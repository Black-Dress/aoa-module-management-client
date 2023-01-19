<template>
  <el-container>
    <el-main>
      <el-steps :active="active" finish-status="success" align-center>
        <el-step title="station"/>
        <el-step title="tags"/>
        <el-step title="start"/>
      </el-steps>
      <el-container>
        
      </el-container>
    </el-main>
    <el-footer>
      aaaa
    </el-footer>
  </el-container>
</template>

<script>
export default {
  data: function () {
    return {
      active: 0
    }
  }
}
</script>

<style scoped>
.el-main {
  height: 400px;
}
</style>