<template>
  <div class="scene-container">
    <canvas ref="canvasEl" class="w-full h-full"></canvas>
    <top-panel ref="topPanelCreation" @focus-change="handleFocus"></top-panel>
    <left-panel @change-skin-tone="handleSkinTone"></left-panel>
    <div id="characterCreation-rightPanel">
      <div v-for="(value, key) in bonesSummary">
        <div v-if="value.group === 'head' && value.name">
          <div class="slidecontainer">
            <p>{{ `${value.name}` ?? "-" }}</p>
            <input
              type="range"
              min="-5"
              step=".1"
              max="5"
              value="1"
              class="slider"
              id="myRange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { EagerWing___CharacterCreation } from "#GL/render/character.creation"
import type {
  CharacterAttribute,
  CharacterBoneCollection,
} from "#types/Character"
import TopPanel from "#vite/components/panel/Character.Creation/Panel.Top.vue"
import LeftPanel from "#vite/components/panel/Character.Creation/Panel.Left.vue"
import { defineComponent, markRaw } from "vue"
import { useCharacterCreationStore } from "../stores/creation"
import { mapState } from "pinia"

export default defineComponent({
  name: "CharacterCreation",
  components: { TopPanel, LeftPanel },
  data() {
    return {
      store: useCharacterCreationStore(),
      characterInitAttribute: {
        modelId: "001",
        information: {
          name: "TATANG 1",
          gender: "female",
          level: 1,
          health: 100,
          mana: 100,
          job: "warrior",
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
      bones: {} as CharacterBoneCollection,
      core: null as EagerWing___CharacterCreation | null,
    }
  },
  mounted() {
    const canvas = this.$refs.canvasEl as HTMLCanvasElement
    if (!canvas) return

    this.store.updateCharacterAttribute(this.characterInitAttribute)

    this.core = new EagerWing___CharacterCreation(
      canvas,
      this.characterInitAttribute,
      this.store,
    )
  },
  computed: {
    ...mapState(useCharacterCreationStore, ["bonesCollection"]),
    bonesSummary() {
      // Display non-circular bone data
      return Object.keys(this.bones).length ? this.bones : "No bones loaded"
    },
  },
  watch: {
    bonesCollection(newValue) {
      const sanitizedBones: CharacterBoneCollection = {}
      for (const key in newValue) {
        sanitizedBones[key] = {
          name: newValue[key].name,
          group: newValue[key].group,
          configurable: newValue[key].configurable,
          minimum: newValue[key].minimum,
          maximum: newValue[key].maximum,
        }
      }
      this.bones = sanitizedBones
    },
  },
  methods: {
    handleFocus(target: string) {
      if (target === "head") this.core?.focusHead()
      if (target === "upper") this.core?.focusUpper()
      if (target === "lower") this.core?.focusLower()
      if (target === "preview") this.core?.focusFull()
    },
    handleSkinTone(color: string) {
      this.characterInitAttribute.style.body.color = color
      this.store.updateCharacterAttribute(this.characterInitAttribute)
      this.core?.applySkinTone(color)
    },
  },
  beforeUnmount() {
    this.core?.destroy()
    this.core = null
  },
})
</script>
