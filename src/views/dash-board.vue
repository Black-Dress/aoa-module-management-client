<template>
    <div>
        <div>
            <el-row :gutter="20" style="margin-bottom: 10px;">
                <el-col :span="4">
                    <span style="float:left">MQTT服务器</span>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-select v-model="curUrl" placeholder="URL">
                        <el-option v-for=" item in mqttUrls" :key="item.name" :label="item.name" :value="item.value" />
                    </el-select>
                </el-col>
                <el-col :span="17">
                    <el-input v-model="curUrl" :placeholder="curUrl" />
                </el-col>
                <el-col :span="1">
                    <el-button id="start" type="primary" @click="connect()">连接</el-button>
                </el-col>
            </el-row>
        </div>
        <el-divider></el-divider>
        <div>
            <el-row>
                <prism-editor class="my-editor" :readonly="true" v-model="code" :highlight="highlighter" line-numbers />
            </el-row>
        </div>
    </div>
</template>
<script>

import { PrismEditor } from "vue-prism-editor";
import { highlight, languages } from 'prismjs/components/prism-core';
import "prismjs/components/prism-clike";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";
import "vue-prism-editor/dist/prismeditor.min.css";
const axios = require('axios').default
// import { mqttx } from '@/utils/mqttx';
export default {
    components: {
        PrismEditor
    },
    created: function () {
        axios
            .get("./mqtt.json").then((res) => {
                this.mqttUrls = res.data
            })
            .catch((err) => {
                console.error(err);
            })
    },
    data: function () {
        return {
            mqttUrls: [],
            curUrl: "",
            code: ""
        }
    },
    methods: {
        connect() {
            console.log("connect")
        },
        highlighter(code) {
            return highlight(code, languages.bash);
        },
        updateUrl(val) {
            console.log(val)
            this.curUrl = val
        }
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