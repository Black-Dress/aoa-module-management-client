<template>
    <div>
        <div>
            <el-row style="margin-bottom: 10px;">
                <el-col :span="4">
                    MQTT服务器
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="20">
                    <div>
                        <p1 :aria-readonly="false" :initial-code="mqttUrl" />
                    </div>
                </el-col>
                <el-col :span="4">
                    <el-button id="start" type="primary" @click="connect()">连接</el-button>
                </el-col>
            </el-row>
        </div>
        <el-divider></el-divider>
        <p2 :aria-readonly="true" />
    </div>
</template>
<script>
import p1 from "../components/prism-editor.vue"
import p2 from "../components/prism-editor.vue"
// import { mqttx } from '@/utils/mqttx';
export default {
    components: {
        p1, p2
    },
    data: () => ({
        mqttUrl: "aaa",
    }),
    methods: {
        connect() {
            console.log("connect")
        }
    }
}
</script>
