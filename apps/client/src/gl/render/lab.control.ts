/**
 * @fileoverview Character movement lab.
 * @module EagerWing___LabControl
 */

// import * as BABYLON from "babylonjs"
import {
  Engine,
  Scene,
  ShadowGenerator,
  HighlightLayer,
  HemisphericLight,
  Mesh,
  TransformNode,
  DirectionalLight,
  AnimationGroup,
  Vector3,
  Color3,
  Color4,
  DracoCompression,
} from "babylonjs"
import Stats from "stats.js"
import { EagerWing___CameraAction } from "#GL/camera/action"
import type { CharacterAttribute } from "#types/Character"
import { EagerWing___AssetManager } from "#utils/asset.manager"
import { EagerWing___Character } from "#GL/character"
import type { KeyState } from "#interfaces/keyboard"
import { EagerWing___Map } from "#GL/map"
import type { LogStore } from "#stores/utils/log"
import { HttpClient } from "#utils/axios"
import { Tile } from "#interfaces/map.config"
import { CharacterControlStatus } from "#interfaces/control.ts"
import { CharacterStore } from "#stores/character.ts"

/**
 * This is lab renderer to develop basic character control module
 *
 * @example
 * const canvas = document.createElement("canvas")
 * const creation = new EagerWing___LabControl(canvas);
 *
 */

export class EagerWing___LabControl {
  /** Store */
  private logStore: LogStore

  private characterStore: CharacterStore

  /** HTTP Client */
  private httpClient: HttpClient

  /** Engine renderer. */
  private engine: Engine | null

  /** The active BabylonJS scene used for load. */
  private scene: Scene | null

  /** Map Manager */
  private mapManager: EagerWing___Map | null = null

  /** Asset Manager Instance. */
  private assetManager: EagerWing___AssetManager

  /** Camera Instance Manager. */
  private cameraActionManager: EagerWing___CameraAction

  /** Shadow Generator. */
  private shadowGenerator: ShadowGenerator

  /** Highlight layer. */
  private highLightLayer: HighlightLayer

  /** Stat intance. */
  private stats: Stats

  /** Module Config */
  private INTERACT_RADIUS: number = 20

  /** Raw character attribute. */
  private characterAttribute: Map<
    string,
    { attribute: CharacterAttribute; object: string; allowMovement: boolean }
  >

  /** Control Status */
  private controlStatus: CharacterControlStatus = {}

  /** Event instances */
  private renderLoopCallback?: () => void
  private boundResizeHandler?: () => void
  private boundKeydownHandler?: (e: KeyboardEvent) => void
  private boundKeyupHandler?: (e: KeyboardEvent) => void
  private boundBlurHandler?: () => void
  private isDestroyed = false

  /** All humanoid character instances */
  private characterInstances: Map<
    string,
    {
      instance: EagerWing___Character
      root: TransformNode
      getAnimationGroup: Record<string, AnimationGroup>
      collider: Mesh
      indicator: {
        circle: Mesh
      }
    }
  > = new Map()

