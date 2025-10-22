<template>
  <div class="scene-container">
    <canvas ref="canvasEl" class="w-full h-full"></canvas>
    <top-panel ref="topPanelCreation" @focus-change="handleFocus"></top-panel>
    <left-panel @change-skin-tone="handleSkinTone"></left-panel>
    <div id="characterCreation-rightPanel"></div>
  </div>
</template>
<script lang="ts">
import { EagerWing__CharacterCreation } from "__&GL/render/character.creation"
import TopPanel from "__&vite/components/panel/Character.Creation/Panel.Top.vue"
import LeftPanel from "__&vite/components/panel/Character.Creation/Panel.Left.vue"
import { defineComponent } from "vue"

export default defineComponent({
  name: "CharacterCreation",
  components: { TopPanel, LeftPanel },
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
  methods: {
    handleFocus(target: string, event: MouseEvent) {
      if (target === "head") this.core?.focusHead()
      if (target === "body") this.core?.focusBody()
      console.log("Event:", event)
    },
    handleSkinTone(color: string) {
      this.core?.applySkinTone(color)
    },
  },
  beforeUnmount() {
    this.core?.destroy()
    this.core = null
  },
})
</script>
