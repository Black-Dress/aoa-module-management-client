<template>
    <prism-editor class="my-editor" :readonly="ariaReadonly" v-model="getcode" :highlight="highlighter" line-numbers>
    </prism-editor>
</template>
<script>
// import Prism Editor
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-bash'
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles

export default {
    components: {
        PrismEditor,
    },
    props: ['ariaReadonly', 'initialCode'],
    data: () => ({
    }),
    methods: {
        highlighter(code) {
            return highlight(code, languages.bash); // languages.<insert language> to return html with markup
        },
    },
    computed: {
        getcode() {
            return this.initialCode
        }
    }
}
</script>
<style>
/* required class */
.my-editor {
    /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
    background: #3c3e3e;
    color: rgb(204, 195, 195);

    /* you must provide font-family font-size line-height. Example: */
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;
    border-radius: 2%;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
    outline: none;
}
</style>