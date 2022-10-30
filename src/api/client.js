import { ElMessage } from "element-plus";
import service from "./api";
export function validateId(
  name,
  s = function (res) {
    console.log(res);
  },
  e = function (err) {
    ElMessage({ type: "error", message: "请求出错" });
    console.error(err);
  }
) {
  service
    .get("/client/id", { params: { name: name } })
    .then(s)
    .catch(e);
}
