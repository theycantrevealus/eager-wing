import * as BABYLON from "babylonjs"
import type { CharacterAttribute } from "__&types/Character"
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
export class __Character__ {
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

  /** Character processing promise. */
  private loadPromise: Promise<void>

  /** Character processing promise result. */
  protected isLoaded: boolean = false

  /** Registered humanoid bones formatted with humanly name */
  private bonesCollection: {
    [key: string]: { bone: BABYLON.Bone; minimum: number; maximum: number }
  } = {}

  /**
   * TODO : TIDY BELOW
   *
   *
   *
   *
   *
   *
   *
   */
  private labelPlane: BABYLON.Mesh | null = null
  private labelUpdateObserver: BABYLON.Observer<BABYLON.Scene> | null = null

  public animations: Record<string, BABYLON.AnimationGroup> = {}

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

  // TODO : Animation preparation
  // private currentAction: BABYLON.AnimationGroup | null = null
  // private actionMap: Record<string, BABYLON.AnimationGroup> = {}
  // private lastMovementState: string = ""
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
            this.characterAttribute.information.dimension.scale,
          )

          // if (mesh.skeleton) {
          //   const clonedSkeleton = this.characterAssets!.skeletons.find((s) =>
          //     s.name.includes(mesh.skeleton!.name.split("_")[0] ?? ""),
          //   )
          //   if (clonedSkeleton) {
          //     clone.skeleton = clonedSkeleton

          //     // TODO : Bone registration with auto paired left and right
          //     // this.controlPanelRegisterBones(clonedSkeleton)

          //     clonedSkeleton.computeAbsoluteTransforms()
          //     clonedSkeleton.prepare()
          //   }
          // }
        }
        return clone
      })
      .filter((m): m is BABYLON.AbstractMesh => m !== null)

    /** Clone materials. */
    this.characterAssets.materials = asset.materials
      .map((mat) => mat.clone(`${mat.name}_${this.characterAttribute.modelId}`))
      .filter((m) => m !== null)

    /** Proceed character hair. */
    const headMesh = this.scene.getMeshByName(MESH_NAME.Head)
    const hairMesh = this.characterAttribute.style.body.hair.asset?.meshes[0]
    if (headMesh && hairMesh && headMesh.material) {
      const realHair = hairMesh.getChildMeshes()[0] || hairMesh
      hairMesh.parent = this.characterRoot

      headMesh.position.set(0, 0.915, 0)
      realHair.rotationQuaternion = null
      realHair.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL)
      headMesh.scaling.set(0.75, 0.75, 0.75)
    }

    /** Proceed character body */
    const bodyMeshes: BABYLON.Nullable<BABYLON.AbstractMesh> =
      this.scene.getMeshByName(MESH_NAME.Body)
    if (bodyMeshes) {
      const bodyMaterial = bodyMeshes.material as BABYLON.PBRMaterial
      bodyMaterial.albedoColor = BABYLON.Color3.FromHexString(
        this.characterAttribute.style.body.color,
      )
    }

    /** Proceed character brow */
    const browMeshes: BABYLON.Nullable<BABYLON.AbstractMesh>[] = [
      this.scene.getMeshByName(MESH_NAME.Brow.Right),
      this.scene.getMeshByName(MESH_NAME.Brow.Left),
    ]

    browMeshes.forEach((browMeshes) => {
      if (browMeshes) {
        const browMaterial = browMeshes.material as BABYLON.PBRMaterial
        browMaterial.albedoColor = BABYLON.Color3.FromHexString(
          this.characterAttribute.style.body.brow.color,
        )
      }
    })

    /** Proceed character eye iris. */
    const eyeIrisMeshes = [
      this.scene.getMeshByName(MESH_NAME.Eye.Right.Iris),
      this.scene.getMeshByName(MESH_NAME.Eye.Left.Iris),
    ]

    const tex = new BABYLON.Texture(
      "./src/assets/character/eyes/iris.png",
      this.scene,
    )
    tex.uScale = 0.5
    tex.vScale = 0.5
    tex.uOffset = (1 - tex.uScale) / 2
    tex.vOffset = (1 - tex.vScale) / 2

    const irisMat = new BABYLON.StandardMaterial("irisMat", this.scene)
    irisMat.diffuseTexture = tex
    irisMat.useAlphaFromDiffuseTexture = true
    irisMat.backFaceCulling = false
    irisMat.diffuseColor = new BABYLON.Color3(0.5, 0.8, 1.0)

    eyeIrisMeshes.forEach((irisMeshes) => {
      if (irisMeshes) {
        irisMeshes.material = irisMat
      }
    })

    /** Proceed character lip. */
    const lipsMesh = this.scene.getMeshByName(MESH_NAME.Lip)
    if (lipsMesh && lipsMesh.material instanceof BABYLON.PBRMaterial) {
      const material = lipsMesh.material as BABYLON.PBRMaterial
      material.albedoColor = BABYLON.Color3.FromHexString(
        this.characterAttribute.style.body.lip.color,
      )
    }

    /**
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 







     */

    // TODO : Currently stop animations to test if they override scaling. Will done on animation management branch
    this.characterAssets.animationGroups.forEach((ag) => {
      ag.stop()
      ag.onAnimationGroupPlayObservable.clear() // Prevent restarts
      ag.onAnimationGroupLoopObservable.clear()
    })

    // TODO : Clone animations
    /*this.characterAssets.animationGroups = asset.animationGroups.map(
      (group) => {
        const animateClone = group.clone(
          `${group.name}_${this.characterAttribute.modelId}`,
          (target) => {
            return (
              this.characterAssets!.meshes.find((m) =>
                m.name.includes(target.name),
              ) || target
            )
          },
        )
        this.animations[`${group.name}_${this.characterAttribute.modelId}`] =
          animateClone
        return animateClone
      },
    )*/

    /** Set up character root : So the instance could be re-use or handle from other spot. */

    this.characterAssets.meshes.forEach((mesh) => {
      console.log(mesh.name)
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

    // TODO : Remove on production. Add render loop to apply bone scaling for model customization (From slider panel)
    // this.scene.registerBeforeRender(() => {
    //   if (this.characterAssets?.skeletons) {
    //     this.characterAssets.skeletons.forEach((skeleton) => {
    //       this.applyBoneScales(skeleton)
    //     })
    //   }
    // })

    if (this.characterRoot && this.characterAttribute.classConfig.needDebug) {
      const axes = new BABYLON.AxesViewer(this.scene, 1)
      axes.xAxis.parent = this.characterRoot
      axes.yAxis.parent = this.characterRoot
      axes.zAxis.parent = this.characterRoot
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
            bone: bone,
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
   *
   * @returns { BABYLON.Bone | null }
   */
  public getBoneByName(name: string): BABYLON.Bone | null {
    return this.bonesCollection[name]?.bone ?? null
  }

  /**
   * Logs all bones with names starting with "DEF-" in a Babylon.js skeleton.
   *
   * @param {BABYLON.Skeleton} skeleton - The skeleton to inspect
   */
  private logBones(prefix: string = "", skeleton: BABYLON.Skeleton) {
    if (!skeleton) {
      console.warn("No skeleton provided!")
      return
    }

    const defBones =
      prefix === ""
        ? skeleton.bones
        : skeleton.bones.filter((bone) => bone.name.startsWith(prefix))

    console.group(`Bones in Skeleton: ${skeleton.name}`)
    defBones.forEach((bone) => {
      if (SKELETON_MAP.female && !SKELETON_MAP.female[bone.name.toString()])
        console.log(bone.name)
    })
    console.groupEnd()

    console.info(`Found ${defBones.length} ${prefix} bones.`)
  }

  /**
   * @private
   * Apply current scale values from controlPanelBones to all registered bones
   *
   * @param { BABYLON.Skeleton } skeleton - Skeleton to apply the scale
   *
   * @returns { void }
   */
  private applyBoneScales(skeleton: BABYLON.Skeleton): void {
    Object.keys(this.controlPanelBones).forEach((boneName) => {
      const boneData = this.controlPanelBones[boneName]
      if (boneData?.isDirty) {
        const scaleValue = boneData.value
        const scaleVector = new BABYLON.Vector3(
          scaleValue,
          scaleValue,
          scaleValue,
        )
        this.resizeBone(skeleton, boneName, scaleVector)
        boneData.isDirty = false
      }
    })
    if (this.characterAssets?.meshes) {
      this.characterAssets.meshes.forEach((mesh) => {
        if (mesh.skeleton === skeleton) {
          mesh.refreshBoundingInfo({ applySkeleton: true })
          mesh.markAsDirty()
          mesh.computeWorldMatrix(true)
          if (mesh instanceof BABYLON.Mesh && mesh.geometry) {
            mesh.geometry.applyToMesh(mesh)
          }
        }
      })
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
    const { w, a, s, d } = key
    let moveDir = new BABYLON.Vector3(0, 0, 0)

    if (this.characterRoot && camera && (w || a || s || d)) {
      const camDir = camera.getDirection(BABYLON.Vector3.Forward()).normalize()
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
        this.characterRoot.position.addInPlace(
          moveDir.scale(this.characterAttribute.speed),
        )

        const targetAngle = Math.atan2(camDir.x, camDir.z) + Math.PI
        this.characterRoot.rotation.y = BABYLON.Scalar.Lerp(
          this.characterRoot.rotation.y,
          targetAngle,
          this.characterAttribute.turnSpeed,
        )
      }
    }

    if (this.characterRoot) {
      camera.target = new BABYLON.Vector3(
        this.characterRoot.position.x,
        this.characterRoot.position.y + 1,
        this.characterRoot.position.z,
      )
    }
  }

  /**
   * @private
   * Register skeleton bones to control panel for dynamic resizing
   *
   * @param { BABYLON.Skeleton } skeleton - Character skeleton collection to register on bones
   *
   * @returns { void }
   */
  private controlPanelRegisterBones(skeleton: BABYLON.Skeleton): void {
    const keyBones = [
      "pelvis",
      "breast",
      "arm",
      "thigh",
      "shoulder",
      "neck",
      "head",
      "forearm",

      /** Facial Control. */
      "forehead",
      "nose",
      "lip",
      "jaw",
      "chin",
      "ear",
      "brow",
      "lid",
      // "eye",
    ]
    const processedPairs: Set<string> = new Set()

    skeleton.bones.forEach((bone) => {
      if (
        bone.name.startsWith("DEF-") &&
        keyBones.some((key) => bone.name.toLowerCase().includes(key)) &&
        !this.controlPanelBones[bone.name]
      ) {
        const isLeft = bone.name.endsWith(".L")
        const isRight = bone.name.endsWith(".R")
        const isLeft001 = bone.name.endsWith(".L.001")
        const isRight001 = bone.name.endsWith(".R.001")
        const isLeft002 = bone.name.endsWith(".L.002")
        const isRight002 = bone.name.endsWith(".R.002")
        const isLeft003 = bone.name.endsWith(".L.003")
        const isRight003 = bone.name.endsWith(".R.003")
        const isLeft004 = bone.name.endsWith(".L.004")
        const isRight004 = bone.name.endsWith(".R.004")
        const baseName = isLeft
          ? bone.name.replace(".L", "")
          : isRight
            ? bone.name.replace(".R", "")
            : isLeft001
              ? bone.name.replace(".L.001", "")
              : isRight001
                ? bone.name.replace(".R.001", "")
                : isLeft002
                  ? bone.name.replace(".L.002", "")
                  : isRight002
                    ? bone.name.replace(".R.002", "")
                    : isLeft003
                      ? bone.name.replace(".L.003", "")
                      : isRight003
                        ? bone.name.replace(".R.003", "")
                        : isLeft004
                          ? bone.name.replace(".L.004", "")
                          : isRight004
                            ? bone.name.replace(".R.004", "")
                            : bone.name

        // This block is used to identify paired body part. But not in used currently
        /**
         * const pairKey =
          isLeft ||
          isRight ||
          isLeft001 ||
          isRight001 ||
          isLeft002 ||
          isRight002
            ? baseName
            : bone.name
         */

        if (
          (isLeft ||
            isRight ||
            isLeft001 ||
            isRight001 ||
            isLeft002 ||
            isRight002 ||
            isLeft003 ||
            isRight003 ||
            isLeft004 ||
            isRight004) &&
          processedPairs.has(baseName)
        ) {
          return
        }

        // Check for overrides based on baseName (without DEF-)
        const overrideKey = baseName.replace("DEF-", "").toLowerCase()
        const config = this.boneConfigOverrides[overrideKey] || {
          minimum: 0.5,
          maximum: 3.0,
        }

        this.controlPanelBones[bone.name] = {
          minimum: config.minimum,
          maximum: config.maximum,
          value: 1.0,
          step: 0.0001,
          isDirty: false,
        }

        if (
          isLeft ||
          isRight ||
          isLeft001 ||
          isRight001 ||
          isLeft002 ||
          isRight002 ||
          isLeft003 ||
          isRight003 ||
          isLeft004 ||
          isRight004
        ) {
          const pairedBoneNames = [
            `${baseName}.L`,
            `${baseName}.R`,
            `${baseName}.L.001`,
            `${baseName}.R.001`,
            `${baseName}.L.002`,
            `${baseName}.R.002`,
            `${baseName}.L.003`,
            `${baseName}.R.003`,
            `${baseName}.L.004`,
            `${baseName}.R.004`,
          ].filter((name) => name !== bone.name)
          pairedBoneNames.forEach((pairedBoneName) => {
            const pairedBone = skeleton.bones.find(
              (b) => b.name === pairedBoneName,
            )
            if (pairedBone && !this.controlPanelBones[pairedBoneName]) {
              this.controlPanelBones[pairedBoneName] = {
                minimum: config.minimum,
                maximum: config.maximum,
                value: 1.0,
                step: 0.0001,
                isDirty: false,
              }
            }
          })
          processedPairs.add(baseName)
        }
      }
    })
  }

  /**
   * @private
   * Resize a bone in the skeleton based on its name
   *
   * @param skeleton - The skeleton containing the bones
   * @param name - Exact bone name to match
   * @param scale - The scale vector to apply
   * @param inverse - Whether to apply inverse scaling (e.g., 1/scale)
   *
   * @returns {Array<{name: string, originalScale: BABYLON.Vector3}>} - Original scales of matched bones
   */
  private resizeBone(
    skeleton: BABYLON.Skeleton,
    name: string,
    scale: BABYLON.Vector3,
  ): Array<{ name: string; originalScale: BABYLON.Vector3 }> {
    const bone = skeleton.bones.find((b) => b.name === name)
    const originalScales: Array<{
      name: string
      originalScale: BABYLON.Vector3
    }> = []

    if (!bone) {
      return originalScales
    }

    /** Identify paired bone and children. */
    const isLeft = name.endsWith(".L")
    const isRight = name.endsWith(".R")
    const isLeft001 = name.endsWith(".L.001")
    const isRight001 = name.endsWith(".R.001")
    const isLeft002 = name.endsWith(".L.002")
    const isRight002 = name.endsWith(".R.002")
    const baseName = isLeft
      ? name.replace(".L", "")
      : isRight
        ? name.replace(".R", "")
        : isLeft001
          ? name.replace(".L.001", "")
          : isRight001
            ? name.replace(".R.001", "")
            : isLeft002
              ? name.replace(".L.002", "")
              : isRight002
                ? name.replace(".R.002", "")
                : name
    const pairedBoneNames = [
      `${baseName}.L`,
      `${baseName}.R`,
      `${baseName}.L.001`,
      `${baseName}.R.001`,
      `${baseName}.L.002`,
      `${baseName}.R.002`,
    ].filter((n) => n !== name)
    const pairedBones = pairedBoneNames
      .map((pairedName) => skeleton.bones.find((b) => b.name === pairedName))
      .filter((b) => b) as BABYLON.Bone[]

    originalScales.push({
      name: bone.name,
      originalScale: bone.scaling.clone(),
    })
    pairedBones.forEach((pairedBone) => {
      originalScales.push({
        name: pairedBone.name,
        originalScale: pairedBone.scaling.clone(),
      })
    })

    /** Apply scale directly (0.5 = smaller, 3.0 = larger). */
    const effectiveScale = new BABYLON.Vector3(
      Math.max(scale.x, 0.8),
      Math.max(scale.y, 0.8),
      Math.max(scale.z, 0.8),
    )

    /** Animate main bone. */
    const animation = new BABYLON.Animation(
      "boneScale",
      "scaling",
      30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
    )
    animation.setKeys([
      { frame: 0, value: bone.scaling.clone() },
      { frame: 15, value: effectiveScale }, // 0.5s transition
    ])
    bone.animations = [animation]
    this.scene.beginAnimation(bone, 0, 15, false, 1.0)

    /** Animate paired bones */
    pairedBones.forEach((pairedBone) => {
      const pairedAnimation = new BABYLON.Animation(
        "boneScale",
        "scaling",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      )
      pairedAnimation.setKeys([
        { frame: 0, value: pairedBone.scaling.clone() },
        { frame: 15, value: effectiveScale },
      ])
      pairedBone.animations = [pairedAnimation]
      this.scene.beginAnimation(pairedBone, 0, 15, false, 1.0)
    })

    bone.scaling = effectiveScale
    pairedBones.forEach((pairedBone) => {
      pairedBone.scaling = effectiveScale
      // pairedBone._constraint = null
      pairedBone.markAsDirty()
      pairedBone._markAsDirtyAndCompose()
      pairedBone.updateMatrix(pairedBone.getLocalMatrix(), true, true)
    })

    // bone._constraint = null
    bone.markAsDirty()
    bone._markAsDirtyAndCompose()
    bone.updateMatrix(bone.getLocalMatrix(), true, true)

    skeleton.computeAbsoluteTransforms()
    skeleton.prepare()

    return originalScales
  }

  // TODO : Animation preparation
  // private updateAnimation(key: KeyState): void {
  //   if (!this.isLoaded) {
  //     return
  //   }
  // }

  // public getRoot(): BABYLON.TransformNode | null {
  //   return this.characterRoot
  // }

  // public getRegisteredBones() {
  //   return this.controlPanelBones
  // }

  get getRoot(): BABYLON.TransformNode | null {
    return this.characterRoot
  }

  get getRegisteredBones() {
    return this.controlPanelBones
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
