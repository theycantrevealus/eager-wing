<template>
  <div class="character-target" v-if="characterStore.target">
    <small>{{ characterStore.target?.level ?? "???" }}</small>
    <label>{{ characterStore.target?.name ?? "???" }}</label>
    <div :class="['job-icon', characterStore.target?.job]"></div>
  </div>
</template>

<script setup lang="ts">
import { useCharacterStore } from "../stores/character"

const characterStore = useCharacterStore()

// const levelUp = () => {
//   characterStore.levelUpCharacter()
// }

// const takeDamage = () => {
//   characterStore.updateCharacterHealth(characterStore.myCharacter.health - 10)
// }

// const useMana = () => {
//   characterStore.updateCharacterMana(characterStore.myCharacter.mana - 10)
// }
</script>

<style scoped>
.top-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
}
</style>
