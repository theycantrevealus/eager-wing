// src/stores/character.ts
import type { CharacterAttribute } from "#types/Character"
import { defineStore } from "pinia"

export const useCharacterStore = defineStore("character", {
  state: () => ({
    MyCharacter: {
      modelId: "001",
      information: {
        name: "TATANG 1",
        gender: "female",
        level: 1,
        health: 100,
        mana: 100,
        job: "templar",
        race: "asmodian",
        dimension: {
          scale: 1,
        },
      },
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      style: {
        body: {
          color: "#ffc095",
          hair: {
            color: "#ffc095",
          },
          brow: {
            color: "#ffc095",
          },
          eye: {
            color: "",
            scale: 0,
          },
          blush: {
            color: "",
          },
          lip: {
            color: "#ff0000",
          },
        },
      },
      speed: 0.1,
      turnSpeed: 0.5,
      classConfig: {
        needDebug: false,
      },
    } as CharacterAttribute,
    target: null as CharacterAttribute | null,
    targetDistance: 0,
  }),

  actions: {
    setMyCharacter(attributes: CharacterAttribute) {
      this.MyCharacter = attributes
    },
    setTargetSelection(attributes: CharacterAttribute | null) {
      this.target = attributes
    },
    updateTargetDistance(distance: number) {
      this.targetDistance = distance
    },
    removeTargetSelection() {
      this.target = null
    },
  },
  getters: {
    getTarget: (state) => state.target,
    getTargetDistance: (state) => state.targetDistance,
  },
})

export type CharacterStore = ReturnType<typeof useCharacterStore>
