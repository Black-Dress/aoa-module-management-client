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
              连接
            </el-button>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-row class="main_row">
          <prism-editor
            class="my-editor"
            :readonly="true"
            v-model="code"
            :highlight="highlighter"
            line-numbers
          />
        </el-row>
      </el-main>
    </el-container>
  </div>
  <el-dialog v-model="addUrlDialogVisible" title="添加新链接" width="300px">
    <el-row>
      <el-col>
        <el-form :v-model="newUrl">
          <el-form-item label="名称" label-width="20%">
            <el-input v-model="newUrl.name"></el-input>
          </el-form-item>
          <el-form-item label="地址" label-width="20%">
            <el-input v-model="newUrl.value"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row :gutter="3">
      <el-col :span="12">
        <el-button @click="dialogCancel">取消</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="dialogConfirm()">确认</el-button>
      </el-col>
    </el-row>
  </el-dialog>
  <el-dialog v-model="editIdDialogVisible" title="修改客户端ID" width="300px">
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
        <el-button @click="dialogCancel">取消</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="dialogConfirm()">确认</el-button>
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
      code: "",
      curUrl: { name: "", value: "" },
      addUrlDialogVisible: false,
      editIdDialogVisible: false,
      newUrl: { name: "", value: "" },
    };
  },
  computed: {},
  methods: {
    connect(url) {
      if (url == undefined || url == "") {
        ElMessage({ message: "请选择mqtt服务器地址。", type: "warning" });
        return;
      }
      // 连接
      if (mqttx.connect(this.curUrl.value)) {
        ElMessage({ type: "success", message: "connect success" });
        mqttx.setMessage(this.message);
      } else ElMessage({ type: "error", message: "connect failed" });
    },
    message(topic, message) {
      this.code += message.toString() + "\n";
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
          ElMessage({ type: "warning", message: "不能使用相同名称" });
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
