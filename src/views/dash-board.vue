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
                        <prism-editor class="my-editor" :readonly="false" v-model="mqttUrl" :highlight="highlighter"
                            line-numbers />
                    </div>
                </el-col>
                <el-col :span="4">
                    <el-button id="start" type="primary" @click="connect()">连接</el-button>
                </el-col>
            </el-row>
        </div>
        <el-divider></el-divider>
        <prism-editor class="my-editor" :readonly="false" v-model="code" :highlight="highlighter" line-numbers />
    </div>
</template>
<script>

import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from 'prismjs/components/prism-core';
import "../settings"
// import { mqttx } from '@/utils/mqttx';
export default {
    components: {
        PrismEditor
    },
    data: () => ({
        mqttUrl: "aaa",
        code: ""
    }),
    methods: {
        connect() {
            console.log("connect")
        },
        highlighter(code) {
            return highlight(code, languages.bash);
        },
    }
}
</script>
<style>
/* required class */
.my-editor {
    /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
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

/* optional class for removing the outline */
.prism-editor__textarea:focus {
    outline: none;
}
</style>