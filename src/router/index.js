import { createRouter, createWebHashHistory } from "vue-router";
import dashboard from "@/views/dash-board";
import tag from "@/views/tag-view";
import station from "@/views/station-view";
import data from "@/views/data-view";
import station_details from "@/views/stationDetails-view";
import tag_details from "@/views/tagDetails-view";
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
    {
      path: "/data",
      name: "data",
      component: data,
    },
    {
      path: "/station-details",
      name: "station-details",
      component: station_details,
    },
    {
      path: "/tag-details",
      name: "tag-details",
      component: tag_details,
    },
  ],
  history: createWebHashHistory(),
});
export default router;
