/**
 * @fileoverview Character movement lab.
 * @module EagerWing___LabControl
 */

import * as BABYLON from "babylonjs"
import Stats from "stats.js"
import { EagerWing___CameraAction } from "__&GL/camera/action"
import type { CharacterAttribute } from "__&types/Character"
import { EagerWing___AssetManager } from "__&utils/asset.manager"
import { EagerWing___Character } from "__&GL/character"
import type { KeyState } from "__&interfaces/keyboard"

/**
 * This is lab renderer to develop basic character control module
 *
 * @example
 * const canvas = document.createElement("canvas")
 * const creation = new EagerWing___LabControl(canvas);
 *
 */

export class EagerWing___LabControl {
  /** Engine renderer. */
  private engine: BABYLON.Engine

  /** The active BabylonJS scene used for load. */
  private scene: BABYLON.Scene

  /** Camera Instance Manager. */
  private cameraActionManager: EagerWing___CameraAction

  /** Shadow Generator. */
  private shadowGenerator: BABYLON.ShadowGenerator

  /** Stat intance. */
  private stats: Stats

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
   * @param { HTMLCanvasElement } canvas - Canvas used for load animation
   * @param { CharacterAttribute } - characterAttribute - Init character configuration
   */
  constructor(
    canvas: HTMLCanvasElement,
    assetsLibrary: Map<string, string>,
    characterAttribute: Map<
      string,
      { attribute: CharacterAttribute; object: string; allowMovement: boolean }
    >,
  ) {
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
      new BABYLON.Vector3(-1, -2, -1), // direction
      this.scene,
    )
    dirLight.position = new BABYLON.Vector3(20, 40, 20)

    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight)
    this.shadowGenerator.useBlurExponentialShadowMap = true
    this.shadowGenerator.blurKernel = 32

    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    this.assetManager = new EagerWing___AssetManager(this.scene)

    this.setupInteractions()

    this.init(assetsLibrary, characterAttribute).then(() => {
      this.animate()
    })

    this.scene.activeCamera = this.cameraActionManager.getCamera()

    // this.scene.onKeyboardObservable.add(this.keyboardFunction.bind(this))
  }

  animate(): void {
    this.engine.runRenderLoop(() => {
      this.stats.begin()
      this.characterInstances.forEach((value, key) => {
        const allowMovement =
          this.characterAttribute.get(key)?.allowMovement ?? false
        if (allowMovement) {
          const characterInstance = this.characterInstances.get(key)
          if (characterInstance && characterInstance.root) {
            characterInstance.instance.update(
              characterInstance.root,
              characterInstance.getAnimationGroup,
              "001",
              this.keyboardKey,
              this.cameraActionManager.getCamera(),
            )
          }
        }
      })

      this.scene.render()
      this.stats.end()
    })
  }

  setupInteractions(): void {
    window.addEventListener("resize", this.handleResize)
    window.addEventListener("keydown", (e) => {
      if (e.key === "w") this.keyboardKey.w = true
      if (e.key === "a") this.keyboardKey.a = true
      if (e.key === "s") this.keyboardKey.s = true
      if (e.key === "d") this.keyboardKey.d = true
      if (e.code === "Space") this.keyboardKey.space = true

      if (e.key === "x")
        this.characterInstances
          .get("mainPlayer")
          ?.instance.toogleCombatMode(
            this.characterInstances.get("mainPlayer")?.getAnimationGroup ??
              null,
          )
    })

    window.addEventListener("keyup", (e) => {
      if (e.key === "w") this.keyboardKey.w = false
      if (e.key === "a") this.keyboardKey.a = false
      if (e.key === "s") this.keyboardKey.s = false
      if (e.key === "d") this.keyboardKey.d = false
      if (e.code === "Space") this.keyboardKey.space = false
    })

    window.addEventListener("blur", () => {
      this.keyboardKey.w = false
      this.keyboardKey.a = false
      this.keyboardKey.s = false
      this.keyboardKey.d = false
      this.keyboardKey.space = false
    })
  }

  handleResize(): void {
    if (this.engine) this.engine.resize()
  }

  destroy(): void {
    window.removeEventListener("resize", () => this.handleResize())

    if (this.cameraActionManager) this.cameraActionManager.destroy()

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
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 50, height: 50 },
      this.scene,
    )

    ground.receiveShadows = true

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

        const { root, getAnimationGroup } = characterInstance.createCharacter()

        this.characterInstances?.set(key, {
          instance: characterInstance,
          root,
          getAnimationGroup,
        })
      }
    })
  }
}
