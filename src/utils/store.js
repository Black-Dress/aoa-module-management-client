import { reactive } from "vue";

export const store = reactive({
  main_connect_status: false,
  cur_url: { name: "default", value: "ws://localhost:9001" },
  set_main_connect_status(status) {
    this.main_connect_status = status;
  },
  set_cur_url(url) {
    this.cur_url = url;
  },
});
