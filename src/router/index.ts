import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import Builder from "__&vite/components/Builder.vue"
import CharacterCreation from "__&vite/components/Character.Creation.vue"
import LabControl from "__&vite/components/Lab.Control.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Builder",
    meta: {
      requiresAuth: true,
    },
    redirect: "/lab.control",
    component: Builder,
    children: [
      {
        path: "creation",
        name: "CharacterCreation",
        meta: {
          requiresAuth: true,
        },
        component: CharacterCreation,
      },
      {
        path: "lab.control",
        name: "LabControl",
        meta: {
          requiresAuth: true,
        },
        component: LabControl,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(""),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" }
    } else {
      return { el: "#content-loader", top: 0, left: 0 }
    }
  },
})

export default router
