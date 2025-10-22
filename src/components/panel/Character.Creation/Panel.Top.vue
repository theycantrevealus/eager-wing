<template>
  <div id="characterCreation-topPanel">
    <div class="segment-container">
      <div class="segment segment-head" v-on:click="menuClick('head', $event)">
        Head
      </div>
      <div
        class="segment segment-body active"
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
      this.$emit("focus-change", target, event)
    },
  },
})
</script>
