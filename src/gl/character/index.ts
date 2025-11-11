import * as BABYLON from "babylonjs"
import type {
  CharacterAttribute,
  CharacterBoneCollection,
} from "__&types/Character"
import { EagerWing___Label } from "__&GL/label"
import type { KeyState } from "__&interfaces/keyboard"
import { MESH_NAME } from "__&constants/map.mesh"
import { SKELETON_MAP } from "__&constants/map.skeleton"

/**
 * Character Management
 *
 * @class
 */
export class EagerWing___Character {
  /** Engine renderer. */
  private engine: BABYLON.Engine

  /** The active BabylonJS scene used for asset loading. */
  private scene: BABYLON.Scene

  /** Label manager. */
  private label: EagerWing___Label

  /** Character attribute contains information, render rule, style, init position, etc. */
  private characterAttribute: CharacterAttribute

  private characterSharedAsset: BABYLON.AssetContainer

  /** Registered humanoid bones formatted with humanly name */
  private bonesCollection: CharacterBoneCollection = {}

  /** Character processing promise. */
  // private loadPromise: Promise<void>

  /** Character processing promise result. */
  protected isLoaded: boolean = false

  private currentAnimation?: BABYLON.AnimationGroup
  private currentAnimName: string | null = null
  private fadeObserver?: BABYLON.Observer<BABYLON.Scene>

  private labelPlane: BABYLON.Mesh | null = null
  private labelUpdateObserver: BABYLON.Observer<BABYLON.Scene> | null = null

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
   * @param { BABYLON.Engine } engine - Main engine instance
   * @param { BABYLON.Scene } scene - Main scene instance
   * @param { BABYLON.AssetContainer } characterSharedAsset - Character shared asset
   * @param { CharacterAttribute } characterAttribute - Character attribute
   */
  constructor(
    engine: BABYLON.Engine,
    scene: BABYLON.Scene,
    characterSharedAsset: BABYLON.AssetContainer,
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

  /**
   * @protected
   * Character model initiate from shared asset
   *   1. Clone available skeleton
   *   2. Config style attribute
   *
   * * @param { BABYLON.AssetContainer } assetContainer - Shared asset
   * @param { BABYLON.AssetContainer } position - Character set position
   *
   * @returns
   */
  public createCharacter(): {
    root: BABYLON.TransformNode
    getAnimationGroup: Record<string, BABYLON.AnimationGroup>
  } {
    const assetContainer = this.characterSharedAsset
    const position = new BABYLON.Vector3(
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

    const root = new BABYLON.TransformNode("root_" + Math.random(), this.scene)
    root.position.copyFrom(position)

    for (const node of rootNodes) {
      node.parent = root
    }

    const getAnimationGroup: Record<string, BABYLON.AnimationGroup> = {}

    for (const ag of animationGroups) {
      getAnimationGroup[ag.name] = ag
      ag.stop()
      ag.reset()
    }

    ;({ plane: this.labelPlane, observer: this.labelUpdateObserver } =
      this.label.makeLabel(
        this.characterAttribute.information?.name ?? "Unnamed",
        root,
      ))

    // Add debug axes if needed
    if (root && this.characterAttribute.classConfig?.needDebug) {
      const axes = new BABYLON.AxesViewer(this.scene, 1)
      axes.xAxis.parent = root
      axes.yAxis.parent = root
      axes.zAxis.parent = root
    }

    this.playAnimation(
      getAnimationGroup,
      `UnArmed-Idle_instance_${this.characterAttribute.modelId}`,
    )

    return { root, getAnimationGroup }
  }

  /**
   * Register all bones to Eager Wing standard so it could identified easier
   *
   * @param { BABYLON.Skeleton } skeleton - Skeleton from model to process
   *
   * @returns { void }
   */
  private registerBone(prefix: string = "", skeleton: BABYLON.Skeleton): void {
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
   * @returns { BABYLON.Bone | null }
   */
  public getBoneByName(name: string): BABYLON.Bone | null {
    return this.bonesCollection[name]?.bone ?? null
  }

  public applySkinTone(color: string) {
    const bodyMeshes: BABYLON.Nullable<BABYLON.AbstractMesh> =
      this.scene.getMeshByName(MESH_NAME.Body)
    if (bodyMeshes) {
      const bodyMaterial = bodyMeshes.material as BABYLON.PBRMaterial
      bodyMaterial.albedoColor = BABYLON.Color3.FromHexString(color)
    }
  }

  /**
   * @public
   * Handle character animation update
   *
   * @returns { void }
   */
  public update(
    rootInstance: BABYLON.TransformNode,
    animationGroup: Record<string, BABYLON.AnimationGroup>,
    modelID: string,
    key: KeyState,
    camera: BABYLON.ArcRotateCamera,
  ): void {
    if (!rootInstance || !camera) return

    const { w, a, s, d, space } = key
    const moving = w || a || s || d
    let moveDir = new BABYLON.Vector3(0, 0, 0)
    let nextAnimName = this.combatMode
      ? `Armed-Idle_instance_${modelID}`
      : `UnArmed-Idle_instance_${modelID}`

    const camForward = camera
      .getDirection(BABYLON.Vector3.Forward())
      .normalize()
    camForward.y = 0
    camForward.normalize()

    const camRight = BABYLON.Vector3.Cross(
      BABYLON.Vector3.Up(),
      camForward,
    ).normalize()

    /** ---------------------------------------------------------------------- movement */
    let useSpeed = this.characterAttribute.speed
    if (w) {
      moveDir.addInPlace(camForward)
      nextAnimName = this.combatMode
        ? `Armed-RunForward_instance_${modelID}`
        : `Unarmed-RunForward_instance_${modelID}`
      useSpeed = this.combatMode ? this.runSpeed : this.characterAttribute.speed
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
      rootInstance.rotation.y = BABYLON.Scalar.Lerp(
        rootInstance.rotation.y,
        camFacing,
        this.characterAttribute.turnSpeed,
      )
    }

    /** ---------------------------------------------------------------------- jump */
    const deltaTime = (this.engine.getDeltaTime() || 16) / 1000
    const origin = rootInstance.position.add(
      new BABYLON.Vector3(0, this.feetOffset + 0.2, 0),
    )
    const down = new BABYLON.Vector3(0, -1, 0)
    const rayLength = Math.abs(this.feetOffset) + 2

    const ray = new BABYLON.Ray(origin, down, rayLength)
    const pick = this.scene.pickWithRay(ray, (mesh) => {
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
        new BABYLON.Vector3(0, this.feetOffset + 0.2, 0),
      )
      const rayAfter = new BABYLON.Ray(originAfter, down, rayLength)
      const pickAfter = this.scene.pickWithRay(rayAfter, (mesh) => {
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
          rootInstance.position.y = BABYLON.Scalar.Lerp(
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

    camera.target = rootInstance.position.add(new BABYLON.Vector3(0, 1, 0))

    /** ---------------------------------------------------------------------- animation */
    if (this.currentAnimName !== nextAnimName) {
      this.playAnimation(animationGroup, nextAnimName)
    }
  }

  private stopAllAnimations(
    animationGroup: Record<string, BABYLON.AnimationGroup>,
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
    animationGroup: Record<string, BABYLON.AnimationGroup>,
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
    from: BABYLON.AnimationGroup,
    to: BABYLON.AnimationGroup,
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
    getAnimationGroup: Record<string, BABYLON.AnimationGroup> | null,
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
