/**
 * @fileoverview Character movement lab.
 * @module EagerWing___LabControl
 */

import * as BABYLON from "babylonjs"
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

  /** HTTP Client */
  private httpClient: HttpClient

  /** Engine renderer. */
  private engine: BABYLON.Engine

  /** The active BabylonJS scene used for load. */
  private scene: BABYLON.Scene

  /** Event instances */
  private renderLoopCallback?: () => void
  private boundResizeHandler?: () => void
  private boundKeydownHandler?: (e: KeyboardEvent) => void
  private boundKeyupHandler?: (e: KeyboardEvent) => void
  private boundBlurHandler?: () => void
  private isDestroyed = false

  private mapManager: EagerWing___Map | null = null

  /** Camera Instance Manager. */
  private cameraActionManager: EagerWing___CameraAction

  /** Shadow Generator. */
  private shadowGenerator: BABYLON.ShadowGenerator

  /** Stat intance. */
  private stats: Stats

  /** ATTRIBUTE */
  private INTERACT_RADIUS: number = 20

  /** Raw character attribute. */
  private characterAttribute: Map<
    string,
    { attribute: CharacterAttribute; object: string; allowMovement: boolean }
  >

  /** Asset Manager Instance. */
  private assetManager: EagerWing___AssetManager

  /** All humanoid character instances */
  private characterInstances: Map<
    string,
    {
      instance: EagerWing___Character
      root: BABYLON.TransformNode
      getAnimationGroup: Record<string, BABYLON.AnimationGroup>
      collider: BABYLON.Mesh
      indicator: {
        circle: BABYLON.Mesh
      }
    }
  > = new Map()

  private hl: BABYLON.HighlightLayer

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
    canvas: HTMLCanvasElement,
    assetsLibrary: Map<string, string>,
    characterAttribute: Map<
      string,
      { attribute: CharacterAttribute; object: string; allowMovement: boolean }
    >,
  ) {
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
    this.characterAttribute = characterAttribute

    /** Configure the canvas */
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.id = "LabControl___renderCanvas"
    document.body.appendChild(canvas)

    this.engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    })

    this.scene = new BABYLON.Scene(this.engine)

    this.scene.clearColor = new BABYLON.Color4(
      0x0c / 255,
      0x12 / 255,
      0x28 / 255,
      1.0,
    )

    this.cameraActionManager = new EagerWing___CameraAction(
      this.engine,
      this.scene,
    )

    const light = new BABYLON.HemisphericLight(
      "LabControl___hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene,
    )
    light.intensity = 0.7

    const dirLight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(-1, -2, -1),
      this.scene,
    )
    dirLight.position = new BABYLON.Vector3(20, 120, 20)

    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight)
    this.shadowGenerator.useBlurExponentialShadowMap = true
    this.shadowGenerator.blurKernel = 32

    this.hl = new BABYLON.HighlightLayer(`global_hl`, this.scene)

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
            const dist = BABYLON.Vector3.Distance(
              mainPlayer?.root.position,
              characterInstance?.root.getAbsolutePosition(),
            )

            if (key !== "mainPlayer") {
              characterInstance.collider.isPickable =
                dist <= this.INTERACT_RADIUS
              characterInstance.indicator.circle.isVisible = true
              characterInstance.indicator.circle.visibility = 1
            }
          }
        }
      })

      /** Update map character */

      if (this.mapManager && !this.mapManager.getPlayer() && mainPlayer) {
        this.mapManager.updateTiles()
      }

      if (this.scene) this.scene.render()
      this.stats.end()
    }

    this.engine.runRenderLoop(this.renderLoopCallback)
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
    window.addEventListener("keydown", (e) => this.handleKeydown(e))
    window.addEventListener("keyup", (e) => this.handleKeyup(e))
    window.addEventListener("blur", this.handleBlur)
  }

  handleResize(): void {
    if (this.engine) this.engine.resize()
  }

  destroy(): void {
    if (this.isDestroyed) return
    this.isDestroyed = true

    if (this.renderLoopCallback) {
      this.engine.stopRenderLoop(this.renderLoopCallback)
    }
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        this.destroy()
      })
    }

    if (this.boundResizeHandler)
      window.removeEventListener("resize", this.boundResizeHandler)

    if (this.boundKeydownHandler)
      window.removeEventListener("keydown", this.boundKeydownHandler)

    if (this.boundKeyupHandler)
      window.removeEventListener("keyup", this.boundKeyupHandler)

    if (this.boundBlurHandler)
      window.removeEventListener("blur", this.boundBlurHandler)

    if (this.cameraActionManager) this.cameraActionManager.destroy()

    this.stats.dom.remove()
    if (this.stats.dom.parentNode) {
      this.stats.dom.parentNode.removeChild(this.stats.dom)
    }

    const canvas = this.engine.getRenderingCanvas()
    if (canvas?.parentNode) {
      canvas.remove()
      canvas.parentNode.removeChild(canvas)
    }

    this.mapManager?.dispose?.()
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

      if (characterAsset) {
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

        this.logStore.addMessage({
          type: "info",
          content: `Checking ${attributeList.get("mainPlayer")?.attribute.information.race} with ${attribute.information.race} ${isEnemy}`,
        })

        const { root, getAnimationGroup, collider, indicator } =
          characterInstance.createCharacter(isEnemy, () => {
            if (this.hl) {
              this.hl.removeAllMeshes()
            }

            const tNode = this.scene.getMeshByName(
              `indicator_${attribute.modelId}`,
            )

            if (tNode) {
              if (tNode instanceof BABYLON.Mesh) {
                this.hl.addMesh(
                  tNode,
                  isEnemy
                    ? new BABYLON.Color3(1, 0, 0)
                    : new BABYLON.Color3(1, 1, 0),
                )
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

    if (this.scene.activeCamera) {
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
