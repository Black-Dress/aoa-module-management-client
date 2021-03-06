<template>
  <div>
    <el-container>
      <el-header>
        <el-row>
          <h1 style="text-align: left">AoA station management</h1>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <el-row class="main_row">
          <el-col
            :span="4"
            style="text-align: left; margin-top: 9px; max-width: 100px"
          >
            <p>{{ clientId }}</p>
          </el-col>
          <el-col
            :span="2"
            style="text-align: left; margin-top: 4px; max-width: 20px"
          >
            <el-button
              @click="editIdDialogVisible = true"
              text
              style="padding: 0 0 0 0"
            >
              <el-icon> <Edit /> </el-icon>
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="5">
          <el-col :span="3">
            <el-select v-model="curUrl" placeholder="URL">
              <el-option
                v-for="item in mqttUrls"
                :key="item.name"
                :label="item.name"
                :value="item"
              />
            </el-select>
          </el-col>
          <el-col :span="14">
            <el-input
              v-model="curUrl.value"
              disabled
              placeholder="ws://localhost:9001"
            />
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
            <el-button id="start" type="primary" @click="connect(curUrl.value)">
              connect
            </el-button>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row class="main_row">
          <prism-editor
            :key="code"
            class="my-editor"
            :readonly="true"
            :model-value="code"
            :highlight="highlighter"
            line-numbers
          />
        </el-row>
      </el-main>
    </el-container>
  </div>
  <el-dialog
    v-model="addUrlDialogVisible"
    title="add new connection"
    width="300px"
  >
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
  <el-dialog
    v-model="editIdDialogVisible"
    title="update client id"
    width="300px"
  >
    <el-row>
      <el-col>
        <el-form>
          <el-form-item label="ID" label-width="20%">
            <el-input v-model="clientId"></el-input>
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
</template>
<script>
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { ElMessage } from "element-plus";
import { mqttx } from "@/utils/mqttx";
const ipcRenderer = window.require("electron").ipcRenderer;
import "prismjs/components/prism-clike";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";
import "vue-prism-editor/dist/prismeditor.min.css";

export default {
  components: {
    PrismEditor,
  },
  created: function () {
    this.init();
  },
  mounted: function () {},
  data: function () {
    return {
      mqttUrls: [],
      clientId: "",
      curUrl: { name: "default", value: "ws://localhost:9001" },
      addUrlDialogVisible: false,
      editIdDialogVisible: false,
      newUrl: { name: "", value: "" },
      code: "",
    };
  },
  computed: {},
  methods: {
    connect(url) {
      if (url == undefined || url == "") {
        ElMessage({ message: "choose a mqtt server adderss", type: "warning" });
        return;
      }
      // 连接
      this.$mqttx.connect(url, this.s, this.f);
    },
    s(msg) {
      ElMessage({ type: "success", message: "connect success" });
      this.$mqttx.set_message_callback((topic, ms) => {
        this.code += ms.toString() + "\n";
      });
      this.code += msg + "\n";
    },
    f(msg) {
      ElMessage({ type: "error", message: "connect failed" });
      this.code += msg + "\n";
    },
    highlighter(code) {
      return highlight(code, languages.plaintext, "bash");
    },
    init() {
      // 读取配置文件
      ipcRenderer.on("mqtt", (event, data) => {
        this.mqttUrls = data.urls;
        this.clientId = data.id;
      });
      ipcRenderer.send("read", ["mqtt"]);
    },
    dialogCancel() {
      this.newUrl = {};
      this.addUrlDialogVisible = false;
      this.editIdDialogVisible = false;
    },
    dialogConfirm() {
      if (this.newUrl.name != "") {
        if (
          this.mqttUrls.findIndex((item) => item.name == this.newUrl.name) != -1
        ) {
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
      this.editIdDialogVisible = false;
      ipcRenderer.send("write", [
        "mqtt",
        JSON.stringify({ id: this.clientId, urls: this.mqttUrls }),
      ]);
    },
    rmUrls() {
      var index = this.mqttUrls.findIndex(
        (item) => item.name == this.curUrl.name
      );
      this.mqttUrls.splice(index, 1);
      console.log(this.mqttUrls);
      this.curUrl =
        this.mqttUrls.length > 0 ? this.mqttUrls[0] : { name: "", value: "" };
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
  margin-left: 0;
  float: left;
}
</style>
