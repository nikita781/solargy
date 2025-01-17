<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchCategory();
  }
});

const isLoading = ref(false);

const errors = ref({
  nameCategory: false,
  photoCategory: false,
});

const categories = ref([])
const categoriesLevel = ref([])
const allCategories = ref([]);
const parentCategory = ref(null);
const nameCategory = ref('');
const photoCategory = ref(null);
const fileCategory = ref(null);
const previewImageCategory = ref(null)
const isEditingCat = ref(false);
const currentCategoryId = ref(null);

const handleFileChangeCategory = (event) => {
  const file = event.target.files[0];
  if (file) {
    photoCategory.value = file;
    previewImageCategory.value = URL.createObjectURL(file);
  }
};
const createCategory = async () => {
  isLoading.value = true;
  errors.value.nameCategory = false;
  errors.value.photoCategory = false;
  errors.value.nameCategory = !nameCategory.value.trim();
  errors.value.photoCategory = !photoCategory.value;
  try {
    const formData = new FormData();
    formData.append('name', nameCategory.value);
    formData.append('photo', photoCategory.value);
    if (parentCategory.value) {
      formData.append('parent_id', parentCategory.value);
    }

    await axios.post(`/categories`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCategory();
    resetCategory();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const flattenCategories = (categories) => {
  const result = [];
  const traverse = (categoryList, parentId = null) => {
    categoryList.forEach((category) => {
      result.push({
        id: category.id,
        name: category.name,
        level: category.level,
        parent_id: category.parent_id,
        parentId, // Добавляем информацию о родительской категории
      });

      if (category.children && category.children.length > 0) {
        traverse(category.children, category.id); // Обрабатываем дочерние категории
      }
    });
  };

  traverse(categories);
  return result;
};
const fetchCategory = async () => {
  try {
    const response = await axios.get('/categories');
    categories.value = response.data;
    allCategories.value = flattenCategories(categories.value);
    categoriesLevel.value = categories.value.filter(category => category.level === 0);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateCategory = async () => {
  isLoading.value = true;
  errors.value.nameCategory = false;
  errors.value.nameCategory = !nameCategory.value.trim();
  try {
    const formData = new FormData();
    formData.append('name', nameCategory.value);
    if (photoCategory.value) {
      formData.append('photo', photoCategory.value);
    }
    if (parentCategory.value) {
      formData.append('parent_id', parentCategory.value);
    }
    await axios.post(`/categories/${currentCategoryId.value}?_method=PATCH`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCategory();
    resetCategory();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editCategory = (category) => {
  isEditingCat.value = true;
  currentCategoryId.value = category.id;
  nameCategory.value = category.name;
  photoCategory.value = null;
  previewImageCategory.value = category.photo;
  errors.value.nameCategory = false;
  errors.value.photoCategory = false;
};
const resetCategory = () => {
  isEditingCat.value = false;
  currentCategoryId.value = null;
  nameCategory.value = '';
  photoCategory.value = null;
  fileCategory.value.value = ''
  parentCategory.value = null;
  previewImageCategory.value = null;
  errors.value.nameCategory = false;
  errors.value.photoCategory = false;
};
const deleteCategory = async (idCategory) => {
  isLoading.value = true;
  try {
    await axios.delete(`/categories/${idCategory}`, {
      headers: {},
    });
    await fetchCategory();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="admin-panel__content">
    <h2>Управление категориями</h2>
    <form class="admin-panel__content_form" v-if="!isEditingCat" @submit.prevent="createCategory">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="nameCategory"
          placeholder="Введите имя категории"
          :class="{ error: errors.nameCategory }"
      />
      <select v-model="parentCategory" class="basket__form_input admin-panel__content_select">
        <option value="" disabled>Выберите родительскую категорию</option>
        <option v-for="cat in categoriesLevel" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <div class="input__wrapper">
        <input ref="fileCategory" type="file" id="input__file" class="input input__file"
               @change="handleFileChangeCategory" accept="image/*" multiple>
        <label for="input__file" class="input__file-button" :class="{ error: errors.photoCategory }">
          <span class="input__file-icon-wrapper">
            <img v-if="previewImageCategory" class="input__file-icon" :src="previewImageCategory" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
          <span class="input__file-button-text">Выберите картинку</span>
        </label>
      </div>
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Создать категорию</span>
      </button>
    </form>
    <form class="admin-panel__content_form" v-if="isEditingCat" @submit.prevent="updateCategory">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="nameCategory"
          placeholder="Введите новое имя категории"
          :class="{ error: errors.nameCategory }"
      />
      <!--          <select v-model="parentCategory" class="basket__form_input admin-panel__content_select">-->
      <!--            <option value="">Выберите родительскую категорию</option>-->
      <!--            <option v-for="cat in categoriesLevel" :key="cat.id" :value="cat.id">-->
      <!--              {{ cat.name }}-->
      <!--            </option>-->
      <!--          </select>-->
      <div class="input__wrapper">
        <input ref="fileCategory" type="file" id="input__file" class="input input__file"
               @change="handleFileChangeCategory" accept="image/*" multiple>
        <label for="input__file" class="input__file-button" :class="{ error: errors.photoCategory }">
          <span class="input__file-icon-wrapper">
            <img v-if="previewImageCategory" class="input__file-icon" :src="previewImageCategory" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
          <span class="input__file-button-text">Выберите картинку</span>
        </label>
      </div>
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Изменить категорию</span>
      </button>
      <button class="main_btn" type="button" @click="resetCategory" v-if="!isLoading">Отмена</button>
    </form>
    <table v-for="category in categories" :key="category.id">
      <thead>
      <tr>
        <th style="width: 50%">Название</th>
        <th>Фото</th>
        <th>Дочерние элементы</th>
        <th style="width: 100px">Изменить</th>
        <th style="width: 100px">Удалить</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>{{ category.name }}</td>
        <td>
          <img v-if="category.photo" :src="category.photo" alt="Фото" width="50"/>
        </td>
        <td>
              <span v-if="category.children.length > 0">
                {{ category.children.length }} дочерних элемента(ов)
              </span>
          <span v-else>Нет</span>
        </td>
        <td>
          <button @click="editCategory(category)" class="admin-panel__content_btn">Изменить</button>
        </td>
        <td>
          <button @click="deleteCategory(category.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      <tr v-for="cat in category.children" :key="cat.id">
        <td>{{ cat.name }}</td>
        <td>
          <img :src="cat.photo" alt="Фото" width="50"/>
        </td>
        <td>
          <!--              <span v-if="cat.children.length > 0">-->
          <!--                {{ cat.children.length }} дочерних элемента(ов)-->
          <!--              </span>-->
          <!--              <span v-else>Нет</span>-->
          Дочерняя
        </td>
        <td>
          <button @click="editCategory(cat)" class="admin-panel__content_btn">Изменить</button>
        </td>
        <td>
          <button @click="deleteCategory(cat.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">

</style>