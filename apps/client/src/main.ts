import { createApp } from "vue"
import "./style.css"
import "./assets/css/character.creation/panel.top.css"
import "./assets/css/character.creation/panel.left.css"
import "./assets/css/panel.css"
import "./assets/css/control.css"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"
import PrimeVue from "primevue/config"
import Aura from "@primeuix/themes/aura"
const pinia = createPinia()
createApp(App)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  })
  .use(pinia)
  .use(router)
  .mount("#app")
