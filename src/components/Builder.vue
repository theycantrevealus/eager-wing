<template>
  <div id="content-loader" class="content-loader">
    <router-view v-slot="{ Component }">
      <transition name="scale" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import pointerCur from "@assets/cursor/normal.cur"
import linkCur from "@assets/cursor/link.cur"

export default defineComponent({
  name: "Builder",

  mounted() {
    document.body.style.cursor = `url(${pointerCur}), auto`

    document.body.addEventListener("mousedown", () => {
      document.body.style.cursor = `url(${linkCur}), auto`
    })

    document.body.addEventListener("mouseup", () => {
      document.body.style.cursor = `url(${pointerCur}), auto`
    })

    // TODO : Couldn't find slider selector
    const slider = document.querySelector("input[type='range']")
    if (slider) {
      slider.addEventListener("mousedown", this.onSliderDown)
    }

    window.addEventListener("mouseup", this.onSliderUp)
  },

  beforeUnmount() {
    const slider = document.querySelector("input[type='range']")
    if (slider) {
      slider.removeEventListener("mousedown", this.onSliderDown)
    }
    window.removeEventListener("mouseup", this.onSliderUp)
  },

  methods: {
    onSliderDown() {
      document.body.style.cursor = `url(${linkCur}), auto`
    },
    onSliderUp() {
      document.body.style.cursor = `url(${pointerCur}), auto`
    },
  },
})
</script>
