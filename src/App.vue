<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu default-active="/dashboard" id="menu" :router="true">
          <el-menu-item index="/">
            <el-icon>
              <compass />
            </el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-menu-item index="/station">
            <el-icon>
              <document />
            </el-icon>
            <span>基站配置</span>
          </el-menu-item>
          <el-menu-item index="/tag">
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
    },
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
