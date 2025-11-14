<template>
  <div class="panel-top">
    <h1>Character: {{ characterStore.myCharacter.name }}</h1>
    <p>Level: {{ characterStore.myCharacter.level }}</p>
    <p>Health: {{ characterStore.myCharacter.health }}</p>
    <p>Mana: {{ characterStore.myCharacter.mana }}</p>
    <button @click="levelUp">Level Up</button>
    <button @click="takeDamage">Take Damage (-10 HP)</button>
    <button @click="useMana">Use Mana (-10 MP)</button>
  </div>
</template>

<script setup lang="ts">
import { useCharacterStore } from "../stores/character"

const characterStore = useCharacterStore()

const levelUp = () => {
  characterStore.levelUpCharacter()
}

const takeDamage = () => {
  characterStore.updateCharacterHealth(characterStore.myCharacter.health - 10)
}

const useMana = () => {
  characterStore.updateCharacterMana(characterStore.myCharacter.mana - 10)
}
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
