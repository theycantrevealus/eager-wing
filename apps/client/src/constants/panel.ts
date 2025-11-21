import type { Panel } from "#types/Panel"
import { Skill } from "#types/Skill.ts"

export const SKILLS: Skill[] = [
  {
    id: 1,
    name: "Ferocious Strike I",
    icon: "cbt_wa_robusthit_g1",
    type: "Offensive",
  },
  {
    id: 2,
    name: "Robust Blow I",
    icon: "cbt_wa_robustblow_g1",
    type: "Offensive",
  },
  {
    id: 3,
    name: "Weakening Severe Blow I",
    icon: "live_fi_enfeeblehit_g1",
    type: "Offensive",
  },
  {
    id: 4,
    name: "Seismic Wave I",
    icon: "seismic_wave_i.webp",
    type: "AoE",
  },
  { id: 5, name: "Taunt I", icon: "taunt_i.webp", type: "Taunt" },
  {
    id: 6,
    name: "Herb Treatment I",
    icon: "cbt_mending_g2",
    type: "Basic",
  },
  {
    id: 7,
    name: "Advanced Plate Armor Proficiency I",
    icon: "cbt_p_equip_plate_g1",
    type: "Passive",
  },
  {
    id: 8,
    name: "Advanced Polearm Training I",
    icon: "cbt_p_equip_polearm_g1.png",
    type: "Passive",
  },
  {
    id: 9,
    name: "Basic Sword Training",
    icon: "cbt_p_equip_enhancedsword_g1.png",
    type: "Passive",
  },
  {
    id: 10,
    name: "Return",
    icon: "cbt_returnhome1",
    type: "Action",
  },
  {
    id: 11,
    name: "Attack",
    icon: "attack.png",
    type: "Action",
  },
  {
    id: 12,
    name: "Rest",
    icon: "toogle_rest.png",
    type: "Action",
  },
  {
    id: 13,
    name: "Loot",
    icon: "loot.png",
    type: "Action",
  },
]

export const PANEL: Panel[] = [
  {
    id: 1,
    identifier: "inventory",
    title: "Inventory",
    component: "Panel.Inventory",
    resizable: false,
    x: window.innerWidth - 540,
    y: 60,
    z: 1,
    width: 540,
    height: 850,
  },
  {
    id: 2,
    identifier: "chat",
    title: "Chat",
    component: "Panel.Chat",
    resizable: false,
    x: 0,
    // y: window.innerHeight / 2 + 260 / 2,
    y: 0,
    z: 2,
    width: 540,
    height: 320,
    parameter: {
      tabIndex: "0",
    },
  },
  {
    id: 3,
    identifier: "skill",
    title: "Skill",
    component: "Panel.Skill",
    resizable: true,
    x: window.innerWidth / 2 + 260 / 2,
    y: 10,
    z: 2,
    width: 540,
    height: 620,
    parameter: {
      tabIndex: "0",
    },
    passingProp: {
      skillChain: {
        templar: {
          label: "Argentina",
          img: "",
          children: [
            {
              label: "Argentina",
              children: [
                {
                  label: "Argentina",
                },
                {
                  label: "Croatia",
                },
              ],
            },
            {
              label: "France",
              children: [
                {
                  label: "France",
                },
                {
                  label: "Morocco",
                },
              ],
            },
          ],
        },
      },
      skillList: SKILLS,
    },
  },
]
