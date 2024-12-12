<script setup>
import {nextTick, onMounted, ref} from "vue";
import axios from "axios";

const tabs = [
  { title: 'Текущие акции' },
  { title: 'Архив' },
];

const blocks = ref([]);
const blocksArchive = ref([]);

const fetchBlocks = async () => {
  try {
    const response = await axios.get(`/pages/1?is_archived=false`);
    blocks.value = response.data.sections;
    console.log(blocks.value)
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};
const fetchBlocksArchive = async () => {
  try {
    const response = await axios.get(`/pages/1?is_archived=true`);
    blocksArchive.value = response.data.sections;
    console.log(blocks.value)
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};

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
  await fetchBlocks();
  await fetchBlocksArchive();
  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });
});
</script>

<template>
<div class="stocks">
  <div class="stocks__main">
    <div class="stocks__main_links">
      <NuxtLink to="/" class="stocks__main_link">Главная</NuxtLink>
      <IconsSun color="#EF7F1A"/>
      <NuxtLink class="stocks__main_link stocks__main_link-active">Акции</NuxtLink>
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
        <div v-for="block in blocks" :key="block.id" class="stocks__item">
          <div class="stocks__item_img">
            <img :src="block.image" alt="">
            <h3 class="stocks__item_title">{{ block.title }}</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">{{ block.html }}</p>
            <p class="stocks__item_data">Срок действия уточните у менеджера</p>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 1" class="card__tabs_info stocks__container">
        <div v-for="block in blocksArchive" :key="block.id" class="stocks__item">
          <div class="stocks__item_img">
            <img :src="block.image" alt="">
            <h3 class="stocks__item_title">{{ block.title }}</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">{{ block.html }}</p>
            <p class="stocks__item_data">Срок действия уточните у менеджера</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>