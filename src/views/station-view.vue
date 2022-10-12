<template>
  <div>
    <el-container>
      <el-header>
        <el-row justify="space-between">
          <el-col :span="6" style="text-align: left">
            <h1>AoA stations</h1>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addStationDialogVisible = true">
              <el-icon>
                <plus />
              </el-icon>
            </el-button>
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main style="margin-top: 10px">
        <el-row :gutter="10" v-for="(row, i) in this.stations[this.current_page]" :key="i">
          <el-col v-for="(col, j) in row" :key="j" :span="6">
            <el-card :body-style="{ padding: '0px' }" class="card" shadow="hover">
              <div style="padding: 10px">
                <el-row justify="space-between">
                  <el-col :span="10" style="text-align: left">
                    <el-button text @click="toStationDetil(col.id)" style="padding: 0 0 0 0">
                      <h1>{{ col.name }}</h1>
                    </el-button>
                  </el-col>
                  <el-col :span="3">
                    <el-button text @click="remove(i, j)">
                      <el-icon>
                        <Close />
                      </el-icon>
                    </el-button>
                  </el-col>
                </el-row>
                <el-row>
                  <code>IP addres: {{ col.net }}</code>
                </el-row>
                <el-row>
                  <code>station id: {{ col.id }}</code>
                </el-row>
                <el-row>
                  <code>status: {{ col.status ? "online" : "offline" }}</code>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
      <el-footer>
        <el-row justify="center" style="margin-top: 10px">
          <el-pagination layout="prev, pager, next" background :total="total" :page-size="12" :pager-count="7"
            v-model:current-page="current_page" />
        </el-row>
      </el-footer>
    </el-container>
    <el-dialog v-model="addStationDialogVisible" title="add new station" width="400px">
      <el-form :model="newStation">
        <el-row>
          <el-col>
            <el-form-item label="id" label-width="20%">
              <el-input v-model="newStation.id"></el-input>
            </el-form-item>
            <el-form-item label="name" label-width="20%">
              <el-input v-model="newStation.name"></el-input>
            </el-form-item>
            <el-form-item label="net" label-width="20%">
              <el-input v-model="newStation.net"></el-input>
            </el-form-item>
            <el-form-item label="status" label-width="20%">
              <el-radio-group v-model="newStation.status">
                <el-radio :label="true">online</el-radio>
                <el-radio :label="false">offline</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row justify="center" :gutter="10">
          <el-col :span="6">
            <el-form-item label="x:" label-width="20%">
              <el-input v-model="newStation.position.x"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="y:" label-width="20%">
              <el-input v-model="newStation.position.y"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="z:" label-width="20%">
              <el-input v-model="newStation.position.z"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-row :gutter="3">
        <el-col :span="12">
          <el-button @click="cancle">cancel</el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="confirm"> confirm </el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
const ipcRenderer = window.require("electron").ipcRenderer;
export default {
  data: function () {
    return {
      current_page: 1,
      total: this.$mqttx.station_list.length,
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
      newStation: {
        id: "",
        name: "",
        net: "",
        status: true,
        position: { x: 0, y: 0, z: 0 },
      },
      addStationDialogVisible: false,
      row_size: 3,
      col_size: 4,
    };
  },
  created: function () {
    this.stations = this.toStations(this.$mqttx.station_list);
  },
  computed: {
    page_size() {
      return this.row_size * this.col_size;
    },
  },
  methods: {
    toStations(data) {
      let res = {};
      for (let i = 0; i * this.page_size < data.length; i += 1) {
        res[i + 1] = [[], [], []];
        let index = 0;
        for (let j = 0; j < this.page_size && j + i * this.page_size < data.length; j += 1) {
          if (j % 4 == 0 && j != 0) index += 1;
          res[i + 1][index].push(data[j + i * this.page_size]);
        }
      }
      return res;
    },
    toStationDetil(id) {
      this.$router.push({ name: "station-details", query: { id: id } });
    },
    remove(i, j) {
      this.stations[this.current_page][i].splice(j, 1);
      this.$mqttx.station_list.splice((this.current_page - 1) * this.page_size + i * this.col_size + j, 1);
      ipcRenderer.send("write", ["station", JSON.stringify(this.$mqttx.station_list)]);
      this.total -= 1;
    },
    confirm() {
      let l = this.$mqttx.station_list.length;
      if (l % 12 == 0) {
        this.stations[Number.parseInt(l / this.page_size) + 1] = [[this.newStation], [], []];
        this.current_page += 1;
      } else {
        this.stations[Number.parseInt(l / this.page_size) + 1][(l % this.page_size) % this.row_size].push(this.newStation);
      }
      this.$mqttx.station_list.push(this.newStation);
      this.total += 1;
      this.newStation = {
        id: "",
        name: "",
        net: "",
        status: true,
        position: { x: 0, y: 0, z: 0 },
      };
      this.addStationDialogVisible = false;
      ipcRenderer.send("write", ["station", JSON.stringify(this.$mqttx.station_list)]);
    },
    cancle() {
      this.newStation = {
        id: "",
        name: "",
        net: "",
        status: true,
        position: { x: 0, y: 0, z: 0 },
      };
      this.addStationDialogVisible = false;
    },
  },
};
</script>
<style scoped>

</style>
