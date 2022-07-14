<template>
  <div>
    <el-container>
      <el-header>
        <div><h1 style="text-align: left">AoA station</h1></div>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <div style="float: left"></div>
        <el-row :gutter="10">
          <el-col v-for="o in 3" :key="o" :span="6" :offset="0">
            <el-card :body-style="{ padding: '0px' }">
              <img
                src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
                class="image"
              />
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
    console.log(this.stations);
  },
  methods: {},
};
</script>
