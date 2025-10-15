import * as BABYLON from "babylonjs"
import * as GUI from "babylonjs-gui"
import type { Coordinate } from "../../../types/coordinate"
import type { CharacterAttribute, CharacterDimension } from "./type"
import { useCharacterStore } from "../../../stores/character"

interface KeyState {
  [key: string]: boolean
}

export class __Character__ {
  private camera: BABYLON.ArcRotateCamera
  private scene: BABYLON.Scene
  private turnSpeed: number = 0.5
  private sideSpeed: number = 0.05
  private speed: number = 0.2
  private runSpeed: number = 0.3
  private key_movement: KeyState = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  }
  private key_selection: KeyState = {
    escape: false,
  }
  private lastMovementState: string = ""
  private allowMoved: boolean
  private characterMesh: BABYLON.AbstractMesh | null = null
  private characterRoot: BABYLON.TransformNode | null = null
  private animationGroups: BABYLON.AnimationGroup[] = []
  private actionMap: Record<string, BABYLON.AnimationGroup> = {}
  private currentAction: BABYLON.AnimationGroup | null = null
  private highlightLayer: BABYLON.HighlightLayer
  private attribute: CharacterAttribute
  private selectionAttribute: CharacterAttribute | null = null
  private isLoaded: boolean = false
  private loadPromise: Promise<void>

  constructor(
    scene: BABYLON.Scene,
    camera: BABYLON.ArcRotateCamera,
    dimension: CharacterDimension,
    position: Coordinate,
    highlightLayer: BABYLON.HighlightLayer,
    color: BABYLON.Color3,
    attribute: CharacterAttribute = {
      modelId: "",
      name: "TATANG",
      level: 1,
      health: 100,
      mana: 50,
      job: "warrior",
      race: "asmodian",
    },
    allowMoved: boolean = false,
    gltfMesh: BABYLON.AbstractMesh,
    animations: BABYLON.AnimationGroup[],
  ) {
    useCharacterStore().setMyCharacter(attribute)
    this.allowMoved = allowMoved
    this.scene = scene
    this.camera = camera
    this.attribute = attribute
    this.highlightLayer = highlightLayer
    this.animationGroups = animations

    this.camera.target = new BABYLON.Vector3(position.x, position.y, position.z)
    this.camera.radius = 5
    this.camera.beta = Math.PI / 4
    this.camera.alpha = Math.PI

    this.loadPromise = this.initCharacter(
      position,
      color,
      dimension,
      attribute,
      gltfMesh,
    )

    window.addEventListener("keydown", (event) => this.onKeyChange(event, true))
    window.addEventListener("keyup", (event) => this.onKeyChange(event, false))
  }

  private async initCharacter(
    position: Coordinate,
    color: BABYLON.Color3,
    dimension: CharacterDimension,
    attribute: CharacterAttribute,
    gltfMesh: BABYLON.AbstractMesh,
  ): Promise<void> {
    return new Promise((resolve) => {
      this.characterMesh = gltfMesh

      this.characterMesh.scaling = new BABYLON.Vector3(
        dimension.width,
        dimension.height,
        dimension.depth,
      )

      this.characterMesh.metadata = this.characterMesh.metadata || {}
      this.characterMesh.metadata.gltfId = attribute.modelId
      this.characterMesh.metadata.clickable = true

      this.characterMesh.receiveShadows = true
      const shadowGenerator = this.scene.getLightByName("dirLight")?.metadata
        ?.shadowGenerator as BABYLON.ShadowGenerator | undefined
      if (shadowGenerator && this.characterMesh instanceof BABYLON.Mesh) {
        shadowGenerator.addShadowCaster(this.characterMesh)
      }

      this.characterMesh.getChildMeshes().forEach((child) => {
        if (child instanceof BABYLON.Mesh) {
          child.metadata = child.metadata || {}
          child.metadata.clickable = true
          child.receiveShadows = true
          if (shadowGenerator) {
            shadowGenerator.addShadowCaster(child)
          }
        }
      })

      const skeleton = this.characterMesh.skeleton
      if (skeleton) {
        const bones = skeleton.bones

        const armBones = [
          "LeftShoulder",
          "LeftArm",
          "LeftForeArm",
          "RightShoulder",
          "RightArm",
          "RightForeArm",
        ]
        const armLengthScale = 2.55
        armBones.forEach((boneName) => {
          const bone = bones.find((b) => b.name === boneName)
          if (bone) {
            bone.scaling = new BABYLON.Vector3(
              armLengthScale,
              armLengthScale,
              armLengthScale,
            )
          }
        })

        const handBones = ["LeftHand", "RightHand"]
        const handScale = 3.95
        handBones.forEach((boneName) => {
          const bone = bones.find((b) => b.name === boneName)
          if (bone) {
            bone.scaling = new BABYLON.Vector3(handScale, handScale, handScale)
          }
        })

        const chestBones = ["Spine1"]
        const chestScale = 1.15
        chestBones.forEach((boneName) => {
          const bone = bones.find((b) => b.name === boneName)
          if (bone) {
            bone.scaling = new BABYLON.Vector3(chestScale, 1, chestScale)
          }
        })

        const hipBones = ["Hips", "LeftUpLeg", "RightUpLeg"]
        const hipScale = 2.1
        hipBones.forEach((boneName) => {
          const bone = bones.find((b) => b.name === boneName)
          if (bone) {
            bone.scaling = new BABYLON.Vector3(hipScale, 1, hipScale)
          }
        })

        skeleton.computeAbsoluteTransforms()
      }

      this.characterRoot = new BABYLON.TransformNode(
        "CharacterRoot",
        this.scene,
      )
      this.characterMesh.parent = this.characterRoot
      this.characterRoot.position = new BABYLON.Vector3(
        position.x,
        position.y,
        position.z,
      )

      if (this.characterMesh instanceof BABYLON.Mesh) {
        const material = new BABYLON.StandardMaterial(
          "characterMaterial",
          this.scene,
        )
        material.diffuseColor = color || BABYLON.Color3.FromHexString("#ff7755")
        material.roughness = 0.5
        this.characterMesh.material = material
      }

      this.animationGroups.forEach((group) => {
        this.actionMap[group.name] = group
        group.loopAnimation = true
      })

      const possibleIdleNames = [
        "Idle",
        "idle",
        "IDLE",
        "Masculine_Idle",
        "Feminine_Idle",
      ]
      for (const name of possibleIdleNames) {
        if (this.actionMap[name]) {
          this.currentAction = this.actionMap[name]
          this.currentAction.start(true, 1.0, undefined, undefined, false)
          this.lastMovementState = "Idle"
          break
        }
      }

      this.makeLabel(`Lv. ${attribute.level} - ${attribute.name}`)

      this.isLoaded = true
      resolve()
    })
  }

  public async waitForLoad(): Promise<void> {
    return this.loadPromise
  }

  private onKeyChange(event: KeyboardEvent, isDown: boolean): void {
    if (this.allowMoved) {
      const key = event.key.toLowerCase()
      if (key in this.key_movement) {
        this.key_movement[key] = isDown
      }
      if (key in this.key_selection) {
        this.key_selection[key] = isDown
        this.updateSelection()
      }
    }
  }

  private updateSelection(): void {
    if (this.characterRoot) {
      this.highlightLayer.removeAllMeshes()
      useCharacterStore().removeTargetSelection()
    }
  }

  private updateAnimation(): void {
    if (!this.isLoaded) {
      return
    }

    const movementState = `${this.key_movement.w}:${this.key_movement.a}:${this.key_movement.s}:${this.key_movement.d}:${this.key_movement.shift}`
    if (movementState === this.lastMovementState) {
      return
    }
    this.lastMovementState = movementState

    let targetAction: BABYLON.AnimationGroup | null = null
    let targetActionName: string | null = null
    if (
      this.key_movement.w &&
      this.key_movement.shift &&
      this.actionMap["Run"]
    ) {
      this.speed = this.runSpeed
      targetAction = this.actionMap["Run"]
      targetActionName = "Run"
    } else if (this.key_movement.w && this.actionMap["Run"]) {
      this.speed =
        this.key_movement.a || this.key_movement.d
          ? this.runSpeed / 2
          : this.runSpeed
      targetAction = this.actionMap["Run"]
      targetActionName = "Run"
    } else if (this.key_movement.a && this.actionMap["WalkLeft"]) {
      this.speed = this.sideSpeed
      targetAction = this.actionMap["WalkLeft"]
      targetActionName = "WalkLeft"
    } else if (this.key_movement.d && this.actionMap["WalkRight"]) {
      this.speed = this.sideSpeed
      targetAction = this.actionMap["WalkRight"]
      targetActionName = "WalkRight"
    } else if (this.key_movement.s && this.actionMap["WalkBack"]) {
      this.speed = this.sideSpeed
      targetAction = this.actionMap["WalkBack"]
      targetActionName = "WalkBack"
    } else if (this.actionMap["Idle"]) {
      targetAction = this.actionMap["Idle"]
      targetActionName = "Idle"
    }

    if (targetAction && targetAction !== this.currentAction) {
      const previous = this.currentAction
      this.currentAction = targetAction

      targetAction.start(true, 1.0, undefined, undefined, false)
      targetAction.setWeightForAllAnimatables(0)

      if (previous) {
        previous.start(true, 1.0, undefined, undefined, false)
        previous.setWeightForAllAnimatables(1)
      }

      const startTime = performance.now()
      const duration = 0.25 * 1000

      const fadeStep = () => {
        const elapsed = performance.now() - startTime
        const t = Math.min(elapsed / duration, 1)
        const weightNew = t
        const weightOld = 1 - t

        targetAction.setWeightForAllAnimatables(weightNew)
        if (previous) previous.setWeightForAllAnimatables(weightOld)

        if (t < 1) {
          requestAnimationFrame(fadeStep)
        } else {
          if (previous) previous.stop()
          targetAction.setWeightForAllAnimatables(1)
        }
      }

      requestAnimationFrame(fadeStep)
    }
  }

  public update(): void {
    this.attribute = useCharacterStore().MyCharacter
    if (!this.isLoaded || !this.characterRoot || !this.characterMesh) {
      return
    }

    const { w, a, s, d } = this.key_movement
    let moveDir = new BABYLON.Vector3(0, 0, 0)

    if (w || a || s || d) {
      const camDir = this.camera
        .getDirection(BABYLON.Vector3.Forward())
        .normalize()
      camDir.y = 0
      camDir.normalize()

      const camRight = BABYLON.Vector3.Cross(
        camDir,
        BABYLON.Vector3.Up(),
      ).normalize()
      if (w) moveDir.addInPlace(camDir)
      if (s) moveDir.subtractInPlace(camDir)
      if (a) moveDir.addInPlace(camRight)
      if (d) moveDir.subtractInPlace(camRight)
      if (moveDir.lengthSquared() > 0) {
        moveDir.normalize()
        this.characterRoot.position.addInPlace(moveDir.scale(this.speed))

        const targetAngle = Math.atan2(camDir.x, camDir.z) + Math.PI
        this.characterRoot.rotation.y = BABYLON.Scalar.Lerp(
          this.characterRoot.rotation.y,
          targetAngle,
          this.turnSpeed,
        )
      }
    }

    if (this.characterRoot) {
      this.camera.target = new BABYLON.Vector3(
        this.characterRoot.position.x,
        this.characterRoot.position.y + 1,
        this.characterRoot.position.z,
      )
    }

    this.updateAnimation()
  }

  private makeLabel(text: string): BABYLON.Mesh {
    const plane = BABYLON.MeshBuilder.CreatePlane(
      "labelPlane",
      { width: 1, height: 0.25 },
      this.scene,
    )
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL
    plane.parent = this.characterMesh
    plane.position.y = 2.2

    const texture = GUI.AdvancedDynamicTexture.CreateForMesh(plane, 612, 128)
    const textBlock = new GUI.TextBlock()
    textBlock.text = text
    textBlock.color = "white"
    textBlock.fontSize = 80
    textBlock.lineSpacing = 2
    textBlock.outlineColor = "black"
    textBlock.outlineWidth = 10
    texture.addControl(textBlock)

    this.scene.registerBeforeRender(() => {
      const camera = this.scene.activeCamera
      if (!camera) return

      const distance = BABYLON.Vector3.Distance(
        camera.position,
        plane.getAbsolutePosition(),
      )
      const scale = distance * 0.02
      plane.scaling.setAll(scale)
    })

    return plane
  }

  public getCharacterRoot(): BABYLON.TransformNode | null {
    return this.characterRoot
  }

  public getCharacterMesh(): BABYLON.AbstractMesh | null {
    return this.characterMesh
  }

  public animate(): void {}

  public getAttribute(): CharacterAttribute {
    return this.attribute
  }

  public clickMe(): void {
    if (this.characterMesh && this.characterMesh instanceof BABYLON.Mesh) {
      this.highlightLayer.addMesh(this.characterMesh, BABYLON.Color3.White())
    }
  }

  public updateTarget(selectionAttribute: CharacterAttribute): void {
    this.selectionAttribute = selectionAttribute
    useCharacterStore().setTargetSelection(this.selectionAttribute)

    let targetColor = BABYLON.Color3.Green()
    if (useCharacterStore().MyCharacter.race !== selectionAttribute.race) {
      targetColor = BABYLON.Color3.FromHexString("#FA02A0")
    }
    if (this.characterMesh && this.characterMesh instanceof BABYLON.Mesh) {
      this.highlightLayer.addMesh(this.characterMesh, targetColor)
    }
  }

  public destroy(): void {
    window.removeEventListener("keydown", (event) =>
      this.onKeyChange(event, true),
    )
    window.removeEventListener("keyup", (event) =>
      this.onKeyChange(event, false),
    )

    if (this.characterRoot) {
      this.scene.removeTransformNode(this.characterRoot)
    }

    if (this.characterMesh) {
      this.highlightLayer.removeMesh(this.characterMesh as BABYLON.Mesh)
      this.characterMesh.getChildMeshes().forEach((child) => {
        if (child instanceof BABYLON.Mesh) {
          if (child.material) {
            child.material.dispose()
          }
          child.dispose()
        }
      })
      if (
        this.characterMesh instanceof BABYLON.Mesh &&
        this.characterMesh.material
      ) {
        this.characterMesh.material.dispose()
      }
      this.characterMesh.dispose()
    }

    if (this.animationGroups) {
      this.animationGroups.forEach((group) => group.stop())
      this.animationGroups = []
    }

    this.characterMesh = null
    this.characterRoot = null
    this.currentAction = null
    this.actionMap = {}
  }
}
