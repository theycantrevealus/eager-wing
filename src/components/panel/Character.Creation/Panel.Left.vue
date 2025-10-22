<template>
  <div id="characterCreation-leftPanel">
    <table class="form-container">
      <tbody>
        <tr>
          <td>
            <div class="input-group">
              <label>Gender</label>
              <div class="selection-box-container">
                <div class="selection-box" v-for="value in gender">
                  {{ value }}
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="input-group">
              <label>Skin Color</label>
              <div class="selection-box-container">
                <div class="selection-box" v-for="value in skin_color">
                  <div
                    v-on:click="changeSkinTone(value, $event)"
                    class="custom-color"
                    :style="{ background: value }"
                  ></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="input-group">
              <label>Hair Color</label>
              <div class="selection-box-container">
                <div class="selection-box" v-for="value in hair_color">
                  <div
                    class="custom-color"
                    :style="{ background: value }"
                  ></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="input-group">
              <label>Preset Cloth</label>
              <div class="selection-box-container">
                <div
                  class="selection-box"
                  v-for="value in preset_cloth"
                  :key="value"
                >
                  <div
                    class="custom-image"
                    :style="{
                      backgroundImage: `url(${getImageUrl(value)})`,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Character.Creation.Left.Panel",
  data() {
    return {
      gender: ["m", "f"],
      skin_color: ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524"],
      hair_color: [
        "#000000", // Black
        "#2C1B0F", // Dark Brown
        "#5C3A21", // Medium Brown
        "#A0522D", // Light Brown / Sienna
        "#FFD700", // Blonde / Gold
        "#FAF0BE", // Platinum Blonde
        "#FFB347", // Strawberry Blonde
        "#A52A2A", // Auburn
        "#FF4500", // Red
        "#B87333", // Copper
        "#964B00", // Chestnut
        "#8B7D7B", // Ash Brown
        "#FFFACD", // Light Golden Blonde
        "#C0C0C0", // Silver
        "#808080", // Gray
        "#FFFFFF", // White
        "#1E90FF", // Blue
        "#32CD32", // Green
        "#FF69B4", // Pink
        "#800080", // Purple
      ],
      images: {} as Record<string, unknown>,
      preset_cloth: [
        "female_001.png",
        "female_002.png",
        "female_003.png",
        "female_004.png",
        "female_005.png",
        "female_006.png",
      ],
    }
  },
  emits: ["change-skin-tone", "change-hair-dye"],
  created() {
    this.images = import.meta.glob("@assets/clothes/*", {
      eager: true,
    }) as Record<string, unknown>
  },
  methods: {
    getImageUrl(file: string) {
      // Find matching file by name
      const entry = Object.entries(this.images).find(([path]) =>
        path.includes(file),
      )
      if (
        entry &&
        typeof entry[1] === "object" &&
        entry[1] &&
        "default" in entry[1]
      ) {
        return entry[1].default
      }
      return ""
    },
    changeSkinTone(color: string, event: MouseEvent) {
      this.$emit("change-skin-tone", color, event)
    },
  },
})
</script>
