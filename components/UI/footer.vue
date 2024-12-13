<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

const tabs = ref([]);
const fetchTabs = async () => {
  try {
    const response = await axios.get('/categories');
    tabs.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error.response?.data || error);
  }
};

const place = ref([]);
const marketplacesPlace = ref([]);

const fetchPlace = async () => {
  try {
    const response = await axios.get(`/purchase-place`);
    place.value = response.data;
    marketplacesPlace.value = place.value.filter((item) => item.type === "marketplace" && item.image !== null);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const socials = ref([]);

const fetchSocials = async () => {
  try {
    const response = await axios.get(`/socials`);
    socials.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const contacts = ref([]);
const fetchContact = async () => {
  try {
    const response = await axios.get(`/contacts`);
    contacts.value = response.data[0];
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

function generateSlug(name) {
  return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
}

onMounted(() => {
  fetchContact();
  fetchSocials();
  fetchPlace();
  fetchTabs();
});
</script>

<template>
  <footer class="footer">
    <div class="footer__social">
      <div class="footer__social_logo">
        <IconsLogo color="#fff"/>
        <p class="footer__social_info">{{ contacts.address }}</p>
      </div>
      <div class="footer__social_content">
        <div class="footer__social_item">
          <p class="footer__social_item_text">Мы в соцсетях</p>
          <div class="footer__social_container">
<!--            <IconsVk />-->
<!--            <IconsTg />-->
            <div
                v-for="place in socials"
                :key="place.id"
            >
              <NuxtLink :to="place.url">
                <img :src="place.image" alt="">
              </NuxtLink>
            </div>
          </div>
        </div>
        <div class="footer__social_item">
          <p class="footer__social_item_text">Мы на маркетплейсах</p>
          <div class="footer__social_container">
<!--            <IconsOzon />-->
<!--            <IconsYa />-->
            <div
                v-for="place in marketplacesPlace"
                :key="place.id"
            >
              <NuxtLink :to="place.url">
                <img :src="place.image" alt="">
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer__catalog">
      <div class="footer__catalog_item">
        <p class="footer__catalog_title">Покупателям</p>
        <NuxtLink to="/stocks" class="footer__catalog_link">Акции</NuxtLink>
        <NuxtLink to="/order" class="footer__catalog_link">Где купить?</NuxtLink>
        <NuxtLink to="/delivery" class="footer__catalog_link">Доставка</NuxtLink>
      </div>
      <div class="footer__catalog_item">
        <p class="footer__catalog_title">Навигация</p>
        <NuxtLink to="/" class="footer__catalog_link">Главная</NuxtLink>
        <NuxtLink to="/about_us" class="footer__catalog_link">О нас</NuxtLink>
        <NuxtLink to="/catalog" class="footer__catalog_link">Каталог</NuxtLink>
        <NuxtLink to="/contact" class="footer__catalog_link">Контакты</NuxtLink>
      </div>
      <div class="footer__catalog_item">
        <p class="footer__catalog_title">Каталог</p>
        <NuxtLink
            v-for="tab in tabs"
            :key="tab.id"
            class="footer__catalog_link"
            :to="`/catalog/${tab.id}-${generateSlug(tab.name)}/`"
        >
          {{ tab.name }}
        </NuxtLink>
      </div>
      <div class="footer__catalog_phone">
        <div class="footer__catalog_item">
          <p class="footer__catalog_title">Связаться с нами</p>
          <NuxtLink  class="footer__catalog_link">{{ contacts.phone }}</NuxtLink>
          <NuxtLink  class="footer__catalog_link">{{ contacts.email }}</NuxtLink>
        </div>
      </div>
    </div>
    <p class="footer__end footer__social_info">Производитель световодов, мансардных фонарей, зенитных фонарей SOLARGY ООО «Соларжи 18», 2024. Все права защищены.
    </p>
  </footer>
</template>

<style scoped lang="scss">

</style>