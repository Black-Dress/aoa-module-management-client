<template>
  <el-header>
    <el-row>
      <h1 style="text-align: left">AoA station management</h1>
    </el-row>
    <el-divider></el-divider>
  </el-header>
  <el-main>
    <el-row class="main_row">
      <el-col :span="2"><p style="font-weight: 600">CLIENT_ID</p></el-col>
      <el-col :span="2" style="text-align: left; max-width: 200px">
        <p>{{ this.client.clientId }}</p>
      </el-col>
      <el-col :span="2" style="text-align: left">
        <el-button @click="editIdDialogVisible = true" text>
          <el-icon> <Edit /> </el-icon>
        </el-button>
      </el-col>
    </el-row>
    <el-row :gutter="5">
      <el-col :span="3">
        <el-select v-model="cur_url" placeholder="URL">
          <el-option v-for="item in this.client.urls" :key="item.name" :label="item.name" :value="item" />
        </el-select>
      </el-col>
      <el-col :span="14">
        <el-input v-model="cur_url.value" disabled />
      </el-col>
      <el-col :span="4" style="max-width: 120px">
        <el-button @click="addUrlDialogVisible = true">
          <el-icon>
            <plus></plus>
          </el-icon>
        </el-button>
        <el-button @click="rmUrls">
          <el-icon>
            <Minus />
          </el-icon>
        </el-button>
      </el-col>
      <el-col :span="2" style="max-width: 32px">
        <el-button v-if="!this.status" id="start" type="primary" @click="connect(cur_url.value)"> connect </el-button>
        <el-button v-if="this.status" id="end" type="danger" @click="disconnect()">disconnect</el-button>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <el-row class="main_row">
      <prism-editor :key="code" class="my-editor" :readonly="true" :model-value="code" :highlight="highlighter" line-numbers />
    </el-row>
  </el-main>

  <el-dialog v-model="addUrlDialogVisible" title="add new connection" width="300px">
    <el-row>
      <el-col>
        <el-form :v-model="newUrl">
          <el-form-item label="name" label-width="20%">
            <el-input v-model="newUrl.name"></el-input>
          </el-form-item>
          <el-form-item label="url" label-width="20%">
            <el-input v-model="newUrl.value"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row :gutter="3">
      <el-col :span="12">
        <el-button @click="dialogCancel">cancel</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="dialogConfirm()">confirm</el-button>
      </el-col>
    </el-row>
  </el-dialog>
  <el-dialog v-model="editIdDialogVisible" title="update client" width="450px">
    <el-row>
      <el-col class="dialog-col" :span="3"> <p>clientId</p> </el-col>
      <el-col :span="15">
        <el-input v-model="this.client.clientId"></el-input>
      </el-col>
      <el-col :span="6">
        <el-button @click="check_client_id(this.client.clientId)">
          <el-icon><RefreshLeft /></el-icon>
        </el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-form-item label="name" label-width="20%">
          <el-input v-model="this.client.name"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-form-item label="position" label-width="20%">
          <el-input v-model="this.client.position"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-button @click="dialogCancel">cancel</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="upload_client">confirm</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { ElMessage } from "element-plus";
import { mqttx } from "@/utils/mqttx";
import { store } from "@/utils/store";
const ipcRenderer = window.require("electron").ipcRenderer;
import "prismjs/components/prism-clike";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";
import "vue-prism-editor/dist/prismeditor.min.css";
import { validateId } from "@/api/client";

export default {
  components: {
    PrismEditor,
  },
  created: function () {
    // 读取配置文件
    ipcRenderer.once("mqtt", (event, data) => {
      this.client = data;
    });
    ipcRenderer.send("read", ["mqtt"]);
    if (this.status) this.connect(this.cur_url.value);
  },
  mounted: function () {},
  data: function () {
    return {
      addUrlDialogVisible: false,
      editIdDialogVisible: false,
      newUrl: { name: "", value: "" },
      code: "",
      client: {
        clientId: "id",
        name: "",
        project: "",
        urls: [{ name: "", value: "" }],
        position: "",
        contact: "",
        remark: "",
      },
    };
  },
  computed: {
    status: {
      get: function () {
        return store.main_connect_status;
      },
      set: function (val) {
        store.set_main_connect_status(val);
      },
    },
    cur_url: {
      get: function () {
        return store.cur_url;
      },
      set: function (val) {
        store.set_cur_url(val);
      },
    },
  },
  methods: {
    upload_client() {
      this.editIdDialogVisible = false;
    },
    check_client_id(name) {
      validateId(name, (res) => {
        if (res.code != 200) {
          ElMessage({ type: "error", message: res.msg });
          return;
        }
        this.clientId = res.data;
      });
    },
    disconnect() {
      this.$mqttx.disconnect(this.df);
    },
    connect(url) {
      if (url == undefined || url == "") {
        ElMessage({ message: "choose a mqtt server adderss", type: "warning" });
        return;
      }
      // 连接
      this.$mqttx.connect(url, this.s, this.f);
    },
    df() {
      ElMessage({ type: "success", message: "disconnect success" });
      this.status = false;
      this.code = "";
    },
    s(msg) {
      ElMessage({ type: "success", message: "connect success" });
      this.$mqttx.set_message_callback((topic, ms) => {
        this.code += ms.toString() + "\n";
      });
      this.code += msg + "\n";
      // 自动订阅主题
      this.$mqttx.defaultSubscribe(() => {});
      store.set_main_connect_status(true);
    },
    f(msg) {
      ElMessage({ type: "error", message: "connect failed" });
      this.code += msg + "\n";
      store.set_main_connect_status(false);
    },
    highlighter(code) {
      return highlight(code, languages.plaintext, "bash");
    },
    init() {},
    dialogCancel() {
      this.newUrl = {};
      this.addUrlDialogVisible = false;
      this.editIdDialogVisible = false;
    },
    dialogConfirm() {
      if (this.newUrl.name != "") {
        if (this.mqttUrls.findIndex((item) => item.name == this.newUrl.name) != -1) {
          ElMessage({
            type: "warning",
            message: "there is already a same name",
          });
        }
        this.mqttUrls.push(this.newUrl);
        this.newUrl = { name: "", value: "" };
      }
      mqttx.setId(this.clientId);
      this.addUrlDialogVisible = false;

      ipcRenderer.send("write", ["mqtt", JSON.stringify({ id: this.clientId, urls: this.mqttUrls })]);
    },
    rmUrls() {
      var index = this.mqttUrls.findIndex((item) => item.name == this.cur_url.name);
      this.mqttUrls.splice(index, 1);
      console.log(this.mqttUrls);
      this.curUrl = this.mqttUrls.length > 0 ? this.mqttUrls[0] : { name: "", value: "" };
      this.dialogConfirm();
    },
  },
};
</script>
<style>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #2d2d2d;
  color: #ccc;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  border-radius: 5px;
  max-height: 500px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
.el-col {
  display: block;
  margin: 0 0 0 0;
  padding: 0 0 0 0;
  float: left;
  height: 36px;
}
p {
  height: 18px;
  padding: 0 0 0 0;
}
.el-col p {
  margin-top: 9px;
  text-align: left;
}
.el-col .el-button {
  height: 32px;
  margin-top: 3px;
}
.el-col .el-input {
  height: 32px;
  margin-top: 3px;
}
.el-row {
  margin-bottom: 10px;
}
</style>
