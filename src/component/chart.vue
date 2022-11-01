<template>
  <div>
    <div :style="{ height: height, width: width }" :id="id"></div>
  </div>
</template>
<script>
import * as echarts from "echarts";

export default {
  name: "aoa_chart",
  props: {
    height: {
      type: String,
      default: "400px",
    },
    width: {
      type: String,
      default: "400px"
    },
    id: {
      type: String,
      default: "chart"
    },
    xAxis: {
      default: []
    },
    x: {
      default: []
    },
    option: {
      default: {
        xAxis: {data: []},
        yAxis: {type: 'value'},
        series: [{data: [], type: 'line', smooth: true}]
      }
    }
  },
  data() {
    return {
      x_: [],
      xAxis_: [],
      chart: null,
      option_: {
        xAxis: {data: this.xAxis},
        yAxis: {type: 'value'},
        series: [{data: this.x, type: 'line', smooth: true}]
      }
    }
  },
  created() {
    this.x_ = this.x
    this.xAxis_ = this.xAxis
    this.option_ = this.option
  },
  watch: {
    x(a, val) {
      this.x_ = val;
      this.option_.series[0].data = this.x_;
      this.chart.setOption(this.option)
      console.log(this.x_)
    },
    xAxis(a, val) {
      this.xAxis_ = val;
      this.option_.xAxis = this.xAxis_;
      this.chart.setOption(this.option)
      console.log("xaxis", this.xAxis_)
    },
    option: {
      handler(val) {
        this.option_ = val;
        if (this.chart !== null) this.chart.setOption(this.option_)
      },
      deep: true,
      // immediate: true,
    }
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.id));
    this.chart.setOption(this.option)
  },
  methods: {}
}
</script>