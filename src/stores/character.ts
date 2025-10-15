// src/stores/character.ts
import { defineStore } from "pinia"
import type { CharacterAttribute } from "../utils/components/character/type"

export const useCharacterStore = defineStore("character", {
  state: () => ({
    MyCharacter: {
      modelId: "CHAR001",
      name: "TATANG",
      level: 1,
      health: 100,
      mana: 100,
      job: "",
      race: "",
    } as CharacterAttribute,
    target: null as CharacterAttribute | null,
  }),

  actions: {
    setMyCharacter(attributes: CharacterAttribute) {
      this.MyCharacter = attributes
    },
    setTargetSelection(attributes: CharacterAttribute) {
      this.target = attributes
    },

    removeTargetSelection() {
      this.target = null
    },
  },
})
