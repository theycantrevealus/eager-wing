import type { Panel } from "__&types/Panel"

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
    y: window.innerHeight / 2 + 260 / 2,
    z: 2,
    width: 540,
    height: 320,
    parameter: {
      tabIndex: "0",
    },
  },
]
