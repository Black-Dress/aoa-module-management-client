<template>
  <div>
    <el-container>
      <el-header>
        <el-row :gutter="2">
          <el-col :span="2" style="text-align: left; max-width: 44px">
            <el-button @click="this.$router.back()" text style="margin-top: 4px">
              <el-icon>
                <ArrowLeft />
              </el-icon>
            </el-button>
          </el-col>
          <el-col :span="16" style="text-align: left">
            <h1>Tag: {{ this.$route.query.id }}</h1>
          </el-col>
          <el-col :span="6" style="text-align: right">
            <el-button @click="save_message_dialog_visible = true" type="primary"> save </el-button>
            <el-switch v-model="value2" class="mt-2" style="margin-left: 24px" inline-prompt :active-icon="Check" :change="statusChange(val)" :inactive-icon="Close" />
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-header>
      <el-main>
        <prism-editor class="code" :model-value="code" :highlight="highlighter" line-numbers :readonly="true"></prism-editor>
      </el-main>
    </el-container>
    <el-dialog v-model="save_message_dialog_visible" title="save message" width="300px">
      <el-row>
        <el-col>
          <el-form>
            <el-form-item label="name" label-width="20%">
              <el-input v-model="file_name" :placeholder="`${new Date().toISOString().slice(0, 10)}.json`"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="3">
        <el-col :span="12">
          <el-button @click="save_message_dialog_visible = false"> cancel </el-button>
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
      file_name: `${new Date().toISOString().slice(0, 10)}.json`,
    };
  },
  created: function () {
    this.$mqttx.set_message_callback(this.ms);
    this.code = `Tag: ${this.$route.query.id} \n`;
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.bash, "bash");
    },
    ms(topic, ms) {
      this.code += ms.toString() + "\n";
    },
    save(name = `${new Date().toISOString().slice(0, 10)}.json`) {
      let data = this.$mqttx.tags[this.$route.query.id];
      data = data ? data : {};
      this.$mqttx.save(JSON.stringify(data), `${this.$route.query.id}/${name}`);
    },
    dialogConfirm() {
      this.save(this.file_name);
      this.save_message_dialog_visible = false;
    },
    statusChange(val) {
      this.$mqttx.tag_list.forEach((element) => {
        if (element.id == this.$route.query.id) element.status = val;
      });
      if (val) this.$mqttx.subscribeTag(this.$route.query.id);
      else this.$mqttx.unsubscribeTag(this.$route.query.id);
    },
  },
};
</script>
<style scoped></style>
