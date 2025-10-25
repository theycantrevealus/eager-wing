/**
 * @fileoverview Character creation module.
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
  /** The active BabylonJS scene used for load. */
  private scene: BABYLON.Scene

  /** Engine renderer. */
  private engine: BABYLON.Engine

  /** Camera Instance Manager. */
  private cameraActionManager: EagerWing___CameraAction

  private stats: Stats

  /** Asset Manager Instance. */
  private assetManager: EagerWing___AssetManager

  /** Asset Container Instance. */
  private assetContainer: Map<string, BABYLON.AssetContainer> = new Map()

  /** All humanoid character instances */
  private characterInstances: Map<string, EagerWing___Character> = new Map()

  /** All humanoid root instances */
  private characterRoots: Map<string, BABYLON.TransformNode> = new Map()

  /** Allowed key */
  private keyboardKey: KeyState = {
    w: false,
    a: false,
    s: false,
    d: false,
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
    characterAttribute: CharacterAttribute,
  ) {
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

    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    this.assetManager = new EagerWing___AssetManager(this.scene)

    this.setupInteractions()

    this.init(characterAttribute).then(() => {
      this.animate()
    })

    this.scene.activeCamera = this.cameraActionManager.getCamera()

    // this.scene.onKeyboardObservable.add(this.keyboardFunction.bind(this))
  }

  animate(): void {
    this.stats.begin()
    this.engine.runRenderLoop(() => {
      const main = this.characterInstances.get("mainPlayer")
      if (main) {
        main.update(this.keyboardKey, this.cameraActionManager.getCamera())
      }

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
    })

    window.addEventListener("keyup", (e) => {
      if (e.key === "w") this.keyboardKey.w = false
      if (e.key === "a") this.keyboardKey.a = false
      if (e.key === "s") this.keyboardKey.s = false
      if (e.key === "d") this.keyboardKey.d = false
    })

    window.addEventListener("blur", () => {
      this.keyboardKey.w = false
      this.keyboardKey.a = false
      this.keyboardKey.s = false
      this.keyboardKey.d = false
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
  async init(characterAttribute: CharacterAttribute): Promise<void> {
    BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 50, height: 50 },
      this.scene,
    )

    await this.assetManager.loadAll({
      mainPlayer: "../characters/DUMMY.glb",
    })
    const characterAsset = this.assetManager.get("mainPlayer")
    if (characterAsset) this.assetContainer?.set("mainPlayer", characterAsset)

    const mainCharacter = this.assetContainer?.get("mainPlayer")

    if (mainCharacter) {
      this.characterInstances?.set(
        "mainPlayer",
        new EagerWing___Character(
          this.scene,
          mainCharacter,
          characterAttribute,
        ),
      )

      const mainCharacterInstance = this.characterInstances?.get("mainPlayer")
      if (this.characterInstances) {
        const mainCharacterRoot = mainCharacterInstance?.getRoot
        if (mainCharacterRoot)
          this.characterRoots?.set("mainPlayer", mainCharacterRoot)
      }
    }
  }
}
