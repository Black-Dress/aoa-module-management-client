<template>
  <el-container>
    <el-header>
      <el-row justify="space-between">
        <el-col :span="6" style="text-align: left">
          <h1>AoA stations</h1>
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
    <el-main style="margin-top: 10px">
      <el-row class="row" :gutter="10" v-for="(a,i) in this.row_size" :key="i">
        <el-col class="col" v-for="(b,j) in this.col_size" :key="j" :span="24/this.col_size">
          <el-card v-if="index(i,j) < this.total"
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
        <el-pagination layout="prev, pager, next" background :total="total" :page-size="page_size" :pager-count="7"
                       v-model:current-page="current_page"/>
      </el-row>
    </el-footer>
  </el-container>
  <el-dialog v-model="addStationDialogVisible" title="add new station" width="400px">
    <el-form :model="new_station">
      <el-row>
        <el-col>
          <el-form-item label="id" label-width="20%">
            <el-input v-model="new_station.id"></el-input>
          </el-form-item>
          <el-form-item label="name" label-width="20%">
            <el-input v-model="new_station.name"></el-input>
          </el-form-item>
          <el-form-item label="net" label-width="20%">
            <el-input v-model="new_station.net"></el-input>
          </el-form-item>
          <el-form-item label="status" label-width="20%">
            <el-radio-group v-model="new_station.status">
              <el-radio :label="true">online</el-radio>
              <el-radio :label="false">offline</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row justify="center" :gutter="10">
        <el-col :span="6">
          <el-form-item label="x:" label-width="20%">
            <el-input v-model="new_station.position.x"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="y:" label-width="20%">
            <el-input v-model="new_station.position.y"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="z:" label-width="20%">
            <el-input v-model="new_station.position.z"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row :gutter="3">
      <el-col :span="12">
        <el-button @click="cancel">cancel</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="confirm"> confirm</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
const ipcRenderer = window.require("electron").ipcRenderer;
export default {
  data: function () {
    return {
      current_page: 1,
      stations: {
        1: [
          [
            {
              id: "a",
              position: {
                x: 1,
                y: 1,
                z: 1,
              },
              status: true,
              net: "192.168.1.101",
            },
            {},
          ],
          [],
          [],
        ],
      },
      new_station: {
        id: "",
        name: "",
        net: "",
        status: true,
        position: {x: 0, y: 0, z: 0},
      },
      addStationDialogVisible: false,
      row_size: 3,
      col_size: 3,
    };
  },
  created: function () {
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
      this.$mqttx.station_list.splice(this.index(i, j), 1);
      ipcRenderer.send("write", ["station", JSON.stringify(this.$mqttx.station_list)]);
    },
    /**
     * 确认添加基站
     */
    confirm() {
      this.stations.push(this.new_station)
      this.$mqttx.station_list.push(this.new_station);
      this.new_station = {
        id: "",
        name: "",
        net: "",
        status: true,
        position: {x: 0, y: 0, z: 0},
      };
      this.addStationDialogVisible = false;
      ipcRenderer.send("write", ["stations", JSON.stringify(this.$mqttx.station_list)]);
    },
    cancel() {
      this.new_station = {
        id: "",
        name: "",
        net: "",
        status: true,
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
