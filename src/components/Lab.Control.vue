<template>
  <div>
    <canvas ref="canvasEl" class="w-full h-full"></canvas>
    <!-- UI Overlay -->
    <div class="overlay">
      <div
        v-for="(panel, index) in panels"
        :key="index + 1"
        class="panel"
        :style="{
          transform: `translate(${panel.x}px, ${panel.y}px)`,
          width: panel.width + 'px',
          height: panel.height + 'px',
          zIndex: panel.z,
        }"
        @pointerdown="focusPanel(index)"
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
          <component
            v-if="panel.component"
            :is="asyncPanel(panel.component)"
          ></component>
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
import { LAB_CHARACTER } from "__&constants/lab.character"
import { KEYBOARD_MAP } from "__&constants/map.keyboard"
import { PANEL } from "__&constants/panel"
import { EagerWing___LabControl } from "__&GL/render/lab.control"
import type { Panel } from "__&types/Panel"
import { defineAsyncComponent, defineComponent } from "vue"

export default defineComponent({
  name: "LabControl",
  data() {
    return {
      processor: null as EagerWing___LabControl | null,
      characterInitAttribute: LAB_CHARACTER,

      /** Panel Management */
      panels: [] as Panel[],
      dragging: false,
      resizing: false,
      activeIndex: null as number | null,
      offsetX: 0,
      offsetY: 0,
      startWidth: 0,
      startHeight: 0,

      /** Keyboard State */
      ctrlPressed: false,
      altPressed: false,
      shiftPressed: false,
      command: "",
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

    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)

    document.addEventListener("keydown", (e) => this.handleKeyDown(e))
    document.addEventListener("keyup", (e) => this.handleKeyUp(e))
    window.addEventListener("blur", this.handleWindowBlur)
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown)
    document.removeEventListener("keyup", this.handleKeyUp)

    this.processor?.destroy()
    this.processor = null
  },
  methods: {
    asyncPanel(target: string) {
      return defineAsyncComponent(
        () => import(`__&vite/components/panel/Utils/${target}.vue`),
      )
    },
    focusPanel(index: number) {
      if (this.panels[index]) {
        const maxZ = Math.max(...this.panels.map((p: Panel) => p.z))
        this.panels[index].z = maxZ + 1
      }
    },

    /* Start dragging */
    startDrag(index: number, e: any) {
      // const panel = this.panels[index]
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
    startResize(index: number, e: MouseEvent) {
      const panel = this.panels[index]
      if (panel) {
        this.resizing = true
        this.activeIndex = index
        this.startWidth = panel ? panel.width : 200
        this.startHeight = panel.height
        this.offsetX = e.clientX
        this.offsetY = e.clientY
        document.addEventListener("pointermove", this.onPointerMove)
        document.addEventListener("pointerup", this.onPointerUp)
      }
      e.preventDefault()
    },

    onPointerMove(e: MouseEvent) {
      if (this.dragging && this.activeIndex !== null) {
        const panel = this.panels[this.activeIndex]
        if (panel) {
          panel.x = e.clientX - this.offsetX
          panel.y = e.clientY - this.offsetY
        }
      } else if (this.resizing && this.activeIndex !== null) {
        const panel = this.panels[this.activeIndex]
        if (panel) {
          const dx = e.clientX - this.offsetX
          const dy = e.clientY - this.offsetY
          panel.width = Math.max(160, this.startWidth + dx)
          panel.height = Math.max(100, this.startHeight + dy)
        }
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

    handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Control") this.ctrlPressed = false
      if (e.key === "Alt") this.altPressed = false
      if (e.key === "Shift") this.shiftPressed = false

      e.preventDefault()
    },

    handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey) this.ctrlPressed = true
      if (e.altKey) this.altPressed = true
      if (e.shiftKey) this.shiftPressed = true

      const key =
        "key" +
        (this.ctrlPressed ? "_ctrl" : "") +
        (this.altPressed ? "_alt" : "") +
        (this.shiftPressed ? "_shift" : "") +
        `_${e.key.toLowerCase()}`

      const targetCommand = KEYBOARD_MAP[key]

      this.command = targetCommand?.description || "???"

      if (targetCommand?.command) {
        if (targetCommand?.command?.type === "UI") {
          const command: Panel[] = PANEL.filter(
            (a) => a.identifier === targetCommand?.command?.target,
          )

          const alreadyOpenned = this.panels.find(
            (p) => p.identifier === targetCommand?.command?.target,
          )

          if (command.length === 1 && !alreadyOpenned) {
            this.panels.push(...command)
          } else {
            this.toggleClose(
              this.panels.findIndex(
                (p) => p.identifier === targetCommand?.command?.target,
              ),
            )
          }
        }
      }

      e.preventDefault()
    },
    handleWindowBlur() {
      this.ctrlPressed = false
      this.altPressed = false
      this.shiftPressed = false
    },
  },
})
</script>
