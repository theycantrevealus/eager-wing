import * as BABYLON from "babylonjs"
import "babylonjs-loaders"
import Stats from "stats.js"
import { createApp } from "vue"
import { createPinia } from "pinia"
import "./style.css"
import CharacterTarget from "./components/Character.Target.vue"
import type { CharacterAttribute } from "__&types/Character"
import { __Map__ } from "__&GL/map"
import type { KeyState } from "__&interfaces/keyboard"
import { __Camera__ } from "__&GL/camera"
import { __Character__ } from "__&GL/character"

export class __Core__ {
  private scene: BABYLON.Scene
  private engine: BABYLON.Engine
  private camera: BABYLON.ArcRotateCamera
  private highlightLayer: BABYLON.HighlightLayer
  private pointer: BABYLON.Vector2
  private stats: Stats
  private MyCamera: __Camera__
  private map: __Map__ | null = null
  private keys: KeyState = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  }

  // Intances
  private characterInstances: Map<string, __Character__> = new Map()

  private GLTFCharacter: BABYLON.AssetContainer | null = null

  constructor() {
    this.pointer = new BABYLON.Vector2()

    const canvas = document.createElement("canvas")
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
    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1)

    this.MyCamera = new __Camera__(this.engine, this.scene, {
      x: 0,
      y: 0,
      z: 0,
    })
    this.camera = this.MyCamera.getCamera()

    this.highlightLayer = new BABYLON.HighlightLayer("highlight", this.scene)
    this.highlightLayer.innerGlow = false
    this.highlightLayer.outerGlow = true
    this.highlightLayer.blurHorizontalSize = 1
    this.highlightLayer.blurVerticalSize = 1

    const material = new BABYLON.StandardMaterial("planeMaterial", this.scene)
    material.diffuseColor = BABYLON.Color3.FromInts(156, 156, 156)

    const plane = BABYLON.MeshBuilder.CreateGround(
      "plane",
      { width: 100, height: 100 },
      this.scene,
    )
    plane.material = material

    const light = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      this.scene,
    )
    light.intensity = 0.7

    this.map = new __Map__(this.scene, 100)

    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    this.setupInteractions()
    this.init()
    this.animate()
  }

  async init() {
    const app = createApp(CharacterTarget)
    const pinia = createPinia()
    app.use(pinia)
    app.mount("#app")

    /**
     * Blender : Facing Y-
     * Somehow babylon is facing Y+ if blender facing Z+
     */
    await this.init_character_gltf("./characters/Female/Female.glb")
    const instances = [
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
      },
      // {
      //   modelId: "002",
      //   information: {
      //     name: "TATANG 2",
      //     level: 1,
      //     health: 100,
      //     mana: 100,
      //     job: "warrior",
      //     race: "asmodian",
      //     dimension: {
      //       scale: 1,
      //     },
      //   },
      //   position: {
      //     x: 2,
      //     y: 0,
      //     z: 2,
      //   },
      //   speed: 0.5,
      //   turnSpeed: 0.5,
      // },
    ] satisfies CharacterAttribute[]

    instances.forEach((value) => {
      if (this.GLTFCharacter)
        this.characterInstances.set(
          value.modelId,
          new __Character__(this.scene, this.GLTFCharacter, value),
        )
    })
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

  animate(): void {
    this.stats.begin()
    this.engine.runRenderLoop(() => {
      // const delta = this.engine.getDeltaTime() / 1000
      this.scene.render()
      this.characterInstances.get("001")?.update(this.keys, this.camera)
      this.stats.end()
    })
  }

  setupInteractions(): void {
    window.addEventListener(
      "keydown",
      (e) => (this.keys[e.key.toLowerCase()] = true),
    )
    window.addEventListener(
      "keyup",
      (e) => (this.keys[e.key.toLowerCase()] = false),
    )
    window.addEventListener("resize", this.handleResize)
  }

  handleResize(): void {
    if (this.engine) this.engine.resize()
  }

  handleClick(event: MouseEvent): void {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  destroy(): void {
    window.removeEventListener("resize", () => this.handleResize())
    window.removeEventListener("click", (event) => this.handleClick(event))
    this.characterInstances.forEach((character) => character.destroy())

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

let coreInstance: __Core__ | null = null

if (!coreInstance) {
  coreInstance = new __Core__()
}

window.onbeforeunload = () => {
  if (coreInstance) {
    coreInstance.destroy()
    coreInstance = null
  }
}
