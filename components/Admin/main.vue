<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchMainBanners();
    await fetchSubBanners();
    await fetchAllProducts();
  }
});

const isLoading = ref(false);

const errors = ref({
  titleBanner: false,
  descriptionBanner: false,
  photoBanners: false,
  productBanners: false,

  titleSlider: false,
  photoSlider: false,
});

const mainBanners = ref([]);
const titleBanner = ref('');
const descriptionBanner = ref('');
const numberBanner = ref('');
const photoBanners = ref(null);
const fileBanners = ref(null);
const productBanners = ref('');
const previewImage = ref(null)
const isEditingBanners = ref(false);
const allProducts = ref([]);
const currentBannerId = ref(null)

const handleFileChangeMainBanner = (event) => {
  const file = event.target.files[0];
  if (file) {
    photoBanners.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};
const fetchAllProducts = async () => {
  try {
    const response = await axios.get('/all-products');
    allProducts.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const createMainBanners = async () => {
  isLoading.value = true;
  errors.value.titleBanner = false;
  errors.value.descriptionBanner = false;
  errors.value.productBanners = false;
  errors.value.photoBanners = false;
  errors.value.titleBanner = !titleBanner.value.trim();
  errors.value.descriptionBanner = !descriptionBanner.value.trim();
  errors.value.productBanners = !productBanners.value;
  errors.value.photoBanners = !photoBanners.value;
  try {
    const formData = new FormData();
    formData.append('title', titleBanner.value);
    formData.append('description', descriptionBanner.value);
    if (numberBanner.value) {
      formData.append('order', numberBanner.value);
    }
    formData.append('image', photoBanners.value);
    formData.append('product_id', productBanners.value);

    await axios.post(`/main-banners`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchMainBanners();
    resetMainBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const updateMainBanners = async () => {
  isLoading.value = true;
  errors.value.titleBanner = false;
  errors.value.descriptionBanner = false;
  errors.value.productBanners = false;
  errors.value.titleBanner = !titleBanner.value.trim();
  errors.value.descriptionBanner = !descriptionBanner.value.trim();
  errors.value.productBanners = !productBanners.value;
  try {
    const formData = new FormData();
    formData.append('title', titleBanner.value);
    formData.append('description', descriptionBanner.value);
    if (numberBanner.value) {
      formData.append('order', numberBanner.value);
    }
    formData.append('product_id', productBanners.value);
    if (photoBanners.value) {
      formData.append('image', photoBanners.value);
    }
    await axios.post(`/main-banners/${currentBannerId.value}?_method=PATCH`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchMainBanners();
    resetMainBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const fetchMainBanners = async () => {
  try {
    const response = await axios.get('/main-banners');
    mainBanners.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const deleteMainBanners = async (idBanner) => {
  isLoading.value = true;
  try {
    await axios.delete(`/main-banners/${idBanner}`, {
      headers: {},
    });
    await fetchMainBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editMainBanners = (banner) => {
  isEditingBanners.value = true;
  currentBannerId.value = banner.id;
  titleBanner.value = banner.title;
  descriptionBanner.value = banner.description;
  numberBanner.value = banner.order;
  productBanners.value = banner.product.id;
  photoBanners.value = null;
  errors.value.titleBanner = false;
  errors.value.descriptionBanner = false;
  errors.value.productBanners = false;
  errors.value.photoBanners = false;
}
const resetMainBanners = () => {
  isEditingBanners.value = false;
  currentBannerId.value = null;
  titleBanner.value = '';
  descriptionBanner.value = '';
  photoBanners.value = null;
  productBanners.value = null;
  numberBanner.value = '';
  fileBanners.value.value = ''
  errors.value.titleBanner = false;
  errors.value.descriptionBanner = false;
  errors.value.productBanners = false;
  errors.value.photoBanners = false;
};


const subBanners = ref([]);
const titleSlider = ref('');
const numberSlider = ref('');
const photoSlider = ref(null);
const fileSlider = ref(null);
const isEditingSlider = ref(false);
const currentSliderId = ref(null)

const handleFileChangeSubBanners = (event) => {
  const file = event.target.files[0];
  if (file) {
    photoSlider.value = file;
  }
};
const createSubBanner = async () => {
  errors.value.titleSlider = false;
  errors.value.photoSlider = false;
  errors.value.titleSlider = !titleSlider.value.trim();
  errors.value.photoSlider = !photoSlider.value;
  try {
    const formData = new FormData();
    formData.append('title', titleSlider.value);
    formData.append('image', photoSlider.value);
    if (numberSlider.value) {
      formData.append('order', numberSlider.value);
    }

    await axios.post(`/sub-banners`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchSubBanners();
    resetSubBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateSubBanners = async () => {
  errors.value.titleSlider = false;
  errors.value.titleSlider = !titleSlider.value.trim();
  try {
    const formData = new FormData();
    formData.append('title', titleSlider.value);
    if (numberSlider.value) {
      formData.append('order', numberSlider.value);
    }
    if (photoSlider.value) {
      formData.append('image', photoSlider.value);
    }
    await axios.post(`/sub-banners/${currentSliderId.value}?_method=PATCH`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchSubBanners();
    resetSubBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const fetchSubBanners = async () => {
  try {
    const response = await axios.get('/sub-banners');
    subBanners.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const deleteSubBanners = async (idBanner) => {
  try {
    await axios.delete(`/sub-banners/${idBanner}`, {
      headers: {},
    });
    await fetchSubBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editSubBanner = (banner) => {
  isEditingSlider.value = true;
  currentSliderId.value = banner.id;
  titleSlider.value = banner.title;
  numberSlider.value = banner.order
  photoSlider.value = null;
  errors.value.titleSlider = false;
  errors.value.photoSlider = false;
}
const resetSubBanners = () => {
  isEditingSlider.value = false;
  currentSliderId.value = null;
  titleSlider.value = '';
  photoSlider.value = null;
  numberSlider.value = '';
  fileSlider.value.value = ''
  errors.value.titleSlider = false;
  errors.value.photoSlider = false;
};
</script>

<template>
  <div class="admin-panel__content">
    <h2>Добро пожаловать!</h2>
    <h3>Главный слайдер</h3>
    <form class="admin-panel__content_form" v-if="!isEditingBanners" @submit.prevent="createMainBanners">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="titleBanner"
          placeholder="Введите название"
          :class="{ error: errors.titleBanner }"
      />
      <input
          type="number"
          class="basket__form_input admin-panel__content_input"
          v-model="numberBanner"
          placeholder="Введите порядок"
      />
      <textarea
          class="basket__form_input admin-panel__content_textarea"
          v-model="descriptionBanner"
          :class="{ error: errors.descriptionBanner }"
          placeholder="Введите описание"
      ></textarea>
      Продукт
      <select v-model="productBanners" :class="{ error: errors.productBanners }"
              class="basket__form_input admin-panel__content_select">
        <option value="" disabled>Выберите продукт</option>
        <option v-for="product in allProducts" :key="product.id" :value="product.id">
          {{ product.name }}
        </option>
      </select>
      <input
          type="file"
          ref="fileBanners"
          :class="{ error: errors.photoBanners }"
          class="basket__form_input admin-panel__content_input"
          @change="handleFileChangeMainBanner"
          accept="image/*"
      />
<!--      <div class="input__wrapper">-->
<!--        <input ref="fileBanners" type="file" id="input__file" class="input input__file"  @change="handleFileChangeMainBanner" accept="image/*" multiple>-->
<!--        <label for="input__file" class="input__file-button">-->
<!--          <span class="input__file-icon-wrapper"><img v-if="previewImage" class="input__file-icon" :src="previewImage" alt="Выбрать файл" width="25"></span>-->
<!--          <span class="input__file-button-text">Выберите файл</span>-->
<!--        </label>-->
<!--      </div>-->
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Создать слайд</span>
      </button>
    </form>
    <form class="admin-panel__content_form" v-if="isEditingBanners" @submit.prevent="updateMainBanners">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="titleBanner"
          placeholder="Введите название"
          :class="{ error: errors.titleBanner }"
      />
      <input
          type="number"
          class="basket__form_input admin-panel__content_input"
          v-model="numberBanner"
          placeholder="Введите порядок"
      />
      <textarea
          class="basket__form_input admin-panel__content_textarea"
          v-model="descriptionBanner"
          :class="{ error: errors.descriptionBanner }"
          placeholder="Введите описание"
      ></textarea>
      Продукт
      <select v-model="productBanners" :class="{ error: errors.productBanners }"
              class="basket__form_input admin-panel__content_select">
        <option value="" disabled>Выберите продукт</option>
        <option v-for="product in allProducts" :key="product.id" :value="product.id">
          {{ product.name }}
        </option>
      </select>
      <input
          type="file"
          ref="fileBanners"
          class="basket__form_input admin-panel__content_input"
          @change="handleFileChangeMainBanner"
          accept="image/*"
      />
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Изменить слайд</span>
      </button>
      <button
          class="main_btn"
          type="button"
          @click="resetMainBanners"
          v-if="!isLoading"
      >
        Отмена
      </button>
    </form>
    <table>
      <thead>
      <tr>
        <th>Название</th>
        <th>Порядок</th>
        <th>Описание</th>
        <th>Фото</th>
        <th>Продукт</th>
        <th>Изменить</th>
        <th>Удалить</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="banner in mainBanners" :key="banner.id">
        <td>{{ banner.title }}</td>
        <td>{{ banner.order }}</td>
        <td>{{ banner.description }}</td>
        <td>
          <img :src="banner.image" alt="Фото" width="50"/>
        </td>
        <td>{{ banner?.product.name }}</td>
        <td>
          <button @click="editMainBanners(banner)" class="admin-panel__content_btn">Изменить</button>
        </td>
        <td>
          <button @click="deleteMainBanners(banner.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>
    <h3>Побочный слайдер</h3>
    <form class="admin-panel__content_form" v-if="!isEditingSlider" @submit.prevent="createSubBanner">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="titleSlider"
          placeholder="Введите название"
          :class="{ error: errors.titleSlider }"
      />
      <input
          type="number"
          class="basket__form_input admin-panel__content_input"
          v-model="numberSlider"
          placeholder="Введите порядок"
      />
      <input
          type="file"
          ref="fileSlider"
          class="basket__form_input admin-panel__content_input"
          @change="handleFileChangeSubBanners"
          accept="image/*"
          :class="{ error: errors.photoSlider }"
      />
      <button class="main_btn" type="submit">Создать слайд</button>
    </form>
    <form class="admin-panel__content_form" v-if="isEditingSlider" @submit.prevent="updateSubBanners">
      <input
          type="text"
          class="basket__form_input admin-panel__content_input"
          v-model="titleSlider"
          placeholder="Введите название"
          :class="{ error: errors.titleSlider }"
      />
      <input
          type="number"
          class="basket__form_input admin-panel__content_input"
          v-model="numberSlider"
          placeholder="Введите порядок"
      />
      <input
          type="file"
          ref="fileBanners"
          class="basket__form_input admin-panel__content_input"
          @change="handleFileChangeSubBanners"
          accept="image/*"
      />
      <button class="main_btn" type="submit">Изменить слайд</button>
      <button class="main_btn" type="button" @click="resetSubBanners">Отмена</button>
    </form>
    <table>
      <thead>
      <tr>
        <th>Название</th>
        <th>Порядок</th>
        <th>Фото</th>
        <th>Изменить</th>
        <th>Удалить</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="banner in subBanners" :key="banner.id">
        <td>{{ banner.title }}</td>
        <td>{{ banner.order }}</td>
        <td>
          <img :src="banner.image" alt="Фото" width="50"/>
        </td>
        <td>
          <button @click="editSubBanner(banner)" class="admin-panel__content_btn">Изменить</button>
        </td>
        <td>
          <button @click="deleteSubBanners(banner.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.input__wrapper {
  width: 100%;
  position: relative;
  margin: 15px 0;
  text-align: center;
}

.input__file {
  opacity: 0;
  visibility: hidden;
  position: absolute;
}

.input__file-icon-wrapper {
  height: 60px;
  width: 60px;
  margin-right: 15px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  border-right: 1px solid #fff;
}

.input__file-button-text {
  line-height: 1;
  margin-top: 1px;
}

.input__file-button {
  width: 100%;
  max-width: 290px;
  height: 60px;
  background: #1bbc9b;
  color: #fff;
  font-size: 1.125rem;
  font-weight: 700;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  border-radius: 3px;
  cursor: pointer;
  margin: 0 auto;
}
</style>