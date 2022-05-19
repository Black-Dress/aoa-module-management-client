<template>
  <div></div>
</template>

<script>
import { mqttx } from './utils/mqttx'
export default {
  name: 'App',
  components: {
  },
  created() {
    let client = new mqttx();
    client.connect()
    // client.subscribe("a")
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
