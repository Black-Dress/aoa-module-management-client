<template>
  <el-container>
    <el-header>
      <el-row :gutter="20">
        <el-col :span="2" style="text-align: left">
          <el-button @click="this.$router.back()" text style="margin-top: 4px">
            <el-icon>
              <ArrowLeft />
            </el-icon>
          </el-button>
        </el-col>
        <el-col :span="18" style="text-align: left">
          <h1>{{ this.station.name }}</h1>
        </el-col>
        <el-col :span="2" style="text-align: right">
          <el-button @click="save_message_dialog_visible = true" type="primary" style="margin-right: 10px"> 保存
          </el-button>
        </el-col>
        <el-col :span="2">
          <el-switch v-model="this.station.status" inline-prompt @change="status_change"
            :before-change="before_status_change" />
        </el-col>
      </el-row>
      <el-divider></el-divider>
    </el-header>
    <el-main>
      <el-container>
        <el-aside width="360px">
          <prism-editor class="code" :model-value="code" :highlight="highlighter" line-numbers :readonly="true">
          </prism-editor>
        </el-aside>
        <el-main style="height: 500px">
          <el-tabs @tab-click="tab_click">
            <el-tab-pane :label="chart_ids.azimuth">
            </el-tab-pane>
            <el-tab-pane :label="chart_ids.elevation">
            </el-tab-pane>
            <el-tab-pane :label="chart_ids.rssi">
            </el-tab-pane>
            <el-tab-pane :label="chart_ids.distance">
            </el-tab-pane>
          </el-tabs>
          <div style="width: 400px;height: 400px" id="chart">
            <aoa_chart :x="x" :xAxis="xAxis" :option="option"></aoa_chart>
          </div>
        </el-main>
      </el-container>
    </el-main>
  </el-container>
  <el-dialog v-model="save_message_dialog_visible" title="保存数据" width="300px">
    <el-row>
      <el-col :span="4">
        <p>名称</p>
      </el-col>
      <el-col :span="20">
        <el-input v-model="file_name" :placeholder="`${new Date().toISOString().slice(0, 10)}.json`"></el-input>
      </el-col>
    </el-row>
    <el-row :gutter="3">
      <el-col :span="12">
        <el-button @click="save_message_dialog_visible = false">取消</el-button>
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
import { store } from "@/utils/store";
import { ElMessage } from "element-plus";
import aoa_chart from "@/component/chart";

export default {
  components: {
    aoa_chart,
    PrismEditor,
  },
  data: function () {
    return {
      code: "",
      save_message_dialog_visible: false,
      file_name: `${new Date().toISOString().slice(0, 10)}.json`,
      station: { id: "", status: false, position: { x: 0, y: 0, z: 0 }, name: "" },
      index: 0,
      /**
       * 当前显示的标签页名称
       */
      active_label: "azimuth",
      /**
       * 图表对象配置
       */
      option: {
        xAxis: { data: [] },
        yAxis: { type: 'value' },
        series: [{ data: [], type: 'line', smooth: true, areaStyle: {} }]
      },
      xAxis: [],
      x: [],
      /**
       * 图表元素id
       */
      chart_ids: {
        azimuth: "azimuth",
        elevation: "elevation",
        rssi: "rssi",
        distance: "distance",
        sequence: "sequence",
        names: ["azimuth", "elevation", "rssi", "distance", "sequence"],
      },
      entities: new Map(),
      entities_size: 1000,
    };
  },
  created: function () {
    this.index = this.$route.query.index
    this.station = this.$mqttx.station_list[this.index]
    this.code = `station: ${this.station.id} \n`;
    this.$mqttx.set_message_callback(this.ms)
    this.chart_ids.names.forEach(name => {
      this.entities.set(name, [])
    })
  },
  methods: {
    /**
     * 处理tab 标签点击时间
     * @param tab 标签页
     */
    tab_click(tab) {
      this.active_label = tab.props.label;
      this.option.series[0].data = []
      this.option.xAxis.data = []
    },
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
      if (!topic.includes(this.station.id)) return
      this.code += ms.toString() + "\n";
      const entity = JSON.parse(ms.split(" ").pop())
      this.option.series[0].data.push(entity[this.active_label])
      this.option.xAxis.data.push(entity[this.chart_ids.sequence])
    },
    /**
     * 保存数据
     * @param {String} name 文件保存的名称，默认使用时间作为名称
     */
    save(name = `${new Date().toISOString().slice(0, 10)}.json`) {
      let data = this.$mqttx.stations.get(this.station.id);
      // if (data === undefined || data.length === 0) return;
      this.$mqttx.save(JSON.stringify(data), `${this.station.id}/${name}`);
    },
    dialogConfirm() {
      this.save(this.file_name);
      this.save_message_dialog_visible = false;
    },
    /**
     * 状态更新前的判断
     * @returns {UnwrapRef<boolean>}
     */
    before_status_change() {
      if (!store.main_connect_status) ElMessage({ type: "error", message: "please connect mqtt in dashboard" });
      return store.main_connect_status;
    },
    /**
     * aoa_locator 程序控制
     * @param val 状态
     */
    status_change(val) {
      this.$mqttx.station_status_ctl(this.index, val);
    },
  },
};
</script>
<style scoped>
.code {
  width: 95%;
  height: 95%;
}
</style>
