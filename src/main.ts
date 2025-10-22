import { createApp } from "vue"
import "./style.css"
import "./assets/css/character.creation/panel.top.css"
import "./assets/css/character.creation/panel.left.css"
import App from "./App.vue"
import router from "./router"

createApp(App).use(router).mount("#app")
