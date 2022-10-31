<template>
  <el-header>
    <el-row>
      <h1 style="text-align: left">AoA station management</h1>
    </el-row>
    <el-divider></el-divider>
  </el-header>
  <el-main>
    <el-row class="main_row">
      <el-col :span="4"><p style="font-weight: 600">CLIENT_ID:</p></el-col>
      <el-col :span="3" style="text-align: left; max-width: 200px">
        <p>{{ this.client.clientId }}</p>
      </el-col>
      <el-col :span="2" style="text-align: left">
        <el-button @click="editIdDialogVisible = true" text>
          <el-icon>
            <Edit/>
          </el-icon>
        </el-button>
      </el-col>
    </el-row>
    <el-row :gutter="5">
      <el-col :span="3">
        <el-select v-model="cur_url" placeholder="URL">
          <el-option v-for="item in this.client.urls" :key="item.name" :label="item.name" :value="item"/>
        </el-select>
      </el-col>
      <el-col :span="14">
        <el-input v-model="cur_url.value" disabled/>
      </el-col>
      <el-col :span="2">
        <el-button @click="addUrlDialogVisible = true">
          <el-icon>
            <plus></plus>
          </el-icon>
        </el-button>
      </el-col>
      <el-col :span="2">
        <el-button @click="rmUrls">
          <el-icon>
            <Minus/>
          </el-icon>
        </el-button>
      </el-col>
      <el-col :span="2" style="max-width: 32px">
        <el-button v-if="!this.status" id="start" type="primary" @click="connect(cur_url.value)"> connect</el-button>
        <el-button v-if="this.status" id="end" type="danger" @click="disconnect()">disconnect</el-button>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <el-row class="main_row">
      <!--suppress JSValidateTypes -->
      <prism-editor :key="code" class="my-editor" :readonly="true" :model-value="code"
                    :highlight="highlighter"
                    line-numbers/>
    </el-row>
  </el-main>

  <el-dialog v-model="addUrlDialogVisible" title="add new connection" width="300px" @close="dialogCancel">
    <el-row>
      <el-col :span="4"><p>name</p></el-col>
      <el-col :span="20">
        <el-input v-model="this.new_url.name"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>url</p></el-col>
      <el-col :span="20">
        <el-input v-model="this.new_url.value"></el-input>
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
  <el-dialog v-model="editIdDialogVisible" title="UPDATE CLIENT" width="450px" @close="dialogCancel">
    <el-row>
      <el-col class="dialog-col" :span="4"><p>clientId</p></el-col>
      <el-col :span="17">
        <el-input v-model="this.client.clientId"></el-input>
      </el-col>
      <el-col :span="3">
        <el-button v-if="!name_check_status" @click="check_client_id(this.client.clientId)">
          <el-icon>
            <RefreshLeft/>
          </el-icon>
        </el-button>
        <el-button v-if="name_check_status" type="primary">
          <el-icon>
            <Check/>
          </el-icon>
        </el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>name</p></el-col>
      <el-col :span="20">
        <el-input v-model="this.client.name"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>position</p></el-col>
      <el-col :span="20">
        <el-input v-model="this.client.position"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>project</p></el-col>
      <el-col :span="20">
        <el-input v-model="this.client.project"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>contact</p></el-col>
      <el-col :span="20">
        <el-input v-model="this.client.contact"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>remark</p></el-col>
      <el-col :span="20">
        <el-input v-model="this.client.remark"></el-input>
      </el-col>
    </el-row>
    <el-row style="margin-top: 10px">
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
import {PrismEditor} from "vue-prism-editor";
import {highlight, languages} from "prismjs/components/prism-core";
import {ElMessage} from "element-plus";
import {mqttx} from "@/utils/mqttx";
import {store} from "@/utils/store";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";
import "vue-prism-editor/dist/prismeditor.min.css";
import {upload_client, validateId} from "@/api/client";

const ipcRenderer = window.require("electron").ipcRenderer;

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
  data: function () {
    return {
      addUrlDialogVisible: false,
      editIdDialogVisible: false,
      new_url: {name: "", value: ""},
      code: "",
      client: {
        clientId: "id",
        name: "",
        project: "",
        urls: [{name: "", value: ""}],
        position: "",
        contact: "",
        remark: "",
      },
      name_check_status: false,
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
    // TODO 统一mqtt代码
    upload_client() {
      upload_client(
          this.client,
          () => {
            ElMessage({type: "success", message: "upload success!"});
            this.editIdDialogVisible = false;
            ipcRenderer.send("write", ["mqtt", JSON.stringify(this.client)]);
            mqttx.setId(this.client.clientId);
          },
          (e) => {
            console.error(e);
          }
      );
    },
    check_client_id(name) {
      validateId(name, (res) => {
        if (res.code !== 200) {
          ElMessage({type: "error", message: res.msg});
          return;
        }
        this.clientId = res.data;
        this.name_check_status = true;
      });
    },
    disconnect() {
      this.$mqttx.disconnect(this.df);
    },
    connect(url) {
      if (url === undefined || url === "") {
        ElMessage({message: "choose a mqtt server address", type: "warning"});
        return;
      }
      // 连接
      this.$mqttx.connect(url, this.s, this.f);
    },
    df() {
      ElMessage({type: "success", message: "disconnect success"});
      this.status = false;
      this.code = "";
    },
    s(msg) {
      ElMessage({type: "success", message: "connect success"});
      this.$mqttx.set_message_callback((topic, ms) => {
        this.code += ms.toString() + "\n";
      });
      this.code += msg + "\n";
      // 自动订阅主题
      this.$mqttx.defaultSubscribe(() => {
      });
      store.set_main_connect_status(true);
    },
    f(msg) {
      ElMessage({type: "error", message: "connect failed"});
      this.code += msg + "\n";
      store.set_main_connect_status(false);
    },
    highlighter(code) {
      return highlight(code, languages.plaintext, "bash");
    },
    dialogCancel() {
      this.new_url = {};
      this.addUrlDialogVisible = false;
      this.editIdDialogVisible = false;
      this.name_check_status = false;
    },
    dialogConfirm() {
      if (this.new_url.name !== "" && this.new_url.value !== "") {
        if (this.client.urls.findIndex((item) => item.name === this.new_url.name) !== -1) {
          ElMessage({type: "warning", message: "there is already a same name"});
          return;
        }
        this.client.urls.push(this.new_url);
        ipcRenderer.send("write", ["mqtt", JSON.stringify(this.client)]);
        ElMessage({type: "success", message: "add url success"});
        this.new_url = {name: "", value: ""};
      }
      this.addUrlDialogVisible = false;
    },
    rmUrls() {
      const index = this.client.urls.findIndex((item) => item.name === this.cur_url.name);
      this.client.urls.splice(index, 1);
      this.cur_url = this.client.urls.length > 0 ? this.client.urls[0] : {name: "", value: ""};
      this.dialogConfirm();
    },
  },
};
</script>
<style>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so that's why we need to add background and text color manually */
  background: #2d2d2d;
  color: #ccc;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  border-radius: 5px;
  max-height: 450px;
}


el-col {
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

el-col p {
  margin-top: 9px;
  text-align: left;
  font-weight: 600;
}

el-col el-button {
  height: 32px;
  margin-top: 3px;
}

el-col el-input {
  height: 32px;
  margin-top: 3px;
}

el-row {
  margin-bottom: 10px;
}
</style>
