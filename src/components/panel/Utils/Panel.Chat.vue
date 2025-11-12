<template>
  <div>
    <Tabs v-model:value="parameter.tabIndex" class="w-full">
      <TabList>
        <Tab value="0">All</Tab>
        <Tab value="1">Combat</Tab>
        <Tab value="2">Normal</Tab>
        <Tab value="3">Group</Tab>
        <Tab value="4">Debug</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">
          <!-- unique ref for each tab -->
          <div ref="chatContainerAll" class="chat-box">
            <p
              v-for="(a, i) in messages"
              :key="`all-${i}`"
              :class="`m-0 chat-p ${a.type}`"
            >
              {{ a.content }}
            </p>
          </div>
        </TabPanel>

        <TabPanel value="1">
          <div ref="chatContainerCombat" class="chat-box">
            <p
              v-for="(a, i) in messages.filter((m) => m.type === 'combat')"
              :key="`combat-${i}`"
              :class="`m-0 chat-p ${a.type}`"
            >
              {{ a.content }}
            </p>
          </div>
        </TabPanel>

        <TabPanel value="2">
          <div ref="chatContainerWhisper" class="chat-box">
            <p
              v-for="(a, i) in messages.filter((m) => m.type === 'whisper')"
              :key="`whisper-${i}`"
              :class="`m-0 chat-p ${a.type}`"
            >
              {{ a.content }}
            </p>
          </div>
        </TabPanel>

        <TabPanel value="3">
          <div ref="chatContainerGuild" class="chat-box">
            <p
              v-for="(a, i) in messages.filter((m) => m.type === 'guild')"
              :key="`guild-${i}`"
              :class="`m-0 chat-p ${a.type}`"
            >
              {{ a.content }}
            </p>
          </div>
        </TabPanel>

        <TabPanel value="4">
          <div ref="chatContainerDebug" class="chat-box">
            <p
              v-for="(a, i) in messages.filter((m) => m.type === 'debug')"
              :key="`debug-${i}`"
              :class="`m-0 chat-p ${a.type}`"
            >
              {{ a.content }}
            </p>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue"
import Tabs from "primevue/tabs"
import TabList from "primevue/tablist"
import Tab from "primevue/tab"
import TabPanels from "primevue/tabpanels"
import TabPanel from "primevue/tabpanel"
import { useLogStore } from "__&stores/utils/log"

export default defineComponent({
  name: "PanelChat",
  components: {
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  },
  data() {
    return { chatStore: markRaw(useLogStore()) }
  },
  props: {
    debug: { type: Boolean, default: false },
    parameter: { type: Object, default: () => ({ tabIndex: "0" }) },
  },
  computed: {
    // ...mapStores(useChatStore),
    messages() {
      return this.chatStore.messages
    },
    activeTab() {
      return String(this.parameter.tabIndex ?? this.parameter.activeTab ?? "0")
    },
  },
  watch: {
    messages: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          if (!this.tryScrollActiveContainer()) {
            setTimeout(() => {
              this.tryScrollActiveContainer()
            }, 50)
          }
        })
      },
    },

    "parameter.activeTab"(newIndex) {
      this.$emit("update-parameter", {
        ...this.parameter,
        activeTab: newIndex,
      })
    },
  },
  methods: {
    tryScrollActiveContainer(): boolean {
      const active = String(this.activeTab)
      const mapRef: Record<string, string> = {
        "0": "chatContainerAll",
        "1": "chatContainerCombat",
        "2": "chatContainerWhisper",
        "3": "chatContainerGuild",
        "4": "chatContainerDebug",
      }
      const refName = mapRef[active]
      if (!refName) return false

      const candidate = (this.$refs as any)[refName]

      let el: HTMLElement | null = null
      if (Array.isArray(candidate)) {
        el = candidate.find((x: any) => x && x.scrollTop !== undefined) ?? null
      } else if (
        candidate &&
        (candidate as HTMLElement).scrollTop !== undefined
      ) {
        el = candidate as HTMLElement
      }

      if (!el) return false

      try {
        el.scrollTop = el.scrollHeight
        return true
      } catch (err) {
        el.scrollTop = el.scrollHeight
        return true
      }
    },
  },
})
</script>

<style>
.chat-box {
  max-height: 250px;
  overflow-y: auto;
  padding: 8px;
}
</style>
