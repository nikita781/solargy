<script setup>
import Editor from "~/components/editor.vue";
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchDelivery();
  }
});

const isLoading = ref(false);

const errors = ref({
  deliveryTitle: false,
  deliveryImage: false,
});

const delivery = ref([]);
const isEditingDelivery = ref(false);
const currentDeliveryId = ref(null);
const deliveryTitle = ref('');
const deliveryDescription = ref('');
const deliveryImage = ref(null);
const deliveryFile = ref(null);
const deliveryPreview = ref(null);

const fetchDelivery = async () => {
  try {
    const response = await axios.get(`/pages/3`, {
      headers: {},
    });
    delivery.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleFileChangeDelivery = (event) => {
  const file = event.target.files[0];
  if (file) {
    deliveryImage.value = file;
    deliveryPreview.value = URL.createObjectURL(file);
  }
};
const handleExportHtmlDelivery = (html) => {
  deliveryDescription.value = html;
}
const createDelivery = async () => {
  isLoading.value = true;
  errors.value.deliveryTitle = false;
  errors.value.deliveryImage = false;
  errors.value.deliveryTitle = !deliveryTitle.value;
  errors.value.deliveryImage = !deliveryImage.value;
  try {
    const formData = new FormData();
    formData.append('sections[0][title]', deliveryTitle.value);
    formData.append('sections[0][html]', deliveryDescription.value);
    formData.append('sections[0][image]', deliveryImage.value);

    await axios.post(`/pages/3?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchDelivery();
    resetDelivery();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const updateDelivery = async () => {
  isLoading.value = true;
  errors.value.deliveryTitle = false;
  errors.value.deliveryTitle = !deliveryTitle.value;
  try {
    const formData = new FormData();
    formData.append('sections[0][id]', currentDeliveryId.value);
    formData.append('sections[0][title]', deliveryTitle.value);
    formData.append('sections[0][html]', deliveryDescription.value);
    if (deliveryImage.value) {
      formData.append('sections[0][image]', deliveryImage.value);
    }

    await axios.post(`/pages/3?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchDelivery();
    deliveryTitle.value = '';
    deliveryDescription.value = '';
    deliveryImage.value = null;
    deliveryFile.value.value = ''
    resetDelivery();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const deleteDelivery = async (idBlock) => {
  isLoading.value = true;
  try {
    await axios.delete(`/pages/${idBlock}`, {
      headers: {},
    });
    await fetchDelivery();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editDelivery = (block) => {
  deliveryPreview.value = block.image;
  isEditingDelivery.value = true;
  currentDeliveryId.value = block.id;
  deliveryTitle.value = block.title;
  deliveryDescription.value = block.html;
  errors.value.deliveryTitle = false;
  errors.value.deliveryImage = false;
};
const resetDelivery = () => {
  deliveryPreview.value = null;
  isEditingDelivery.value = false;
  deliveryTitle.value = '';
  deliveryDescription.value = '';
  deliveryImage.value = null;
  deliveryFile.value.value = ''
  currentDeliveryId.value = null
  errors.value.deliveryTitle = false;
  errors.value.deliveryImage = false;
};
</script>

<template>
<div class="admin-panel__content">
  <h2>Управление страницей доставка</h2>
  <form class="admin-panel__content_form" v-if="!isEditingDelivery" @submit.prevent="createDelivery">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="deliveryTitle"
        placeholder="Введите название"
        :class="{ error: errors.deliveryTitle }"
    />
    <Editor @export-html="handleExportHtmlDelivery"/>
    <div class="input__wrapper">
      <input ref="deliveryFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeDelivery" accept="image/*" multiple>
      <label for="input__file" class="input__file-button" :class="{ error: errors.deliveryImage }">
          <span class="input__file-icon-wrapper">
            <img v-if="deliveryPreview" class="input__file-icon" :src="deliveryPreview" alt="Выбрать файл"
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
      <span v-else>Создать блок</span>
    </button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingDelivery" @submit.prevent="updateDelivery">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="deliveryTitle"
        placeholder="Введите название"
        :class="{ error: errors.deliveryTitle }"
    />
    <Editor :initialHtml="deliveryDescription" @export-html="handleExportHtmlDelivery"/>
    <div class="input__wrapper">
      <input ref="deliveryFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeDelivery" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="deliveryPreview" class="input__file-icon" :src="deliveryPreview" alt="Выбрать файл"
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
      <span v-else>Изменить блок</span>
    </button>
    <button class="main_btn" @click="resetDelivery" v-if="!isLoading">Отмена</button>
  </form>
  <table>
    <thead>
    <tr>
      <th>Название</th>
      <th>Описание</th>
      <th>Фото</th>
      <th>Изменить</th>
      <th>Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="section in delivery.sections" :key="section.id">
      <td>{{ section.title }}</td>
      <td>{{ section.html }}</td>
      <td>
        <img v-if="section.image" :src="section.image" alt="Фото" width="50"/>
      </td>
      <td>
        <button @click="editDelivery(section)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deleteDelivery(section.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
</div>
</template>

<style scoped lang="scss">

</style>