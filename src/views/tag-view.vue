<template>
  <el-container>
    <el-header>
      <el-row justify="space-between">
        <el-col :span="6" style="text-align: left">
          <h1>AoA tags</h1>
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
    <el-main :key="tags.length">
      <el-row class="row" :gutter="10" v-for="(a, i) in row_size" :key="i">
        <el-col class="col" v-for="(b, j) in col_size" :key="j" :span="24 / this.col_size">
          <el-card
            :body-style="{ padding: '0px' }"
            class="card"
            shadow="hover"
            :class="this.tags[this.index(i, j)].status ? 'active' : 'inactive'"
            v-if="index(i, j) < tags.length"
          >
            <div style="padding: 10px">
              <el-row justify="space-between" class="row">
                <el-col :span="12" style="text-align: left">
                  <h1>{{ tags[index(i, j)].name }}</h1>
                </el-col>
                <el-col :span="12" style="text-align: right">
                  <el-button text @click="remove(i, j)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </el-button>
                </el-col>
              </el-row>
              <div @click="detail(i, j)">
                <el-row class="row">
                  <code>{{ tags[index(i, j)].id }}</code>
                </el-row>
                <el-row class="row">
                  <code> {{ tags[index(i, j)].status ? "online" : "offline" }} </code>
                </el-row>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <el-footer>
      <el-row justify="center" style="margin-top: 10px">
        <el-pagination layout="prev, pager, next" background :total="tags.length" :page-size="page_size" :pager-count="7" v-model:current-page="current_page" />
      </el-row>
    </el-footer>
  </el-container>
  <el-dialog v-model="addStationDialogVisible" title="add new tag">
    <el-row>
      <el-col :span="4"><p>id</p></el-col>
      <el-col :span="20">
        <el-input v-model="new_tag.id"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="4"><p>name</p></el-col>
      <el-col :span="20">
        <el-input v-model="new_tag.name"></el-input>
      </el-col>
    </el-row>
    <el-row :gutter="3">
      <el-col :span="12">
        <el-button @click="cancel">cancel</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="confirm">confirm</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import { ElMessage } from "element-plus";

const ipcRenderer = window.require("electron").ipcRenderer;

export default {
  data: function () {
    return {
      tags: [],
      current_page: 1,
      col_size: 4,
      row_size: 3,
      addStationDialogVisible: false,
      new_tag: {
        name: "",
        id: "",
        status: "",
      },
    };
  },
  computed: {
    page_size() {
      return this.col_size * this.row_size;
    },
  },
  created: function () {
    this.tags = this.$mqttx.tag_list;
  },
  methods: {
    cancel() {
      this.new_tag = {
        name: "",
        id: "",
        status: "",
      };
      this.addStationDialogVisible = false;
    },
    confirm() {
      if (this.new_tag.id === "" || this.new_tag.name === "") {
        ElMessage({ type: "error", message: "id or name could not be empty" });
      }
      if (this.tags.findIndex((tag) => tag.id === this.new_tag.id) !== -1) {
        ElMessage({ type: "error", message: "tag id could not be repeated" });
        return;
      }
      this.tags.push(this.new_tag);
      ipcRenderer.send("write", ["tags", JSON.stringify(this.tags)]);
      this.new_tag = {
        name: "",
        id: "",
        status: "",
      };
      this.addStationDialogVisible = false;
    },
    /**
     * 通过 i j 计算出编号
     * @param i row
     * @param j col
     * @returns {number} 在 tag list中的编号
     */
    index(i, j) {
      return (this.current_page - 1) * this.page_size + i * this.col_size + j;
    },
    /**
     * 删除 指定位置的tag
     * @param i row
     * @param j col
     */
    remove(i, j) {
      this.tags.splice(this.index(i, j), 1);
      ipcRenderer.send("write", ["tags", JSON.stringify(this.tags)]);
    },
    /**
     * 跳转至 指定页面
     * @param i row
     * @param j col
     */
    detail(i, j) {
      this.$router.push({ name: "tag-details", query: { index: this.index(i, j) } });
    },
  },
};
</script>
<style scoped>
.row {
  height: auto;
}

.col {
  height: 140px;
  margin: 0 0 0 0;
}

.active {
  background: #ccffff;
}

.inactive {
  background: #fffafa;
}
</style>
