<template>
  <div>
    <el-container>
      <el-header>
        <div><h1 style="text-align: left">AoA station</h1></div>
        <el-divider></el-divider>
      </el-header>
      <el-main style="margin-top: 10px">
        <el-row
          :gutter="10"
          v-for="(row, i) in this.stations[this.current_page]"
          :key="i"
        >
          <el-col v-for="(col, j) in row" :key="j" :span="6">
            <el-card
              :body-style="{ padding: '0px' }"
              class="card"
              shadow="hover"
            >
              <div style="padding: 10px">
                <el-row justify="space-between">
                  <el-col :span="4">
                    <el-button text @click="toStationDetil(col.id)">
                      <h1>{{ col.name }}</h1>
                    </el-button>
                  </el-col>
                  <el-col :span="4">
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
                  <code>station id :{{ col.id }}</code>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
      <el-footer>
        <el-row justify="center" style="margin-top: 10px">
          <el-pagination
            layout="prev, pager, next"
            background
            :total="total"
            :page-size="12"
            :pager-count="7"
            v-model:current-page="current_page"
          />
        </el-row>
      </el-footer>
    </el-container>
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
    };
  },
  created: function () {
    ipcRenderer.on("station", (event, data) => {
      this.total = data.length;
      this.station_list = data;
      for (let i = 0; i * 12 < data.length; i += 1) {
        this.stations[i + 1] = [[], [], []];
        let index = 0;
        for (let j = 0; j < 12 && j + i * 12 < data.length; j += 1) {
          if (j % 4 == 0 && j != 0) index += 1;
          this.stations[i + 1][index].push(data[j + i * 12]);
        }
      }
    });
    ipcRenderer.send("read", ["station"]);
  },
  methods: {
    toStationDetil(id) {
      this.$router.push({ name: "station-details", query: { id: id } });
    },
    remove(i, j) {
      this.stations[this.current_page][i].splice(j, 1);
      this.station_list.splice((this.current_page - 1) * 12 + i * 4 + j, 1);
      ipcRenderer.send("write", ["station", JSON.stringify(this.station_list)]);
      this.total -= 1;
    },
  },
};
</script>
<style>
.card-container {
  height: 430px;
}
.card {
  height: 130px;
  margin-bottom: 5px;
}
code {
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  border-radius: 5px;
  max-height: 500px;
}
h1 {
  font-size: 20px;
  line-height: 2;
  margin: 0;
}
</style>
