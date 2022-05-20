import { createRouter, createWebHashHistory } from "vue-router";
import dashboard from "@/views/dash-board";
import tag from "@/views/tag-view";
import station from "@/views/station-view";
const router = createRouter({
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: dashboard,
    },
    {
      path: "/tag",
      name: "tag",
      component: tag,
    },
    {
      path: "/station",
      name: "station",
      component: station,
    },
  ],
  history: createWebHashHistory(),
});
export default router;
