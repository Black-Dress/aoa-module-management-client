<template>
  <el-container>
    <el-header>
      <el-row justify="space-between">
        <el-col :span="6" style="text-align: left">
          <h1>蓝牙基站</h1>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addStationDialogVisible = true">
            <el-icon>
              <plus/>
            </el-icon>
          </el-button>
        </el-col>
      </el-row>
      <el-divider></el-divider>
    </el-header>
    <el-main :key="stations.length">
      <el-row class="row" :gutter="10" v-for="(a,i) in this.row_size" :key="i">
        <el-col class="col" v-for="(b,j) in this.col_size" :key="j" :span="24/this.col_size">
          <el-card v-if="index(i,j) < stations.length"
                   :body-style="{ padding: '0px' }"
                   class="card" shadow="hover"
                   :class="this.stations[this.index(i,j)].status?'active':'inactive'"
          >
            <div style="padding: 10px">
              <el-row justify="space-between">
                <el-col :span="14" style="text-align: left">
                  <h1>{{ this.stations[this.index(i, j)].name }}</h1>
                </el-col>
                <el-col :span="10" style="text-align: right">
                  <el-button text @click="remove(i, j)">
                    <el-icon>
                      <Close/>
                    </el-icon>
                  </el-button>
                </el-col>
              </el-row>
              <div @click="to_station_detail(i,j)">
                <el-row>
                  <code>{{ this.stations[this.index(i, j)].net }}</code>
                </el-row>
                <el-row>
                  <code>{{ this.stations[this.index(i, j)].id }}</code>
                </el-row>
                <el-row>
                  <code>{{ this.stations[this.index(i, j)].status ? "online" : "offline" }}</code>
                </el-row>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <el-footer>
      <el-row justify="center" style="margin-top: 10px">
        <el-pagination layout="prev, pager, next" background :total="stations.length" :page-size="page_size"
                       :pager-count="7"
                       v-model:current-page="current_page"/>
      </el-row>
    </el-footer>
  </el-container>
  <el-dialog v-model="addStationDialogVisible" title="添加基站" width="400px">
    <el-row>
      <el-col :span="4"><p>基站ID</p></el-col>
      <el-col :span="20">
        <el-input v-model="new_station.id"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>基站名称</p></el-col>
      <el-col :span="20">
        <el-input v-model="new_station.name"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>网络IP</p></el-col>
      <el-col :span="20">
        <el-input v-model="new_station.net"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><p>X坐标</p></el-col>
      <el-col :span="18">
        <el-input v-model="new_station.position.x"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><p>Y坐标</p></el-col>
      <el-col :span="18">
        <el-input v-model="new_station.position.y"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><p>Z坐标</p></el-col>
      <el-col :span="18">
        <el-input v-model="new_station.position.z"></el-input>
      </el-col>
    </el-row>
    <el-row :gutter="3">
      <el-col :span="12">
        <el-button @click="cancel">取消</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="confirm"> 确认</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import {ElMessage} from "element-plus";

const ipcRenderer = window.require("electron").ipcRenderer;
export default {
  data: function () {
    return {
      current_page: 1,
      stations: [],
      new_station: {
        id: "",
        name: "",
        net: "",
        status: false,
        position: {x: 0, y: 0, z: 0},
      },
      addStationDialogVisible: false,
      row_size: 3,
      col_size: 3,
    };
  },
  created: function () {
    // 将对象拷贝过来了，对stations的修改会反馈到station_list上
    this.stations = this.$mqttx.station_list
  },
  computed: {
    page_size() {
      return this.row_size * this.col_size;
    },

    total() {
      return this.$mqttx.station_list.length;
    }
  },
  methods: {
    /**
     * 获取 i, j 位置在list中的位置
     * @param i row
     * @param j col
     * @returns {int} 0～n的位置
     */
    index(i, j) {
      return (this.current_page - 1) * (this.page_size) + i * this.col_size + j;
    },
    /**
     * 跳转到详情页面
     * @param i row
     * @param j col
     */
    to_station_detail(i, j) {
      this.$router.push({name: "station-details", query: {index: this.index(i, j)}});
    },
    /**
     * 删除指定位置的基站
     * @param i row
     * @param j col
     */
    remove(i, j) {
      this.stations.splice(this.index(i, j), 1);
      ipcRenderer.send("write", ["stations", JSON.stringify(this.$mqttx.station_list)]);
    },
    /**
     * 确认添加基站
     */
    confirm() {
      if (this.new_station.id === "" || this.new_station.net === "") {
        ElMessage({type: "error", message: "id or net could not be empty!"})
        return
      }
      if (this.stations.findIndex(s => s.id === this.new_station.id || s.net === this.new_station.net) !== -1) {
        ElMessage({type: "error", message: "id or net could not be repeated"})
        return;
      }
      this.stations.push(this.new_station)
      this.new_station = {
        id: "",
        name: "",
        net: "",
        status: false,
        position: {x: 0, y: 0, z: 0},
      };
      this.addStationDialogVisible = false;
      ipcRenderer.send("write", ["stations", JSON.stringify(this.stations)]);
    },
    cancel() {
      this.new_station = {
        id: "",
        name: "",
        net: "",
        status: false,
        position: {x: 0, y: 0, z: 0},
      };
      this.addStationDialogVisible = false;
    },
  },
};
</script>
<style scoped>
.row {
  height: auto;
}

.active {
  background: #ccffff;
}

.inactive {
  background: #FFFAFA;
}

.col {
  height: 160px;
  margin: 0 0 0 0;
}
</style>
