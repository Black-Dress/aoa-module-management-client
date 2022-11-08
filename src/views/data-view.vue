<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="10" style="text-align: left">
          <h1>mqtt messages</h1>
        </el-col>
        <el-divider></el-divider>
      </el-row>
    </el-header>
    <el-main>
      <el-table :data="files" row-key="name" style="width: 100%" height="500">
        <el-table-column fixed prop="name" label="Name"/>
        <el-table-column prop="time" label="Time"/>
        <el-table-column prop="size" label="Size"/>
        <el-table-column
            :filters="category"
            :filter-method="filter_station"
            prop="station"
            label="station"
        />
        <el-table-column fixed="right" label="operations">
          <template #default="scope">
            <el-button
                text
                type="primary"
                size="small"
                @click="remove(scope.$index)"
            >
              remove
            </el-button>
            <el-button
                text
                type="primary"
                size="small"
                @click="detail(scope.$index)"
            >
              detail
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
  <el-dialog v-model="detailDialogVisible">
    <el-container>
      <el-header>
        <el-row :gutter="2">
          <el-col :span="2" style="text-align: left; max-width: 44px">
            <el-button
                @click="detailDialogVisible = false"
                text
                style="margin-top: 4px"
            >
              <el-icon>
                <ArrowLeft/>
              </el-icon>
            </el-button>
          </el-col>
          <el-col :span="18" style="text-align: left">
            <h1>name: {{ files[cur_index].name }}</h1>
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <prism-editor
            class="code"
            :model-value="code"
            :highlight="highlighter"
            line-numbers
            :readonly="true"
        ></prism-editor>
      </el-main>
    </el-container>
  </el-dialog>
</template>
<script>
import {PrismEditor} from "vue-prism-editor";
import {highlight, languages} from "prismjs/components/prism-core";
import {ElMessage} from "element-plus";

const ipcRenderer = window.require("electron").ipcRenderer;
export default {
  components: {
    PrismEditor,
  },
  data: function () {
    return {
      code: "",
      detailDialogVisible: false,
      cur_index: 0,
      files: [
        {
          name: "a",
          time: "a",
          size: "aaaaaaaaaaaaaaaaaaaaaaaa",
          station: "a",
          path: "",
        },
        {
          name: "b",
          time: "b",
          size: "bbbbbbbbbbbbbbbbbbbbb",
          station: "b",
          path: "",
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
        res.push({text: k, value: v});
      });
      return res;
    },
  },
  created: function () {
    ipcRenderer.once("data", (event, arg) => {
      this.files = arg;
    });

    ipcRenderer.send("read", ["data"]);
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.plaintext, "bash");
    },
    alert_delete() {
      ElMessage({type: "success", message: "delete success"});
    },
    remove(index) {
      ipcRenderer.send("delete", ["data", this.files[index].path]);
      this.files.splice(index, 1);
    },
    detail(index) {
      this.detailDialogVisible = true;
      this.cur_index = index;
      ipcRenderer.once("data_details", (event, arg) => {
        this.code = "";
        for (let index = 0; index < arg.length; index++) {
          const element = arg[index];
          this.code += element + "\n";
        }
      });
      ipcRenderer.send("read", ["data_detail", this.files[index].path]);
    },
    filter_station(value, row) {
      return row.station === value;
    },
  },
};
</script>
<style scoped></style>
