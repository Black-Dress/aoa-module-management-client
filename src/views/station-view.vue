<template>
  <div>
    <el-container>
      <el-header>
        <div><h1 style="text-align: left">AoA station</h1></div>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <div style="float: left"></div>
        <!-- TODO 添加分页，每页12个，每行4个 -->
        <el-row :gutter="10">
          <el-col
            v-for="station in stations.length > 4 ? 4 : stations.length"
            :key="station.id"
            :span="6"
          >
            <el-card :body-style="{ padding: '0px' }">
              <div style="padding: 14px">
                <span>Yummy hamburger</span>
                <div class="bottom">
                  <time class="time">{{ currentDate }}</time>
                  <el-button text class="button">Operating</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
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
      stations: [
        {
          id: "a",
          positon: {
            x: 1,
            y: 1,
            z: 1,
          },
          net: "192.168.1.101",
        },
      ],
    };
  },
  created: function () {
    ipcRenderer.on("station", (event, data) => {
      this.stations = data;
    });
    ipcRenderer.send("read", "station");
  },
  methods: {},
};
</script>
