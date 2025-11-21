<template>
  <div id="dockbar">
    <div id="status-bar"></div>
    <div id="experience-bar"></div>
    <div id="quick-bar">
      <div v-for="item in slot" :key="item.slot">
        <div
          class="quick-bar-item"
          :id="`quick-bar-item-${item.slot}`"
          @dragover.prevent
          @dragenter.prevent
          @drop="onDrop"
        >
          <label>{{ item.slot }}</label>
          <img
            draggable="true"
            v-if="item.skill"
            :src="`${assetUrl}/assets/skill/${item.skill.icon}`"
            @dragstart="onDragStart(item, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { SKILLS } from "#constants/panel.ts"
import { Skill } from "#types/Skill.ts"
import { defineComponent } from "vue"

export default defineComponent({
  name: "Dockbar",
  props: {
    passingProp: Object,
  },
  data() {
    return {
      assetUrl: import.meta.env.VITE_SERVER_ASSET,
      slot: [
        {
          slot: "1",
          skill: undefined,
        },
        {
          slot: "2",
          skill: undefined,
        },
        {
          slot: "3",
          skill: undefined,
        },
        {
          slot: "4",
          skill: undefined,
        },
        {
          slot: "5",
          skill: undefined,
        },
        {
          slot: "6",
          skill: undefined,
        },
        {
          slot: "7",
          skill: undefined,
        },
        {
          slot: "8",
          skill: undefined,
        },
        {
          slot: "9",
          skill: undefined,
        },
        {
          slot: "0",
          skill: undefined,
        },
      ] as {
        slot: string
        skill?: Skill
      }[],
      skills: SKILLS,
      fromSlot: {} as {
        originalIndex: number
        slot: string
        skill?: Skill
      } | null,
    }
  },
  mounted() {
    if (this.passingProp && this.passingProp.quickbar) {
      this.slot = this.applySlot(this.passingProp.quickbar)
    }
  },
  methods: {
    applySlot(config: any[]) {
      const map = new Map(config.map((item) => [item.slot, item.skill]))
      return this.slot.map((item) => ({
        ...item,
        skill: map.has(item.slot) ? map.get(item.slot) : item.skill,
      }))
    },
    onDragOver(event: MouseEvent) {
      event.preventDefault()
    },
    onDrop(event: any) {
      event.preventDefault()
      const skill = event.dataTransfer.getData("skill")
      if (skill) {
        const targetID = event.target.id.split("-")
        const targetSkill: Skill[] = this.skills.filter((m) => m.id == skill)
        this.slot
          .map((item, index) => {
            if (item.skill?.id == targetSkill[0]?.id) {
              // if (this.slot[index]) {
              //   if (this.fromSlot) {
              //     this.slot[index].skill = undefined
              //   } else {
              //     this.slot[index] = this.fromSlot
              //   }
              // }

              if (this.slot[index]) this.slot[index].skill = undefined
            }
            return { ...item, originalIndex: index }
          })
          .filter((m: any) => m.slot == targetID[targetID.length - 1])
          .map((v) => {
            const changeSlot = this.slot[v.originalIndex]

            if (changeSlot && targetSkill[0]) {
              if (this.fromSlot) {
                const oldSlot = this.slot[this.fromSlot.originalIndex]
                if (oldSlot) {
                  oldSlot.skill = changeSlot.skill
                  this.fromSlot = null
                }
              }
              changeSlot.skill = targetSkill[0]
            }
          })
      }
    },
    onDragStart(item: any, event: any) {
      document
        .querySelectorAll<HTMLImageElement>(".quick-bar-item img")
        .forEach((img) => {
          img.style.pointerEvents = "none"
        })

      this.slot
        .map((item, index) => {
          return { ...item, originalIndex: index }
        })
        .filter((m: any) => m.slot == item.slot)

      this.fromSlot = {
        ...item,
        originalIndex: this.slot
          .map((item, index) => {
            return { ...item, originalIndex: index }
          })
          .filter((m: any) => m.slot == item.slot)[0]?.originalIndex,
      }

      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData("skill", item.skill.id)

      document.addEventListener("pointerup", this.onPointerUp)
    },

    onPointerUp() {
      document
        .querySelectorAll<HTMLImageElement>(".quick-bar-item img")
        .forEach((img) => {
          img.style.pointerEvents = "all"
        })
      document.removeEventListener("pointerup", this.onPointerUp)
    },
  },
})
</script>
