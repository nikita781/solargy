<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchPlace();
  }
});

const isLoading = ref(false);

const errors = ref({
  placeName: false,
  placeSelect: false,
  placeImg: false,
});

const place = ref([]);
const marketplacesPlace = ref([]);
const partnersPlace = ref([]);
const retailersPlace = ref([]);
const storesPlace = ref([]);
const placeName = ref('');
const placeUrl = ref('')
const placeImg = ref(null);
const placeFile = ref(null);
const placePreview = ref(null);
const placeSelect = ref('');
const isEditingPlace = ref(false);
const currentPlaceId = ref(false);

const fetchPlace = async () => {
  try {
    const response = await axios.get(`/purchase-place`, {
      headers: {},
    });
    place.value = response.data;
    marketplacesPlace.value = place.value.filter((item) => item.type === "marketplace");
    partnersPlace.value = place.value.filter((item) => item.type === "partner");
    retailersPlace.value = place.value.filter((item) => item.type === "retailer");
    storesPlace.value = place.value.filter((item) => item.type === "store");
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleFileChangePlace = (event) => {
  const file = event.target.files[0];
  if (file) {
    placeImg.value = file;
    placePreview.value = URL.createObjectURL(file);
  }
};
const createPlace = async () => {
  isLoading.value = true;
  errors.value.placeName = false;
  errors.value.placeSelect = false;
  errors.value.placeImg = false;
  errors.value.placeName = !placeName.value;
  errors.value.placeSelect = !placeSelect.value;
  errors.value.placeImg = !placeImg.value;
  try {
    const formData = new FormData();
    formData.append('name', placeName.value);
    formData.append('type', placeSelect.value);
    if (placeImg.value) {
      formData.append('image', placeImg.value);
    }
    if (placeUrl.value) {
      formData.append('url', placeUrl.value);
    }

    await axios.post(`/purchase-place`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPlace();
    resetPlace();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const updatePlace = async () => {
  isLoading.value = true;
  errors.value.placeName = false;
  errors.value.placeSelect = false;
  errors.value.placeName = !placeName.value;
  errors.value.placeSelect = !placeSelect.value;
  try {
    const formData = new FormData();
    formData.append('name', placeName.value);
    formData.append('type', placeSelect.value);
    if (placeImg.value) {
      formData.append('image', placeImg.value);
    }
    if (placeUrl.value) {
      formData.append('url', placeUrl.value);
    }

    await axios.post(`/purchase-place/${currentPlaceId.value}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPlace();
    resetPlace();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const deletePlace = async (idPlace) => {
  isLoading.value = true;
  try {
    await axios.delete(`/purchase-place/${idPlace}`, {
      headers: {},
    });
    await fetchPlace();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editPlace = (place) => {
  placePreview.value = place.image;
  isEditingPlace.value = true;
  currentPlaceId.value = place.id;
  placeName.value = place.name;
  placeUrl.value = place.url;
  placeSelect.value = place.type;
  errors.value.placeName = false;
  errors.value.placeSelect = false;
  errors.value.placeImg = false;
};
const resetPlace = () => {
  placePreview.value = null;
  isEditingPlace.value = false;
  placeName.value = '';
  placeUrl.value = '';
  placeImg.value = null;
  placeFile.value.value = ''
  placeSelect.value = ''
  currentPlaceId.value = null
  errors.value.placeName = false;
  errors.value.placeSelect = false;
  errors.value.placeImg = false;
};
const resetPlacePreview = () => {
  placePreview.value = null;
  placeImg.value = null;
  placeFile.value.value = ''
};
</script>

<template>
<div class="admin-panel__content">
  <h2>Управление страницей Где купить?</h2>
  <form class="admin-panel__content_form" v-if="!isEditingPlace" @submit.prevent="createPlace">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="placeName"
        placeholder="Введите название"
        :class="{ error: errors.placeName }"
    />
    <select v-model="placeSelect" :class="{ error: errors.placeSelect }"
            class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option value='marketplace'>
        Маркетплейсы
      </option>
      <option value='partner'>
        Дилеры и партнеры
      </option>
      <option value='retailer'>
        Розничные магазины
      </option>
      <option value='store'>
        Торговые сети
      </option>
    </select>
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="placeUrl"
        placeholder="Введите ссылку"
    />
    <div class="input__wrapper">
      <input ref="placeFile" type="file" id="input__file" class="input input__file-reset"
             @change="handleFileChangePlace" accept="image/*" multiple>
      <label for="input__file" class="input__file-button-reset">
          <span class="input__file-icon-wrapper">
            <img v-if="placePreview" class="input__file-icon" :src="placePreview" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
        <span class="input__file-icon-reset" @click.prevent="resetPlacePreview">
            <IconsCross color="#fff"/>
          </span>
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
      <span v-else>Создать пункт</span>
    </button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingPlace" @submit.prevent="updatePlace">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="placeName"
        placeholder="Введите название"
        :class="{ error: errors.placeName }"
    />
    <select v-model="placeSelect" :class="{ error: errors.placeSelect }"
            class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option value='marketplace'>
        Маркетплейсы
      </option>
      <option value='partner'>
        Дилеры и партнеры
      </option>
      <option value='retailer'>
        Розничные магазины
      </option>
      <option value='store'>
        Торговые сети
      </option>
    </select>
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="placeUrl"
        placeholder="Введите ссылку"
    />
    <div class="input__wrapper">
      <input ref="placeFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangePlace" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="placePreview" class="input__file-icon" :src="placePreview" alt="Выбрать файл"
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
      <span v-else>Изменить пункт</span>
    </button>
    <button class="main_btn" @click="resetPlace" v-if="!isLoading">Отмена</button>
  </form>
  <div class="admin-panel__content_info_item">
    Маркетплейсы
    <table>
      <thead>
      <tr>
        <th>Название</th>
        <th>Ссылка</th>
        <th>Иконка</th>
        <th style="width: 100px">Изменить</th>
        <th style="width: 100px">Удалить</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="place in marketplacesPlace" :key="place.id">
        <td>{{ place.name }}</td>
        <td>{{ place.url }}</td>
        <td>
          <img v-if="place.image" :src="place.image" alt="Фото" width="50"/>
        </td>
        <td>
          <button @click="editPlace(place)" class="admin-panel__content_btn">Изменить</button>
        </td>
        <td>
          <button @click="deletePlace(place.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div class="admin-panel__content_info_item">
    Дилеры и партнеры
    <table>
      <thead>
      <tr>
        <th>Название</th>
        <th>Ссылка</th>
        <th>Иконка</th>
        <th style="width: 100px">Изменить</th>
        <th style="width: 100px">Удалить</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="place in partnersPlace" :key="place.id">
        <td>{{ place.name }}</td>
        <td>{{ place.url }}</td>
        <td>
          <img v-if="place.image" :src="place.image" alt="Фото" width="50"/>
        </td>
        <td>
          <button @click="editPlace(place)" class="admin-panel__content_btn">Изменить</button>
        </td>
        <td>
          <button @click="deletePlace(place.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div class="admin-panel__content_info_item">
    Розничные магазины
    <table>
      <thead>
      <tr>
        <th>Название</th>
        <th>Ссылка</th>
        <th>Иконка</th>
        <th style="width: 100px">Изменить</th>
        <th style="width: 100px">Удалить</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="place in retailersPlace" :key="place.id">
        <td>{{ place.name }}</td>
        <td>{{ place.url }}</td>
        <td>
          <img v-if="place.image" :src="place.image" alt="Фото" width="50"/>
        </td>
        <td>
          <button @click="editPlace(place)" class="admin-panel__content_btn">Изменить</button>
        </td>
        <td>
          <button @click="deletePlace(place.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div class="admin-panel__content_info_item">
    Торговые сети
    <table>
      <thead>
      <tr>
        <th>Название</th>
        <th>Ссылка</th>
        <th>Иконка</th>
        <th style="width: 100px">Изменить</th>
        <th style="width: 100px">Удалить</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="place in storesPlace" :key="place.id">
        <td>{{ place.name }}</td>
        <td>{{ place.url }}</td>
        <td>
          <img v-if="place.image" :src="place.image" alt="Фото" width="50"/>
        </td>
        <td>
          <button @click="editPlace(place)" class="admin-panel__content_btn">Изменить</button>
        </td>
        <td>
          <button @click="deletePlace(place.id)" class="admin-panel__content_btn">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>