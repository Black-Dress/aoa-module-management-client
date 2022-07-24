<template>
  <div>
    <el-container>
      <el-header>
        <el-row :gutter="2">
          <el-col :span="2" style="text-align: left; max-width: 44px">
            <el-button
              @click="this.$router.back()"
              text
              style="margin-top: 4px"
            >
              <el-icon>
                <ArrowLeft />
              </el-icon>
            </el-button>
          </el-col>
          <el-col :span="18" style="text-align: left">
            <h1>station: {{ this.$route.query.id }}</h1>
          </el-col>
          <el-col :span="4" style="text-align: right">
            <el-button
              @click="save_message_dialog_visible = true"
              type="primary"
            >
              save
            </el-button>
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <!-- <code>{{ code }}</code> -->
        <prism-editor
          class="code"
          :model-value="code"
          :highlight="highlighter"
          line-numbers
          :readonly="true"
        ></prism-editor>
      </el-main>
    </el-container>
    <el-dialog
      v-model="save_message_dialog_visible"
      title="save message"
      width="300px"
    >
      <el-row>
        <el-col>
          <el-form>
            <el-form-item label="name" label-width="20%">
              <el-input v-model="file_name"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="3">
        <el-col :span="12">
          <el-button @click="save_message_dialog_visible = false">
            cancel
          </el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="dialogConfirm()">confirm</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from "prismjs/components/prism-core";
export default {
  components: {
    PrismEditor,
  },
  data: function () {
    return {
      code: "",
      save_message_dialog_visible: false,
      file_name: "",
    };
  },
  created: function () {
    this.$mqttx.set_message_callback(this.ms);
    this.code = `station: ${this.$route.query.id} \n`;
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.bash);
    },
    ms(topic, ms) {
      this.code += ms.toString() + "\n";
    },
    save(
      name = `${this.$route.query.id}/${new Date()
        .toISOString()
        .slice(0, 10)}.json`
    ) {
      const data = this.$mqttx.output[this.$route.query.id];
      this.$mqttx.save(JSON.stringify(data), `${this.$route.query.id}/${name}`);
    },
    dialogConfirm() {
      this.save(this.file_name);
      this.save_message_dialog_visible = false;
    },
  },
};
</script>
<style scoped>
.code {
  background: #2d2d2d;
  color: #ccc;
  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  border-radius: 5px;
  max-height: 500px;
}
</style>
