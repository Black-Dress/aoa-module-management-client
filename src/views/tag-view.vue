<template>
  <div>
    <el-container style="height: 600px">
      <el-header>
        <el-row justify="space-between">
          <el-col :span="6" style="text-align: left">
            <h1>AoA station</h1>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addStationDialogVisible = true">
              <el-icon>
                <plus />
              </el-icon>
            </el-button>
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main style="margin-top: 10px; height: 410px">
        <el-row :gutter="10" v-for="(row, i) in this.tags[this.current_page]" :key="i">
          <el-col v-for="(col, j) in row" :key="j" :span="6">
            <el-card :body-style="{ padding: '0px' }" class="card" shadow="hover">
              <div style="padding: 10px">
                <el-row justify="space-between">
                  <el-col :span="10" style="text-align: left">
                    <el-button text @click="detail(col.id)" style="padding: 0 0 0 0">
                      <h1>{{ col.name }}</h1>
                    </el-button>
                  </el-col>
                  <el-col :span="5">
                    <el-button text @click="remove(i, j)">
                      <el-icon>
                        <Close />
                      </el-icon>
                    </el-button>
                  </el-col>
                </el-row>
                <el-row>
                  <code> Tag Status: {{ col.status ? "online" : "offline" }} </code>
                </el-row>
                <el-row>
                  <code>Tag id :{{ col.id }}</code>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
      <el-footer>
        <el-row justify="center" style="margin-top: 10px">
          <el-pagination layout="prev, pager, next" background :total="total" :page-size="12" :pager-count="7" v-model:current-page="current_page" />
        </el-row>
      </el-footer>
    </el-container>
  </div>
</template>
<script>
const ipcRenderer = window.require("electron").ipcRenderer;

export default {
  data: function () {
    return {
      tags: {
        1: [[{ name: "aa", id: "id-aa", status: false }, {}], [], []],
      },
      tag_list: [],
      current_page: 1,
      col_size: 4,
      row_size: 3,
    };
  },
  computed: {
    page_size() {
      return this.col_size * this.row_size;
    },
  },
  created: function () {
    ipcRenderer.once("tags", (event, args) => {
      this.tag_list = args;
      this.tags = this.toTags(args);
    });
    ipcRenderer.send("read", ["tags"]);
  },
  methods: {
    detail() {},
    toTags(args) {
      let res = {};
      for (let i = 0; i * this.page_size < args.length; i += 1) {
        res[i + 1] = [[], [], []];
        let index = 0;
        for (let j = 0; j < this.page_size && j + i * this.page_size < args.length; j += 1) {
          if (j % 4 == 0 && j != 0) index += 1;
          res[i + 1][index].push(args[j + i * this.page_size]);
        }
      }
      return res;
    },
  },
};
</script>
