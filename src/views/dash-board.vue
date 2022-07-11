<template>
  <div>
    <div>
      <el-row :gutter="20" style="margin-bottom: 10px">
        <el-col :span="4">
          <span style="float: left">MQTT服务器</span>
        </el-col>
      </el-row>
      <el-row :gutter="10">
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
                <el-button type="primary" @click="dialogConfirm"
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
            @click="connect()"
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
import "prismjs/components/prism-clike";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";
import "vue-prism-editor/dist/prismeditor.min.css";
// const axios = require("axios").default;
const ipcRenderer = window.require("electron").ipcRenderer;

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
      curUrl: "",
      code: "",
      addUrlDialogVisible: false,
      newUrl: {
        name: "",
        value: "",
      },
    };
  },
  methods: {
    connect() {},
    highlighter(code) {
      return highlight(code, languages.plaintext, "bash");
    },
    init() {
      // 读取配置文件
      ipcRenderer.on("mqtt", (event, data) => {
        this.mqttUrls = data;
      });
      ipcRenderer.send("file", "mqtt");
    },
    dialogCancel() {
      this.newUrl = {};
      this.addUrlDialogVisible = false;
    },
    dialogConfirm() {
      this.mqttUrls.push(this.newUrl);
      this.newUrl = {};
      this.addUrlDialogVisible = false;
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
