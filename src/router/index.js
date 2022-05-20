import { createRouter, createWebHashHistory } from "vue-router";
import dashboard from "@/views/dash-board";
const router = createRouter({
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: dashboard,
    },
  ],
  history: createWebHashHistory(),
});
export default router;
