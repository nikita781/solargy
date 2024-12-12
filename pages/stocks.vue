<script setup>
import {nextTick, onMounted, ref} from "vue";
import axios from "axios";

const tabs = [
  { title: 'Текущие акции' },
  { title: 'Архив' },
];

const blocks = ref([]);
const blocksNotArchive = ref([]);
const blocksArchive = ref([]);

const sections = ref([]);

const fetchBlocks = async () => {
  try {
    const response = await axios.get(`/promos`);
    blocks.value = response.data;
    blocksNotArchive.value = blocks.value.filter((block) => !block.is_archived);
    blocksArchive.value = blocks.value.filter((block) => block.is_archived);
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};

const fetchSection = async () => {
  try {
    const response = await axios.get(`/pages/1`);
    sections.value = response.data.sections;
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};

const activeTab = ref(0);

const setActiveTab = (index) => {
  activeTab.value = index;
};

const convertDateToText = (dateString) => {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];

  const [year, month] = dateString.split('-').map(Number);
  const monthName = months[month - 1];

  return `До конца ${monthName} ${year} года`;
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
  await fetchSection();
  await fetchBlocks();
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
      <div  v-for="(section, index) in sections" :key="index">
        <p v-html="section.html"></p>
      </div>
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
        <div v-for="block in blocksNotArchive" :key="block.id" class="stocks__item">
          <div class="stocks__item_img">
            <img :src="block.image" alt="">
            <h3 class="stocks__item_title">{{ block.title }}</h3>
          </div>
          <div class="stocks__item_content">
            <p class="stocks__item_text">{{ block.description }}</p>
            <p class="stocks__item_data">{{ convertDateToText(block.end) }}</p>
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
            <p class="stocks__item_text">{{ block.description }}</p>
            <p class="stocks__item_data">{{ convertDateToText(block.end) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>