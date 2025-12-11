<script setup>
import {computed, onMounted, ref} from "vue";
import axios from "axios";
import Option from "~/components/Admin/option.vue";
import EditorProd from "~/components/UI/editorProd.vue";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchNews();
    await fetchStocks();
  }
});

const isLoading = ref(false);

const errors = ref({
  nameNews: false,
  photoNews: false,
  newsType: false,
  newsStock: false,
  newsPinned: false,
});

const newsPinned = ref('');
const todayStr = new Date().toISOString().split('T')[0];

const page = ref(1);
const totalPages = ref(0);
const itemsPerPage = 10;

const news = ref([]);

const fetchNews = async () => {
  try {
    const response = await axios.get(`/news?per_page=${itemsPerPage}&page=${page.value}`);
    totalPages.value = response.data.meta.last_page || 0;
    news.value = response.data.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const nameNews = ref('');
const fileNews = ref(null);
const previewImageNews = ref(null);
const newsPhoto = ref(null);
const newsDescription = ref(null);
const newsType = ref(null);
const newsStock = ref(null);
const newsVideo = ref('');
const currentNewsId = ref(null)

const stocks = ref(null);

const fetchStocks = async () => {
  try {
    const response = await axios.get(`/promos`, {
      headers: {},
    });
    stocks.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const visibleDialogAdd = ref(false);
const openDialogAdd = () => {
  visibleDialogAdd.value = true;
};
const closeDialogAdd = () => {
  visibleDialogAdd.value = false;
};

const visibleDialogUpdate = ref(false);
const openDialogUpdate = () => {
  visibleDialogUpdate.value = true;
};
const closeDialogUpdate = () => {
  visibleDialogUpdate.value = false;
  resetNews();
};

const handleExportHtmlPropertie = (html) => {
  newsDescription.value = html;
};
const handleFileChangeNews = (event) => {
  const file = event.target.files[0];
  if (file) {
    newsPhoto.value = file;
    previewImageNews.value = URL.createObjectURL(file);
  }
};

const createNews = async () => {
  isLoading.value = true;

  errors.value.nameNews = false;
  errors.value.photoNews = false;
  errors.value.newsType = false;
  errors.value.newsStock = false;
  errors.value.newsPinned = false;

  errors.value.nameNews = !nameNews.value;
  errors.value.photoNews = !newsPhoto.value;
  errors.value.newsStock = newsType.value === 'Акция' && !newsStock.value;
  errors.value.newsType = !newsType.value;

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  if (newsPinned.value && newsPinned.value < formattedDate) {
    errors.value.newsPinned = true;
    isLoading.value = false;
    return;
  }

  if (nameNews.value && newsPhoto.value && newsType.value && !errors.value.newsPinned) {
    try {
      const formData = new FormData();
      formData.append('title', nameNews.value);
      formData.append('image', newsPhoto.value);
      formData.append('type', newsType.value);

      if (newsType.value === "Акция" && newsStock.value) {
        formData.append('promo_id', newsStock.value);
      }

      formData.append('date', formattedDate);

      if (newsPinned.value) {
        formData.append('pinned_until', newsPinned.value);
      }

      if (newsVideo.value) {
        formData.append('video', newsVideo.value);
      }

      formData.append('html', newsDescription.value);

      await axios.post(`/news`, formData, {
        headers: {},
      });
      await fetchNews();
      resetNews();
      closeDialogAdd();
    } catch (error) {
      console.error('Ошибка:', error.response?.data || error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
};

const updateNews = async () => {
  isLoading.value = true;

  errors.value.nameNews = false;
  errors.value.newsStock = false;
  errors.value.newsPinned = false;

  errors.value.nameNews = !nameNews.value;
  errors.value.newsStock = newsType.value === 'Акция' && !newsStock.value;

  const formattedToday = new Date().toISOString().split('T')[0];

  if (newsPinned.value && newsPinned.value < formattedToday) {
    errors.value.newsPinned = true;
    isLoading.value = false;
    return;
  }

  if (nameNews.value && !errors.value.newsPinned) {
    try {
      const formData = new FormData();
      formData.append('title', nameNews.value);

      if (newsPhoto.value) {
        formData.append('image', newsPhoto.value);
      }

      formData.append('type', newsType.value);

      if (newsVideo.value) {
        formData.append('video', newsVideo.value);
      }

      if (newsType.value === "Акция" && newsStock.value) {
        formData.append('promo_id', newsStock.value);
      }

      if (newsPinned.value) {
        formData.append('pinned_until', newsPinned.value);
      }

      formData.append('html', newsDescription.value);

      await axios.post(`/news/${currentNewsId.value}?_method=patch`, formData, {
        headers: {},
      });
      await fetchNews();
      resetNews();
      closeDialogUpdate();
    } catch (error) {
      console.error('Ошибка:', error.response?.data || error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
};

const editNews = (news) => {
  console.log(news)
  openDialogUpdate();
  currentNewsId.value = news.id;
  nameNews.value = news.title;
  newsVideo.value = news.video;
  previewImageNews.value = news.image;
  newsDescription.value = news.html;
  newsType.value = news.type;
  newsStock.value = news.promo_id;
  newsPinned.value = formatFromBackend(news.pinned_until);

  errors.value.nameNews = false;
  errors.value.photoNews = false;
  errors.value.newsType = false;
  errors.value.newsStock = false;
  errors.value.newsPinned = false;
};

const resetNews = () => {
  currentNewsId.value = null;
  nameNews.value = '';
  newsVideo.value = '';
  fileNews.value = null;
  previewImageNews.value = null;
  newsPhoto.value = null;
  newsDescription.value = null;
  newsType.value = null;
  newsStock.value = null;
  newsPinned.value = '';

  errors.value.nameNews = false;
  errors.value.photoNews = false;
  errors.value.newsType = false;
  errors.value.newsStock = false;
  errors.value.newsPinned = false;
};

const deleteNews = async (idValue) => {
  isLoading.value = true;
  try {
    await axios.delete(`/news/${idValue}`, {
      headers: {},
    });
    await fetchNews();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};

const formatFromBackend = (dateStr) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const formatToBackend = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
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

</script>

<template>
  <div class="admin-panel__content admin-panel__content-prod">
    <h2>Управление блогом / новостями</h2>
    <button class="main_btn" @click="openDialogAdd" style="width: fit-content">Создать запись</button>
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
        <th style="width: 100px">Удалить</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="nw in paginatedNews" :key="nw.id">
        <td>{{ nw.title }}</td>
        <td>
          <img v-if="nw.image" :src="nw.image" alt="Фото" width="50"/>
        </td>
        <td>{{nw.video}}</td>
        <td>{{nw.date}}</td>
        <td>{{nw.pinned_until}}</td>
        <td>{{nw.type}}</td>
        <td>
          <button @click="editNews(nw)" class="admin-panel__content_btn">Изменить</button>
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
    <div class="admin__dialog" v-if="visibleDialogAdd" @click="closeDialogAdd">
      <div class="admin__dialog_container" @click.stop>
        <h3 style="margin: 0">Создание записи</h3>
        <form class="admin-panel__content_form-dialog" @submit.prevent="createNews">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="nameNews"
              placeholder="Введите заголовок"
              :class="{ error: errors.nameNews }"
          />
          <div class="input__wrapper">
            <input ref="fileNews" type="file" id="input__file" class="input input__file"
                   @change="handleFileChangeNews" accept="image/*" multiple>
            <label for="input__file" class="input__file-button" :class="{ error: errors.photoNews }">
          <span class="input__file-icon-wrapper">
            <img v-if="previewImageNews" class="input__file-icon" :src="previewImageNews" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
              <span class="input__file-button-text">Выберите картинку</span>
            </label>
          </div>
          Категория
          <select v-model="newsType" :class="{ error: errors.newsType }" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите категорию</option>
            <option value="Новости">
              Новости
            </option>
            <option value="Блог">
              Блог
            </option>
            <option value="Акция">
              Акция
            </option>
          </select>
          <p v-if="newsType === 'Акция'">Привязка к акции</p>
          <select v-if="newsType === 'Акция'" :class="{ error: errors.newsStock }" v-model="newsStock" class="basket__form_input admin-panel__content_select">
            <option v-for="stock in stocks" :value="stock.id">
              {{ stock.title }}
            </option>
          </select>
          Отображение на главной до (необязательный параметр, по умолчанию месяц)
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="newsPinned"
              :min="todayStr"
              :class="{ error: errors.newsPinned }"
          />
          Видео в шапку (необязательный параметр)
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="newsVideo"
              placeholder="Введите ссылку на VK video"
          />
          <div class="editor__dialog">
            <EditorProd class="editor__dialog" @export-html="handleExportHtmlPropertie"/>
          </div>
          <button
              class="main_btn"
              type="submit"
              :disabled="isLoading"
              :class="{ 'loading': isLoading }"
              :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
          >
            <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
            <span v-else>Создать запись</span>
          </button>
        </form>
      </div>
    </div>
    <div class="admin__dialog" v-if="visibleDialogUpdate" @click="closeDialogUpdate">
      <div class="admin__dialog_container" @click.stop>
        <h3 style="margin: 0">Изменение записи</h3>
        <form class="admin-panel__content_form-dialog" @submit.prevent="updateNews">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="nameNews"
              placeholder="Введите заголовок"
              :class="{ error: errors.nameNews }"
          />
          <div class="input__wrapper">
            <input ref="fileNews" type="file" id="input__file" class="input input__file"
                   @change="handleFileChangeNews" accept="image/*" multiple>
            <label for="input__file" class="input__file-button" :class="{ error: errors.photoNews }">
          <span class="input__file-icon-wrapper">
            <img v-if="previewImageNews" class="input__file-icon" :src="previewImageNews" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
              <span class="input__file-button-text">Выберите картинку</span>
            </label>
          </div>
          Категория
          <select v-model="newsType" :class="{ error: errors.newsType }" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите категорию</option>
            <option value="Новости">
              Новости
            </option>
            <option value="Блог">
              Блог
            </option>
            <option value="Акция">
              Акция
            </option>
          </select>
          Привязка к акции
          <select v-if="newsType === 'Акция'" :class="{ error: errors.newsStock }" v-model="newsStock" class="basket__form_input admin-panel__content_select">
            <option v-for="stock in stocks" :value="stock.id">
              {{ stock.title }}
            </option>
          </select>
          Отображение на главной до (необязательный параметр, по умолчанию месяц)
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="newsPinned"
              :min="todayStr"
              :class="{ error: errors.newsPinned }"
          />
          Видео в шапку (необязательный параметр)
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="newsVideo"
              placeholder="Введите ссылку на VK video"
          />
          <div class="editor__dialog">
            <EditorProd class="editor__dialog" @export-html="handleExportHtmlPropertie" :initialHtml="newsDescription" />
          </div>
          <button
              class="main_btn"
              type="submit"
              :disabled="isLoading"
              :class="{ 'loading': isLoading }"
              :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
          >
            <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
            <span v-else>Изменить запись</span>
          </button>
        </form>
      </div>
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