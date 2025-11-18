<template>
  <div id="characterCreation-topPanel">
    <img src="#assets/logo.png" />
    <div class="game-info">
      <h1>Eager Wing</h1>
      <label>v.1.2.0</label>
    </div>
    <div class="segment-container">
      <div
        class="segment active"
        id="segment-head"
        v-on:click="menuClick('head', $event)"
      >
        HEAD
      </div>
      <div
        class="segment"
        id="segment-upper"
        v-on:click="menuClick('upper', $event)"
      >
        UPPER
      </div>
      <div
        class="segment"
        id="segment-lower"
        v-on:click="menuClick('lower', $event)"
      >
        LOWER
      </div>
      <div
        class="segment"
        id="segment-preview"
        v-on:click="menuClick('preview', $event)"
      >
        PREVIEW
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Character.Creation.Top.Panel",
  emits: ["focus-change"],
  methods: {
    menuClick(target: string, event: MouseEvent) {
      const el = document.getElementById(`segment-${target}`)
      if (el) {
        const elements = document.querySelectorAll(".segment.active")
        elements.forEach((el) => el.classList.remove("active"))

        el.classList.add("active")
      }
      this.$emit("focus-change", target, event)
    },
  },
})
</script>
