<template>
  <div id="panel-skillcontainer">
    <Tabs v-model:value="parameter.tabIndex" class="w-full">
      <TabList>
        <Tab value="0">Active</Tab>
        <Tab value="1">Passive</Tab>
        <Tab value="2">Gather/Craft</Tab>
        <Tab value="3">Emotes</Tab>
        <Tab value="4">Action</Tab>
        <Tab value="5">Chain</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">
          <div class="overflow-y">
            <table class="panel-table">
              <thead>
                <tr>
                  <th colspan="2">
                    <span class="text">Skill Name</span>
                  </th>
                  <th><span class="text">Type</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in passingProp?.skillList.filter(
                    (m: any) =>
                      m.type === 'Offensive' ||
                      m.type === 'AoE' ||
                      m.type === 'Basic',
                  )"
                  :key="item.id"
                >
                  <td class="wrap-content">
                    <img
                      draggable="true"
                      @dragstart="onDragStart(item, $event)"
                      :src="`${assetUrl}/assets/skill/${item.icon}`"
                    />
                  </td>
                  <td>
                    {{ item.name }}
                  </td>
                  <td>
                    {{ item.type }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPanel>

        <TabPanel value="1">
          <div class="overflow-y">
            <table class="panel-table">
              <thead>
                <tr>
                  <th colspan="2">
                    <span class="text">Skill Name</span>
                  </th>
                  <th><span class="text">Type</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in passingProp?.skillList.filter(
                    (m: any) => m.type === 'Passive',
                  )"
                  :key="item.id"
                >
                  <td class="wrap-content">
                    <img
                      style="pointer-events: none"
                      :src="`${assetUrl}/assets/skill/${item.icon}`"
                    />
                  </td>
                  <td>
                    {{ item.name }}
                  </td>
                  <td>
                    {{ item.type }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPanel>

        <TabPanel value="2"> </TabPanel>

        <TabPanel value="3"> </TabPanel>

        <TabPanel value="4">
          <div class="overflow-y">
            <table class="panel-table">
              <thead>
                <tr>
                  <th colspan="2">
                    <span class="text">Skill Name</span>
                  </th>
                  <th><span class="text">Type</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in passingProp?.skillList.filter(
                    (m: any) => m.type === 'Action',
                  )"
                  :key="item.id"
                >
                  <td class="wrap-content">
                    <img
                      draggable="true"
                      @dragstart="onDragStart(item, $event)"
                      :src="`${assetUrl}/assets/skill/${item.icon}`"
                    />
                  </td>
                  <td>
                    {{ item.name }}
                  </td>
                  <td>
                    {{ item.type }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPanel>

        <TabPanel value="5">
          <OrganizationChart :value="passingProp?.skillChain">
            <template #default="slotProps">
              <span>{{ slotProps.node.label }}</span>
            </template>
          </OrganizationChart>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import OrganizationChart from "primevue/organizationchart"
import Tabs from "primevue/tabs"
import TabList from "primevue/tablist"
import Tab from "primevue/tab"
import TabPanels from "primevue/tabpanels"
import TabPanel from "primevue/tabpanel"
export default defineComponent({
  name: "PanelSkill",
  components: {
    Tabs,
    Tab,
    TabPanels,
    TabList,
    TabPanel,
    OrganizationChart,
  },
  data() {
    return {
      assetUrl: import.meta.env.VITE_SERVER_ASSET,
    }
  },
  props: {
    parameter: { type: Object, default: () => ({ tabIndex: "0" }) },
    passingProp: Object,
    items: Array<any>,
  },
  methods: {
    onDragStart(item: any, event: any) {
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData("skill", item.id)
    },
  },
})
</script>
