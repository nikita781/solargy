<script setup>
const pageData = useState('pageData');
</script>

<template>
  <div class="container">
    <UIHeader />

    <div class="container-content">
      <div class="container-content__page">
        <NuxtPage :style="{ display: pageData ? 'none' : '' }" />
      </div>

      <UIFooter :style="{ display: pageData ? 'none' : 'flex' }" />
    </div>

    <UICookieConsent v-if="!pageData" policy-url="/privacy-policy" />

    <noscript>
      <div>
        <img src="https://mc.yandex.ru/watch/100325209" style="position:absolute; left:-9999px;" alt="" />
      </div>
    </noscript>
  </div>
</template>
