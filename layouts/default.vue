<script setup>
const pageData = useState('pageData');
</script>

<template>
  <div class="container">
    <UIHeader />
<!--    <div class="container-content">-->
      <NuxtPage :style="{ display: pageData ? 'none' : '' }"/>
<!--    </div>-->
    <UIFooter :style="{ display: pageData ? 'none' : 'flex' }"/>
  </div>
</template>

<style scoped lang="scss">
</style>