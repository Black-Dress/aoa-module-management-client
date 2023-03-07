<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="10" style="text-align: left">
          <h1>误差修正</h1>
        </el-col>
        <el-divider></el-divider>
      </el-row>
    </el-header>
    <el-main>
      <el-steps :active="active" finish-status="success" align-center>
        <el-step title="基站选择"/>
        <el-step title="标签选择"/>
        <el-step title="开始测量"/>
      </el-steps>
      <el-container style="margin-top: 20px">
        <div v-if="active === 0" class="main">
          <el-table :data="this.$mqttx.station_list" highlight-current-row @current-change="stations_change">
            <el-table-column prop="id" label="基站ID" width="195"/>
            <el-table-column prop="name" label="基站名称" width="195"/>
            <el-table-column prop="net" label="基站IP" width="195"/>
            <el-table-column prop="status" label="基站状态" width="195"/>
          </el-table>
        </div>
        <div v-if="active === 1" class="main">
          <el-table :data="this.$mqttx.tag_list" highlight-current-row @selection-change="tags_change">
            <el-table-column type="selection" width="50"/>
            <el-table-column prop="id" label="标签ID" width="230"/>
            <el-table-column prop="name" label="标签名称" width="230"/>
            <el-table-column prop="status" label="标签状态" width="230"/>
          </el-table>
        </div>
        <div v-if="active === 2" class="main">
          <el-row :gutter="20">
            <el-col :span="14" class="a">
              <el-row>
                <el-col><p>已选择基站</p></el-col>
              </el-row>
              <el-row>
                <el-col class="b">
                  <el-card>
                    {{ this.selected_station.id }}
                  </el-card>
                </el-col>
              </el-row>
              <el-divider/>
              <el-row>
                <el-col><p>已选择标签</p></el-col>
              </el-row>
              <el-row>
                <el-col v-for="(o, i) in this.selected_tags.length" :key="o" class="c">
                  <el-card @click="click_tag(i)">
                    {{ this.selected_tags[i].id }}
                    x: {{
                      this.selected_tags[i].position ? this.selected_tags[i].position.x : "null"
                    }},
                    y: {{
                      this.selected_tags[i].position ? this.selected_tags[i].position.y : "null"
                    }},
                    z: {{
                      this.selected_tags[i].position ? this.selected_tags[i].position.z : "null"
                    }}
                  </el-card>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="10" class="a">
              <el-row>
                <el-col :span="24" class="d">
                  <el-button type="primary" style="width: 100px; height: 100px; border-radius: 50px"
                             @click="start">
                    开始测量
                  </el-button>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24" class="d">
                  <p style="text-align: center">目前已测量次数: {{ this.record_times }}</p>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </div>
        <div v-if="active === 3" class="main">
          <el-table :data="this.upload_file" table-layout="fixed">
            <el-table-column type="selection"/>
            <el-table-column prop="time" label="采集时间"/>
            <el-table-column prop="size" label="采集大小"/>
          </el-table>
          <el-button @click="upload" style="margin-top: 30px" type="primary">上传</el-button>


        </div>
      </el-container>
    </el-main>
    <el-footer>
      <el-row>
        <el-col :span="12">
          <el-button @click="minus">
            <el-icon>
              <ArrowLeft/>
            </el-icon>
          </el-button>
        </el-col>
        <el-col :span="12">
          <el-button @click="plus">
            <el-icon>
              <ArrowRight/>
            </el-icon>
          </el-button>
        </el-col>
      </el-row>
    </el-footer>
  </el-container>
  <el-dialog v-model="add_tags_position" title="添加位置" width="400px">
    <el-row>
      <el-col :span="6"><p>标签X</p></el-col>
      <el-col :span="18">
        <el-input v-model="selected_tag.position.x"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><p>标签Y</p></el-col>
      <el-col :span="18">
        <el-input v-model="selected_tag.position.y"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6"><p>标签Z</p></el-col>
      <el-col :span="18">
        <el-input v-model="selected_tag.position.z"></el-input>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import {store} from "@/utils/store";
import {ElMessage} from "element-plus";
import {upload_error_fix_data} from "@/api/client.js"

const ipcRenderer = window.require("electron").ipcRenderer;
export default {
  data: function () {
    return {
      active: 0,
      selected_station: {},
      selected_tags: [{}, {}],
      selected_tag: {},
      record_times: 0,
      add_tags_position: false,
      status: "start",
      files: [],
      upload_file: [],
    };
  },
  created: function () {
    let a = {
      time: new Date().getTime(),
      size: 1023
    }
    this.upload_file.push(a)
  },
  computed: {
    cur_url: {
      get: function () {
        return store.cur_url;
      },
      set: function (val) {
        store.set_cur_url(val);
      },
    },
  },
  methods: {
    minus() {
      this.active -= 1;
      this.active = this.active >= 0 ? this.active : 0;
    },
    plus() {
      this.active += 1;
      this.active = this.active <= 3 ? this.active : 3;
    },
    /**
     * 基站选择变更，选择之后会读取基站相关的误差文件，进行files的初始化
     * @param val 选择后的基站
     */
    stations_change(val) {
      this.selected_station = val
      this.update_files(this.selected_station.id)
    },
    /**
     * 通过id 读取station的误差采集数据
     * @param id
     */
    update_files(id) {
      ipcRenderer.send("read", ["error_files", id])
      ipcRenderer.once("data", (event, arg) => {
        this.files = arg;
      })
    },
    tags_change(val) {
      this.selected_tags = val;
    },
    click_tag(i) {
      this.selected_tag = this.selected_tags[i]
      if (this.selected_tag.position === undefined) this.selected_tag.position = {x: 0, y: 0, z: 0}
      this.add_tags_position = true
    },
    /**
     * 开始采集数据 \n
     * 重新连接mqtt服务、重新订阅 \n
     * 数据都保存至 this.$mqttx.tags 中，多次采集
     */
    start() {
      if (this.$mqttx.client === undefined || this.$mqttx.client.connected === false)
        this.$mqttx.connect(this.cur_url.value, this.s, this.f)
      this.status = "collecting"
      this.$mqttx.station_status_ctl_by_id(this.selected_station.id, true)
      setTimeout(() => {
        this.$mqttx.station_status_ctl_by_id(this.selected_station.id, false)
        this.status = "start"
        this.record_times += 1
        this.upload_file.push({
          "time": new Date().getTime(),
          "size": this.$mqttx.msgs.length,
          "data": this.$mqttx.msgs
        })
      }, 10000)
    },
    /**
     * 上传误差文件
     */
    upload() {
      let data = []
      this.upload_file.forEach(item => {
        data.push(item.data)
      })
      upload_error_fix_data(data, () => {
        ElMessage({type: "success", message: "upload success"})
      })
    },
    s() {
      // 自动订阅主题
      this.$mqttx.defaultSubscribe(() => {
        ElMessage({type: "success", message: "subscribe success"})
        this.code += "connect & subscribe success" + "\n";
      });
      store.set_main_connect_status(true);
    },
    f() {
      ElMessage({type: "error", message: "connect failed please retry"});
      this.code += "connect failed \n";
      ipcRenderer.send("mosquitto_ctl", [true])
      store.set_main_connect_status(false);
    },
  },
};
</script>

<style scoped>
.a {
  height: 400px;
}

.main {
  width: 785px;
}

.b {
  height: 70px;
}

.c {
  height: 70px;
}

.d {
  height: 120px;
  margin-top: 100px;
}

</style>
