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
   * Create a GUI panel for controlling bone scales
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
    console.log(
      `Creating sliders for ${Object.keys(this.controlPanelBones).length} bones`,
    )
    Object.keys(this.controlPanelBones).forEach((key) => {
      const itemDetail: any = this.controlPanelBones[key]
      const boneScaleSlider = new GUI.Slider()
      boneScaleSlider.minimum = itemDetail.minimum
      boneScaleSlider.maximum = itemDetail.maximum
      boneScaleSlider.value = itemDetail.value
      boneScaleSlider.step = itemDetail.step
      boneScaleSlider.height = "20px"
      boneScaleSlider.width = "250px"
      boneScaleSlider.onValueChangedObservable.add((value) => {
        console.log(`Slider changed for ${key}: New value ${value}`)

        if (this.controlPanelBones[key]) {
          this.controlPanelBones[key].value = value
          this.controlPanelBones[key].isDirty = true
        }

        console.log(
          `Updated controlPanelBones[${key}]:`,
          this.controlPanelBones[key],
        )
      })
      const boneHeaderLabel = new GUI.TextBlock()
      boneHeaderLabel.text = key
      boneHeaderLabel.height = "20px"
      boneHeaderLabel.color = "white"
      panel.addControl(boneHeaderLabel)
      panel.addControl(boneScaleSlider)
    })
    this.isControlPanelCreated = true
    console.log(
      `Control panel created with ${panel.children.length / 2} sliders`,
    )
  }

  /**
   * Apply current scale values from controlPanelBones to all registered bones
   */
  private applyBoneScales(skeleton: BABYLON.Skeleton): void {
    console.log(
      `Applying scales for skeleton: ${skeleton.name}, bound meshes:`,
      this.characterAssets?.meshes
        .filter((m) => m.skeleton === skeleton)
        .map((m) => m.name) || "None",
    )
    Object.keys(this.controlPanelBones).forEach((boneName) => {
      const boneData = this.controlPanelBones[boneName]
      if (boneData?.isDirty) {
        const scaleValue = boneData.value
        const scaleVector = new BABYLON.Vector3(
          scaleValue,
          scaleValue,
          scaleValue,
        )
        console.log(`Applying scale ${scaleValue} to bone ${boneName}`)
        this.resizeBone(skeleton, boneName, scaleVector, false)
        boneData.isDirty = false
      }
    })
    if (this.characterAssets?.meshes) {
      this.characterAssets.meshes.forEach((mesh) => {
        if (mesh.skeleton === skeleton) {
          mesh.refreshBoundingInfo({ applySkeleton: true })
          const boundingInfo = mesh.getBoundingInfo().boundingBox
          console.log(
            `Refreshed mesh: ${mesh.name}, Bounding min:`,
            boundingInfo.minimum.toArray([], 0),
            `max:`,
            boundingInfo.maximum.toArray([], 0),
          )
          ;["DEF-pelvis.R", "DEF-breast.L"].forEach((boneName) => {
            const bone = skeleton.bones.find((b) => b.name === boneName)
            if (bone && mesh.subMeshes && mesh.skeleton) {
              const boneIndex = skeleton.getBoneIndexByName(bone.name)
              const weights = mesh.getVerticesData(
                BABYLON.VertexBuffer.MatricesWeightsKind,
              )
              const indices = mesh.getVerticesData(
                BABYLON.VertexBuffer.MatricesIndicesKind,
              )
              const weightCount =
                weights && indices
                  ? weights.filter(
                      (w, i) =>
                        i % 4 === 0 && w > 0 && indices[i] === boneIndex,
                    ).length
                  : 0
              console.log(
                `Vertex weights for ${boneName} on ${mesh.name}: ${weightCount} vertices`,
              )
            }
          })
          mesh.markAsDirty()
          mesh.computeWorldMatrix(true) // Force full update
        }
      })
    }
    if (this.characterAssets?.animationGroups) {
      const activeAnims = this.characterAssets.animationGroups.filter(
        (ag) => ag.isPlaying,
      )
      console.log(
        `Active animations check:`,
        activeAnims.length > 0
          ? activeAnims.map((ag) => ag.name)
          : "No active animations",
      )
      if (activeAnims.length > 0) {
        console.warn(
          `Active animations may override bone scaling:`,
          activeAnims.map((ag) => ag.name),
        )
      }
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

          console.log(
            `Mesh: ${clone.name}, Has skeleton: ${!!clone.skeleton}, Skeleton name: ${clone.skeleton?.name || "None"}`,
          )
          console.log(
            `Mesh: ${clone.name}, Applied model scale:`,
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
      console.log(`Stopping animation: ${ag.name}`)
      ag.stop()
      ag.onAnimationGroupPlayObservable.clear() // Prevent restarts
      ag.onAnimationGroupLoopObservable.clear()
    })
    // Clone materials
    this.characterAssets.materials = asset.materials
      .map((mat) => mat.clone(`${mat.name}_${this.characterAttribute.modelId}`))
      .filter((m) => m !== null)

    // Clone animations
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
      console.log(
        `Render loop: Applying bone scales for ${this.characterAssets?.skeletons.length || 0} skeletons`,
      )
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
   * Log the parent bones of bones matching a given regex pattern
   * @param skeleton - The skeleton to inspect
   * @param pattern - Regex pattern to match bone names
   */
  private logBonesHierarchy(skeleton: BABYLON.Skeleton, pattern: RegExp): void {
    const matchingBones = skeleton.bones.filter((b) => pattern.test(b.name))

    if (matchingBones.length === 0) {
      console.warn(`No bones matched pattern: ${pattern}`)
      return
    }

    matchingBones.forEach((bone) => {
      const parentBone = bone.getParent()
      if (parentBone) {
        const parentScale = parentBone.scaling.clone()
        console.log(
          `Bone "${bone.name}" has parent "${parentBone.name}" with scale:`,
          {
            x: parentScale.x,
            y: parentScale.y,
            z: parentScale.z,
          },
        )
      } else {
        console.log(`Bone "${bone.name}" has no parent (root bone)`)
      }
    })
  }

  /**
   * Register skeleton bones to control panel for dynamic resizing
   */
  private controlPanelRegisterBones(skeleton: BABYLON.Skeleton): void {
    const keyBones = ["pelvis", "breast", "arm", "thigh", "spine", "shoulder"]
    skeleton.bones.forEach((bone) => {
      if (
        bone.name.startsWith("DEF-") &&
        keyBones.some((key) => bone.name.toLowerCase().includes(key)) &&
        !this.controlPanelBones[bone.name]
      ) {
        console.log(`Registered deform bone: ${bone.name}`)
        this.controlPanelBones[bone.name] = {
          minimum: 0.1,
          maximum: 1.0,
          value: 1.0,
          step: 0.1,
          isDirty: false,
        }
      }
    })
    console.log(
      `Total bones registered: ${Object.keys(this.controlPanelBones).length}`,
    )
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
    inverse: boolean = false,
  ): Array<{ name: string; originalScale: BABYLON.Vector3 }> {
    const bone = skeleton.bones.find((b) => b.name === name)
    const originalScales: Array<{
      name: string
      originalScale: BABYLON.Vector3
    }> = []

    if (!bone) {
      console.warn(`No bones matched: ${name}`)
      return originalScales
    }

    const originalScale = bone.scaling.clone()
    originalScales.push({ name: bone.name, originalScale })
    console.log(`Bone "${bone.name}" original scale:`, {
      x: originalScale.x,
      y: originalScale.y,
      z: originalScale.z,
    })

    // Log and scale parent hierarchy
    let currentBone: BABYLON.Bone | null = bone
    const parentBones: BABYLON.Bone[] = []
    while (currentBone && currentBone.parent) {
      parentBones.push(currentBone.parent)
      currentBone = currentBone.parent
    }
    parentBones.forEach((parent) => {
      console.log(`Parent bone "${parent.name}" original scale:`, {
        x: parent.scaling.x,
        y: parent.scaling.y,
        z: parent.scaling.z,
      })
      originalScales.push({
        name: parent.name,
        originalScale: parent.scaling.clone(),
      })
    })

    let effectiveScale = scale.clone()
    if (inverse) {
      const epsilon = 0.001
      effectiveScale = new BABYLON.Vector3(
        scale.x > epsilon ? 1 / scale.x : 1 / epsilon,
        scale.y > epsilon ? 1 / scale.y : 1 / epsilon,
        scale.z > epsilon ? 1 / scale.z : 1 / epsilon,
      )
      console.log(`Applying inverse scale for "${bone.name}":`, {
        x: effectiveScale.x,
        y: effectiveScale.y,
        z: effectiveScale.z,
      })
    }
    effectiveScale = new BABYLON.Vector3(
      originalScale.x * effectiveScale.x,
      originalScale.y * effectiveScale.y,
      originalScale.z * effectiveScale.z,
    )
    effectiveScale.x = Math.max(effectiveScale.x, 0.5)
    effectiveScale.y = Math.max(effectiveScale.y, 0.5)
    effectiveScale.z = Math.max(effectiveScale.z, 0.5)

    bone.scaling = effectiveScale
    // Scale all parent bones
    parentBones.forEach((parent) => {
      parent.scaling = effectiveScale
      parent._markAsDirtyAndCompose()
      parent.updateMatrix(parent.getLocalMatrix(), true, true)
    })
    bone.markAsDirty()
    bone._markAsDirtyAndCompose()
    bone.updateMatrix(bone.getLocalMatrix(), true, true)
    console.log(`✅ Resized bone "${bone.name}" to`, {
      x: bone.scaling.x,
      y: bone.scaling.y,
      z: bone.scaling.z,
    })

    const finalMatrix = bone.getFinalMatrix()
    const scaleFromMatrix = new BABYLON.Vector3()
    finalMatrix.decompose(scaleFromMatrix)
    console.log(`Bone "${bone.name}" final matrix scale:`, {
      x: scaleFromMatrix.x,
      y: scaleFromMatrix.y,
      z: scaleFromMatrix.z,
    })
    console.log(
      `Bone "${bone.name}" world position:`,
      bone.getAbsolutePosition().toArray([], 0),
      `world scale:`,
      (() => {
        const worldScale = new BABYLON.Vector3()
        bone.computeWorldMatrix(true).decompose(worldScale)
        return worldScale.toArray([], 0)
      })(),
    )

    skeleton.computeAbsoluteTransforms()
    skeleton.prepare()

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
