<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="5" style="text-align: left">
          <h1>mqtt messages</h1>
        </el-col>
        <el-divider> </el-divider>
      </el-row>
    </el-header>
    <el-main>
      <el-table :data="files" row-key="name" style="width: 100%" height="500">
        <el-table-column fixed prop="name" label="Name" />
        <el-table-column prop="time" label="Time" />
        <el-table-column prop="size" label="Size" />
        <el-table-column
          :filters="category"
          :filter-method="filter_station"
          prop="station"
          label="station"
        />
        <el-table-column fixed="right" label="operations">
          <el-button text type="primary" size="small" @click="remove">
            remove
          </el-button>
          <el-button text type="primary" size="small" @click="detail">
            detail
          </el-button>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>
<script>
export default {
  data: function () {
    return {
      files: [
        {
          name: "a",
          time: "a",
          size: "aaaaaaaaaaaaaaaaaaaaaaaa",
          station: "a",
        },
        {
          name: "b",
          time: "b",
          size: "bbbbbbbbbbbbbbbbbbbbb",
          station: "b",
        },
      ],
    };
  },
  computed: {
    category() {
      let s = new Set();
      let res = [];
      for (let index = 0; index < this.files.length; index++) {
        const element = this.files[index];
        s.add(element.station);
      }
      s.forEach((k, v) => {
        res.push({ text: k, value: v });
      });
      return res;
    },
  },
  methods: {
    remove() {
      console.log("remove");
    },
    detail() {
      console.log("detail");
    },
    filter_station(value, row) {
      return row.station == value;
    },
  },
};
</script>
