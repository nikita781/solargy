<script setup>
import Editor from "~/components/editor.vue";
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchSeos();
  }
});

const isLoading = ref(false);

const errors = ref({
  pageSeo: false,
  nameSeo: false,
  contentSeo: false,
});

const seos = ref([]);
const isEditingSeo = ref(false);
const pageSeo = ref(null);
const nameSeo = ref(null);
const contentSeo = ref('');
const currentSeoId = ref(null);
const currentSeoValueId = ref(null);

const fetchSeos = async () => {
  try {
    const response = await axios.get(`/seos`, {
      headers: {},
    });
    seos.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const createSeo = async () => {
  isLoading.value = true;
  errors.value.pageSeo = false;
  errors.value.nameSeo = false;
  errors.value.contentSeo = false;
  errors.value.pageSeo = !pageSeo.value;
  errors.value.nameSeo = !nameSeo.value;
  errors.value.contentSeo = !contentSeo.value;
  try {
    const formData = new FormData();
    formData.append('page_id', pageSeo.value);
    formData.append('name', nameSeo.value);
    formData.append('content', contentSeo.value);

    await axios.post(`/seos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchSeos();
    resetSeo();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const updateSeo = async () => {
  isLoading.value = true;
  errors.value.contentSeo = false;
  errors.value.contentSeo = !contentSeo.value;
  try {
    const formData = new FormData();
    formData.append('page_id', currentSeoId.value);
    formData.append('content', contentSeo.value);

    await axios.post(`/seos/${currentSeoValueId.value}?_method=patch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchSeos();
    resetSeo();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const deleteSeo = async (idTeam) => {
  isLoading.value = true;
  try {
    await axios.delete(`/seos/${idTeam}`, {
      headers: {},
    });
    await fetchSeos();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editSeo = (value, seoId) => {
  isEditingSeo.value = true;
  pageSeo.value = null;
  nameSeo.value = null;
  contentSeo.value = value.content;
  currentSeoValueId.value = value.id;
  currentSeoId.value = seoId;
  errors.value.pageSeo = false;
  errors.value.nameSeo = false;
  errors.value.contentSeo = false;
};
const resetSeo = () => {
  isEditingSeo.value = false;
  pageSeo.value = null;
  nameSeo.value = null;
  contentSeo.value = '';
  currentSeoId.value = null;
  currentSeoValueId.value = null;
  errors.value.pageSeo = false;
  errors.value.nameSeo = false;
  errors.value.contentSeo = false;
};

</script>

<template>
  <div class="admin-panel__content">
    <h2>Управление SEO полями</h2>
    <form class="admin-panel__content_form" v-if="!isEditingSeo" @submit.prevent="createSeo">
      Страница
      <select v-model="pageSeo" :class="{ error: errors.pageSeo }"
              class="basket__form_input admin-panel__content_select">
        <option value="" disabled>Выберите страницу</option>
        <option v-for="seo in seos" :key="seo.id" :value="seo.id">
          {{ seo.title }}
        </option>
      </select>
      Поле
      <select v-model="nameSeo" :class="{ error: errors.nameSeo }"
              class="basket__form_input admin-panel__content_select">
        <option value="" disabled>Выберите поле</option>
        <option value='title'>
          Название
        </option>
        <option value='description'>
          Описание
        </option>
        <option value='keywords'>
          Ключевые слова
        </option>
        <option value='author'>
          Автор
        </option>
      </select>
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="contentSeo"
          placeholder="Введите поле"
          :class="{ error: errors.contentSeo }"
      />
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Создать поле</span>
      </button>
    </form>
    <form class="admin-panel__content_form" v-if="isEditingSeo" @submit.prevent="updateSeo">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="contentSeo"
          placeholder="Введите поле"
          :class="{ error: errors.contentSeo }"
      />
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Изменить поле</span>
      </button>
      <button class="main_btn" type="submit" @click="resetSeo" v-if="!isLoading">Отмена</button>
    </form>
    <div
        class="admin-panel__content_info_item"
        v-for="seo in seos" :key="seo.id"
    >
      <div class="admin-panel__content_info_content">
        <p>{{ seo.title }}</p>
      </div>
      <table>
        <thead>
        <tr>
          <th>Название</th>
          <th>Контент</th>
          <th>Изменить</th>
          <th>Удалить</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="value in seo?.seos" :key="value.id">
          <td>{{ value.name }}</td>
          <td>{{ value.content }}</td>
          <td>
            <button @click="editSeo(value, seo.id)" class="admin-panel__content_btn">Изменить</button>
          </td>
          <td>
            <button @click="deleteSeo(value.id)" class="admin-panel__content_btn">Удалить</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>