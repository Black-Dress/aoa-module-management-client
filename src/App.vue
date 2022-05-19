<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
      </el-aside>
      <el-main>Main</el-main>
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
</style>
