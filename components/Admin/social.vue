<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchSocials();
  }
});

const isLoading = ref(false);

const errors = ref({
  socialPlatform: false,
  socialUrl: false,
  socialImage: false,
  socialImageFooter: false,
});

const socials = ref([]);
const socialPlatform = ref('')
const socialUrl = ref('');
const socialImage = ref(null);
const socialFile = ref(null)
const socialPreview = ref(null);
const socialImageFooter = ref(null);
const socialFileFooter = ref(null)
const socialPreviewFooter = ref(null);
const isEditingSocial = ref(false);
const currentSocialId = ref(null);

const fetchSocials = async () => {
  try {
    const response = await axios.get(`/socials`, {
      headers: {},
    });
    socials.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleFileChangeSocial = (event) => {
  const file = event.target.files[0];
  if (file) {
    socialImage.value = file;
    socialPreview.value = URL.createObjectURL(file);
  }
};
const handleFileChangeSocialFooter = (event) => {
  const file = event.target.files[0];
  if (file) {
    socialImageFooter.value = file;
    socialPreviewFooter.value = URL.createObjectURL(file);
  }
};
const createSocial = async () => {
  isLoading.value = true;
  errors.value.socialPlatform = false;
  errors.value.socialUrl = false;
  errors.value.socialImage = false;
  errors.value.socialImageFooter = false;
  errors.value.socialPlatform = !socialPlatform.value;
  errors.value.socialUrl = !socialUrl.value;
  errors.value.socialImage = !socialImage.value;
  errors.value.socialImageFooter = !socialImageFooter.value;
  try {
    const formData = new FormData();
    formData.append('platform', socialPlatform.value);
    formData.append('url', socialUrl.value);
    formData.append('image', socialImage.value);
    formData.append('image_footer', socialImageFooter.value);

    await axios.post(`/socials`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchSocials();
    resetSocial();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const updateSocial = async () => {
  isLoading.value = true;
  errors.value.socialPlatform = false;
  errors.value.socialUrl = false;
  errors.value.socialPlatform = !socialPlatform.value;
  errors.value.socialUrl = !socialUrl.value;
  try {
    const formData = new FormData();
    formData.append('platform', socialPlatform.value);
    formData.append('url', socialUrl.value);
    if (socialImage.value) {
      formData.append('image', socialImage.value);
    }
    if (socialImageFooter.value) {
      formData.append('image_footer', socialImageFooter.value);
    }

    await axios.post(`/socials/${currentSocialId.value}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchSocials();
    resetSocial();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const deleteSocial = async (idSocial) => {
  isLoading.value = true;
  try {
    await axios.delete(`/socials/${idSocial}`, {
      headers: {},
    });
    await fetchSocials();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editSocial = (block) => {
  socialPreview.value = block.image;
  socialPreviewFooter.value = block.image_footer;
  isEditingSocial.value = true;
  currentSocialId.value = block.id;
  socialPlatform.value = block.platform;
  socialUrl.value = block.url;
  errors.value.socialPlatform = false;
  errors.value.socialUrl = false;
  errors.value.socialImage = false;
  errors.value.socialImageFooter = false;
};
const resetSocial = () => {
  socialPreview.value = null;
  socialPreviewFooter.value = null;
  isEditingSocial.value = false;
  socialPlatform.value = '';
  socialUrl.value = '';
  socialImage.value = null;
  socialFile.value.value = ''
  socialImageFooter.value = null;
  socialFileFooter.value.value = ''
  currentSocialId.value = null
  errors.value.socialPlatform = false;
  errors.value.socialUrl = false;
  errors.value.socialImage = false;
  errors.value.socialImageFooter = false;
};
</script>

<template>
<div class="admin-panel__content">
  <h2>Управление страницей доставка</h2>
  <form class="admin-panel__content_form" v-if="!isEditingSocial" @submit.prevent="createSocial">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="socialPlatform"
        placeholder="Введите название"
        :class="{ error: errors.socialPlatform }"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="socialUrl"
        placeholder="Введите ссылку"
        :class="{ error: errors.socialUrl }"
    />
    Фото основное
    <div class="input__wrapper">
      <input ref="socialFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeSocial" accept="image/*" multiple>
      <label for="input__file" class="input__file-button" :class="{ error: errors.socialImage }">
          <span class="input__file-icon-wrapper">
            <img v-if="socialPreview" class="input__file-icon" :src="socialPreview" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    Фото для подвала
    <div class="input__wrapper">
      <input ref="socialFileFooter" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeSocialFooter" accept="image/*" multiple>
      <label for="input__file" class="input__file-button" :class="{ error: errors.socialImageFooter }">
          <span class="input__file-icon-wrapper">
            <img v-if="socialPreviewFooter" class="input__file-icon" :src="socialPreviewFooter" alt="Выбрать файл"
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
      <span v-else>Создать соц сеть</span>
    </button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingSocial" @submit.prevent="updateSocial">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="socialPlatform"
        placeholder="Введите название"
        :class="{ error: errors.socialPlatform }"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="socialUrl"
        placeholder="Введите ссылку"
        :class="{ error: errors.socialUrl }"
    />
    Фото основное
    <div class="input__wrapper">
      <input ref="socialFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeSocial" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="socialPreview" class="input__file-icon" :src="socialPreview" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    Фото для подвала
    <div class="input__wrapper">
      <input ref="socialFileFooter" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeSocialFooter" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="socialPreviewFooter" class="input__file-icon" :src="socialPreviewFooter" alt="Выбрать файл"
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
      <span v-else>Изменить соц сеть</span>
    </button>
    <button class="main_btn" @click="resetSocial" v-if="!isLoading">Отмена</button>
  </form>
  <table>
    <thead>
    <tr>
      <th>Название</th>
      <th>Ссылка</th>
      <th>Фото</th>
      <th>Фото подвал</th>
      <th>Изменить</th>
      <th>Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="social in socials" :key="social.id">
      <td>{{ social.platform }}</td>
      <td>{{ social.url }}</td>
      <td>
        <img v-if="social.image" :src="social.image" alt="Фото" width="50"/>
      </td>
      <td>
        <img v-if="social.image_footer" :src="social.image_footer" alt="Фото" width="50"/>
      </td>
      <td>
        <button @click="editSocial(social)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deleteSocial(social.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
</div>
</template>

<style scoped lang="scss">

</style>