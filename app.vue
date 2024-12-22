<template>
  <NuxtLayout>
  </NuxtLayout>
</template>

<script setup>
import axios from 'axios';

//async function onCreate() {
//  await axios.get('http://localhost:8000/sanctum/csrf-cookie', );
//  await axios.post('http://localhost:8000/api/register', {
//    name: form.value.name,
//    email: form.value.email,
//    password: form.value.password
//});
//
//  let { data } = await axios.get('http://localhost:8000/api/user');
//  user.value = data;
//}

axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
// axios.defaults.withCredentials = true;
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
</style>