<template>
  <div class="scene-container">
    <canvas ref="canvasEl" class="w-full h-full"></canvas>
  </div>
</template>
<script lang="ts">
import { __CharacterCreation__ } from "__&GL/render/character.creation"

export default {
  name: "CharacterCreation",
  data() {
    return {
      core: null as __CharacterCreation__ | null,
    }
  },
  mounted() {
    const canvas = this.$refs.canvasEl as HTMLCanvasElement
    if (!canvas) return

    this.core = new __CharacterCreation__(canvas)
  },
  beforeUnmount() {
    this.core?.destroy()
    this.core = null
  },
}
</script>
