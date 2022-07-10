import { createApp } from "vue";
import "element-plus/dist/index.css";
import App from "./App.vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import router from "./router";
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
// 引入bashcode
// import bashcode from "./component/bash-code.vue";
// app.use(bashcode);
// app.component("bash-code", bashcode);
// 使用router
app.use(router);
app.mount("#app");
