<template>
  <div class="scene-container">
    <canvas ref="canvasEl" class="w-full h-full"></canvas>
    <div id="characterCreation-topPanel"></div>
    <div id="characterCreation-leftPanel"></div>
    <div id="characterCreation-rightPanel"></div>
    <div id="characterCreation-bottomoverlay"></div>
  </div>
</template>
<script lang="ts">
import { EagerWing__CharacterCreation } from "__&GL/render/character.creation"

export default {
  name: "CharacterCreation",
  data() {
    return {
      core: null as EagerWing__CharacterCreation | null,
    }
  },
  mounted() {
    const canvas = this.$refs.canvasEl as HTMLCanvasElement
    if (!canvas) return

    this.core = new EagerWing__CharacterCreation(canvas)
  },
  beforeUnmount() {
    this.core?.destroy()
    this.core = null
  },
}
</script>
