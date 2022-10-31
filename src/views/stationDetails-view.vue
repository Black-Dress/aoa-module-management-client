<template>
  <div>
    <el-container>
      <el-header>
        <el-row :gutter="20">
          <el-col :span="2" style="text-align: left">
            <el-button @click="this.$router.back()" text style="margin-top: 4px">
              <el-icon>
                <ArrowLeft/>
              </el-icon>
            </el-button>
          </el-col>
          <el-col :span="18" style="text-align: left">
            <h1>{{ this.station.id }} {{ this.station.position }}</h1>
          </el-col>
          <el-col :span="2" style="text-align: right">
            <el-button @click="save_message_dialog_visible = true" type="primary" style="margin-right: 10px"> save
            </el-button>
          </el-col>
          <el-col :span="2">
            <el-switch v-model="this.station.status" inline-prompt @change="status_change"
                       :before-change="before_status_change"/>
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <prism-editor class="code" :model-value="code" :highlight="highlighter" line-numbers
                      :readonly="true"></prism-editor>
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
          <el-button @click="save_message_dialog_visible = false"> cancel</el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="dialogConfirm()">confirm</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import {PrismEditor} from "vue-prism-editor";
import {highlight, languages} from "prismjs/components/prism-core";
import {store} from "@/utils/store";
import {ElMessage} from "element-plus";

export default {
  components: {
    PrismEditor,
  },
  data: function () {
    return {
      code: "",
      save_message_dialog_visible: false,
      file_name: `${new Date().toISOString().slice(0, 10)}.json`,
      station: {id: "", status: false, position: {x: 0, y: 0, z: 0}},
      index: 0,
    };
  },
  created: function () {
    this.$mqttx.set_message_callback(this.ms);
    this.index = this.$route.query.index
    this.station = this.$mqttx.station_list[this.index]
    this.code = `station: ${this.station.id} \n`;
  },
  methods: {
    /**
     * 高亮代码函数
     * @param code 代码
     * @returns {string} 高亮后的代码
     */
    highlighter(code) {
      return highlight(code, languages.bash, "bash");
    },
    /**
     * 更新输入框的内容
     * @param topic 主题
     * @param ms 消息
     */
    ms(topic, ms) {
      this.code += ms.toString() + "\n";
    },
    save(name = `${new Date().toISOString().slice(0, 10)}.json`) {
      let data = this.$mqttx.stations.get(this.station.id);
      if (data === undefined || data.length === 0) return;
      this.$mqttx.save(JSON.stringify(data), `${this.station.id}/${name}`);
    },
    dialogConfirm() {
      this.save(this.file_name);
      this.save_message_dialog_visible = false;
    },
    before_status_change() {
      if (!store.main_connect_status) ElMessage({type: "error", message: "please connect mqtt in dashboard"});
      return store.main_connect_status;
    },
    // 状态转换，是否开启AoA线程
    status_change(val) {
      this.$mqttx.station_status_ctl(this.index, val);
    },
  },
};
</script>
<style scoped></style>
