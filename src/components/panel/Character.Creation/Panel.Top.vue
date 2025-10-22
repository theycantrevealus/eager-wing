<template>
  <div id="characterCreation-topPanel">
    <div class="segment-container">
      <div
        class="segment"
        id="segment-head"
        v-on:click="menuClick('head', $event)"
      >
        Head
      </div>
      <div
        class="segment active"
        id="segment-body"
        v-on:click="menuClick('body', $event)"
      >
        Body
      </div>
      <div class="segment">Preview</div>
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
