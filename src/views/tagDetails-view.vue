<template>

  <el-container>
    <el-header>
      <el-row :gutter="2">
        <el-col :span="2" style="text-align: left; max-width: 44px">
          <el-button @click="this.$router.back()" text style="margin-top: 4px">
            <el-icon>
              <ArrowLeft/>
            </el-icon>
          </el-button>
        </el-col>
        <el-col :span="16" style="text-align: left">
          <h1>Tag: {{ this.$route.query.id }}</h1>
        </el-col>
        <el-col :span="6" style="text-align: right">
          <el-button @click="save_message_dialog_visible = true" type="primary"> save</el-button>
          <el-switch v-model="tag.status" style="margin-left: 24px" inline-prompt :before-change="before_status_change"
                     @change="status_change"/>
        </el-col>
      </el-row>
      <el-divider></el-divider>
    </el-header>
    <el-main>
      <prism-editor class="code" :model-value="code" :highlight="highlighter" line-numbers
                    :readonly="true"></prism-editor>
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
        <el-button @click="save_message_dialog_visible = false"> cancel</el-button>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="dialogConfirm()">confirm</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import {PrismEditor} from "vue-prism-editor";
import {highlight, languages} from "prismjs/components/prism-core";
import {store} from "@/utils/store";
import {ElMessage} from "element-plus";

export default {
  components: {
    PrismEditor,
  },
  data: function () {
    return {
      tag: {
        name: "aa",
        id: "aa-id",
        status: false,
      },
      code: "",
      save_message_dialog_visible: false,
      file_name: `${new Date().toISOString().slice(0, 10)}.json`,
    };
  },
  created: function () {
    this.tag = this.$mqttx.tag_list[this.$route.query.index];
    this.code = `Tag: ${this.tag.id} \n`;
    this.$mqttx.set_message_callback(this.ms)
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.bash, "bash");
    },
    ms(topic, ms) {
      if (topic.includes(this.tag.id))
        this.code += ms.toString() + "\n";
    },
    save(name = `${new Date().toISOString().slice(0, 10)}.json`) {
      let data = this.$mqttx.tags[this.$route.query.id];
      data = data ? data : {};
      this.$mqttx.save(JSON.stringify(data), `${this.tag.id}/${name}`);
    },
    dialogConfirm() {
      this.save(this.file_name);
      this.save_message_dialog_visible = false;
    },
    /**
     * 状态更新前的判断
     * @returns {UnwrapRef<boolean>}
     */
    before_status_change() {
      if (!store.main_connect_status) ElMessage({type: "error", message: "please connect mqtt in dashboard"});
      return store.main_connect_status;
    },
    /**
     * 启动或者关闭tag标签
     * @param val {boolean} 是否启动
     */
    status_change(val) {
      if (!val) {
        this.tag.status = val
        return
      }
      // 重置其他所有的tag
      this.$mqttx.tag_list.forEach(tag => {
        if (tag.status) tag.status = false
      })
      this.$mqttx.tag_list[this.$route.query.index].status = true;
      this.$mqttx.active_tag = this.tag.id
    },
  },
};
</script>
<style scoped></style>
