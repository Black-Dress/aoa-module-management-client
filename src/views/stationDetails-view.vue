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
            <el-switch v-model="status" style="margin-left: 24px" inline-prompt active-text="on" inactive-text="off" @change="statusChange" />
          </el-col>
          <el-col :span="18" style="text-align: left">
            <h1>station: {{ this.$route.query.id }}</h1>
          </el-col>
          <el-col :span="4" style="text-align: right">
            <el-button @click="save_message_dialog_visible = true" type="primary"> save </el-button>
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <prism-editor class="code" :model-value="code" :highlight="highlighter" line-numbers :readonly="true"></prism-editor>
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
      status: false,
      station_index: 0,
    };
  },
  created: function () {
    this.$mqttx.set_message_callback(this.ms);
    this.code = `station: ${this.$route.query.id} \n`;
    this.station_index = this.$route.query.index;
    this.status = this.$mqttx.station_list[this.station_index].status;
  },
  methods: {
    statusChange() {
      this.$mqttx.station_list[this.station_index].status = this.status;
      console.log(this.station_index);
      if (this.status) this.$mqttx.subscribeStation(this.$route.query.id);
      else this.$mqttx.unSubscribeStation(this.$route.query.id);
      ipcRenderer.send("write", ["stations", JSON.stringify(this.$mqttx.station_list)]);
    },
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
  },
};
</script>
<style scoped></style>
