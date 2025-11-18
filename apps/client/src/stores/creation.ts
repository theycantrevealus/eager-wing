import type {
  CharacterAttribute,
  CharacterBoneCollection,
} from "#types/Character"
import { defineStore } from "pinia"

export const useCharacterCreationStore = defineStore("creation", {
  state: () => ({
    character: {} as CharacterAttribute,
    bones: {} as CharacterBoneCollection,
  }),
  actions: {
    updateCharacterAttribute(attributes: CharacterAttribute) {
      this.character = attributes
    },
    updateBones(bones: CharacterBoneCollection) {
      this.bones = bones
    },
  },
  getters: {
    bonesCollection(): CharacterBoneCollection {
      return this.bones
    },
  },
})

export type CharacterCreationStore = ReturnType<
  typeof useCharacterCreationStore
>
