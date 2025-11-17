import * as BABYLON from "babylonjs"
import * as GUI from "babylonjs-gui"
import "babylonjs-loaders"
import Stats from "stats.js"
import type { CharacterAttribute } from "#types/Character"
import { EagerWing___CameraCreation } from "#GL/camera/creation"
import { EagerWing___Character } from "#GL/character"
import { SKELETON_MAP } from "#constants/map.skeleton"
import { CharacterCreationStore } from "#stores/creation.ts"
import { EagerWing___AssetManager } from "#utils/asset.manager.ts"

/**
 * @fileoverview Character creation module.
 * @module EagerWing___CharacterCreation
 */

/**
 * Organize character creation to produce configured meta data
 *
 * @example
 * const canvas = document.createElement("canvas")
 * const creation = new EagerWing___CharacterCreation(canvas);
 *
 */

export class EagerWing___CharacterCreation {
  /** The active BabylonJS scene used for load. */
  private scene: BABYLON.Scene

  /** Engine renderer. */
  private engine: BABYLON.Engine

  /** Camera. */
  private camera: BABYLON.ArcRotateCamera | null = null

  /** Stats. */
  private stats: Stats
  private cameraInstance: EagerWing___CameraCreation | null = null

  private assetManager: EagerWing___AssetManager

  /** Pinia Stpre */
  private store: CharacterCreationStore | null = null

  private characterInstance: EagerWing___Character | null = null
  private GLTFCharacter: BABYLON.AssetContainer | null = null
  private characterRoot: BABYLON.TransformNode | null = null

  // Wallpaper background elements
  private bgDiv: HTMLDivElement | null = null
  private bgImg: HTMLImageElement | null = null
  private defaultRadius: number = 2.0 // Will be set dynamically

  // Control Panel
  private isControlPanelCreated: boolean = false
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

