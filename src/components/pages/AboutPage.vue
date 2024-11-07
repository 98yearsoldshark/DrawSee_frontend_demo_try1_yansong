<template>
  <div class="aboutpage">
    <iframe :src="feishuUrl" frameborder="0" class="iframe"></iframe>
  </div>
</template>

<script lang="ts" setup>
const feishuUrl = 'https://bcn290wiug78.feishu.cn/wiki/FDF5wNR2AiVj8Jkqvw7czV5RnWf';
</script>

<style scoped>
.aboutpage {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
