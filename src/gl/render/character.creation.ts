import * as BABYLON from "babylonjs"
import * as GUI from "babylonjs-gui"
import "babylonjs-loaders"
import Stats from "stats.js"
import type { CharacterAttribute } from "__&types/Character"
import { __CameraHead__ } from "__&GL/camera/head"
import { __Character__ } from "__&GL/character"

export class __CharacterCreation__ {
  private scene: BABYLON.Scene
  private engine: BABYLON.Engine
  private camera: BABYLON.ArcRotateCamera | null = null
  private stats: Stats
  private cameraInstance: __CameraHead__ | null = null
  private characterInstance: __Character__ | null = null
  private GLTFCharacter: BABYLON.AssetContainer | null = null

  // Wallpaper background elements
  private bgDiv: HTMLDivElement | null = null
  private bgImg: HTMLImageElement | null = null
  private wallpaperUrl: string = "./src/assets/wallpaper/character.creation.jpg" // Replace with your image URL (e.g., a vibrant abstract or gradient)
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
   * Character Creation Manager
   *
   * @param { HTMLCanvasElement } canvas - Canvas used for load animation
   */
  constructor(canvas: HTMLCanvasElement) {
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
    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)

    const material = new BABYLON.StandardMaterial("planeMaterial", this.scene)
    material.diffuseColor = BABYLON.Color3.FromInts(156, 156, 156)

    const light = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene,
    )
    light.intensity = 0.7

    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    // Create background div and img
    this.bgDiv = document.createElement("div")
    this.bgDiv.style.position = "absolute"
    this.bgDiv.style.top = "0"
    this.bgDiv.style.left = "0"
    this.bgDiv.style.width = "100%"
    this.bgDiv.style.height = "100%"
    this.bgDiv.style.overflow = "hidden"
    this.bgDiv.style.zIndex = "-1"
    document.body.appendChild(this.bgDiv)

    this.bgImg = document.createElement("img")
    this.bgImg.src = this.wallpaperUrl
    this.bgImg.style.width = "100%"
    this.bgImg.style.height = "100%"
    this.bgImg.style.objectFit = "cover"
    this.bgImg.style.transformOrigin = "center center"
    this.bgDiv.appendChild(this.bgImg)

    this.init().then(() => {
      this.animate()
    })
  }

  async init() {
    await this.init_character_gltf("../characters/Female/FemaleMeshed.glb")

    if (this.GLTFCharacter) {
      this.characterInstance = new __Character__(
        this.scene,
        this.GLTFCharacter,
        {
          modelId: "001",
          information: {
            name: "TATANG 1",
            level: 1,
            health: 100,
            mana: 100,
            job: "warrior",
            race: "asmodian",
            dimension: {
              scale: 1,
            },
          },
          position: {
            x: 0,
            y: 0,
            z: 0,
          },
          speed: 0.1,
          turnSpeed: 0.5,
        } satisfies CharacterAttribute,
      )

      // Create camera after character is initialized
      const characterRoot = this.characterInstance.getRoot()
      if (characterRoot)
        this.cameraInstance = new __CameraHead__(
          this.engine,
          this.scene,
          "001",
          characterRoot,
        )
      if (this.cameraInstance) {
        this.camera = this.cameraInstance.getCamera()
        this.controlPanelBones = this.characterInstance.getRegisteredBones()
        this.createScaleControlPanel()
      }
      if (this.camera) {
        this.scene.activeCamera = this.camera
        this.defaultRadius = this.camera.radius // Set default for zoom baseline
      } else {
        console.error("Failed to create camera. Scene may not render.")
      }
    }

    // Register zoom update for background
    if (this.camera && this.bgImg) {
      this.scene.registerBeforeRender(() => {
        if (this.camera) {
          const zoomFactor = this.defaultRadius / this.camera.radius
          this.bgImg!.style.transform = `scale(${zoomFactor})`
        }
      })
    }
  }

  async init_character_gltf(targetAsset: string): Promise<void> {
    try {
      const assetsManager = new BABYLON.AssetsManager(this.scene)
      const task = assetsManager.addContainerTask(
        "characterTask",
        "",
        targetAsset,
        "",
      )
      await assetsManager.loadAsync()
      this.GLTFCharacter = task.loadedContainer
      this.GLTFCharacter.meshes.forEach((mesh) => mesh.setEnabled(false))
    } catch (error) {
      console.error("Error loading character GLTF:", error)
      throw error
    }
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
