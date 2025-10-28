<template>
  <div>
    <Tabs v-model:value="parameter.tabIndex" class="w-full">
      <TabList>
        <Tab value="0">All</Tab>
        <Tab value="1">Combat</Tab>
        <Tab value="2">Normal</Tab>
        <Tab value="3">Group</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <p class="m-0 chat-p system">Renabella has defeated Johnz</p>
          <p class="m-0 chat-p system">You have defeated Goblin Warrior</p>
          <p class="m-0 chat-p from-enemy">
            R4daHn inflicted 412 damage to you
          </p>
          <p class="m-0 chat-p from-allied">
            +HP 120 from [Eternity Faith lv.2]
          </p>
          <p class="m-0 chat-p whisper">Renabella: Parah bro</p>
          <p class="m-0 chat-p guild">Renabella: Bagi potion L gaes</p>
          <p class="m-0 chat-p party">Levi4than007: Izin off dulu</p>
        </TabPanel>
        <TabPanel value="1">
          <p class="m-0">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
            aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
            eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci
            velit, sed quia non numquam eius modi.
          </p>
        </TabPanel>
        <TabPanel value="2">
          <p class="m-0">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui
            blanditiis praesentium voluptatum deleniti atque corrupti quos
            dolores et quas molestias excepturi sint occaecati cupiditate non
            provident, similique sunt in culpa qui officia deserunt mollitia
            animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis
            est et expedita distinctio. Nam libero tempore, cum soluta nobis est
            eligendi optio cumque nihil impedit quo minus.
          </p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"

import Tabs from "primevue/tabs"
import TabList from "primevue/tablist"
import Tab from "primevue/tab"
import TabPanels from "primevue/tabpanels"
import TabPanel from "primevue/tabpanel"

export default defineComponent({
  name: "PanelChat",
  components: {
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  },
  props: {
    debug: {
      type: Boolean,
      default: false,
    },
    parameter: {
      type: Object,
      default: () => ({ tabIndex: "0" }),
    },
    chat: {
      type: Array<{
        type: string
        message: string
      }>,
      default: () => [],
    },
  },
  emits: ["update-parameter"],
  watch: {
    "parameter.activeTab"(newIndex) {
      this.$emit("update-parameter", {
        ...this.parameter,
        activeTab: newIndex,
      })
    },
  },
})
</script>
