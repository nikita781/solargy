<script setup>
const pageData = useState('pageData');
</script>

<template>
  <div class="container">
    <UIHeader />
    <div class="container-content">
      <div class="container-content__page">
        <NuxtPage :style="{ display: pageData ? 'none' : '' }"/>
      </div>
      <UIFooter :style="{ display: pageData ? 'none' : 'flex' }"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>