import { reactive } from "vue";

export const store = reactive({
  main_connect_status: false,
  set_main_connect_status(status) {
    this.main_connect_status = status;
  },
});
