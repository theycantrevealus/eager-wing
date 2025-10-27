<template>
  <div class="w-full h-full">
    <canvas ref="canvasEl" class="w-full h-full"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import * as BABYLON from "babylonjs"
import "babylonjs-loaders"
import Stats from "stats.js"

export default defineComponent({
  name: "LabAsset",

  async mounted() {
    const canvas = this.$refs.canvasEl as HTMLCanvasElement
    if (!canvas) return

    // 🔹 Engine + Scene
    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    })
    const scene = new BABYLON.Scene(engine)

    // 🔹 Camera
    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3,
      3,
      BABYLON.Vector3.Zero(),
      scene,
    )
    camera.attachControl(canvas, true)

    // 🔹 Lighting
    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
    new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-1, -2, -1), scene)

    // 🔹 Stats (FPS)
    const stats = new Stats()
    stats.showPanel(0)
    document.body.appendChild(stats.dom)

    // 🔹 Load GLB from public/characters/
    const container = await BABYLON.SceneLoader.LoadAssetContainerAsync(
      "/characters/",
      "DUMMY.glb",
      scene,
    )

    // Stop all default animations
    for (const ag of container.animationGroups) {
      ag.stop()
      ag.reset()
    }

    console.log("✅ Loaded container:", container)
    console.log(
      "Meshes:",
      container.meshes.map((m) => m.name),
    )
    console.log(
      "AnimationGroups:",
      container.animationGroups.map((a) => a.name),
    )

    // 🔹 Instantiate independent characters
    const inst1 = this.instantiateCharacter(
      container,
      scene,
      new BABYLON.Vector3(0, 0, 0),
    )
    const inst2 = this.instantiateCharacter(
      container,
      scene,
      new BABYLON.Vector3(3, 0, 0),
    )

    // 🟢 Play animation only on first instance
    this.playAnimation(inst1.animationGroups, "Idle")
    this.playAnimation(inst2.animationGroups, "Right")

    // 🔹 Render loop
    engine.runRenderLoop(() => {
      stats.begin()
      scene.render()
      stats.end()
    })

    window.addEventListener("resize", () => engine.resize())
  },

  methods: {
    /**
     * ✅ Instantiate independent copy using Babylon's official method
     */
    instantiateCharacter(
      container: BABYLON.AssetContainer,
      scene: BABYLON.Scene,
      position: BABYLON.Vector3,
    ) {
      // Create isolated instance with all animations & skeletons remapped
      const { rootNodes, animationGroups } = container.instantiateModelsToScene(
        (name) =>
          name + "_instance_" + Math.random().toString(36).substring(2, 7),
      )

      // Create a root node for positioning
      const root = new BABYLON.TransformNode("root_" + Math.random(), scene)
      root.position.copyFrom(position)

      // Parent the root nodes under our new root
      for (const node of rootNodes) {
        node.parent = root
      }

      // Stop any auto-playing animations
      for (const ag of animationGroups) {
        ag.stop()
        ag.reset()
      }

      return { root, animationGroups }
    },

    /**
     * ✅ Helper to play a specific animation by name
     */
    playAnimation(groups: BABYLON.AnimationGroup[], name: string, loop = true) {
      for (const g of groups) {
        if (g.name.toLowerCase().includes(name.toLowerCase())) {
          g.start(loop)
        } else {
          g.stop()
        }
      }
    },
  },
})
</script>

<style scoped>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
canvas {
  display: block;
}
</style>
