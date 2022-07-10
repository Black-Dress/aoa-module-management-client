<template>
    <div>
        <p1 :aria-readonly="false"></p1>
        <el-divider></el-divider>
        <p2 :aria-readonly="true"></p2>
    </div>
</template>
<script>
import p1 from "../components/prism-editor.vue";
import p2 from "../components/prism-editor.vue"

export default {
    components: {
        p1, p2
    }
}
</script>
