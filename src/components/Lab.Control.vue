<template>
  <div>
    <canvas ref="canvasEl" class="w-full h-full"></canvas>
    <!-- UI Overlay -->
    <div class="overlay">
      <div
        v-for="(panel, index) in panels"
        :key="panel.id"
        class="panel"
        :style="{
          transform: `translate(${panel.x}px, ${panel.y}px)`,
          width: panel.width + 'px',
          height: panel.height + 'px',
          zIndex: panel.z,
        }"
        @pointerdown="focusPanel(index, $event)"
      >
        <!-- Panel Header -->
        <header
          class="panel-header"
          @pointerdown.stop="startDrag(index, $event)"
        >
          {{ panel.title }}
          <button class="min-btn" @click.stop="toggleClose(index)">
            {{ panel.minimized ? "🗖" : "⨉" }}
          </button>
        </header>

        <!-- Panel Content -->
        <div v-show="!panel.minimized" class="panel-content">
          <div class="character-info"></div>
          <div class="inventory">
            <table>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resize handle -->
        <div
          class="resize-handle"
          @pointerdown.stop="startResize(index, $event)"
        ></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { EagerWing___LabControl } from "__&GL/render/lab.control"
import type { CharacterAttribute } from "__&types/Character"
// import Log from "__&vite/components/panel/Utils/Log.vue"
import { defineComponent } from "vue"

export default defineComponent({
  name: "LabControl",
  // components: { Log },
  data() {
    return {
      processor: null as EagerWing___LabControl | null,
      characterInitAttribute: new Map([
        [
          "mainPlayer",
          {
            allowMovement: true,
            object: "character",
            attribute: {
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
                  scale: 0.005,
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
            },
          },
        ],
        [
          "secondPlayer",
          {
            allowMovement: false,
            object: "character",
            attribute: {
              modelId: "002",
              information: {
                name: "TANIA",
                gender: "female",
                level: 1,
                health: 100,
                mana: 100,
                job: "warrior",
                race: "elyos",
                dimension: {
                  scale: 0.005,
                },
              },
              position: {
                x: 5,
                y: 0,
                z: 5,
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
            },
          },
        ],
      ]) as Map<
        string,
        {
          attribute: CharacterAttribute
          object: string
          allowMovement: boolean
        }
      >,

      // Panel Manager
      panels: [
        {
          id: 1,
          title: "Inventory",
          x: 60,
          y: 60,
          width: 450,
          height: 850,
          z: 1,
          minimized: false,
        },
      ],
      panelLib: [
        {
          id: 1,
          title: "Inventory",
          x: 60,
          y: 60,
          width: 240,
          height: 160,
          z: 1,
          minimized: false,
        },
        {
          id: 2,
          title: "Stats",
          x: 340,
          y: 100,
          width: 240,
          height: 160,
          z: 2,
          minimized: false,
        },
      ],
      dragging: false,
      resizing: false,
      activeIndex: null,
      offsetX: 0,
      offsetY: 0,
      startWidth: 0,
      startHeight: 0,
    }
  },
  mounted() {
    const canvas = this.$refs.canvasEl as HTMLCanvasElement
    if (!canvas) return

    this.processor = new EagerWing___LabControl(
      canvas,
      new Map([["character", "../characters/DUMMY.glb"]]),
      this.characterInitAttribute,
    )
  },
  beforeUnmount() {
    this.processor?.destroy()
    this.processor = null
  },
  methods: {
    focusPanel(index, e) {
      const maxZ = Math.max(...this.panels.map((p) => p.z))
      this.panels[index].z = maxZ + 1
    },

    /* Start dragging */
    startDrag(index, e) {
      const panel = this.panels[index]
      this.dragging = true
      this.activeIndex = index
      const rect = e.currentTarget.parentElement.getBoundingClientRect()
      this.offsetX = e.clientX - rect.left
      this.offsetY = e.clientY - rect.top
      document.addEventListener("pointermove", this.onPointerMove)
      document.addEventListener("pointerup", this.onPointerUp)
      e.preventDefault()
    },

    /* Start resizing */
    startResize(index, e) {
      const panel = this.panels[index]
      this.resizing = true
      this.activeIndex = index
      this.startWidth = panel.width
      this.startHeight = panel.height
      this.offsetX = e.clientX
      this.offsetY = e.clientY
      document.addEventListener("pointermove", this.onPointerMove)
      document.addEventListener("pointerup", this.onPointerUp)
      e.preventDefault()
    },

    onPointerMove(e) {
      if (this.dragging && this.activeIndex !== null) {
        const panel = this.panels[this.activeIndex]
        panel.x = e.clientX - this.offsetX
        panel.y = e.clientY - this.offsetY
      } else if (this.resizing && this.activeIndex !== null) {
        const panel = this.panels[this.activeIndex]
        const dx = e.clientX - this.offsetX
        const dy = e.clientY - this.offsetY
        panel.width = Math.max(160, this.startWidth + dx)
        panel.height = Math.max(100, this.startHeight + dy)
      }
    },

    onPointerUp() {
      this.dragging = false
      this.resizing = false
      this.activeIndex = null
      document.removeEventListener("pointermove", this.onPointerMove)
      document.removeEventListener("pointerup", this.onPointerUp)
    },

    toggleClose(index: number) {
      // this.panels[index].minimized = !this.panels[index].minimized
      this.panels.splice(index, 1)
    },
  },
})
</script>
