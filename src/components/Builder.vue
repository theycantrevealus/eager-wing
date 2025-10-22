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

export default defineComponent({
  name: "Builder",
  mounted() {
    document.body.style.cursor = `url(${pointerCur}), auto`
  },
})
</script>
