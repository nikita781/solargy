<template>
  <NuxtLayout>
  </NuxtLayout>
</template>

<script setup>
import axios from 'axios';

axios.defaults.baseURL = 'https://api.solargy.shop/api';

import {useBasketStore} from '@/stores/basket';
const basketStore = useBasketStore();
if (process.client) {
  basketStore.loadBasketFromStorage();
}
</script>

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
@use "/assets/scss/search" as *;
@use "/assets/scss/promo" as *;
@use "/assets/scss/news" as *;
</style>