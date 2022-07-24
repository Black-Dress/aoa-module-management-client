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
          <el-col :span="4" style="text-align:right">
            <el-button @click="save" type="primary">save</el-button>
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
    };
  },
  created: function () {
    this.$mqttx.addMessage(this.ms);
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.bash);
    },
    ms(topic, ms) {
      this.code += ms.toString() + "\n";
    },
    save(){
      const data = this.$mqttx.output[this.$route.query.id]
      this.$mqttx.save(JSON.stringify(data),`${new Date().toISOString().slice(0,10)}.json`)
    }
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
