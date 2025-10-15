import * as BABYLON from "babylonjs"
import "babylonjs-loaders"
import Stats from "stats.js"
import { createApp } from "vue"
import { createPinia } from "pinia"
import CharacterTarget from "./components/Character.Target.vue"
import "./style.css"
import { __Camera__ } from "./utils/components/camera"
import { __Light__ } from "./utils/components/light"
import { __Character__ } from "./utils/components/character"
import type { CharacterAttribute } from "./utils/components/character/type"

export class __Core__ {
  private scene: BABYLON.Scene
  private engine: BABYLON.Engine
  private camera: BABYLON.ArcRotateCamera
  private highlightLayer: BABYLON.HighlightLayer
  private pointer: BABYLON.Vector2
  private stats: Stats
  private MyCamera: __Camera__
  private MyCharacter: __Character__ | null = null
  private MyCharacterRoot: BABYLON.TransformNode | null = null
  private MyCharacterSize: number = 1
  private MyCharacterAttribute: CharacterAttribute
  private MyCharacterLastGroundCheck: number
  private CharacterInstances: Map<string, __Character__>
  private GLTFCharacter: BABYLON.AssetContainer | null = null

  constructor() {
    this.pointer = new BABYLON.Vector2()
    this.CharacterInstances = new Map()
    this.MyCharacterAttribute = {
      modelId: "CHAR001",
      name: "TATANG",
      level: 1,
      health: 100,
      mana: 100,
      job: "warrior",
      race: "asmodian",
    }
    this.MyCharacterLastGroundCheck = 0

    // Create canvas and engine
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

    // Create scene
    this.scene = new BABYLON.Scene(this.engine)
    this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1)

    // Camera
    this.MyCamera = new __Camera__(this.engine, this.scene, {
      x: 0,
      y: 0,
      z: 0,
    })
    this.camera = this.MyCamera.getCamera()

    // Highlight layer for outline effect
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

    // Optional: Adjust light properties
    light.intensity = 0.7

    // Map

    // Stats
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    this.setupInteractions()
    this.init()
    this.animate()
  }

  async init() {
    // Vue and Pinia setup
    const app = createApp(CharacterTarget)
    const pinia = createPinia()
    app.use(pinia)
    app.mount("#app")

    // Load character GLTF
    await this.init_character_gltf("./characters/Char001/char.001.gltf")
    if (this.GLTFCharacter) {
      const playerModel = this.GLTFCharacter.meshes[0].clone("player")
      // Player character
      this.MyCharacter = new __Character__(
        this.scene,
        this.camera,
        {
          height: this.MyCharacterSize,
          width: this.MyCharacterSize,
          depth: this.MyCharacterSize,
        },
        { x: 0, y: 0, z: 0 },
        this.highlightLayer,
        new BABYLON.Color3(0.576, 0.439, 0.858),
        this.MyCharacterAttribute,
        true,
        playerModel,
        this.GLTFCharacter.animationGroups.map((ag) =>
          ag.clone(ag.name, (target) => {
            const newTarget = this.GLTFCharacter!.meshes.find(
              (m) => m.name === target.name,
            )
            return newTarget || target
          }),
        ),
      )
      await this.MyCharacter.waitForLoad()
      this.MyCharacterRoot = this.MyCharacter.getCharacterRoot()
      this.CharacterInstances.set("CHAR001", this.MyCharacter)
    }
  }

  async init_character_gltf(targetAsset: string): Promise<void> {
    try {
      const result = await BABYLON.LoadAssetContainerAsync(
        targetAsset,
        this.scene,
      )

      this.GLTFCharacter = new BABYLON.AssetContainer(this.scene)
      this.GLTFCharacter.meshes = result.meshes
      this.GLTFCharacter.animationGroups = result.animationGroups
      this.GLTFCharacter.materials = result.materials
      this.GLTFCharacter.textures = result.textures
      this.GLTFCharacter.transformNodes = result.transformNodes

      // Remove from scene to use as template for cloning
      this.GLTFCharacter.meshes.forEach((mesh) => {
        this.scene.removeMesh(mesh)
      })
    } catch (error) {
      console.error("Error loading character GLTF:", error)
      throw error
    }
  }

  animate(): void {
    this.stats.begin()
    this.engine.runRenderLoop(() => {
      const delta = this.engine.getDeltaTime() / 1000
      if (this.MyCharacter) {
        this.MyCharacter.update()
        this.MyCharacter.animate()
      }

      // this.CharacterInstances.get("NPC001")?.animate(delta)
      // this.CharacterInstances.get("ENEMY001")?.animate(delta)

      // this.MyCamera.updateCameraFollow(this.MyCharacterRoot)

      // const elapsed = this.scene.getAnimationRatio() * delta
      // if (elapsed - this.MyCharacterLastGroundCheck > 0.2) {
      //   this.map.updateGroundContact(
      //     this.MyCharacterRoot,
      //     this.MyCharacterSize / 2,
      //   )
      //   this.MyCharacterLastGroundCheck = elapsed
      // }

      this.scene.render()
      this.stats.end()
    })
  }

  setupInteractions(): void {
    window.addEventListener("resize", () => this.handleResize())
    window.addEventListener("click", (event) => this.handleClick(event))
  }

  handleResize(): void {
    this.engine.resize()
  }

  handleClick(event: MouseEvent): void {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

    const pickResult = this.scene.pick(this.pointer.x, this.pointer.y)
    if (pickResult?.hit && pickResult.pickedMesh) {
      const clickedObject = pickResult.pickedMesh
      if (clickedObject.metadata?.clickable) {
        let parentMesh = clickedObject
        while (parentMesh && !parentMesh.metadata?.gltfId) {
          parentMesh = parentMesh.parent as BABYLON.AbstractMesh
        }
        const gltfId = parentMesh?.metadata?.gltfId || "unknown"
        const person = this.CharacterInstances.get(gltfId)
        const myCharacter = this.CharacterInstances.get(
          this.MyCharacterAttribute.modelId,
        )
        if (myCharacter && person) {
          myCharacter.updateTarget(person.getAttribute())
          person.clickMe()
        }
      }
    }
  }

  destroy(): void {
    window.removeEventListener("resize", () => this.handleResize())
    window.removeEventListener("click", (event) => this.handleClick(event))

    this.CharacterInstances.forEach((character) => character.destroy())
    this.CharacterInstances.clear()

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
