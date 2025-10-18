import * as BABYLON from "babylonjs"
import * as GUI from "babylonjs-gui"
import type { CharacterAttribute } from "__&types/Character"
import type { Matrix } from "__&types/Matrix"
import { __Label__ } from "__&GL/label"
import type { KeyState } from "__&interfaces/keyboard"

/**
 * Character Management
 *
 * @class
 */
export class __Character__ {
  /** @private */
  private scene: BABYLON.Scene

  /** @private */
  private label: __Label__

  /** @private */
  private characterAssets: BABYLON.AssetContainer | null = null

  /** @private */
  private characterAttribute: CharacterAttribute

  private characterRoot: BABYLON.TransformNode | null = null

  private labelPlane: BABYLON.Mesh | null = null
  private labelUpdateObserver: BABYLON.Observer<BABYLON.Scene> | null = null

  protected isLoaded: boolean = false
  private loadPromise: Promise<void>

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
  private isControlPanelCreated: boolean = false

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

  private currentAction: BABYLON.AnimationGroup | null = null
  private actionMap: Record<string, BABYLON.AnimationGroup> = {}
  private lastMovementState: string = ""
  private sideSpeed: number = 0.05
  private runSpeed: number = 0.3

  /**
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
    scene.debugLayer.show({
      embedMode: false,
      overlay: true,
      handleResize: true,
    })
    this.label = new __Label__(scene)
    this.characterAttribute = characterAttribute

    this.loadPromise = this.initCharacter(
      characterAttribute.position,
      characterSharedAsset,
    ).then(() => {
      this.createScaleControlPanel() // Create GUI after bones are registered
    })
  }

  /**
   * @private
   * Create a GUI panel for controlling bone scales
   *
   * @returns
   */
  private createScaleControlPanel(): void {
    if (this.isControlPanelCreated) return
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "UI",
      true,
      this.scene,
    )
    const scrollViewer = new GUI.ScrollViewer()
    scrollViewer.width = "400px"
    scrollViewer.height = "400px"
    scrollViewer.thickness = 2
    scrollViewer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
    scrollViewer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
    advancedTexture.addControl(scrollViewer)
    const panel = new GUI.StackPanel()
    panel.width = "380px"
    scrollViewer.addControl(panel)

    const processedGroups: Set<string> = new Set()
    const boneKeys = Object.keys(this.controlPanelBones)

    boneKeys.forEach((key) => {
      const isLeft = key.endsWith(".L")
      const isRight = key.endsWith(".R")
      const isLeft001 = key.endsWith(".L.001")
      const isRight001 = key.endsWith(".R.001")
      const isLeft002 = key.endsWith(".L.002")
      const isRight002 = key.endsWith(".R.002")
      const baseName = isLeft
        ? key.replace(".L", "")
        : isRight
          ? key.replace(".R", "")
          : isLeft001
            ? key.replace(".L.001", "")
            : isRight001
              ? key.replace(".R.001", "")
              : isLeft002
                ? key.replace(".L.002", "")
                : isRight002
                  ? key.replace(".R.002", "")
                  : key

      if (
        (isLeft ||
          isRight ||
          isLeft001 ||
          isRight001 ||
          isLeft002 ||
          isRight002) &&
        processedGroups.has(baseName)
      ) {
        return
      }

      const itemDetail: any = this.controlPanelBones[key]
      const boneScaleSlider = new GUI.Slider()
      boneScaleSlider.minimum = itemDetail.minimum // 0.5 = smaller
      boneScaleSlider.maximum = itemDetail.maximum // 3.0 = larger
      boneScaleSlider.value = itemDetail.value
      boneScaleSlider.step = itemDetail.step
      boneScaleSlider.height = "20px"
      boneScaleSlider.width = "250px"

      const isPaired =
        isLeft || isRight || isLeft001 || isRight001 || isLeft002 || isRight002
      const displayName = isPaired ? baseName.replace("DEF-", "") : key

      boneScaleSlider.onValueChangedObservable.add((value) => {
        if (this.controlPanelBones[key]) {
          this.controlPanelBones[key].value = value
          this.controlPanelBones[key].isDirty = true
        }

        if (isPaired) {
          const pairedBoneNames = [
            `${baseName}.L`,
            `${baseName}.R`,
            `${baseName}.L.001`,
            `${baseName}.R.001`,
            `${baseName}.L.002`,
            `${baseName}.R.002`,
          ].filter((name) => name !== key)
          pairedBoneNames.forEach((pairedBoneName) => {
            if (this.controlPanelBones[pairedBoneName]) {
              this.controlPanelBones[pairedBoneName].value = value
              this.controlPanelBones[pairedBoneName].isDirty = true
            }
          })
        }
      })

      const boneHeaderLabel = new GUI.TextBlock()
      boneHeaderLabel.text = displayName
      boneHeaderLabel.height = "20px"
      boneHeaderLabel.color = "white"
      panel.addControl(boneHeaderLabel)
      panel.addControl(boneScaleSlider)

      if (isPaired) {
        processedGroups.add(baseName)
      }
    })

