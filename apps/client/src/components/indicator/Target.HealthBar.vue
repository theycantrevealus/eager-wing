<template>
  <div id="character_target_container" v-if="characterTarget !== null">
    <img
      :src="`${assetUrl}/assets/class.${characterTarget.information.job}.webp`"
      id="character_target_class_icon"
    />
    <label id="character_target_level">{{
      characterTarget.information.level
    }}</label>
    <label id="character_target_nickname">{{
      characterTarget.information.name
    }}</label>
    <label id="character_target_distance"
      ><b>{{ characterDistance ?? "?" }}</b
      >m</label
    >
  </div>
</template>
<script lang="ts">
import { defineComponent, markRaw } from "vue"
import { useCharacterStore } from "#stores/character.ts"

export default defineComponent({
  name: "Target.HealthBar",
  data() {
    return {
      characterStore: markRaw(useCharacterStore()),

      assetUrl: import.meta.env.VITE_SERVER_ASSET,
    }
  },
  computed: {
    characterTarget() {
      return this.characterStore.getTarget
    },
    characterDistance() {
      return this.characterStore.getTargetDistance &&
        this.characterStore.getTargetDistance < 0
        ? 0
        : this.characterStore.getTargetDistance.toFixed(2)
    },
  },
  watch: {
    messages: {
      deep: true,
      handler() {
        //
      },
    },
  },
  mounted() {
    //
  },
})
</script>
