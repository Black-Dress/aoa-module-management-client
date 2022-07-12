<template>
  <div>
    <div>
      <el-row :gutter="2" style="margin-bottom: 10px">
        <el-col :span="4">
          <span style="float: left">{{ clientId }}</span>
        </el-col>
        <el-col :span="4">
          <el-button @click="editIdDialogVisible = true"
            ><el-icon><Edit /></el-icon>
          </el-button>
        </el-col>
        <el-dialog
          v-model="editIdDialogVisible"
          title="修改客户端ID"
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
              <el-button @click="dialogCancel">取消</el-button>
            </el-col>
            <el-col :span="12">
              <el-button type="primary" @click="dialogConfirm()"
                >确认</el-button
              >
            </el-col>
          </el-row>
        </el-dialog>
      </el-row>
      <el-row :gutter="2">
        <el-col :span="4">
          <el-select v-model="curUrl" placeholder="URL">
            <el-option
              v-for="item in mqttUrls"
              :key="item.name"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="15">
          <el-input v-model="curUrl" :placeholder="curUrl" />
        </el-col>
        <el-col :span="2">
          <el-button @click="addUrlDialogVisible = true">
            <el-icon>
              <plus></plus>
            </el-icon>
          </el-button>
          <el-dialog
            v-model="addUrlDialogVisible"
            title="添加新链接"
            width="300px"
          >
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
                <el-button type="primary" @click="dialogConfirm()"
                  >确认</el-button
                >
              </el-col>
            </el-row>
          </el-dialog>
        </el-col>
        <el-col :span="3">
          <el-button
            id="start"
            type="primary"
            @click="connect(curUrl)"
            style="width: 90px"
            >连接</el-button
          >
        </el-col>
      </el-row>
    </div>
    <el-divider></el-divider>
    <div>
      <el-row>
        <prism-editor
          class="my-editor"
          :readonly="true"
          v-model="code"
          :highlight="highlighter"
          line-numbers
        />
      </el-row>
    </div>
  </div>
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
      clientId: "local-client",
      curUrl: "",
      code: "",
      addUrlDialogVisible: false,
      editIdDialogVisible: false,
      newUrl: {
        name: "",
        value: "",
      },
    };
  },
  methods: {
    connect(url) {
      if (url == undefined || url == "") {
        ElMessage({ message: "请选择mqtt服务器地址。", type: "warning" });
        return;
      }
      // 连接
      mqttx.connect(this.curUrl, () => {
        this.code = "connected success";
        ElMessage({ type: "success", message: "connect success" });
      });
      // 参数设置
      mqttx.client.on("message", (payload) => {
        console.info(`message:${payload}`);
      });
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
      ipcRenderer.send("read", "mqtt");
    },
    editClientId() {
      this.clientId;
    },
    dialogCancel() {
      this.newUrl = {};
      this.addUrlDialogVisible = false;
      this.editIdDialogVisible = false;
    },
    dialogConfirm() {
      this.mqttUrls.push(this.newUrl);
      this.newUrl = {};
      this.addUrlDialogVisible = false;
      this.editIdDialogVisible = false;
      let res = { id: this.clientId, urls: this.mqttUrls };
      ipcRenderer.send("writeMqtt", JSON.stringify(res));
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
</style>
