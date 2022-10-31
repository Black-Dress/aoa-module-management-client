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

export function upload_client(client, s = function () {}, e = function () {}) {
  service
    .post("/client", client)
    .then((res) => {
      if (res.code != 200) {
        ElMessage({ type: "error", message: `upload failed: ${res.msg}` });
      } else s(res);
    })
    .catch(e);
}
// 上传
export function upload_aoa_raw_data(msgs, s, e) {
  service
    .post("/client/upload/aoa", msgs)
    .then((res) => {
      if (res.code != 200) {
        ElMessage({ type: "error", message: `upload aoa data failed: ${res.msg}` });
        return;
      }
      s(res);
    })
    .catch(e);
}
