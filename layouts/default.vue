<script setup>
const pageData = useState('pageData');
</script>

<template>
  <div class="container">
    <UIHeader />
    <NuxtPage :style="{ display: pageData ? 'none' : '' }"/>
    <UIFooter :style="{ display: pageData ? 'none' : 'flex' }"/>
  </div>
</template>

<style scoped lang="scss">
</style>