  /** Allowed key */
  private keyboardKey: KeyState = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  }

  /**
   * Character Control Lab
   * Use it for development purposes only
   *
   * @param { LogStore } logStore - Pinia chat store
   * @param { HTMLCanvasElement } canvas - Canvas used for load animation
   * @param { CharacterAttribute } characterAttribute - Init character configuration
   */
  constructor(
    logStore: LogStore,
    characterStore: CharacterStore,
    canvas: HTMLCanvasElement,
    assetsLibrary: Map<string, string>,
    characterAttribute: Map<
      string,
      { attribute: CharacterAttribute; object: string; allowMovement: boolean }
    >,
  ) {
    DracoCompression.Configuration.decoder.wasmUrl = `${import.meta.env.VITE_SERVER_DRACO}/draco_wasm_wrapper_gltf.js`
    DracoCompression.Configuration.decoder.wasmBinaryUrl = `${import.meta.env.VITE_SERVER_DRACO}/draco_decoder_gltf.wasm`
    DracoCompression.Configuration.decoder.fallbackUrl = `${import.meta.env.VITE_SERVER_DRACO}/draco_decoder_gltf.js`

    const authMiddleware = async (config: any) => {
      config.headers = {
        ...config.headers,
        Authorization: "Bearer example_token",
      }
      return config
    }

    const jsonMiddleware = async (response: any) => {
      return response
    }

    const errorHandler = async (err: any) => {
      throw err
    }

    this.httpClient = new HttpClient({
      baseURL: `${import.meta.env.VITE_SERVER_ASSET}/chunks_lod/`,
      requestMiddlewares: [authMiddleware],
      responseMiddlewares: [jsonMiddleware],
      errorMiddlewares: [errorHandler],
    })

    this.logStore = logStore
    this.characterStore = characterStore
    this.characterAttribute = characterAttribute

    /** Configure the canvas */
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.id = "LabControl___renderCanvas"
    // document.body.appendChild(canvas)

    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    })

    this.scene = new Scene(this.engine)

    this.scene.clearColor = new Color4(0x0c / 255, 0x12 / 255, 0x28 / 255, 1.0)

    this.cameraActionManager = new EagerWing___CameraAction(
      this.engine,
      this.scene,
    )

    const light = new HemisphericLight(
      "LabControl___hemiLight",
      new Vector3(0, 1, 0),
      this.scene,
    )
    light.intensity = 0.7

    const dirLight = new DirectionalLight(
      "dirLight",
      new Vector3(-1, -2, -1),
      this.scene,
    )
    dirLight.position = new Vector3(20, 120, 20)

    this.shadowGenerator = new ShadowGenerator(1024, dirLight)
    this.shadowGenerator.useBlurExponentialShadowMap = true
    this.shadowGenerator.blurKernel = 32

    this.highLightLayer = new HighlightLayer(`global_hl`, this.scene)

    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    this.assetManager = new EagerWing___AssetManager(this.scene)

    this.setupInteractions()

    this.scene.activeCamera = this.cameraActionManager.getCamera()

    this.init(assetsLibrary, characterAttribute).then(() => {
      this.animate()
    })

    // this.scene.onKeyboardObservable.add(this.keyboardFunction.bind(this))
  }

  async setupMap(): Promise<void> {
    await this.httpClient
      .get<Tile[]>("/tile_manifest.json")
      .then((manifest) => {
        manifest.match({
          success: (u) => {
            if (this.scene)
              this.mapManager = new EagerWing___Map(
                this.logStore,
                this.scene,
                null,
                {
                  name: "dessert",
                  url: `${import.meta.env.VITE_SERVER_ASSET}/chunks_lod/`,
                  manifest: u,
                  load_radius: 100,
                  load_grid_radius: 2,
                  tile_size: 408.8,
                  eps: 1e-6,
                },
              )
          },
          failure: (err) => {
            this.logStore.addMessage({
              type: "error",
              content: `${err.message}: ${err.stack?.toString()}`,
            })
          },
        })
      })
  }

  animate(): void {
    this.renderLoopCallback = () => {
      this.stats.begin()
      const mainPlayer = this.characterInstances.get("mainPlayer")
      // @ts-ignore
      this.characterInstances.forEach((value, key) => {
        const allowMovement =
          this.characterAttribute.get(key)?.allowMovement ?? false

        const characterInstance = this.characterInstances.get(key)
        if (characterInstance && characterInstance.root) {
          characterInstance.instance.update(
            characterInstance.root,
            characterInstance.getAnimationGroup,
            "001",
            this.keyboardKey,
            this.cameraActionManager.getCamera(),
            allowMovement,
          )

          if (mainPlayer) {
            const dist = Vector3.Distance(
              mainPlayer?.root.position,
              characterInstance?.root.getAbsolutePosition(),
            )

            if (key !== "mainPlayer") {
              characterInstance.collider.isPickable =
                dist <= this.INTERACT_RADIUS
              characterInstance.indicator.circle.isVisible = true
              characterInstance.indicator.circle.visibility = 1
            }

            if (dist > this.INTERACT_RADIUS) {
              this.characterStore.setTargetSelection(null)
            }
          }
        }
      })

      /** Update map character */

      if (this.mapManager && !this.mapManager.getPlayer() && mainPlayer) {
        this.mapManager.updateTiles()
      }

      /** Handle object selection
       * 1. Show indicator
       * 2. Calculate distance
       * 3. Check action
       *    a. NPC - Open dialog
       *    b. Enemy - Combat mode
       */
      if (this.controlStatus.selectedObject) {
        this.characterStore.setTargetSelection(
          this.controlStatus.selectedObject.attribute,
        )

        if (
          mainPlayer?.indicator.circle &&
          this.controlStatus.selectedObject.indicator.circle
        )
          this.characterStore.updateTargetDistance(
            this.getMeshDistance(
              mainPlayer?.indicator.circle,
              this.controlStatus.selectedObject.indicator.circle,
            ),
          )
      }

      if (this.scene) this.scene.render()
      this.stats.end()
    }

    if (this.engine) this.engine.runRenderLoop(this.renderLoopCallback)
  }

  private getMeshDistance(mesh1: Mesh, mesh2: Mesh): number {
    mesh1.refreshBoundingInfo()
    mesh2.refreshBoundingInfo()

    const center1 = mesh1.getBoundingInfo().boundingSphere.centerWorld
    const center2 = mesh2.getBoundingInfo().boundingSphere.centerWorld

    const radius1 = mesh1.getBoundingInfo().boundingSphere.radiusWorld
    const radius2 = mesh2.getBoundingInfo().boundingSphere.radiusWorld

    const centersDistance = Vector3.Distance(center1, center2)

    return centersDistance - radius1 - radius2
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === "w") this.keyboardKey.w = true
    if (e.key === "a") this.keyboardKey.a = true
    if (e.key === "s") this.keyboardKey.s = true
    if (e.key === "d") this.keyboardKey.d = true
    if (e.code === "Space") this.keyboardKey.space = true

    if (e.key === "x")
      this.characterInstances
        .get("mainPlayer")
        ?.instance.toogleCombatMode(
          this.characterInstances.get("mainPlayer")?.getAnimationGroup ?? null,
        )
  }

  private handleKeyup(e: KeyboardEvent): void {
    if (e.key === "w") this.keyboardKey.w = false
    if (e.key === "a") this.keyboardKey.a = false
    if (e.key === "s") this.keyboardKey.s = false
    if (e.key === "d") this.keyboardKey.d = false
    if (e.code === "Space") this.keyboardKey.space = false
  }

  private handleBlur(): void {
    this.keyboardKey.w = false
    this.keyboardKey.a = false
    this.keyboardKey.s = false
    this.keyboardKey.d = false
    this.keyboardKey.space = false
  }

  setupInteractions(): void {
    this.boundResizeHandler = this.handleResize.bind(this)
    this.boundKeydownHandler = this.handleKeydown.bind(this)
    this.boundKeyupHandler = this.handleKeyup.bind(this)
    this.boundBlurHandler = this.handleBlur.bind(this)

    window.addEventListener("resize", this.boundResizeHandler)
    window.addEventListener("keydown", this.boundKeydownHandler)
    window.addEventListener("keyup", this.boundKeyupHandler)
    window.addEventListener("blur", this.boundBlurHandler)
  }

  handleResize(): void {
    if (this.engine) this.engine.resize()
  }

  destroy(): void {
    if (this.isDestroyed) return
    this.isDestroyed = true

    if (this.engine) {
      const canvas = this.engine?.getRenderingCanvas()
      if (canvas?.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    }

    // Stop rendering
    if (this.engine) {
      this.engine.stopRenderLoop()
      this.engine.dispose()
      this.engine = null
    }

    // Dispose scene
    this.scene?.dispose()
    this.scene = null

    // Remove event listeners
    if (this.boundResizeHandler)
      window.removeEventListener("resize", this.boundResizeHandler)
    if (this.boundKeydownHandler)
      window.removeEventListener("keydown", this.boundKeydownHandler)
    if (this.boundKeyupHandler)
      window.removeEventListener("keyup", this.boundKeyupHandler)
    if (this.boundBlurHandler)
      window.removeEventListener("blur", this.boundBlurHandler)

    // Clean DOM
    this.stats.dom.remove()
    this.cameraActionManager?.destroy()

    // Clean resources
    this.mapManager?.dispose()
    this.mapManager = null

    this.characterInstances.forEach(({ instance, root }) => {
      instance.destroy?.()
      root.dispose()
    })
    this.characterInstances.clear()
  }

  /**
   * @async
   * Lab Initiation
   *
   * @param characterAttribute - Character attribute to loads
   *
   * @returns { Promise<void> }
   */
  async init(
    assetsLibrary: Map<string, string>,
    attributeList: Map<
      string,
      {
        object: string
        attribute: CharacterAttribute
      }
    >,
  ): Promise<void> {
    await this.assetManager.loadAll(Object.fromEntries(assetsLibrary))

    attributeList.forEach(({ object, attribute }, key) => {
      const characterAsset = this.assetManager.get(object)

      if (characterAsset && this.engine && this.scene) {
        const characterInstance = new EagerWing___Character(
          this.engine,
          this.scene,
          characterAsset,
          attribute,
        )

        /** Build interaction meta */
        const isEnemy =
          attributeList.get("mainPlayer")?.attribute.information.race !=
          attribute.information.race

        const { root, getAnimationGroup, collider, indicator } =
          characterInstance.createCharacter(isEnemy, () => {
            if (this.scene) {
              if (this.highLightLayer) {
                this.highLightLayer.removeAllMeshes()
              }

              const tNode = this.scene.getMeshByName(
                `indicator_${attribute.modelId}`,
              )

              if (tNode) {
                if (tNode instanceof Mesh) {
                  this.highLightLayer.addMesh(
                    tNode,
                    isEnemy ? new Color3(1, 0, 0) : new Color3(1, 1, 0),
                  )

                  this.controlStatus.selectedObject = {
                    attribute: attribute,
                    indicator,
                    isEnemy: isEnemy,
                  }
                }
              }
            }
          })

        this.characterInstances?.set(key, {
          instance: characterInstance,
          root,
          getAnimationGroup,
          collider,
          indicator,
        })
      }
    })

    const mainPlayer = this.characterInstances.get("mainPlayer")

    if (this.scene && this.scene.activeCamera) {
      if (mainPlayer && mainPlayer.root) {
        await this.setupMap()

        if (this.mapManager) {
          this.mapManager.setPlayer(mainPlayer?.root)
          await this.mapManager.initialLoadPromise
        }
      }
    }
  }
}
