import * as BABYLON from "babylonjs"
import type {
  CharacterAttribute,
  CharacterBoneCollection,
} from "__&types/Character"
import type { Matrix } from "__&types/Matrix"
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
  /** The active BabylonJS scene used for asset loading. */
  private scene: BABYLON.Scene

  /** Label manager. */
  private label: EagerWing___Label

  /** Character attribute contains information, render rule, style, init position, etc. */
  private characterAttribute: CharacterAttribute

  /** Shared asset from main scene. */
  private characterAssets: BABYLON.AssetContainer | null = null

  /** Character object after apply attribute. */
  private characterRoot: BABYLON.TransformNode | null = null

  /** Registered humanoid bones formatted with humanly name */
  private bonesCollection: CharacterBoneCollection = {}

  /** Animation collection */
  public animations: Record<string, BABYLON.AnimationGroup> = {}

  /** Character processing promise. */
  private loadPromise: Promise<void>

  /** Character processing promise result. */
  protected isLoaded: boolean = false

  private currentAnimation?: BABYLON.AnimationGroup
  private currentAnimName: string | null = null
  private fadeObserver?: BABYLON.Observer<BABYLON.Scene>

  private labelPlane: BABYLON.Mesh | null = null
  private labelUpdateObserver: BABYLON.Observer<BABYLON.Scene> | null = null

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

  private boneConfigOverrides: {
    [key: string]: { minimum: number; maximum: number }
  } = {
    // TODO : This block should load from system config
    breast: { minimum: 0.8, maximum: 1.0 },
    pelvis: { minimum: 0.9, maximum: 1.8 },
    upper_arm: { minimum: 1.0, maximum: 1.1 },
    thigh: { minimum: 1, maximum: 1.2 },
    shoulder: { minimum: 0.9, maximum: 1.2 },
    forearm: { minimum: 1.1, maximum: 1.2 },
  }

  // private sideSpeed: number = 0.05
  // private runSpeed: number = 0.3

  /**
   * @constructor
   * Create character instance. Handle the character customizations, animations, motions, and else.
   * All the assets is shared for same character model: NPC, other players, etc
   *
   * @param { BABYLON.Scene } scene - Main scene instance
   * @param { BABYLON.AssetContainer } characterSharedAsset - Character shared asset
   * @param { CharacterAttribute } characterAttribute - Character attribute
   */
  constructor(
    scene: BABYLON.Scene,
    characterSharedAsset: BABYLON.AssetContainer,
    characterAttribute: CharacterAttribute,
  ) {
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

    /** Load asset asyncronously. */
    this.loadPromise = this.initCharacter(
      characterAttribute.position,
      characterSharedAsset,
    )
  }

  /**
   * @protected
   * @async
   * Character model initiate from shared asset
   *   1. Clone available skeleton
   *   2. Config style attribute
   *
   * @param { Matrix } position - Character set position
   * @param { BABYLON.AssetContainer } asset - Shared asset
   *
   * @returns { void }
   */
  protected async initCharacter(
    position: Matrix,
    asset: BABYLON.AssetContainer,
  ): Promise<void> {
    if (!asset) throw new Error("GLTFCharacterTemplate not initialized")

    this.characterAssets = new BABYLON.AssetContainer(this.scene)

    this.characterRoot = new BABYLON.TransformNode(
      `character_root_${this.characterAttribute.modelId}`,
      this.scene,
    )

    this.characterRoot.position = new BABYLON.Vector3(
      position.x,
      position.y,
      position.z,
    )

    /** Clone skeletons. */
    this.characterAssets.skeletons = asset.skeletons.map((skeleton) =>
      skeleton.clone(`${skeleton.name}_${this.characterAttribute.modelId}`),
    )

    if (this.characterAssets.skeletons[0]) {
      // this.logBones("DEF-", this.characterAssets.skeletons[0])
      this.registerBone("DEF-", this.characterAssets.skeletons[0])
    }

    /** Clone meshes. */
    this.characterAssets.meshes = asset.meshes
      .map((mesh) => {
        const clone = mesh.clone(
          `${mesh.name}_${this.characterAttribute.modelId}`,
          null,
        )

        if (clone) {
          clone.isVisible = true
          clone.setEnabled(true)
          clone.scaling.scaleInPlace(
            this.characterAttribute.information.dimension
              ? this.characterAttribute.information.dimension.scale
              : 0,
          )
        }
        return clone
      })
      .filter((m): m is BABYLON.AbstractMesh => m !== null)

    /** Clone materials. */
    this.characterAssets.materials = asset.materials
      .map((mat) => mat.clone(`${mat.name}_${this.characterAttribute.modelId}`))
      .filter((m) => m !== null)

    this.characterAssets.animationGroups = asset.animationGroups.map(
      (group) => {
        group.stop()

        const animateClone = group.clone(
          `${group.name}_${this.characterAttribute.modelId}`,
          (target) =>
            this.characterAssets!.meshes.find((m) =>
              m.name.includes(target.name),
            ) || target,
        )

        this.animations[`${group.name}_${this.characterAttribute.modelId}`] =
          animateClone
        return animateClone
      },
    )

    this.stopAllAnimations()

    /** Set up character root : So the instance could be re-use or handle from other spot. */
    this.characterAssets.meshes.forEach((mesh) => {
      mesh.setParent(this.characterRoot)
      mesh.position.set(0, 0, 0)
    })

    this.characterAssets.addAllToScene()

    /** Provide label for character such like nickname or else. */
    ;({ plane: this.labelPlane, observer: this.labelUpdateObserver } =
      this.label.makeLabel(
        this.characterAttribute.information.name,
        this.characterRoot,
      ))

    if (this.characterRoot && this.characterAttribute.classConfig.needDebug) {
      const axes = new BABYLON.AxesViewer(this.scene, 1)
      axes.xAxis.parent = this.characterRoot
      axes.yAxis.parent = this.characterRoot
      axes.zAxis.parent = this.characterRoot
    }

    const idleName = Object.keys(this.animations).find((k) =>
      k.includes("UnArmed-Idle"),
    )
    if (idleName) {
      this.playAnimation(idleName)
    } else {
      console.warn(
        "⚠️ Idle animation not found in:",
        Object.keys(this.animations),
      )
    }

    this.isLoaded = true
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
   * Model load state asyncronously
   *
   * @returns
   */
  public async waitForLoad(): Promise<void> {
    return this.loadPromise
  }

  /**
   * @public
   * Handle character animation update
   *
   * @returns { void }
   */
  public update(key: KeyState, camera: BABYLON.ArcRotateCamera): void {
    if (!this.isLoaded || !this.characterRoot || !camera) return

    const { w, a, s, d } = key
    const moving = w || a || s || d
    let moveDir = new BABYLON.Vector3(0, 0, 0)
    let nextAnimName = `UnArmed-Idle_${this.characterAttribute.modelId}`

    const camForward = camera
      .getDirection(BABYLON.Vector3.Forward())
      .normalize()
    camForward.y = 0
    camForward.normalize()

    const camRight = BABYLON.Vector3.Cross(
      BABYLON.Vector3.Up(),
      camForward,
    ).normalize()

    if (w) {
      moveDir.addInPlace(camForward)
      nextAnimName = `Unarmed-RunForward_${this.characterAttribute.modelId}`
    }
    if (s) {
      moveDir.subtractInPlace(camForward)
      nextAnimName = `Unarmed-Backward_${this.characterAttribute.modelId}`
    }
    if (a) {
      moveDir.subtractInPlace(camRight)
      nextAnimName = `Unarmed-StrafeLeft_${this.characterAttribute.modelId}`
    }
    if (d) {
      moveDir.addInPlace(camRight)
      nextAnimName = `Unarmed-StrafeRight_${this.characterAttribute.modelId}`
    }

    if (moving) {
      moveDir.normalize()
      this.characterRoot.position.addInPlace(
        moveDir.scale(this.characterAttribute.speed),
      )

      const camFacing = Math.atan2(camForward.x, camForward.z)
      this.characterRoot.rotation.y = BABYLON.Scalar.Lerp(
        this.characterRoot.rotation.y,
        camFacing,
        this.characterAttribute.turnSpeed,
      )
    }

    if (this.currentAnimName !== nextAnimName) {
      this.playAnimation(nextAnimName)
    }

    camera.target = this.characterRoot.position.add(
      new BABYLON.Vector3(0, 1, 0),
    )
  }

  private stopAllAnimations(): void {
    Object.values(this.animations).forEach((ag) => {
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

  private playAnimation(name: string, duration = 300) {
    const next = this.animations[name]
    if (!next) return

    if (this.currentAnimName === name && this.currentAnimation === next) return

    const idleName = `UnArmed-Idle_${this.characterAttribute.modelId}`

    if (name === idleName) {
      this.stopAllAnimations()
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

  get getRoot(): BABYLON.TransformNode | null {
    return this.characterRoot
  }

  get getRegisteredBones() {
    return this.controlPanelBones
  }

  get getBoneCollection() {
    return this.bonesCollection
  }

  /**
   * @public
   * Destroy character meshes
   *
   * @returns { void }
   */
  public destroy(): void {
    if (!this.characterAssets) return
    if (this.characterAssets.animationGroups) {
      this.characterAssets.animationGroups.forEach((anim) => {
        anim.stop()
        anim.dispose()
      })
    }

    if (this.characterAssets.meshes) {
      this.characterAssets.meshes.forEach((mesh) => {
        mesh.dispose(false, true)
      })
    }

    if (this.characterAssets.skeletons) {
      this.characterAssets.skeletons.forEach((skeleton) => {
        skeleton.dispose()
      })
    }

    if (this.characterAssets.materials) {
      this.characterAssets.materials.forEach((mat) => mat.dispose())
    }

    if (this.characterAssets.textures) {
      this.characterAssets.textures.forEach((tex) => tex.dispose())
    }

    if (this.labelPlane && !this.labelPlane.isDisposed()) {
      this.labelPlane.dispose()
    }

    if (this.characterRoot && !this.characterRoot.isDisposed()) {
      this.characterRoot.dispose(false, true)
    }

    if (this.labelUpdateObserver) {
      this.scene.onBeforeRenderObservable.remove(this.labelUpdateObserver)
    }

    this.characterAssets = null as any
    this.isLoaded = false
  }
}
