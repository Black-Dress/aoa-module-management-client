<template>
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
          <h1>{{ this.station.name }}</h1>
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
      <el-container>
        <el-aside width="360px">
          <prism-editor class="code" :model-value="code" :highlight="highlighter" line-numbers
                        :readonly="true"></prism-editor>
        </el-aside>
        <el-main style="height: 500px">
          <el-tabs class="demo-tabs">
            <el-tab-pane label="azimuth">
              <div id="azimuth"></div>
            </el-tab-pane>
            <el-tab-pane label="elevation">
              <div id="elevation"></div>
            </el-tab-pane>
            <el-tab-pane label="rssi">
              <div id="rssi"></div>
            </el-tab-pane>
            <el-tab-pane label="distance">
              <div id="distance"></div>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>

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
</template>
<script>
import {PrismEditor} from "vue-prism-editor";
import {highlight, languages} from "prismjs/components/prism-core";
import {store} from "@/utils/store";
import {ElMessage} from "element-plus";
import * as echarts from 'echarts';

export default {
  components: {
    PrismEditor,
  },
  data: function () {
    return {
      code: "",
      save_message_dialog_visible: false,
      file_name: `${new Date().toISOString().slice(0, 10)}.json`,
      station: {id: "", status: false, position: {x: 0, y: 0, z: 0}, name: ""},
      index: 0,
      active_num: 0,
      /**
       * 图表对象数组，azimuth,elevation,rssi,distance
       */
      charts: new Map(),
      /**
       * 图表元素id
       */
      chart_ids: {
        azimuth: "azimuth",
        elevation: "elevation",
        rssi: "rssi",
        distance: "distance",
        names: ["azimuth", "elevation", "rssi", "distance"],
      },
    };
  },
  created: function () {
    this.index = this.$route.query.index
    this.station = this.$mqttx.station_list[this.index]
    this.code = `station: ${this.station.id} \n`;
    this.$mqttx.connect(store.cur_url.value, () => {
      this.$mqttx.set_message_callback(this.ms)
      this.$mqttx.subscribeStation(this.station.id)
    })
  },
  mounted: function () {
    this.init_chart()
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
     * @param topic{string} 主题
     * @param ms{string} 消息
     */
    ms(topic, ms) {
      this.code += ms.toString() + "\n";
      const entity = JSON.parse(ms.split(" ").pop())
      this.chart_ids.names.forEach(name => {
        let option = this.charts.get(name).getOption();
        option.xAxis.data.push(parseInt(entity.get("sequence")))
        option.option.series[0].data.push(parseInt(entity.get(name)))
        if (option.xAxis.data.length > 10) option.xAxis.data.shift()
        if (option.series[0].data.length > 10) option.series[0].data.shift()
      })
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
    /**
     * 初始化 charts
     */
    init_chart() {
      this.chart_ids.names.forEach(name => {
        const chart = echarts.init(document.getElementById(name))
        chart.setOption({
          xAxis: {
            data: []
          },
          yAxis: {type: 'value'},
          series: [
            {
              data: [],
              type: 'line',
              smooth: true
            }
          ]
        })
        this.charts.set(name, echarts.init(document.getElementById(name)))
      })
    },
  },
};
</script>
<style scoped>
.code {
  width: 95%;
  height: 95%;
}

.el-tabs {
  height: 100%;
  width: 100%;
}

.el-tab-pane {
  width: 100%;
  height: 400px;
}

.el-tab-pane div {
  height: 100%;
  width: 100%;
}
</style>
