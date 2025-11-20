export const KEYBOARD_MAP: {
  [key: string]: {
    description?: string
    command?: {
      type: string
      target: string
    }
  }
} = {
  key_a: {
    description: "[Character-Movement] Left",
  },
  key_b: {},
  key_c: {},
  key_d: {
    description: "[Character-Movement] Right",
  },
  key_e: {},
  key_f: {},
  key_g: {
    description: "[UI] Guild",
  },
  key_h: {},
  key_i: {
    description: "[UI] Inventory",
    command: {
      type: "UI",
      target: "inventory",
    },
  },
  key_j: {
    description: "[UI] Quest",
  },
  key_k: {
    description: "[UI] Skill",
    command: {
      type: "UI",
      target: "skill",
    },
  },
  key_l: {},
  key_m: {
    description: "[UI] Map",
  },
  key_n: {},
  key_o: {
    description: "[UI] Configuration",
  },
  key_p: {
    description: "[UI] Character Profile",
  },
  key_q: {},
  key_r: {},
  key_s: {
    description: "[Character-Movement] Back",
  },
  key_t: {},
  key_u: {},
  key_v: {
    description: "[UI] Friends List",
  },
  key_w: {
    description: "[Character-Movement] Forward",
  },
  key_x: {
    description: "[Character-Mode] Combat mode",
  },
  key_y: {},
  key_z: {},

  key_1: {},
  key_2: {},
  key_3: {},
  key_4: {},
  key_5: {},
  key_6: {},
  key_7: {},
  key_8: {},
  key_9: {},
  key_0: {},

  key_alt_1: {},
  key_alt_2: {},
  key_alt_3: {},
  key_alt_4: {},
  key_alt_5: {},
  key_alt_6: {},
  key_alt_7: {},
  key_alt_8: {},
  key_alt_9: {},
  key_alt_0: {},

  key_ctrl_1: {},
  key_ctrl_2: {},
  key_ctrl_3: {},
  key_ctrl_4: {},
  key_ctrl_5: {},
  key_ctrl_6: {},
  key_ctrl_7: {},
  key_ctrl_8: {},
  key_ctrl_9: {},
  key_ctrl_0: {},

  key_enter: {
    description: "[UI] Chat",
    command: {
      type: "UI",
      target: "chat",
    },
  },

  key_space: {
    description: "[Character-Movement] Jump",
  },
}
