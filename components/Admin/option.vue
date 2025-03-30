<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";
import { saveAs } from 'file-saver';

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchOptions();
    await fetchImgs();
  }
});

const isLoading = ref(false);

const errors = ref({
  nameOptions: false,

  optionValue: false,
  optionPrice: false,
});

const options = ref([]);
const optionsSearch = ref([]);
const nameOptions = ref('');
const isEditingOptions = ref(false);
const currentOptionsId = ref(null);
const optionSearch = ref('');
const isSearch = ref(false);

const visibleDialog = ref(false);
const dialogPhoto = ref(null);
const dialogFile = ref(null);
const dialogPreview = ref(null);
const imgs = ref([]);
const openDialog = () => {
  visibleDialog.value = true;
};
const closeDialog = () => {
  visibleDialog.value = false;
};
const handleFileChangeDialog = (event) => {
  const file = event.target.files[0];
  if (file) {
    dialogPhoto.value = file;
    dialogPreview.value = URL.createObjectURL(file);
  }
};
const resetDialogPreview = () => {
  dialogPhoto.value = null;
  dialogFile.value.value = ''
  dialogPreview.value = null
};
const fetchImgs = async () => {
  try {
    const response = await axios.get('/library-images');
    imgs.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const ExportOptions = async (option) => {
  try {
    const response = await axios.get(`/options/${option.id}/export`, {
      responseType: 'blob',
    });

    // Создаем Blob-объект с Excel-файлом
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Сохраняем файл с помощью FileSaver.js
    saveAs(blob, `${option.name}.xlsx`);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const addImage = async () => {
  try {
    const formData = new FormData();
    formData.append('image', dialogPhoto.value);

    await axios.post(`/library-images`, formData, {
      headers: {},
    });
    await fetchImgs();
    resetDialogPreview();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const deleteImg = async (imgId) => {
  try {
    await axios.delete(`/library-images/${imgId}`, {
      headers: {},
    });
    await fetchImgs();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const selectPhoto = (image) => {
  optionPhotoImg.value = image;
  visibleDialog.value = false;
};
const resetPhoto = () => {
  optionPhotoImg.value = null;
};

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
const cloneOption = async (optionId) => {
  isLoading.value = true;
  try {
    await axios.post(`/values/${optionId}/copy`, {
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
const fetchSearchOption = async () => {
  try {
    const response = await axios.get(`/search/options?q=${optionSearch.value}`);
    optionsSearch.value = response.data;
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
  openDialogUpdate();
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
  closeDialogAdd();
  closeDialogUpdate();
};


const optionValue = ref('')
const optionPrice = ref(null)
const optionPhoto = ref(null);
const optionPhotoImg = ref(null);
const optionFile = ref(null);
const optionPreview = ref(null);
const optionId = ref(null)
const optionOrder = ref(null);
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
    if (optionPhotoImg.value) {
      formData.append('values[0][from-library]', true);
      formData.append('values[0][image-library]', optionPhotoImg.value);
    } else if (optionPhoto.value) {
      formData.append('values[0][image]', optionPhoto.value);
    }
    if (optionOrder.value) {
      formData.append('values[0][order]', optionOrder.value);
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
    resetPhoto();
    closeDialogAddValue();
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
    if (optionPhotoImg.value) {
      formData.append('values[0][from-library]', true);
      formData.append('values[0][image-library]', optionPhotoImg.value);
    } else if (optionPhoto.value) {
      formData.append('values[0][image]', optionPhoto.value);
    }
    if (optionOrder.value) {
      formData.append('values[0][order]', optionOrder.value);
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
    resetPhoto();
    resetOptionPreview()
    closeDialogUpdateValue();
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
  openDialogUpdateValue()
  idEditingOptionValue.value = true;
  currentOptionValueId.value = options.id;
  optionValue.value = options.value;
  optionPrice.value = options.price;
  optionPhoto.value = null;
  optionPreview.value = options.image
  optionId.value = idOptions;
  optionOrder.value = options.order
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
  optionPhotoImg.value = null
  optionOrder.value = null
  errors.value.optionValue = false;
  errors.value.optionPrice = false;
  closeDialogAddValue();
  closeDialogUpdateValue();
};
const resetOptionPreview = () => {
  optionPhoto.value = null;
  optionFile.value.value = ''
  optionPreview.value = null
};

function searchOption() {
  if (optionSearch.value.trim() !== '') {
    fetchSearchOption()
    isSearch.value = true
  } else {
    isSearch.value = false
  }
}


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
  resetOptions();
};


const visibleDialogAddValue = ref(false);
const openDialogAddValue = () => {
  visibleDialogAddValue.value = true;
};
const closeDialogAddValue = () => {
  visibleDialogAddValue.value = false;
};

const visibleDialogUpdateValue = ref(false);
const openDialogUpdateValue = () => {
  visibleDialogUpdateValue.value = true;
};
const closeDialogUpdateValue = () => {
  visibleDialogUpdateValue.value = false;
  resetOptionValue();
};

const optionImport = ref(null);
const visibleDialogImport = ref(false);
const openDialogImport = () => {
  visibleDialogImport.value = true;
};
const closeDialogImport = () => {
  visibleDialogImport.value = false;
};

const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    optionImport.value = file
  }
}

const importOptions = async () => {
  isLoading.value = true;
  if (!optionFile.value) {
    return
  }
  if (!optionFile.value.name.toLowerCase().endsWith('.xlsx')) {
    return
  }
  try {
    const formData = new FormData();
    formData.append('file', optionImport.value);

    await axios.post(`/options/import`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
    closeDialogImport();
  }
};
</script>

<template>
<div class="admin-panel__content admin-panel__content-prod">
  <h2>Управление параметрами товара</h2>
  <div class="admin-panel__content_info">
    <div class="admin__flex">
      <button class="main_btn" @click="openDialogAdd" style="width: fit-content">Создать параметр</button>
      <button class="main_btn" @click="openDialogAddValue" style="width: fit-content">Создать пункт</button>
      <button class="main_btn" @click="openDialogImport" style="width: fit-content">Импорт</button>
    </div>
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="optionSearch"
        placeholder="Поиск"
        @input="searchOption"
    />
    <div
        class="admin-panel__content_info_item"
        v-for="option in options" :key="option.id"
        v-if="!isSearch"
    >
      <div class="admin__grid_2">
        <p>{{ option.name }}</p>
        <div class="admin__flex">
          <button class="main_btn" @click="ExportOptions(option)" style="width: fit-content">Экспорт</button>
          <button @click="editOptions(option)" class="main_btn" style="width: fit-content">Изменить</button>
          <button @click="deleteOptions(option.id)" class="main_btn" style="width: fit-content">Удалить</button>
        </div>
      </div>
      <table>
        <thead>
        <tr>
          <th>Название</th>
          <th>Цена</th>
          <th>Фото</th>
          <th>Порядок</th>
          <th style="width: 100px">Изменить</th>
          <th style="width: 100px">Дублировать</th>
          <th style="width: 100px">Удалить</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="value in option.values" :key="value.id">
          <td>{{ value.value }}</td>
          <td>{{ value.price }}</td>
          <td>
            <img v-if="value.image" :src="value.image" alt="Фото" width="50"/>
          </td>
          <td>{{ value.order }}</td>
          <td>
            <button @click="editOptionValue(option.id, value)" class="admin-panel__content_btn">Изменить</button>
          </td>
          <td>
            <button @click="cloneOption(value.id)" class="admin-panel__content_btn">Дублировать</button>
          </td>
          <td>
            <button @click="deleteOptionValue(option.id, value.id)" class="admin-panel__content_btn">Удалить
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div
        class="admin-panel__content_info_item"
        v-for="option in optionsSearch" :key="option.id"
        v-if="isSearch"
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
          <th style="width: 100px">Изменить</th>
          <th style="width: 100px">Дублировать</th>
          <th style="width: 100px">Удалить</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="value in option.values" :key="value.id">
          <td>{{ value.value }}</td>
          <td>{{ value.price }}</td>
          <td>
            <img v-if="value.image" :src="value.image" alt="Фото" width="50"/>
          </td>
          <td>
            <button @click="editOptionValue(option.id, value)" class="admin-panel__content_btn">Изменить</button>
          </td>
          <td>
            <button @click="cloneOption(value.id)" class="admin-panel__content_btn">Дублировать</button>
          </td>
          <td>
            <button @click="deleteOptionValue(option.id, value.id)" class="admin-panel__content_btn">Удалить
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div class="admin__dialog" v-if="visibleDialog" @click="closeDialog" style="z-index: 1">
      <div class="admin__dialog_container" @click.stop>
        <h4>Библиотека изображений</h4>
        <div class="admin__dialog_form">
          <div class="input__wrapper">
            <input ref="dialogFile" type="file" id="input__file" class="input input__file-reset"
                   @change="handleFileChangeDialog" accept="image/*" multiple>
            <label for="input__file" class="input__file-button-reset">
            <span class="input__file-icon-wrapper">
              <img v-if="dialogPreview" class="input__file-icon" :src="dialogPreview" alt="Выбрать файл"
                   width="50" height="50px">
            </span>
              <span class="input__file-button-text">Выберите картинку</span>
              <span class="input__file-icon-reset" @click.prevent="resetDialogPreview">
              <IconsCross color="#fff"/>
            </span>
            </label>
          </div>
          <button class="main_btn" @click="addImage">Добавить изображение</button>
        </div>
        <div class="admin__dialog_imgs">
          <div
              v-for="img in imgs" :key="img.id"
              class="admin__dialog_img"
          >
            <img @click="selectPhoto(img.image)" :src="img.image" alt="">
            <div @click="deleteImg(img.id)" class="admin__dialog_trash">
              <IconsTrash color="#fff"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="admin__dialog" v-if="visibleDialogAdd" @click="closeDialogAdd">
      <div class="admin__dialog_container admin__dialog_container-small" @click.stop>
        <h3 style="margin: 0">Создание параметра</h3>
        <form class="admin-panel__content_form-dialog" @submit.prevent="createOptions">
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
      </div>
    </div>
    <div class="admin__dialog" v-if="visibleDialogUpdate" @click="closeDialogUpdate">
      <div class="admin__dialog_container admin__dialog_container-small" @click.stop>
        <h3 style="margin: 0">Изменение параметра</h3>
        <form class="admin-panel__content_form-dialog" @submit.prevent="updateOptions">
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
        </form>
      </div>
    </div>
    <div class="admin__dialog" v-if="visibleDialogAddValue" @click="closeDialogAddValue">
      <div class="admin__dialog_container admin__dialog_container-small" @click.stop>
        <h3 style="margin: 0">Создание пункта</h3>
        <form class="admin-panel__content_form-dialog" @submit.prevent="createOptionValue">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="optionValue"
              placeholder="Введите имя пункта"
              :class="{ error: errors.optionValue }"
          />
          <input
              type="number" :min="0"
              class="basket__form_input admin-panel__content_input"
              v-model="optionPrice"
              placeholder="Введите цену пункта"
              :class="{ error: errors.optionPrice }"
          />
          <button type="button" class="main_btn" @click="openDialog">Библиотека изображений</button>
          <button v-if="optionPhotoImg" type="button" class="main_btn" @click="resetPhoto">Отменить выбор</button>
          <div class="input__wrapper" v-if="!optionPhotoImg">
            <input ref="optionFile" type="file" id="input__file" class="input input__file-reset"
                   @change="handleFileChangeOption" accept="image/*" multiple>
            <label for="input__file" class="input__file-button-reset">
          <span class="input__file-icon-wrapper">
            <img v-if="optionPreview" class="input__file-icon" :src="optionPreview" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
              <span class="input__file-button-text">Выберите картинку</span>
              <span class="input__file-icon-reset" @click.prevent="resetOptionPreview">
            <IconsCross color="#fff"/>
          </span>
            </label>
          </div>
          Параметр
          <select v-model="optionId" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите продукт</option>
            <option v-for="option in options" :key="option.id" :value="option.id">
              {{ option.name }}
            </option>
          </select>
          <input
              type="number" :min="0"
              class="basket__form_input admin-panel__content_input"
              v-model="optionOrder"
              placeholder="Введите порядковый номер"
          />
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
      </div>
    </div>
    <div class="admin__dialog" v-if="visibleDialogUpdateValue" @click="closeDialogUpdateValue">
      <div class="admin__dialog_container admin__dialog_container-small" @click.stop>
        <h3 style="margin: 0">Изменение пункта</h3>
        <form class="admin-panel__content_form-dialog" @submit.prevent="updateOptionValue">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="optionValue"
              placeholder="Введите имя пункта"
              :class="{ error: errors.optionValue }"
          />
          <input
              type="number" :min="0"
              class="basket__form_input admin-panel__content_input"
              v-model="optionPrice"
              placeholder="Введите цену пункта"
              :class="{ error: errors.optionPrice }"
          />
          <button type="button" class="main_btn" @click="openDialog">Библиотека изображений</button>
          <button v-if="optionPhotoImg" type="button" class="main_btn" @click="resetPhoto">Отменить выбор</button>
          <div class="input__wrapper" v-if="!optionPhotoImg">
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
          <input
              type="number" :min="0"
              class="basket__form_input admin-panel__content_input"
              v-model="optionOrder"
              placeholder="Введите порядковый номер"
          />
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
        </form>
      </div>
    </div>
    <div class="admin__dialog" v-if="visibleDialogImport" @click="closeDialogImport">
      <div class="admin__dialog_container admin__dialog_container-small" @click.stop>
        <h3 style="margin: 0">Импорт параметров</h3>
        <form class="admin-panel__content_form-dialog" @submit.prevent="importOptions">
          <input
              type="file"
              accept=".xlsx"
              class="basket__form_input admin-panel__content_input"
              @change="onFileChange"
          />
          <button
              class="main_btn"
              type="submit"
              :disabled="isLoading"
              :class="{ 'loading': isLoading }"
              :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
          >
            <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
            <span v-else>Импорт</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>