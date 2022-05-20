<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu default-active="1" id="menu">
          <el-menu-item index="1">
            <el-icon>
              <compass />
            </el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon>
              <document />
            </el-icon>
            <span>基站配置</span>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon>
              <position />
            </el-icon>
            <span>标签管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mqttx } from './utils/mqttx'
export default {
  name: 'App',
  components: {
  },
  created() {
  },
  methods: {
    connect() {
      mqttx.connect()
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#menu {
  height: 500px;
}
</style>
