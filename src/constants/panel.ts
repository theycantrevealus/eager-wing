import type { Panel } from "__&types/Panel"

export const PANEL: Panel[] = [
  {
    identifier: "inventory",
    title: "Inventory",
    component: "Panel.Inventory",
    x: 60,
    y: 60,
    width: 540,
    height: 850,
    z: 1,
    minimized: false,
  },
  {
    identifier: "chat",
    title: "Chat",
    component: "Panel.Chat",
    x: 340,
    y: 100,
    width: 240,
    height: 160,
    z: 2,
    minimized: false,
  },
]
