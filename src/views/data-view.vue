<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="5" style="text-align: left">
          <h1>mqtt messages</h1>
        </el-col>
        <el-divider></el-divider>
      </el-row>
    </el-header>
    <el-main>
      <el-table> </el-table>
    </el-main>
  </el-container>
</template>
<script>
export default {
  data: function () {
    return {
      files: [
        {
          name: "",
          time: "",
          size: "",
        },
      ],
    };
  },
};
</script>
