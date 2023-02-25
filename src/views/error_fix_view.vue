<template>
  <el-container>
    <el-header>
      <el-row>
        <el-col :span="10" style="text-align: left">
          <h1>error fix</h1>
        </el-col>
        <el-divider></el-divider>
      </el-row>
    </el-header>
    <el-main>
      <el-steps :active="active" finish-status="success" align-center>
        <el-step title="station" />
        <el-step title="tags" />
        <el-step title="start" />
      </el-steps>
      <el-container style="margin-top: 20px">
        <div v-if="active == 0" class="main">
          <el-table :data="this.$mqttx.station_list" highlight-current-row @current-change="stations_change">
            <el-table-column prop="id" label="id" width="195" />
            <el-table-column prop="name" label="name" width="195" />
            <el-table-column prop="net" label="net" width="195" />
            <el-table-column prop="status" label="status" width="195" />
          </el-table>
        </div>
        <div v-if="active == 1" class="main">
          <el-table :data="this.$mqttx.tag_list" highlight-current-row @selection-change="tags_change">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="id" label="id" width="230" />
            <el-table-column prop="name" label="name" width="230" />
            <el-table-column prop="status" label="status" width="230" />
          </el-table>
        </div>
        <div v-if="active == 2" class="main">
          <el-row :gutter="20">
            <el-col :span="14" class="a">
              <el-row>
                <el-col><p>station</p></el-col>
              </el-row>
              <el-row>
                <el-col class="b">
                  <el-card>
                    {{ this.slected_station.id }}
                  </el-card>
                </el-col>
              </el-row>
              <el-divider />
              <el-row>
                <el-col><p>tags</p></el-col>
              </el-row>
              <el-row>
                <el-col v-for="(o, i) in this.slected_tags.length" :key="o" class="c">
                  <el-card>
                    {{ this.slected_tags[i].id }}
                  </el-card>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="10" class="a">
              <el-row>
                <el-col :span="24" class="d"><el-button type="primary" style="width: 100px; height: 100px; border-radius: 50px">start</el-button></el-col>
              </el-row>
              <el-row>
                <el-col :span="24" class="d">
                  <p style="text-align: center">current record times: {{ this.record_times }}</p>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </div>
        <div v-if="active == 3" class="main">3</div>
      </el-container>
    </el-main>
    <el-footer>
      <el-row>
        <el-col :span="12">
          <el-button @click="minus">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </el-col>
        <el-col :span="12">
          <el-button @click="plus">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </el-col>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script>
export default {
  data: function () {
    return {
      active: 0,
      slected_station: {},
      slected_tags: [{}, {}],
      record_times: 0,
    };
  },
  created: function () {
    console.log(this.$mqttx.tag_list);
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
    stations_change(val) {
      this.slected_station = val;
    },
    tags_change(val) {
      this.slected_tags = val;
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