    this.isControlPanelCreated = true
  }

  /**
   * @private
   * Apply current scale values from controlPanelBones to all registered bones
   *
   * @param { BABYLON.Skeleton } skeleton - Skeleton to apply the scale
   * @returns
   */
  private applyBoneScales(skeleton: BABYLON.Skeleton): void {
    Object.keys(this.controlPanelBones).forEach((boneName) => {
      const boneData = this.controlPanelBones[boneName]
      if (boneData?.isDirty) {
        const scaleValue = boneData.value // Direct use of slider value
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
            // mesh.geometry._resetVertexData()
            mesh.geometry.applyToMesh(mesh)
          }
        }
      })
    }
  }

  /**
   * @protected
   * Character model initiate from shared asset
   *
   * @param { Matrix } position - Character set position
   * @param { BABYLON.AssetContainer } asset - Shared asset
   * @returns
   */
  protected async initCharacter(
    position: Matrix,
    asset: BABYLON.AssetContainer,
  ): Promise<void> {
    if (!asset) throw new Error("GLTFCharacterTemplate not initialized")

    this.characterAssets = new BABYLON.AssetContainer(this.scene)

    // Clone skeletons
    this.characterAssets.skeletons = asset.skeletons.map((skeleton) =>
      skeleton.clone(`${skeleton.name}_${this.characterAttribute.modelId}`),
    )

    // Clone meshes and bind skeletons
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

          // Rebind skeleton
          if (mesh.skeleton) {
            const clonedSkeleton = this.characterAssets!.skeletons.find((s) =>
              s.name.includes(mesh.skeleton!.name.split("_")[0] ?? ""),
            )
            if (clonedSkeleton) {
              clone.skeleton = clonedSkeleton

              this.controlPanelRegisterBones(clonedSkeleton) // Register bones once

              clonedSkeleton.computeAbsoluteTransforms()
              clonedSkeleton.prepare()
            }
          }
        }
        return clone
      })
      .filter((m): m is BABYLON.AbstractMesh => m !== null)
    // Stop animations to test if they override scaling
    this.characterAssets.animationGroups.forEach((ag) => {
      ag.stop()
      ag.onAnimationGroupPlayObservable.clear() // Prevent restarts
      ag.onAnimationGroupLoopObservable.clear()
    })
    // Clone materials
    this.characterAssets.materials = asset.materials
      .map((mat) => mat.clone(`${mat.name}_${this.characterAttribute.modelId}`))
      .filter((m) => m !== null)

    // TODO : Clone animations
    // this.characterAssets.animationGroups = asset.animationGroups.map(
    //   (group) => {
    //     const animateClone = group.clone(
    //       `${group.name}_${this.characterAttribute.modelId}`,
    //       (target) => {
    //         return (
    //           this.characterAssets!.meshes.find((m) =>
    //             m.name.includes(target.name),
    //           ) || target
    //         )
    //       },
    //     )
    //     this.animations[`${group.name}_${this.characterAttribute.modelId}`] =
    //       animateClone
    //     return animateClone
    //   },
    // )

    // Set up character root
    this.characterRoot = new BABYLON.TransformNode(
      `character_root_${this.characterAttribute.modelId}`,
      this.scene,
    )

    this.characterAssets.meshes.forEach((mesh) => {
      mesh.setParent(this.characterRoot)
      mesh.position.set(0, 0, 0)
    })

    this.characterRoot.position = new BABYLON.Vector3(
      position.x,
      position.y,
      position.z,
    )
    this.characterAssets.addAllToScene()

    // Add label
    ;({ plane: this.labelPlane, observer: this.labelUpdateObserver } =
      this.label.makeLabel(
        this.characterAttribute.information.name,
        this.characterRoot,
      ))

    // Add axes for debugging
    if (this.characterRoot) {
      const axes = new BABYLON.AxesViewer(this.scene, 1)
      axes.xAxis.parent = this.characterRoot
      axes.yAxis.parent = this.characterRoot
      axes.zAxis.parent = this.characterRoot
    }

    // Add render loop to apply bone scaling
    this.scene.registerBeforeRender(() => {
      if (this.characterAssets?.skeletons && this.isControlPanelCreated) {
        this.characterAssets.skeletons.forEach((skeleton) => {
          this.applyBoneScales(skeleton) // Apply current slider values
        })
      }
    })

    this.isLoaded = true
  }

  /**
   * @public
   * Model load state
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
   * @returns
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
   * Register skeleton bones to control panel for dynamic resizing
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
                    : bone.name

        // const pairKey =
        //   isLeft ||
        //   isRight ||
        //   isLeft001 ||
        //   isRight001 ||
        //   isLeft002 ||
        //   isRight002
        //     ? baseName
        //     : bone.name

        if (
          (isLeft ||
            isRight ||
            isLeft001 ||
            isRight001 ||
            isLeft002 ||
            isRight002) &&
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
          isRight002
        ) {
          const pairedBoneNames = [
            `${baseName}.L`,
            `${baseName}.R`,
            `${baseName}.L.001`,
            `${baseName}.R.001`,
            `${baseName}.L.002`,
            `${baseName}.R.002`,
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
   * Resize a bone in the skeleton based on its name
   * @param skeleton - The skeleton containing the bones
   * @param name - Exact bone name to match
   * @param scale - The scale vector to apply
   * @param inverse - Whether to apply inverse scaling (e.g., 1/scale)
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

    // Identify paired bone and children
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

    // Store original scales
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

    // Apply scale directly (0.5 = smaller, 3.0 = larger)
    const effectiveScale = new BABYLON.Vector3(
      Math.max(scale.x, 0.8),
      Math.max(scale.y, 0.8),
      Math.max(scale.z, 0.8),
    )

    // Animate main bone
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

    // Animate paired bones
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

    console.log(effectiveScale)

    return originalScales
  }

  private updateAnimation(key: KeyState): void {
    if (!this.isLoaded) {
      return
    }
  }

  /**
   * @public
   * Get character root
   *
   * @returns
   */
  public getRoot(): BABYLON.TransformNode | null {
    return this.characterRoot
  }

  /**
   * @public
   * Destroy character meshes
   *
   * @returns
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
