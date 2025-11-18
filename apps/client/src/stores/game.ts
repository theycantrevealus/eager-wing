import { defineStore } from "pinia"
import { ref } from "vue"
import type { Coordinate } from "../types/coordinate"

export const useGameStore = defineStore("game", () => {
  const player = ref({
    position: { x: 0, y: 0, z: 0 },
    inventory: [
      { id: 1, name: "Sword" },
      { id: 2, name: "Shield" },
    ],
  })

  // Window state (for UI)
  const activeWindows = ref(new Map())

  // Actions to update state
  const updatePlayerPosition = (newPosition: Coordinate) => {
    player.value.position = { ...newPosition }
  }

  const addInventoryItem = (item) => {
    player.value.inventory.push(item)
  }

  const openWindow = (id, component, props) => {
    activeWindows.value.set(id, { component, props })
  }

  const closeWindow = (id) => {
    activeWindows.value.delete(id)
  }

  return {
    player,
    activeWindows,
    updatePlayerPosition,
    addInventoryItem,
    openWindow,
    closeWindow,
  }
})
