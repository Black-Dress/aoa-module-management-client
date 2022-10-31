import {createApp} from "vue";
import "element-plus/dist/index.css";
import App from "./App.vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import router from "./router";
import "./assert/css/index.css";
import {mqttx} from "./utils/mqttx";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.config.globalProperties.$mqttx = mqttx;
// 使用router
app.use(router);
app.mount("#app");
