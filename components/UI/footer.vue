<script setup>

</script>

<template>
  <footer class="footer">
    <div class="footer__social">
      <div class="footer__social_logo">
        <IconsLogo color="#fff"/>
        <p class="footer__social_info">г. Ижевск, Проспект конструктора М.Т. Калашникова,7</p>
      </div>
      <div class="footer__social_content">
        <div class="footer__social_item">
          <p class="footer__social_item_text">Мы в соцсетях</p>
          <div class="footer__social_container">
            <IconsVk />
            <IconsTg />
          </div>
        </div>
        <div class="footer__social_item">
          <p class="footer__social_item_text">Мы на маркетплейсах</p>
          <div class="footer__social_container">
            <IconsOzon />
            <IconsYa />
          </div>
        </div>
      </div>
    </div>
    <div class="footer__catalog">
      <div class="footer__catalog_item">
        <p class="footer__catalog_title">Покупателям</p>
        <NuxtLink class="footer__catalog_link">Акции</NuxtLink>
        <NuxtLink class="footer__catalog_link">Где купить?</NuxtLink>
        <NuxtLink class="footer__catalog_link">Доставка</NuxtLink>
      </div>
      <div class="footer__catalog_item">
        <p class="footer__catalog_title">Навигация</p>
        <NuxtLink to="/" class="footer__catalog_link">Главная</NuxtLink>
        <NuxtLink class="footer__catalog_link">О нас</NuxtLink>
        <NuxtLink class="footer__catalog_link">Каталог</NuxtLink>
        <NuxtLink class="footer__catalog_link">Контакты</NuxtLink>
      </div>
      <div class="footer__catalog_item">
        <p class="footer__catalog_title">Каталог</p>
        <NuxtLink class="footer__catalog_link">Светопроводящие системы</NuxtLink>
        <NuxtLink class="footer__catalog_link">Солнцезащитные устройства</NuxtLink>
        <NuxtLink class="footer__catalog_link">Дополнительные товары</NuxtLink>
      </div>
      <div class="footer__catalog_phone">
        <div class="footer__catalog_item">
          <p class="footer__catalog_title">Связаться с нами</p>
          <NuxtLink to="tel: +78002000602" class="footer__catalog_link">8(800) 200 06 02</NuxtLink>
          <NuxtLink class="footer__catalog_link">info@solargy.ru</NuxtLink>
        </div>
      </div>
    </div>
    <p class="footer__end footer__social_info">Производитель световодов, мансардных фонарей, зенитных фонарей SOLARGY ООО «Соларжи 18», 2024. Все права защищены.
    </p>
  </footer>
</template>

<style scoped lang="scss">

</style>