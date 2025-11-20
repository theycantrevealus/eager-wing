<template>
  <div>
    <img :src="`${assetUrl}/assets/skill/${imageFile}`" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Drag.Skill",
  props: {
    imageFile: String,
  },
  data() {
    return {
      assetUrl: import.meta.env.VITE_SERVER_ASSET,
    }
  },
})
</script>
