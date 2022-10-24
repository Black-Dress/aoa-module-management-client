<template>
  <div>
    <el-container>
      <el-header>
        <el-row :gutter="2">
          <el-col :span="2" style="text-align: left; max-width: 44px">
            <el-button @click="this.$router.back()" text style="margin-top: 4px">
              <el-icon>
                <ArrowLeft />
              </el-icon>
            </el-button>
          </el-col>
          <el-col :span="16" style="text-align: left">
            <h1>station: {{ this.station.id }} {{ this.station.position }}</h1>
          </el-col>
          <el-col :span="3" style="text-align: right">
            <el-button @click="save_message_dialog_visible = true" type="primary"> save </el-button>
          </el-col>
          <el-col :span="3" style="text-align: right">
            <el-switch v-model="this.station.status" inline-prompt active-text="Y" inactive-text="N" @change="status_change" />
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <prism-editor class="code" :model-value="code" :highlight="highlighter" line-numbers :readonly="true"> </prism-editor>
      </el-main>
    </el-container>
    <el-dialog v-model="save_message_dialog_visible" title="save message" width="300px">
      <el-row>
        <el-col>
          <el-form>
            <el-form-item label="name" label-width="20%">
              <el-input v-model="file_name" :placeholder="`${new Date().toISOString().slice(0, 10)}.json`"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="3">
        <el-col :span="12">
          <el-button @click="save_message_dialog_visible = false"> cancel </el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="dialogConfirm()">confirm</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
const ipcRenderer = window.require("electron").ipcRenderer;
export default {
  components: {
    PrismEditor,
  },
  data: function () {
    return {
      code: "",
      save_message_dialog_visible: false,
      file_name: `${new Date().toISOString().slice(0, 10)}.json`,
      station: { id: "", status: false, position: { x: 0, y: 0, z: 0 } },
      index: 0,
    };
  },
  created: function () {
    this.station = JSON.parse(this.$route.query.station);
    this.index = parseInt(this.$route.query.index);
    this.$mqttx.set_message_callback(this.ms);
    this.code = `station: ${this.station.id} \n`;
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.bash, "bash");
    },
    ms(topic, ms) {
      this.code += ms.toString() + "\n";
    },
    save(name = `${new Date().toISOString().slice(0, 10)}.json`) {
      let data = this.$mqttx.stations[this.$route.query.id];
      data = data ? data : {};
      this.$mqttx.save(JSON.stringify(data), `${this.$route.query.id}/${name}`);
    },
    dialogConfirm() {
      this.save(this.file_name);
      this.save_message_dialog_visible = false;
    },
    // 状态转换，是否开启AoA线程
    status_change(val) {
      ipcRenderer.send("locator_ctl", [this.station.net, val]);
      this.$mqttx.station_list[this.index].status = val;
      console.log(this.$mqttx.station_list);
    },
  },
};
</script>
<style scoped></style>
