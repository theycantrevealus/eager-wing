import {
  Engine,
  Scene,
  Ray,
  AnimationGroup,
  AssetContainer,
  Vector3,
  Observer,
  Mesh,
  TransformNode,
  HighlightLayer,
  MeshBuilder,
  StandardMaterial,
  ActionManager,
  ExecuteCodeAction,
  AxesViewer,
  Skeleton,
  Nullable,
  Bone,
  AbstractMesh,
  PBRMaterial,
  Color3,
  ArcRotateCamera,
  Scalar,
} from "babylonjs"
import type {
  CharacterAttribute,
  CharacterBoneCollection,
} from "#types/Character"
import { EagerWing___Label } from "#GL/label"
import type { KeyState } from "#interfaces/keyboard"
import { MESH_NAME } from "#constants/map.mesh"
import { SKELETON_MAP } from "#constants/map.skeleton"

/**
 * Character Management
 *
 * @class
 */
export class EagerWing___Character {
  /** Engine renderer. */
  private engine: Engine

  /** The active BabylonJS scene used for asset loading. */
  private scene: Scene

  private ray: Ray = new Ray(new Vector3(), new Vector3(), 0)

  /** Label manager. */
  private label: EagerWing___Label

  /** Character attribute contains information, render rule, style, init position, etc. */
  private characterAttribute: CharacterAttribute

  private isEnemy: boolean = true

  private characterSharedAsset: AssetContainer

  /** Registered humanoid bones formatted with humanly name */
  private bonesCollection: CharacterBoneCollection = {}

  /** Character processing promise. */
  // private loadPromise: Promise<void>

  /** Character processing promise result. */
  protected isLoaded: boolean = false

  private currentAnimation?: AnimationGroup
  private currentAnimName: string | null = null
  private fadeObserver?: Observer<Scene>

  private labelPlane: Mesh | null = null
  private labelUpdateObserver: Observer<Scene> | null = null

  /** Character Mode */
  private combatMode: boolean = false

  private controlPanelBones: Record<
    string,
    {
      minimum: number
      maximum: number
      value: number
      step: number
      isDirty: boolean
    }
  > = {}

  /** Physics */
  private feetOffset: number = 0
  private groundTolerance: number = 0.5
  private gravityForce: number = 10
  private isJumping: boolean = false
  private jumpPower: number = 5
  private verticalVelocity: number = 0
  private sideSpeed: number = 0.05
  private runSpeed: number = 0.3

  /**
   * @constructor
   * Create character instance. Handle the character customizations, animations, motions, and else.
   * All the assets is shared for same character model: NPC, other players, etc
   *
   * @param { Engine } engine - Main engine instance
   * @param { Scene } scene - Main scene instance
   * @param { AssetContainer } characterSharedAsset - Character shared asset
   * @param { CharacterAttribute } characterAttribute - Character attribute
   */
  constructor(
    engine: Engine,
    scene: Scene,
    characterSharedAsset: AssetContainer,
    characterAttribute: CharacterAttribute,
  ) {
    this.engine = engine
    this.scene = scene

    /** If debugging character object is needed */
    if (characterAttribute.classConfig.needDebug)
      scene.debugLayer.show({
        embedMode: false,
        overlay: true,
        handleResize: true,
      })

    /** Initiate label manager. */
    this.label = new EagerWing___Label(scene)

    /** Init attribute for character configuration. */
    this.characterAttribute = characterAttribute

    this.characterSharedAsset = characterSharedAsset
  }

  public removeHighlight(nodeName: string, hl: HighlightLayer) {
    const node = this.scene.getTransformNodeByName(nodeName)
    if (!node) return

    node.getChildMeshes().forEach((mesh) => {
      if (mesh instanceof Mesh) hl.removeMesh(mesh)
    })
  }

