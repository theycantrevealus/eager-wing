<template>
  <div>
    <canvas ref="canvasEl" class="w-full h-full"></canvas>
  </div>
</template>
<script lang="ts">
import { EagerWing___LabControl } from "__&GL/render/lab.control"
import type { CharacterAttribute } from "__&types/Character"
import { defineComponent } from "vue"

export default defineComponent({
  name: "LabControl",
  data() {
    return {
      processor: null as EagerWing___LabControl | null,

      characterInitAttribute: {
        modelId: "001",
        information: {
          name: "TATANG 1",
          gender: "female",
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
        style: {
          body: {
            color: "#ffc095",
            hair: {
              color: "#ffc095",
            },
            brow: {
              color: "#ffc095",
            },
            eye: {
              color: "",
              scale: 0,
            },
            blush: {
              color: "",
            },
            lip: {
              color: "#ff0000",
            },
          },
        },
        speed: 0.1,
        turnSpeed: 0.5,
        classConfig: {
          needDebug: false,
        },
      } as CharacterAttribute,
    }
  },
  mounted() {
    const canvas = this.$refs.canvasEl as HTMLCanvasElement
    if (!canvas) return

    this.processor = new EagerWing___LabControl(
      canvas,
      this.characterInitAttribute,
    )
  },
  beforeUnmount() {
    this.processor?.destroy()
    this.processor = null
  },
})
</script>