  /**
   * Character Creation Manager initiation. Pass canvas element to organize the render
   *
   * @param { HTMLCanvasElement } canvas - Canvas used for load animation
   */
  constructor(
    canvas: HTMLCanvasElement,
    characterAttribute: CharacterAttribute,
    store: CharacterCreationStore,
  ) {
    this.store = store
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.id = "renderCanvas"
    document.body.appendChild(canvas)
    this.engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    })

    this.scene = new BABYLON.Scene(this.engine)
    // this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)
    this.scene.clearColor = new BABYLON.Color4(
      0x0c / 255,
      0x12 / 255,
      0x28 / 255,
      1.0,
    )

    this.cameraInstance = new EagerWing___CameraCreation(
      this.engine,
      this.scene,
      "001",
    )

    this.assetManager = new EagerWing___AssetManager(this.scene)

    // ========================================== TIDY BELOW

    const light = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene,
    )
    light.intensity = 0.7

    this.stats = new Stats()
    this.stats.showPanel(0)
    // document.body.appendChild(this.stats.dom)

    this.camera = this.cameraInstance.getCamera()

    this.init(characterAttribute).then(() => {
      this.animate()
    })
  }

  /**
   * Init routine
   * @async
   * [SECTION-001] - Define list off asset to load
   */
  async init(characterAttribute: CharacterAttribute) {
    // [SECTION-001]
    await this.assetManager.loadAll({
      // Basic character model
      character: "../characters/Female/Female.Meshed.glb",

      // Load all available hair styles
      hair_001: "../characters/Female/Hair.001.glb",

      // Load all available clothes
      clothes: "",
    })

    const characterAsset = this.assetManager.get("character")
    if (characterAsset) this.GLTFCharacter = characterAsset

    if (this.GLTFCharacter) {
      this.characterInstance = new EagerWing___CharacterCreation(
        this.scene,
        this.GLTFCharacter,
        characterAttribute,
      )

      const characterRoot = this.characterInstance.getRoot
      if (this.cameraInstance && characterRoot) {
        this.characterRoot = characterRoot
        if (this.store)
          this.store.updateBones(this.characterInstance.getBoneCollection)
        this.focusHead()
      }

      this.scene.activeCamera = this.camera
    }
  }

  // TODO : TIDY BELOW

  public getCharacterBoneCollection() {
    return this.characterInstance?.getBoneCollection
  }

  /**
   * Move and focus camera for head customization
   *
   * @returns {void}
   */
  public focusHead(): void {
    if (this.cameraInstance && this.characterInstance && this.characterRoot) {
      const boneName = Object.entries(SKELETON_MAP.female ?? "").find(
        ([key, value]) => value.identifier === "TONGUE001",
      )?.[0]

      if (boneName) {
      }

      const findBone = boneName
        ? (this.scene
            .getBoneByName(boneName)
            ?.getFinalMatrix()
            .getTranslation() ?? this.characterRoot.position)
        : this.characterRoot.position

      this.cameraInstance.focusTo(findBone, 0.6)
    }
  }

  /**
   * Move and focus camera for body customization
   *
   * @returns {void}
   */
  public focusUpper(): void {
    if (this.cameraInstance && this.characterInstance && this.characterRoot) {
      const boneName = Object.entries(SKELETON_MAP.female ?? "").find(
        ([key, value]) => value.identifier === "SPINE004",
      )?.[0]

      if (boneName) {
      }

      const findBone = boneName
        ? (this.scene
            .getBoneByName(boneName)
            ?.getFinalMatrix()
            .getTranslation() ?? this.characterRoot.position)
        : this.characterRoot.position

      this.cameraInstance.focusTo(findBone, 1)
    }
  }

  /**
   * Move and focus camera for lower body customization
   *
   * @returns {void}
   */
  public focusLower(): void {
    if (this.cameraInstance && this.characterInstance && this.characterRoot) {
      const boneName = Object.entries(SKELETON_MAP.female ?? "").find(
        ([key, value]) => value.identifier === "SPINE001",
      )?.[0]

      if (boneName) {
      }

      const findBone = boneName
        ? (this.scene
            .getBoneByName(boneName)
            ?.getFinalMatrix()
            .getTranslation() ?? this.characterRoot.position)
        : this.characterRoot.position

      this.cameraInstance.focusTo(
        findBone.add(new BABYLON.Vector3(0, -0.52, 0)),
        1.2,
      )
    }
  }

  /**
   * Move and focus camera for lower body customization
   *
   * @returns {void}
   */
  public focusFull(): void {
    if (this.cameraInstance && this.characterInstance && this.characterRoot) {
      const boneName = Object.entries(SKELETON_MAP.female ?? "").find(
        ([key, value]) => value.identifier === "SPINE001",
      )?.[0]

      if (boneName) {
      }

      const findBone = boneName
        ? (this.scene
            .getBoneByName(boneName)
            ?.getFinalMatrix()
            .getTranslation() ?? this.characterRoot.position)
        : this.characterRoot.position

      this.cameraInstance.focusTo(findBone, 5)
    }
  }

  /**
   * Update skin tone from control panel
   *
   * @param {string} color - Hex color string
   * @returns {void}
   */
  public applySkinTone(color: string): void {
    this.characterInstance?.applySkinTone(color)
  }

  /**
   * @private
   * Create a GUI panel for controlling bone scales
   *
   * @returns { void }
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
      const isLeft003 = key.endsWith(".L.003")
      const isRight003 = key.endsWith(".R.003")
      const isLeft004 = key.endsWith(".L.004")
      const isRight004 = key.endsWith(".R.004")
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
                  : isLeft003
                    ? key.replace(".L.003", "")
                    : isRight003
                      ? key.replace(".R.003", "")
                      : isLeft004
                        ? key.replace(".L.004", "")
                        : isRight004
                          ? key.replace(".R.004", "")
                          : key

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
            `${baseName}.L.003`,
            `${baseName}.R.003`,
            `${baseName}.L.004`,
            `${baseName}.R.004`,
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

  animate(): void {
    this.stats.begin()
    this.engine.runRenderLoop(() => {
      this.scene.render()
      this.stats.end()
    })
  }

  handleResize(): void {
    if (this.engine) this.engine.resize()
  }

  destroy(): void {
    window.removeEventListener("resize", () => this.handleResize())
    if (this.characterInstance) this.characterInstance.destroy()
    if (this.cameraInstance) this.cameraInstance.destroy()

    // Remove background elements
    if (this.bgDiv && this.bgDiv.parentNode) {
      this.bgDiv.parentNode.removeChild(this.bgDiv)
    }

    this.scene.dispose()
    this.engine.dispose()

    if (this.stats.dom.parentNode) {
      this.stats.dom.parentNode.removeChild(this.stats.dom)
    }

    const canvas = this.engine.getRenderingCanvas()
    if (canvas?.parentNode) {
      canvas.parentNode.removeChild(canvas)
    }
  }
}
