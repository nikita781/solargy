<script setup>
import {nextTick, onMounted, ref} from "vue";
import axios from "axios";
import { useAsyncData } from '#app';

const { data: seos, error } = await useAsyncData("fetchSeos", () =>
    axios.get(`/seos`).then((res) => res.data)
);

const deliverySeo = ref(null);

const defaultSeo = {
  title: "SOLARGY SHOP - Световые панели для вашего дома и бизнеса",
  description: "SOLARGY SHOP предлагает световые панели высокого качества по доступным ценам. Энергосберегающие технологии, широкий ассортимент и доставка по всей России.",
  keywords: "световые панели, солнечные панели, энергосбережение, купить световые панели, панели для дома, панели для бизнеса, Solargy Shop, солнечные батареи, возобновляемая энергия",
  author: "Solargy"
};

if (seos.value) {
  deliverySeo.value = seos.value.find((seo) => seo.url === "stocks");

  if (deliverySeo.value) {
    const seoFields = deliverySeo.value.seos.reduce((acc, item) => {
      acc[item.name] = item.content;
      return acc;
    }, {});
    useHead({
      title: seoFields.title || defaultSeo.title,
      meta: [
        { name: "description", content: seoFields.description || defaultSeo.description },
        { name: "keywords", content: seoFields.keywords || defaultSeo.keywords },
        { name: "author", content: seoFields.author || defaultSeo.author },
      ],
    });
  } else {
    useHead({
      title: defaultSeo.title,
      meta: [
        { name: "description", content: defaultSeo.description },
        { name: "keywords", content: defaultSeo.keywords },
        { name: "author", content: defaultSeo.author },
      ],
    });
  }
} else {
  useHead({
    title: defaultSeo.title,
    meta: [
      { name: "description", content: defaultSeo.description },
      { name: "keywords", content: defaultSeo.keywords },
      { name: "author", content: defaultSeo.author },
    ],
  });
}


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
  if (!dateString) return '';

  const parts = dateString.split('-');
  if (parts.length < 2) return dateString;

  const [year, month, day = '01'] = parts;

  const dd = day.padStart(2, '0');
  const mm = month.padStart(2, '0');

  return `${dd}.${mm}.${year}`;
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

function generateSlug(name) {
  const cyrillicToLatinMap = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
    ы: 'y', э: 'e', ю: 'yu', я: 'ya', ъ: '', ь: ''
  };

  const transliterate = (str) => {
    return str
        .toLowerCase()
        .split('')
        .map(char => cyrillicToLatinMap[char] || char)
        .join('');
  };

  return transliterate(name)
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
}

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
        <div class="editor__content" v-html="section.html"></div>
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
        <template v-if="blocksNotArchive.length">
          <NuxtLink
              v-for="block in blocksNotArchive"
              :key="block.id"
              class="stocks__item"
              :to="`/promo/${block.id}-${generateSlug(block.title)}/`"
          >
            <div class="stocks__item_img">
              <NuxtImg format="webp" loading="lazy" preload :src="block.image" alt="" />
              <h3 class="stocks__item_title">{{ block.title }}</h3>
            </div>
            <div class="stocks__item_content">
              <p class="stocks__item_text">{{ block.description }}</p>
              <p class="stocks__item_data">До {{ convertDateToText(block.end) }}</p>
            </div>
          </NuxtLink>
        </template>

        <div v-else class="stocks__empty">
          <img src="/main_logo.png" alt="">
          Сейчас нет действующих акций
        </div>
      </div>

      <div v-if="activeTab === 1" class="card__tabs_info stocks__container">
        <template v-if="blocksArchive.length">
          <NuxtLink
              v-for="block in blocksArchive"
              :key="block.id"
              class="stocks__item"
              :to="`/promo/${block.id}-${generateSlug(block.title)}/`"
          >
            <div class="stocks__item_img">
              <NuxtImg format="webp" loading="lazy" preload :src="block.image" alt="" />
              <h3 class="stocks__item_title">{{ block.title }}</h3>
            </div>
            <div class="stocks__item_content">
              <p class="stocks__item_text">{{ block.description }}</p>
              <p class="stocks__item_data">До {{ convertDateToText(block.end) }}</p>
            </div>
          </NuxtLink>
        </template>

        <div v-else class="stocks__empty">
          <img src="/main_logo.png" alt="">
          Архивных акций пока нет
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.stocks__empty{
  width: 100%;
  padding: 24px;
  text-align: center;
  color: #EF7F1A;
  opacity: 0.8;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  img {
    width: 70px;
  }
}
</style>