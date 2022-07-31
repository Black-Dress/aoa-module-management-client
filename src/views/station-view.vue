<template>
  <div>
    <el-container style="height: 600px">
      <el-header>
        <el-row justify="space-between">
          <el-col :span="6" style="text-align: left">
            <h1>AoA station</h1>
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
      <el-main style="margin-top: 10px; height: 410px">
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
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
      <el-footer>
        <el-row justify="center" style="margin-top: 10px">
          <el-pagination layout="prev, pager, next" background :total="total" :page-size="12" :pager-count="7" v-model:current-page="current_page" />
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
          <el-button @click="cancle">取消</el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="confirm"> 确认 </el-button>
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
      total: 10,
      stations: {
        1: [
          [
            {
              id: "a",
              positon: {
                x: 1,
                y: 1,
                z: 1,
              },
              net: "192.168.1.101",
            },
            {},
          ],
          [],
          [],
        ],
      },
      station_list: [],
      newStation: {
        id: "",
        name: "",
        net: "",
        position: { x: 0, y: 0, z: 0 },
      },
      addStationDialogVisible: false,
    };
  },
  created: function () {
    ipcRenderer.once("stations", (event, data) => {
      this.total = data.length;
      this.station_list = data;
      this.stations = this.toStations();
    });
    ipcRenderer.send("read", ["stations"]);
  },
  methods: {
    toStations() {
      let res = {};
      for (let i = 0; i * 12 < this.station_list.length; i += 1) {
        res[i + 1] = [[], [], []];
        let index = 0;
        for (let j = 0; j < 12 && j + i * 12 < this.station_list.length; j += 1) {
          if (j % 4 == 0 && j != 0) index += 1;
          res[i + 1][index].push(this.station_list[j + i * 12]);
        }
      }
      return res;
    },
    toStationDetil(id) {
      this.$router.push({ name: "station-details", query: { id: id } });
    },
    remove(i, j) {
      this.stations[this.current_page][i].splice(j, 1);
      this.station_list.splice((this.current_page - 1) * 12 + i * 4 + j, 1);
      ipcRenderer.send("write", ["station", JSON.stringify(this.station_list)]);
      this.total -= 1;
    },
    confirm() {
      let l = this.station_list.length;
      if (l % 12 == 0) {
        this.stations[Number.parseInt(l / 12) + 1] = [[this.newStation], [], []];
        this.current_page += 1;
      } else {
        this.stations[Number.parseInt(l / 12) + 1][(l % 12) % 3].push(this.newStation);
      }
      this.station_list.push(this.newStation);
      this.total = this.station_list.length;
      this.newStation = {
        id: "",
        name: "",
        net: "",
        position: { x: 0, y: 0, z: 0 },
      };
      this.addStationDialogVisible = false;
      ipcRenderer.send("write", ["station", JSON.stringify(this.station_list)]);
    },
    cancle() {
      this.newStation = {
        id: "",
        name: "",
        net: "",
        position: { x: 0, y: 0, z: 0 },
      };
      this.addStationDialogVisible = false;
    },
  },
};
</script>
<style scoped></style>
