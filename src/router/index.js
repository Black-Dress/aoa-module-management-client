import { createRouter, createWebHashHistory } from "vue-router";
import dashboard from "@/views/dash-board";
import tag from "@/views/tag-view";
import station from "@/views/station-view";
import data from "@/views/data-view";
import details from "@/views/details-view";
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
      children: [{ path: "details/:id", component: details }],
    },
    {
      path: "/data",
      name: "data",
      component: data,
    },
  ],
  history: createWebHashHistory(),
});
export default router;
