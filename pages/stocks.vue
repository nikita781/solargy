<script setup>
import {nextTick, onMounted, ref} from "vue";

const tabs = [
  { title: 'Текущие акции' },
  { title: 'Архив' },
];

const activeTab = ref(0);

const setActiveTab = (index) => {
  activeTab.value = index;
};

const tabsRef = ref([]);
const sliderStyle = computed(() => {
  if (tabsRef.value.length === 0 || activeTab.value === null) return {};

  const activeTabElement = tabsRef.value[activeTab.value];
  const left = activeTabElement?.offsetLeft || 0;
  const width = activeTabElement?.offsetWidth || 0;

  return {
    left: `${left}px`,
    width: `${width}px`,
  };
});

onMounted(async () => {
  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });
});
</script>

<template>
<div class="stocks">
  <div class="stocks__main">
    <div class="stocks__main_links">
      <NuxtLink to="#" class="stocks__main_link">Главная</NuxtLink>
      <IconsSun color="#EF7F1A"/>
      <NuxtLink to="#" class="stocks__main_link stocks__main_link-active">Акции</NuxtLink>
    </div>
    <h2 class="main_title">Акции</h2>
    <div class="stocks__main_info">
      <p>В разделе «Акции» нашего сайта мы представляем специальные предложения, скидки и уникальные возможности для наших клиентов. Этот раздел создан для того, чтобы вы могли легко находить актуальные предложения и максимально выгодно использовать наши услуги.</p>
      <p>Чтобы нe пропустить выгодные предложения, следите за обновлениями в нащих соцсетях. Мы регулярно обновляем информацию о текущих акциях и добавляем новые предложения. Убедитесь, что вы подписаны на наши уведомления, чтобы первыми узнавать о лучших предложениях.</p>
      <p>Мы стремимся сделать ваши покупки не только выгодными, но и приятными. Не упустите возможность воспользоваться нашими акциями и сделайте свои покупки еще более выгодными!</p>
    </div>
  </div>
  <div class="stocks__content">
    <div class="card__tabs_cont">
      <p
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['card__tabs_item', { active: activeTab === index }]"
          @click="setActiveTab(index)"
      >
        {{ tab.title }}
      </p>
      <div
          class="slider"
          :style="sliderStyle"
      ></div>
    </div>

    <div class="card__tabs_content">
      <div v-if="activeTab === 0" class="card__tabs_info stocks__container">
        <div class="stocks__item">
          <div class="stocks__item_img">
            <img src="/88fd5ede88dad9778e8aad7637b43f43.jpg" alt="">
            <h3 class="stocks__item_title">Новогоднее чудо</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">При покупке до конца 2024 года действует скидка 10% на всю продукцию Solargy</p>
            <p class="stocks__item_data">До конца 2024 года</p>
          </div>
        </div>
        <div class="stocks__item">
          <div class="stocks__item_img">
            <img src="/c96980a170c0ee8c900f18e71bcaf52b.jpg" alt="">
            <h3 class="stocks__item_title">Установка в подарок!</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">При покупке грунтового Solargy SW F до конца ноября 2024 года установка совершенно бесплатно</p>
            <p class="stocks__item_data">До конца ноября 2024 года</p>
          </div>
        </div>
        <div class="stocks__item">
          <div class="stocks__item_img">
            <img src="/d6e5c63f4b58b44296cd88a901f8ea67.jpg" alt="">
            <h3 class="stocks__item_title">Распродажа световодово</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">Покупайте любые световоды с любыми параметрами со скидкой 20% до конца 2024 года</p>
            <p class="stocks__item_data">До конца 2024 года</p>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 1" class="card__tabs_info stocks__container">
        <div class="stocks__item">
          <div class="stocks__item_img">
            <img src="/d68c7e229a700b90b369e4e092b13554.jpg" alt="">
            <h3 class="stocks__item_title">Раздаем мерч</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">При покупке светоскопа до конца мая 2024 в подарок дарим футболку с фирменной символикой</p>
            <p class="stocks__item_data">До конца ноября 2024 года</p>
          </div>
        </div>
        <div class="stocks__item">
          <div class="stocks__item_img">
            <img src="/3ca6988e74abea824a3a7bca8b2c089c.jpg" alt="">
            <h3 class="stocks__item_title">Да будет свет!</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">Покупайте световые колодцы со скидкой 10% до конца марта, впустите свет в свой дом</p>
            <p class="stocks__item_data">До конца 2024 года</p>
          </div>
        </div>
        <div class="stocks__item">
          <div class="stocks__item_img">
            <img src="/d95f62426ad2d3de11731c89f6a84f39.jpg" alt="">
            <h3 class="stocks__item_title">Новый год с Solargy</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">При покупке до конца 2023 года действует скидка 10% на всю продукцию Solargy</p>
            <p class="stocks__item_data">До конца 2023 года</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>