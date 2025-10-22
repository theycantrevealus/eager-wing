import { createApp } from "vue"
import "./style.css"
import "./assets/css/character.creation/panel.top.css"
import "./assets/css/character.creation/panel.left.css"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"
const pinia = createPinia()
createApp(App).use(pinia).use(router).mount("#app")