  /**
   * @protected
   * Character model initiate from shared asset
   *   1. Clone available skeleton
   *   2. Config style attribute
   *
   * * @param { AssetContainer } assetContainer - Shared asset
   * @param { AssetContainer } position - Character set position
   *
   * @returns
   */
  public createCharacter(
    isEnemy: boolean = true,
    objectEvent: any,
  ): {
    root: TransformNode
    getAnimationGroup: Record<string, AnimationGroup>
    collider: Mesh
    indicator: {
      circle: Mesh
    }
  } {
    this.isEnemy = isEnemy
    const assetContainer = this.characterSharedAsset
    const position = new Vector3(
      this.characterAttribute.position.x,
      this.characterAttribute.position.y,
      this.characterAttribute.position.z,
    )
    for (const ag of assetContainer.animationGroups) {
      ag.stop()
      ag.reset()
    }

    const { rootNodes, animationGroups } =
      assetContainer.instantiateModelsToScene(
        (name) => name + "_instance_" + this.characterAttribute.modelId,
      )

    // const root = new TransformNode(
    //   `root_${this.characterAttribute.modelId}_${Math.random()}`,
    //   this.scene,
    // )

    const root = new TransformNode(
      `root_${this.characterAttribute.modelId}`,
      this.scene,
    )
    root.position.copyFrom(position)

    for (const node of rootNodes) {
      node.parent = root
    }

    const collider = MeshBuilder.CreateBox(
      `${root.name}_collider`,
      { size: 1, height: 4 },
      this.scene,
    )

    const circle = MeshBuilder.CreateDisc(
      `indicator_${this.characterAttribute.modelId}`,
      {
        radius: 0.6,
        tessellation: 32,
      },
      this.scene,
    ) as Mesh

    circle.parent = root
    circle.rotation.x = Math.PI / 2
    circle.position.y = -root.getHierarchyBoundingVectors().min.y + 0.005
    circle.isVisible = false
    circle.visibility = 0

    const circleMat = new StandardMaterial(
      `indicatorMat_${this.characterAttribute.modelId}`,
      this.scene,
    )
    circleMat.alpha = 0
    circleMat.backFaceCulling = false
    circle.material = circleMat

    collider.parent = root
    collider.isPickable = false
    collider.isVisible = true
    collider.visibility = 0
    collider.actionManager = new ActionManager(this.scene)
    collider.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, objectEvent),
    )

    const getAnimationGroup: Record<string, AnimationGroup> = {}

    for (const ag of animationGroups) {
      getAnimationGroup[ag.name] = ag
      ag.stop()
      ag.reset()
    }

    ;({ plane: this.labelPlane, observer: this.labelUpdateObserver } =
      this.label.makeLabel(
        this.characterAttribute.information?.name ?? "Unnamed",
        root,
        isEnemy,
      ))

    // Add debug axes if needed
    if (root && this.characterAttribute.classConfig?.needDebug) {
      const axes = new AxesViewer(this.scene, 1)
      axes.xAxis.parent = root
      axes.yAxis.parent = root
      axes.zAxis.parent = root
    }

    this.playAnimation(
      getAnimationGroup,
      `UnArmed-Idle_instance_${this.characterAttribute.modelId}`,
    )

    return {
      root,
      getAnimationGroup,
      collider,
      indicator: {
        circle,
      },
    }
  }

  /**
   * Register all bones to Eager Wing standard so it could identified easier
   *
   * @param { Skeleton } skeleton - Skeleton from model to process
   *
   * @returns { void }
   */
  private registerBone(prefix: string = "", skeleton: Skeleton): void {
    const defBones =
      prefix === ""
        ? skeleton.bones
        : skeleton.bones.filter((bone) => bone.name.startsWith(prefix))

    defBones.forEach((bone) => {
      if (SKELETON_MAP.female) {
        const identifier: string | undefined =
          SKELETON_MAP.female[bone.name.toString()]?.identifier
        if (identifier)
          this.bonesCollection[identifier] = {
            name: SKELETON_MAP.female[bone.name.toString()]?.name ?? "",
            configurable:
              SKELETON_MAP.female[bone.name.toString()]?.configurable ?? false,
            group: SKELETON_MAP.female[bone.name.toString()]?.group ?? "",
            // bone: bone, Removed due to CPU lead on ISSUE (https://github.com/theycantrevealus/eager-wing/issues/4)
            minimum: 0,
            maximum: 0,
          }
      }
    })
  }

  /**
   * Get bone by name
   *
   * @param { string } name - Mapped name of bone on SKELETON_MAP
   * @deprecated
   * @returns { Bone | null }
   */
  public getBoneByName(name: string): Bone | null {
    return this.bonesCollection[name]?.bone ?? null
  }

  public applySkinTone(color: string) {
    const bodyMeshes: Nullable<AbstractMesh> = this.scene.getMeshByName(
      MESH_NAME.Body,
    )
    if (bodyMeshes) {
      const bodyMaterial = bodyMeshes.material as PBRMaterial
      bodyMaterial.albedoColor = Color3.FromHexString(color)
    }
  }

  /**
   * @public
   * Handle character animation update
   *
   * @returns { void }
   */
  public update(
    rootInstance: TransformNode,
    animationGroup: Record<string, AnimationGroup>,
    modelID: string,
    key: KeyState,
    camera: ArcRotateCamera,
    allowMovement: boolean = false,
  ): void {
    if (!rootInstance || !camera) return

    const { w, a, s, d, space } = key
    const moving = w || a || s || d
    let moveDir = new Vector3(0, 0, 0)
    let nextAnimName = this.combatMode
      ? `Armed-Idle_instance_${modelID}`
      : `UnArmed-Idle_instance_${modelID}`

    const camForward = camera.getDirection(Vector3.Forward()).normalize()
    camForward.y = 0
    camForward.normalize()

    const camRight = Vector3.Cross(Vector3.Up(), camForward).normalize()

    /** ---------------------------------------------------------------------- movement */
    let useSpeed = this.characterAttribute.speed
    if (allowMovement) {
      if (w) {
        moveDir.addInPlace(camForward)
        nextAnimName = this.combatMode
          ? `Armed-RunForward_instance_${modelID}`
          : `Unarmed-RunForward_instance_${modelID}`
        useSpeed = this.combatMode
          ? this.runSpeed
          : this.characterAttribute.speed
      }
      if (s) {
        moveDir.subtractInPlace(camForward)
        nextAnimName = this.combatMode
          ? `Armed-WalkBack_instance_${modelID}`
          : `Unarmed-Backward_instance_${modelID}`
        useSpeed = this.combatMode
          ? this.characterAttribute.speed
          : this.sideSpeed
      }
      if (a) {
        moveDir.subtractInPlace(camRight)
        nextAnimName = this.combatMode
          ? `Armed-WalkLeft_instance_${modelID}`
          : `Unarmed-StrafeLeft_instance_${modelID}`
        useSpeed = this.combatMode
          ? this.characterAttribute.speed
          : this.sideSpeed
      }
      if (d) {
        moveDir.addInPlace(camRight)
        nextAnimName = this.combatMode
          ? `Armed-WalkRight_instance_${modelID}`
          : `Unarmed-StrafeRight_instance_${modelID}`
        useSpeed = this.combatMode
          ? this.characterAttribute.speed
          : this.sideSpeed
      }

      if (moving) {
        moveDir.normalize()
        rootInstance.position.addInPlace(moveDir.scale(useSpeed))

        const camFacing = Math.atan2(camForward.x, camForward.z)
        rootInstance.rotation.y = Scalar.Lerp(
          rootInstance.rotation.y,
          camFacing,
          this.characterAttribute.turnSpeed,
        )
      }
    }

    /** ---------------------------------------------------------------------- jump */
    const deltaTime = (this.engine.getDeltaTime() || 16) / 1000
    const origin = rootInstance.position.add(
      new Vector3(0, this.feetOffset + 0.2, 0),
    )
    const down = new Vector3(0, -1, 0)
    const rayLength = Math.abs(this.feetOffset) + 2

    // this.ray =
    this.ray.origin.copyFrom(origin)
    this.ray.direction.copyFrom(down)
    this.ray.length = rayLength
    const pick = this.scene.pickWithRay(this.ray, (mesh) => {
      return mesh.isPickable && mesh.name.toLowerCase().includes("ground")
    })

    const hasHit = !!(pick && pick.hit && pick.pickedPoint)
    let groundY = Number.NEGATIVE_INFINITY
    if (hasHit && pick!.pickedPoint) groundY = pick!.pickedPoint!.y

    const feetY = origin.y
    const distanceToGround = hasHit ? feetY - groundY : Number.POSITIVE_INFINITY

    const grounded =
      hasHit &&
      distanceToGround <= this.groundTolerance &&
      this.verticalVelocity <= 0

    if (space && grounded && !this.isJumping) {
      this.isJumping = true
      this.verticalVelocity = this.jumpPower

      // TODO : Jump animation
      // nextAnimName = `Armed-RunJump_${this.characterAttribute.modelId}`
      this.playAnimation(animationGroup, `Armed-RunJump_instance_${modelID}`)
    }

    if (this.isJumping || !grounded) {
      this.verticalVelocity -= this.gravityForce * deltaTime
      rootInstance.position.y += this.verticalVelocity * deltaTime

      const originAfter = rootInstance.position.add(
        new Vector3(0, this.feetOffset + 0.2, 0),
      )

      const pickAfter = this.scene.pickWithRay(this.ray, (mesh) => {
        return mesh.isPickable && mesh.name.toLowerCase().includes("ground")
      })
      const landed = !!(
        pickAfter &&
        pickAfter.hit &&
        originAfter.y - pickAfter!.pickedPoint!.y <= this.groundTolerance &&
        this.verticalVelocity <= 0
      )

      if (landed) {
        this.isJumping = false
        this.verticalVelocity = 0
        rootInstance.position.y =
          pickAfter!.pickedPoint!.y - this.feetOffset + 0.01

        // nextAnimName = `Armed-RunJump_${this.characterAttribute.modelId}`
        this.playAnimation(animationGroup, `Armed-RunJump_instance_${modelID}`)
        /**
           * 
           * 
           * nextAnimName = `Unarmed-Land_${this.characterAttribute.modelId}`

        // optionally transition to idle automatically after landing anim
        setTimeout(() => {
          if (!this.isJumping) {
            this.playAnimation(`UnArmed-Idle_${this.characterAttribute.modelId}`)
          }
        }, 400) // duration of landing anim in ms
           * 
           * 
           */
      }
    } else {
      if (hasHit) {
        const targetY = groundY - this.feetOffset + 0.01
        const curY = rootInstance.position.y
        const diff = targetY - curY
        if (Math.abs(diff) > 0.001) {
          const snapSpeed = 30 // higher = faster snap
          rootInstance.position.y = Scalar.Lerp(
            curY,
            targetY,
            Math.min(1, snapSpeed * deltaTime),
          )
        } else {
          rootInstance.position.y = targetY
        }
      } else {
        this.isJumping = true
      }
    }
    /** ---------------------------------------------------------------------- end of jump */

    if (allowMovement)
      camera.target = rootInstance.position.add(new Vector3(0, 1, 0))

    /** ---------------------------------------------------------------------- animation */
    if (this.currentAnimName !== nextAnimName && allowMovement) {
      this.playAnimation(animationGroup, nextAnimName)
    }
  }

  private stopAllAnimations(
    animationGroup: Record<string, AnimationGroup>,
  ): void {
    Object.values(animationGroup).forEach((ag) => {
      try {
        ag.stop()
      } catch {}
      try {
        if (typeof ag.setWeightForAllAnimatables === "function") {
          ag.setWeightForAllAnimatables(0)
        }
      } catch {}
    })
    this.currentAnimation = undefined
    this.currentAnimName = null
    if (this.fadeObserver) {
      try {
        this.scene.onBeforeRenderObservable.remove(this.fadeObserver)
      } catch {}
      this.fadeObserver = undefined
    }
  }

  public playAnimation(
    animationGroup: Record<string, AnimationGroup>,
    name: string,
    duration = 300,
  ) {
    const next = animationGroup[name]
    if (!next) return

    if (this.currentAnimName === name && this.currentAnimation === next) return

    const idleName = this.combatMode
      ? `Armed-Idle_instance_${this.characterAttribute.modelId}`
      : `UnArmed-Idle_instance_${this.characterAttribute.modelId}`

    if (name === idleName) {
      this.stopAllAnimations(animationGroup)
      try {
        next.stop()
      } catch {}
      next.play(true)
      if (typeof next.setWeightForAllAnimatables === "function") {
        next.setWeightForAllAnimatables(1)
      }
      this.currentAnimation = next
      this.currentAnimName = name
      return
    }

    if (!this.currentAnimation) {
      try {
        next.stop()
      } catch {}
      next.play(true)
      if (typeof next.setWeightForAllAnimatables === "function") {
        next.setWeightForAllAnimatables(1)
      }
      this.currentAnimation = next
      this.currentAnimName = name
      return
    }

    if (this.currentAnimation !== next) {
      this.crossFade(this.currentAnimation, next, duration)
    } else {
      next.play(true)
      if (typeof next.setWeightForAllAnimatables === "function") {
        next.setWeightForAllAnimatables(1)
      }
    }

    this.currentAnimation = next
    this.currentAnimName = name
  }

  private crossFade(
    from: AnimationGroup,
    to: AnimationGroup,
    duration: number,
  ) {
    if (!this.scene) return

    if (this.fadeObserver) {
      try {
        this.scene.onBeforeRenderObservable.remove(this.fadeObserver)
      } catch {}
      this.fadeObserver = undefined
    }

    const start = performance.now()

    try {
      from.stop()
    } catch {}
    try {
      from.play(true)
    } catch {}
    try {
      to.stop()
    } catch {}
    try {
      to.play(true)
    } catch {}

    if (typeof from.setWeightForAllAnimatables === "function") {
      try {
        from.setWeightForAllAnimatables(1)
      } catch {}
    }
    if (typeof to.setWeightForAllAnimatables === "function") {
      try {
        to.setWeightForAllAnimatables(0)
      } catch {}
    }

    this.fadeObserver = this.scene.onBeforeRenderObservable.add(() => {
      const now = performance.now()
      const alpha = Math.min(1, (now - start) / duration)

      if (typeof from.setWeightForAllAnimatables === "function") {
        try {
          from.setWeightForAllAnimatables(1 - alpha)
        } catch {}
      }
      if (typeof to.setWeightForAllAnimatables === "function") {
        try {
          to.setWeightForAllAnimatables(alpha)
        } catch {}
      }

      if (alpha >= 1) {
        try {
          from.stop()
        } catch {}
        if (typeof to.setWeightForAllAnimatables === "function") {
          try {
            to.setWeightForAllAnimatables(1)
          } catch {}
        }

        if (this.fadeObserver) {
          try {
            this.scene.onBeforeRenderObservable.remove(this.fadeObserver)
          } catch {}
          this.fadeObserver = undefined
        }
        this.currentAnimation = to
        this.currentAnimName = to.name
      }
    })
  }

  /**
   * @public
   * Destroy character meshes
   *
   * @returns { void }
   */
  public destroy(): void {
    //
    this.isLoaded = false
  }

  public toogleCombatMode(
    getAnimationGroup: Record<string, AnimationGroup> | null,
  ) {
    this.stopAllAnimations(getAnimationGroup!) // TODO : this make animation not smooth. Fix it
    if (getAnimationGroup)
      this.playAnimation(
        getAnimationGroup,
        this.combatMode
          ? `UnArmed-Idle_instance_${this.characterAttribute.modelId}`
          : `Armed-Idle_instance_${this.characterAttribute.modelId}`,
      )

    this.combatMode = !this.combatMode
  }
}
