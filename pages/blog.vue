<script setup>
import {computed, onMounted, ref} from 'vue';
import axios from "axios";
import {useRoute, useRouter} from "#vue-router";
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
  deliverySeo.value = seos.value.find((seo) => seo.url === "blog");

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

const route = useRoute();
const router = useRouter();
const newsId = ref(null);
const activeFilter = ref('Все');

const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  fetchNews();
};

const page = ref(1);
const totalPages = ref(0);
const itemsPerPage = 6;

const news = ref([]);

const fetchNews = async () => {
  if (activeFilter.value === "Все") {
    try {
      const response = await axios.get(`/news?page=${page.value}`);
      totalPages.value = response.data.meta.last_page || 0;
      news.value = response.data.data;
    } catch (error) {
      console.error('Ошибка:', error.response?.data || error);
    }
  } else {
    try {
      const response = await axios.get(`/news?page=${page.value}&type=${activeFilter.value}`);
      totalPages.value = response.data.meta.last_page || 0;
      news.value = response.data.data;
    } catch (error) {
      console.error('Ошибка:', error.response?.data || error);
    }
  }
};

const paginatedNews = computed(() => news.value.slice(0, itemsPerPage));

const goToPage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchNews();
  }
};

const pagesInRange = computed(() => {
  const range = [];
  const start = Math.max(2, page.value - 4);
  const end = Math.min(totalPages.value - 1, page.value + 4);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
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

watch(() => route.fullPath, () => {
  const newsIdURL = route.params.blogId;
  if (newsIdURL) {
    activeFilter.value = newsIdURL;
  }
  fetchNews();
});
onMounted( () => {
  const newsIdURL = route.params.blogId;
  if (newsIdURL) {
    activeFilter.value = newsIdURL;
  }
  fetchNews();
});
</script>

<template>
  <div class="blog">
    <div class="blog__filter">
      <p
          class="blog__filter_item"
          :class="{ active: activeFilter === 'Все' }"
          @click="setActiveFilter('Все')"
      >
        Все
      </p>
      <p
          class="blog__filter_item"
          :class="{ active: activeFilter === 'Новости' }"
          @click="setActiveFilter('Новости')"
      >
        Новости
      </p>
      <p
          class="blog__filter_item"
          :class="{ active: activeFilter === 'Блог' }"
          @click="setActiveFilter('Блог')"
      >
        Блог
      </p>
    </div>
    <div class="blog__container">
      <NuxtLink
          class="news-card"
          v-for="(blog, index) in paginatedNews"
          :key="index"
          :to="`/news/${blog.id}-${generateSlug(blog.title)}/`"
      >
        <div class="news-card__header">
          <NuxtImg format="webp" preload loading="lazy" class="news-card__photo" :src="blog.image" alt=""/>
          <div class="news-card__title_cont">
            <p class="news-card__title">{{blog.title}}</p>
          </div>
        </div>
        <div class="news-card__footer">
          <p class="news-card__type">{{ blog.type }}</p>
          <p class="news-card__date">{{ blog.date }}</p>
        </div>
      </NuxtLink>
    </div>
    <div class="pagination" v-if="totalPages > 1">
      <button
          class="arrow-left"
          @click="goToPage(page - 1)"
          :disabled="page === 1"
      >
      </button>
      <span
          class="pagination__number"
          :class="{ active: page === 1 }"
          @click="goToPage(1)"
      >
        1
      </span>
      <span v-if="page > 6">...</span>
      <span
          v-for="pageNum in pagesInRange"
          :key="pageNum"
          class="pagination__number"
          :class="{ active: pageNum === page }"
          @click="goToPage(pageNum)"
      >
        {{ pageNum }}
      </span>
      <span v-if="page < totalPages - 5">...</span>
      <span
          class="pagination__number"
          :class="{ active: page === totalPages }"
          @click="goToPage(totalPages)"
      >
        {{ totalPages }}
      </span>
      <button
          class="arrow-right"
          @click="goToPage(page + 1)"
          :disabled="page === totalPages"
      >
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
$x-small: 575.98px;
$small: 767.98px;
$medium: 991.98px;
$large: 1199.98px;
$x-large: 1399.98px;
$big: 1592.98px;
$x-big: 1829.98px;
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  @media screen and (max-width: $medium) {
    margin-bottom: 40px;
  }
  @media screen and (max-width: $small) {
    gap: 6px;
  }

  .arrow-left {
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 15px;
    height: 19px;
    outline: none;
    border: none;
    transform: rotate(90deg);
    background-color: transparent;
    margin-right: 10px;
    @media screen and (max-width: $small) {
      transform: rotate(90deg) scale(0.8);
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 3px;
      height: 100%;
      background-color: #EF7F1A;
    }

    &::before {
      transform: rotate(-45deg);
      left: 0;
      top: 0;
    }

    &::after {
      transform: rotate(45deg);
      right: 0;
      top: 0;
    }
  }

  .arrow-right {
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 15px;
    height: 19px;
    outline: none;
    border: none;
    transform: rotate(-90deg);
    background-color: transparent;
    margin-left: 10px;
    @media screen and (max-width: $small) {
      transform: rotate(-90deg) scale(0.8);
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 3px;
      height: 100%;
      background-color: #EF7F1A;
    }

    &::before {
      transform: rotate(-45deg);
      left: 0;
      top: 0;
    }

    &::after {
      transform: rotate(45deg);
      right: 0;
      top: 0;
    }
  }

  &__number {
    font-size: 20px;
    margin: 0 5px;
    cursor: pointer;
    color: #9B9B9B;
    @media screen and (max-width: $small) {
      font-size: 16px;
    }

    &.active {
      color: #EF7F1A;
    }
  }
}
</style>