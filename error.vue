<script setup>
import axios from "axios";

axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
</script>

<template>
  <div class="container">
    <UIHeader />
    <div class="container-content">
      <div class="container-content__page">
        <div class="error_info">
          <IconsError/>
        </div>
      </div>
      <UIFooter :style="{ display: pageData ? 'none' : 'flex' }"/>
    </div>
  </div>
</template>

<style lang="scss">
@use "/assets/scss/main" as *;
@use "/assets/scss/header" as *;
@use "/assets/scss/footer" as *;
@use "/assets/scss/index" as *;
@use "/assets/scss/about_us" as *;
@use "/assets/scss/catalog" as *;
@use "/assets/scss/card" as *;
@use "/assets/scss/contact" as *;
@use "/assets/scss/other" as *;
@use "/assets/scss/basket" as *;
@use "/assets/scss/admin" as *;
@use "/assets/scss/editor" as *;
</style>