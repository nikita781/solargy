<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

const route = useRoute();
const searchQueryFull = ref(route.query.q || "");
const searchResultFull = ref([]);

const handleSearchFull = async () => {
  if (!searchQueryFull.value) return;

  try {
    const response = await axios.get(`/search?q=${searchQueryFull.value}`);
    searchResultFull.value = response.data;
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error);
  }
};

const urls = ref({}); // Хранилище для URL

const getUrl = async (page_id) => {
  try {
    const response = await axios.get(`/pages/${page_id}`);
    return response.data.url;
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error);
    return ""; // Возвращаем пустую строку в случае ошибки
  }
};

const fetchUrls = async () => {
  if (searchResultFull.value.pages) {
    const urlPromises = searchResultFull.value.pages.map(async (page) => {
      const url = await getUrl(page.page_id);
      return { page_id: page.page_id, url };
    });

    const resolvedUrls = await Promise.all(urlPromises);
    urls.value = Object.fromEntries(
        resolvedUrls.map(({ page_id, url }) => [page_id, url])
    );
  }
};

watch(searchResultFull, fetchUrls, { immediate: true });

const resetInput = () => {
  searchQueryFull.value = "";
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

watch(
    () => route.query.q,
    (newQuery) => {
      searchQueryFull.value = newQuery || "";
      if (newQuery) {
        handleSearchFull();
      }
    },
    { immediate: true }
);
</script>

<template>
  <div class="search">
    <div class="search__cont">
      <div class="search__form">
        <input
            class="search__form_input"
            v-model="searchQueryFull"
            name="search"
            type="text"
            placeholder="Искать"
            @keydown.enter="handleSearchFull"
        />
        <IconsCross color="#EF7F1A" @click="resetInput" />
      </div>
      <div class="main_btn search__form_btn" @click="handleSearchFull">Искать</div>
    </div>

    <div class="search__results">
      <div class="header__menu_title">
        <h3>Категории</h3>
        <p>{{ searchResultFull?.categories?.length }}</p>
      </div>
      <div class="header__menu_container-search-cont">
        <div
            v-if="searchResultFull?.categories"
            v-for="(search, index) in searchResultFull?.categories"
            :key="index"
            class="header__menu_container-search"
        >
          <NuxtLink
              class="header__menu_container-search"
              :to="`/catalog/${search.id}-${generateSlug(search.name)}/`"
          >
            <NuxtImg format="webp" preload :src="search.photo" alt=""/>
            <p class="header__menu_name">{{ search.name }}</p>
          </NuxtLink>
        </div>
      </div>
      <div class="header__menu_title">
        <h3>Товары</h3>
        <p>{{ searchResultFull?.products?.length }}</p>
      </div>
      <div class="header__menu_container-search-cont">
        <div
            v-if="searchResultFull?.products"
            v-for="(search, index) in searchResultFull?.products"
            :key="index"
            class="header__menu_container-search"
        >
          <NuxtLink
              class="header__menu_container-search"
              :to="`/card/${search.id}-${generateSlug(search.name)}/`"
          >
            <NuxtImg format="webp" preload :src="search?.photos[0]?.photo" alt=""/>
            <p class="header__menu_name">{{ search.name }}</p>
          </NuxtLink>
        </div>
      </div>
      <div class="header__menu_title">
        <h3>Страницы</h3>
        <p>{{ searchResultFull?.pages?.length }}</p>
      </div>
      <div class="header__menu_container-search-cont">
        <div
            v-if="searchResultFull?.pages"
            v-for="(search, index) in searchResultFull?.pages"
            :key="index"
            class="header__menu_container-search"
        >
          <NuxtLink
              class="header__menu_container-search"
              :to="`/${urls[search.page_id]}`"
          >
            <NuxtImg format="webp" preload :src="search.image" alt=""/>
            <p class="header__menu_name">{{ search.title }}</p>
          </NuxtLink>
        </div>
      </div>
      <div class="header__menu_title">
        <h3>Активные акции</h3>
        <p>{{ searchResultFull?.newPromos?.length }}</p>
      </div>
      <div class="header__menu_container-search-cont">
        <div
            v-if="searchResultFull?.newPromos"
            v-for="(search, index) in searchResultFull?.newPromos"
            :key="index"
            class="header__menu_container-search"
        >
          <NuxtLink
              class="header__menu_container-search"
              :to="`/promo/${search.id}-${generateSlug(search.title)}/`"
          >
            <NuxtImg format="webp" preload :src="search.image" alt=""/>
            <div class="header__menu_container-search-info">
              <p class="header__menu_name">{{ search.title }}</p>
              <p class="header__menu_data">{{ convertDateToText(search.end) }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
      <div class="header__menu_title">
        <h3>Архивные акции</h3>
        <p>{{ searchResultFull?.archivePromos?.length }}</p>
      </div>
      <div class="header__menu_container-search-cont">
        <div
            v-if="searchResultFull?.archivePromos"
            v-for="(search, index) in searchResultFull?.archivePromos"
            :key="index"
            class="header__menu_container-search"
        >
          <NuxtLink
              class="header__menu_container-search"
              :to="`/promo/${search.id}-${generateSlug(search.title)}/`"
          >
            <NuxtImg format="webp" preload :src="search.image" alt=""/>
            <div class="header__menu_container-search-info">
              <p class="header__menu_name">{{ search.title }}</p>
              <p class="header__menu_data">{{ convertDateToText(search.end) }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
      <div class="header__menu_title">
        <h3>Новости</h3>
        <p>{{ searchResultFull?.news?.length }}</p>
      </div>
      <div class="header__menu_container-search-cont">
        <div
            v-if="searchResultFull?.news"
            v-for="(search, index) in searchResultFull?.news"
            :key="index"
            class="header__menu_container-search"
        >
          <NuxtLink
              class="header__menu_container-search"
              :to="`/news/${search.id}-${generateSlug(search.title)}/`"
          >
            <NuxtImg format="webp" preload :src="search.image" alt=""/>
            <div class="header__menu_container-search-info">
              <p class="header__menu_name">{{ search.title }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>