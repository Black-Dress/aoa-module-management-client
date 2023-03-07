<template>

  <el-container>
    <el-header>
      <el-row :gutter="2">
        <el-col :span="2" style="text-align: left;">
          <el-button @click="this.$router.back()" text style="margin-top: 4px">
            <el-icon>
              <ArrowLeft/>
            </el-icon>
          </el-button>
        </el-col>
        <el-col :span="16" style="text-align: left">
          <h1>TAG: {{ this.tag.id }}</h1>
        </el-col>
        <el-col :span="6" style="text-align: right">
          <el-button @click="save_message_dialog_visible = true" type="primary"> 保存</el-button>
          <el-switch v-model="tag.status" style="margin-left: 24px" inline-prompt :before-change="before_status_change"
                     @change="status_change"/>
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
            <aoa_chart :option="option"></aoa_chart>
          </div>
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
import aoa_chart from "@/component/chart";

export default {
  components: {
    PrismEditor,
    aoa_chart
  },
  data: function () {
    return {
      tag: {
        name: "aa",
        id: "aa-id",
        status: false,
      },
      code: "",
      save_message_dialog_visible: false,
      file_name: `${new Date().toISOString().slice(0, 10)}.json`,
      active_station_name: "",
      /**
       * 当前启动的 station
       */
      active_stations: [],
      /**
       * 当前显示的标签页名称
       */
      active_label: "azimuth",
      /**
       * 图表对象配置
       */
      option: {
        xAxis: {data: []},
        yAxis: {type: 'value'},
        series: []
      },
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
      /**
       * station id 和 series 的对应关系
       */
      station_line_index: {}
    };
  },
  created: function () {
    this.tag = this.$mqttx.tag_list[this.$route.query.index];
    this.code = `Tag: ${this.tag.id} \n`;
    this.$mqttx.set_message_callback(this.ms)
    this.active_stations = this.$mqttx.station_list.filter(station => station.status)
    this.active_stations.forEach((val, index) => {
      this.station_line_index[val.id] = index
      this.option.series.push({data: [], type: 'line', smooth: true, areaStyle: {}})
    })
  },
  methods: {
    /**
     * 处理tab 标签点击时间
     * @param tab 标签页
     */
    tab_click(tab) {
      this.active_label = tab.props.label;
      this.option.series.forEach(s => s.data = [])
    },
    highlighter(code) {
      return highlight(code, languages.bash, "bash");
    },
    /**
     * 处理每一个 消息
     * @param topic 消息 主题
     * @param ms 消息内容
     */
    ms(topic, ms) {
      if (!topic.includes(this.tag.id)) return
      this.code += ms.toString() + "\n";
      const s = topic.split("/");
      const stationsId = s[s.length - 2];
      const entity = JSON.parse(ms.split(" ").pop())
      this.option.series[this.station_line_index[stationsId]].data.push(entity[this.active_label])
    },
    save(name = `${new Date().toISOString().slice(0, 10)}.json`) {
      let data = this.$mqttx.tags[this.$route.query.id];
      data = data ? data : {};
      this.$mqttx.save(JSON.stringify(data), `${this.tag.id}/${name}`);
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
      if (!store.main_connect_status) ElMessage({type: "error", message: "please connect mqtt in dashboard"});
      return store.main_connect_status;
    },
    /**
     * 启动或者关闭tag标签
     * @param val {boolean} 是否启动
     */
    status_change(val) {
      if (!val) {
        this.tag.status = val
        return
      }
      // 重置其他所有的tag
      this.$mqttx.tag_list.forEach(tag => {
        if (tag.status) tag.status = false
      })
      this.tag.status = true
      this.$mqttx.active_tag = this.tag.id
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
