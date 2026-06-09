<script setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import NewsDialog from "~/components/Admin/NewsDialog.vue";

onMounted(async () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await fetchNews();
    await fetchStocks();
    await fetchAllProductsFull();
  }
});

const isLoading = ref(false);

const page = ref(1);
const totalPages = ref(0);
const itemsPerPage = 10;

const news = ref([]);
const stocks = ref([]);
const allProductsFull = ref([]);

const fetchNews = async ({ bust = false } = {}) => {
  const ts = bust ? `&_=${Date.now()}` : "";
  const resp = await axios.get(
      `/news?per_page=${itemsPerPage}&page=${page.value}${ts}`,
      { headers: { "Cache-Control": "no-cache" } }
  );

  totalPages.value = resp.data.meta.last_page || 0;
  news.value = resp.data.data;
};

const fetchStocks = async () => {
  const resp = await axios.get(`/promos`);
  stocks.value = resp.data;
};

const fetchAllProductsFull = async () => {
  const resp = await axios.get(`/products-for-select`);
  allProductsFull.value = resp.data;
};

const paginatedNews = computed(() => news.value.slice(0, itemsPerPage));
const goToPage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchNews();
  }
};

const visibleDialog = ref(false);
const dialogMode = ref("create");
const dialogNewsId = ref(null);
const dialogSeed = ref(null);

const openCreate = () => {
  dialogMode.value = "create";
  dialogNewsId.value = null;
  dialogSeed.value = null;
  visibleDialog.value = true;
};

const openEdit = (nw) => {
  dialogMode.value = "edit";
  dialogNewsId.value = nw.id;
  dialogSeed.value = null;
  visibleDialog.value = true;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const duplicateNews = async (nw) => {
  isLoading.value = true;
  try {
    const topBefore = news.value?.[0]?.id;

    const resp = await axios.post(`/news/${nw.id}/duplicate`);

    page.value = 1;

    const newId = resp?.data?.id ?? null;

    for (let i = 0; i < 8; i++) {
      await fetchNews({ bust: true });

      const appeared = newId
          ? news.value?.some((n) => n.id === newId)
          : (news.value?.[0]?.id && news.value?.[0]?.id !== topBefore);

      if (appeared) break;

      await sleep(250);
    }

    const fallbackId = news.value?.[0]?.id;
    const idToOpen = newId || fallbackId;
    if (!idToOpen) return;

    dialogMode.value = "edit";
    dialogNewsId.value = idToOpen;
    dialogSeed.value = null;
    visibleDialog.value = true;
  } catch (e) {
    console.error("Ошибка дублирования новости:", e?.response?.data || e);
  } finally {
    isLoading.value = false;
  }
};


const deleteNews = async (id) => {
  isLoading.value = true;
  try {
    await axios.delete(`/news/${id}`);
    await fetchNews();
  } finally {
    isLoading.value = false;
  }
};

const onSaved = async () => {
  await fetchNews();
};
</script>

<template>
  <div class="admin-panel__content admin-panel__content-prod">
    <h2>Управление блогом / новостями</h2>

    <button class="main_btn" @click="openCreate" style="width: fit-content">Создать запись</button>

    <table>
      <thead>
      <tr>
        <th>Название</th>
        <th>Фото</th>
        <th>Видео</th>
        <th>Дата</th>
        <th>На главной до</th>
        <th>Тип</th>
        <th style="width: 100px">Изменить</th>
        <th style="width: 110px">Дублировать</th>
        <th style="width: 100px">Удалить</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="nw in paginatedNews" :key="nw.id">
        <td>{{ nw.title }}</td>
        <td><img v-if="nw.image" :src="nw.image" alt="Фото" width="50"/></td>
        <td>{{ nw.video }}</td>
        <td>{{ nw.date }}</td>
        <td>{{ nw.pinned_until }}</td>
        <td>{{ nw.type }}</td>

        <td>
          <button @click="openEdit(nw)" class="admin-panel__content_btn">Изменить</button>
        </td>

        <td>
          <button @click="duplicateNews(nw)" class="admin-panel__content_btn" :disabled="isLoading">
            Дублировать
          </button>
        </td>

        <td>
          <button @click="deleteNews(nw.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>

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

    <NewsDialog
        v-model="visibleDialog"
        :mode="dialogMode"
        :news-id="dialogNewsId"
        :seed="dialogSeed"
        :promos="stocks"
        :all-products="allProductsFull"
        @saved="onSaved"
    />
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
  margin-bottom: 70px;
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