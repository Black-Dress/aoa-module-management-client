<template>
  <div>
    <el-container>
      <el-aside width="200px">
        <el-menu default-active="/" id="menu" :router="true">
          <el-menu-item index="/">
            <el-icon>
              <compass/>
            </el-icon>
            <span>导航</span>
          </el-menu-item>
          <el-menu-item index="/station">
            <el-icon>
              <document/>
            </el-icon>
            <span>基站</span>
          </el-menu-item>
          <el-menu-item index="/tag">
            <el-icon>
              <position/>
            </el-icon>
            <span>标签</span>
          </el-menu-item>
          <el-menu-item index="/data">
            <el-icon>
              <DataBoard/>
            </el-icon>
            <span>数据</span>
          </el-menu-item>
          <el-menu-item index="/error">
            <el-icon>
              <View/>
            </el-icon>
            <span>误差</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <router-view></router-view>
      </el-container>
    </el-container>
  </div>
</template>

<script>
const ipcRenderer = window.require("electron").ipcRenderer;
export default {
  name: "App",
  components: {},
  created() {
    ipcRenderer.once("tags", (event, data) => {
      this.$mqttx.tag_list = data;
    });
    ipcRenderer.once("stations", (event, data) => {
      this.$mqttx.station_list = data;
    });
    ipcRenderer.send("read", ["stations"]);
    ipcRenderer.send("read", ["tags"]);
    this.$router.push("/")
  },
  methods: {},
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

#menu {
  height: 600px;
}

</style>
