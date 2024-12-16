<script setup>
const pageData = useState('pageData');
</script>

<template>
  <div class="container">
    <UIHeader />
    <div class="container-content">
      <NuxtPage :style="{ display: pageData ? 'none' : '' }"/>
      <UIFooter :style="{ display: pageData ? 'none' : 'flex' }"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>