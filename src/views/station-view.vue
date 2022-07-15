<template>
  <div>
    <el-container>
      <el-header>
        <div><h1 style="text-align: left">AoA station</h1></div>
        <el-divider></el-divider>
      </el-header>
      <el-main style="margin-top: 10px">
        <div style="float: left"></div>
        <el-row
          :gutter="10"
          v-for="(row, i) in this.stations[this.current_page]"
          :key="i"
        >
          <el-col v-for="(col, j) in row" :key="j" :span="6">
            <el-card :body-style="{ padding: '0px' }" class="card">
              <div style="padding: 14px">
                <span>{{ col.id }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row justify="center" style="margin-top: 10px">
          <el-pagination
            layout="prev, pager, next"
            :total="total"
            :page-size="12"
            :pager-count="7"
            v-model:current-page="current_page"
          />
        </el-row>
      </el-main>
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
    };
  },
  created: function () {
    ipcRenderer.on("station", (event, data) => {
      this.total = data.length;
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
  methods: {},
};
</script>
<style>
.card-container {
  height: 430px;
}
.card {
  height: 140px;
  margin-bottom: 5px;
}
</style>
