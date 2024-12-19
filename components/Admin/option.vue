<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchOptions();
  }
});

const isLoading = ref(false);

const errors = ref({
  nameOptions: false,

  optionValue: false,
  optionPrice: false,
});

const options = ref([]);
const nameOptions = ref('');
const isEditingOptions = ref(false);
const currentOptionsId = ref(null);

const createOptions = async () => {
  isLoading.value = true;
  errors.value.nameOptions = false;
  errors.value.nameOptions = !nameOptions.value.trim();
  try {
    const formData = new FormData();
    formData.append('name', nameOptions.value);

    await axios.post(`/options`, formData, {
      headers: {},
    });
    await fetchOptions();
    resetOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const updateOptions = async () => {
  isLoading.value = true;
  errors.value.nameOptions = false;
  errors.value.nameOptions = !nameOptions.value.trim();
  try {
    const formData = new FormData();
    formData.append('name', nameOptions.value);

    await axios.post(`/options/${currentOptionsId.value}?_method=PATCH`, formData, {
      headers: {},
    });
    await fetchOptions();
    resetOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const fetchOptions = async () => {
  try {
    const response = await axios.get('/options');
    options.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const deleteOptions = async (idOptions) => {
  isLoading.value = true;
  try {
    await axios.delete(`/options/${idOptions}`, {
      headers: {},
    });
    await fetchOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editOptions = (options) => {
  isEditingOptions.value = true;
  currentOptionsId.value = options.id;
  nameOptions.value = options.name;
  errors.value.nameOptions = false;
};
const resetOptions = () => {
  isEditingOptions.value = false;
  currentOptionsId.value = null;
  nameOptions.value = '';
  errors.value.nameOptions = false;
};


const optionValue = ref('')
const optionPrice = ref(null)
const optionPhoto = ref(null);
const optionFile = ref(null);
const optionPreview = ref(null);
const optionId = ref(null)
const idEditingOptionValue = ref(false);
const currentOptionValueId = ref(null);

const handleFileChangeOption = (event) => {
  const file = event.target.files[0];
  if (file) {
    optionPhoto.value = file;
    optionPreview.value = URL.createObjectURL(file);
  }
};
const createOptionValue = async () => {
  isLoading.value = true;
  errors.value.optionValue = false;
  errors.value.optionPrice = false;
  errors.value.optionValue = !optionValue.value.trim();
  errors.value.optionPrice = !optionPrice.value;
  try {
    const formData = new FormData();
    formData.append('values[0][value]', optionValue.value);
    formData.append('values[0][price]', optionPrice.value);
    if (optionPhoto.value) {
      formData.append('values[0][image]', optionPhoto.value);
    }

    await axios.post(`/options/${optionId.value}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchOptions();
    resetOptionValue();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const updateOptionValue = async () => {
  isLoading.value = true;
  errors.value.optionValue = false;
  errors.value.optionPrice = false;
  errors.value.optionValue = !optionValue.value.trim();
  errors.value.optionPrice = !optionPrice.value;
  try {
    const formData = new FormData();
    formData.append('values[0][id]', currentOptionValueId.value);
    formData.append('values[0][value]', optionValue.value);
    formData.append('values[0][price]', optionPrice.value);
    if (optionPhoto.value) {
      formData.append('values[0][image]', optionPhoto.value);
    }

    await axios.post(`/options/${optionId.value}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchOptions();
    resetOptionValue();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const deleteOptionValue = async (idOptions, idValue) => {
  isLoading.value = true;
  try {
    await axios.delete(`/options/${idOptions}/values/${idValue}`, {
      headers: {},
    });
    await fetchOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editOptionValue = (idOptions, options) => {
  idEditingOptionValue.value = true;
  currentOptionValueId.value = options.id;
  optionValue.value = options.value;
  optionPrice.value = options.price;
  optionPhoto.value = null;
  optionPreview.value = options.image
  optionId.value = idOptions;
  errors.value.optionValue = false;
  errors.value.optionPrice = false;
};
const resetOptionValue = () => {
  idEditingOptionValue.value = false;
  currentOptionValueId.value = null;
  optionValue.value = '';
  optionPrice.value = '';
  optionPhoto.value = null;
  optionId.value = null;
  optionFile.value.value = ''
  optionPreview.value = null
  errors.value.optionValue = false;
  errors.value.optionPrice = false;
};
</script>

<template>
<div class="admin-panel__content">
  <h2>Управление параметрами товара</h2>
  <h3>Параметры</h3>
  <div class="admin-panel__content_info">
    <form class="admin-panel__content_form" v-if="!isEditingOptions" @submit.prevent="createOptions">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="nameOptions"
          placeholder="Введите имя параметра"
          :class="{ error: errors.nameOptions }"
      />
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Создать параметр</span>
      </button>
    </form>
    <form class="admin-panel__content_form" v-if="isEditingOptions" @submit.prevent="updateOptions">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="nameOptions"
          placeholder="Введите имя параметра"
          :class="{ error: errors.nameOptions }"
      />
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Изменить параметр</span>
      </button>
      <button class="main_btn" type="button" @click="resetOptions" v-if="!isLoading">Отмена</button>
    </form>
    <h3>Пункт</h3>
    <form class="admin-panel__content_form" v-if="!idEditingOptionValue" @submit.prevent="createOptionValue">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="optionValue"
          placeholder="Введите имя пункта"
          :class="{ error: errors.optionValue }"
      />
      <input
          type="number"
          class="basket__form_input admin-panel__content_input"
          v-model="optionPrice"
          placeholder="Введите цену пункта"
          :class="{ error: errors.optionPrice }"
      />
      <div class="input__wrapper">
        <input ref="optionFile" type="file" id="input__file" class="input input__file"
               @change="handleFileChangeOption" accept="image/*" multiple>
        <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="optionPreview" class="input__file-icon" :src="optionPreview" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
          <span class="input__file-button-text">Выберите картинку</span>
        </label>
      </div>
      Параметр
      <select v-model="optionId" class="basket__form_input admin-panel__content_select">
        <option value="" disabled>Выберите продукт</option>
        <option v-for="option in options" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select>
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Создать пункт</span>
      </button>
    </form>
    <form class="admin-panel__content_form" v-if="idEditingOptionValue" @submit.prevent="updateOptionValue">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="optionValue"
          placeholder="Введите имя пункта"
          :class="{ error: errors.optionValue }"
      />
      <input
          type="number"
          class="basket__form_input admin-panel__content_input"
          v-model="optionPrice"
          placeholder="Введите цену пункта"
          :class="{ error: errors.optionPrice }"
      />
      <div class="input__wrapper">
        <input ref="optionFile" type="file" id="input__file" class="input input__file"
               @change="handleFileChangeOption" accept="image/*" multiple>
        <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="optionPreview" class="input__file-icon" :src="optionPreview" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
          <span class="input__file-button-text">Выберите картинку</span>
        </label>
      </div>
      Параметр
      <select v-model="optionId" class="basket__form_input admin-panel__content_select">
        <option value="" disabled>Выберите продукт</option>
        <option v-for="option in options" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select>
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Изменить пункт</span>
      </button>
      <button class="main_btn" type="button" @click="resetOptionValue" v-if="!isLoading">Отмена</button>
    </form>
    <div
        class="admin-panel__content_info_item"
        v-for="option in options" :key="option.id"
    >
      <div class="admin-panel__content_info_content">
        <p>{{ option.name }}</p>
        <button @click="editOptions(option)" class="admin-panel__content_btn">Изменить</button>
        <button @click="deleteOptions(option.id)" class="admin-panel__content_btn">Удалить</button>
      </div>
      <table>
        <thead>
        <tr>
          <th>Название</th>
          <th>Цена</th>
          <th>Фото</th>
          <th>Изменить</th>
          <th>Удалить</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="value in option.values" :key="value.id">
          <td>{{ value.value }}</td>
          <td>{{ value.price }}</td>
          <td>
            <img :src="value.image" alt="Фото" width="50"/>
          </td>
          <td>
            <button @click="editOptionValue(option.id, value)" class="admin-panel__content_btn">Изменить</button>
          </td>
          <td>
            <button @click="deleteOptionValue(option.id, value.id)" class="admin-panel__content_btn">Удалить
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>