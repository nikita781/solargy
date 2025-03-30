<script setup>
import Editor from "~/components/editor.vue";
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchPromo();
    await fetchStocks();
    await fetchAllProductsFull();
  }
});

const isLoading = ref(false);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const errors = ref({
  promoTitle: false,
  promoImage: false,

  stockTitle: false,
  stockDescription: false,
  stockImage: false,
  stockStart: false,
  stockEnd: false,
});

const promo = ref([]);
const isEditingPromo = ref(false);
const promoTitle = ref('');
const promoDescription = ref('');
const promoImage = ref(null);
const promoFile = ref(null);
const promoPreview = ref(null);
const currentPromosBlockId = ref(null);

const fetchPromo = async () => {
  try {
    const response = await axios.get(`/pages/1`, {
      headers: {},
    });
    promo.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleFileChangePromo = (event) => {
  const file = event.target.files[0];
  if (file) {
    promoImage.value = file;
    promoPreview.value = URL.createObjectURL(file);
  }
};
const handleExportHtmlPromoBlock = (html) => {
  promoDescription.value = html;
}
const createPromoBlock = async () => {
  isLoading.value = true;
  errors.value.promoTitle = false;
  errors.value.promoImage = false;
  errors.value.promoTitle = !promoTitle.value;
  errors.value.promoImage = !promoImage.value;
  try {
    const formData = new FormData();
    formData.append('sections[0][title]', promoTitle.value);
    formData.append('sections[0][html]', promoDescription.value);
    formData.append('sections[0][image]', promoImage.value);

    await axios.post(`/pages/1?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPromo();
    resetPromoBlock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const updatePromoBlock = async () => {
  isLoading.value = true;
  errors.value.promoTitle = false;
  errors.value.promoTitle = !promoTitle.value;
  try {
    const formData = new FormData();
    formData.append('sections[0][id]', currentPromosBlockId.value);
    formData.append('sections[0][title]', promoTitle.value);
    formData.append('sections[0][html]', promoDescription.value);
    if (promoImage.value) {
      formData.append('sections[0][image]', promoImage.value);
    }

    await axios.post(`/pages/1?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPromo();
    resetPromoBlock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const deletePromoBlock = async (idBlock) => {
  isLoading.value = true;
  try {
    await axios.delete(`/pages/${idBlock}`, {
      headers: {},
    });
    await fetchPromo();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const editPromoBlock = (block) => {
  promoPreview.value = block.image;
  isEditingPromo.value = true;
  currentPromosBlockId.value = block.id;
  promoTitle.value = block.title;
  promoDescription.value = block.html;
  errors.value.promoTitle = false;
  errors.value.promoImage = false;
};
const resetPromoBlock = () => {
  promoPreview.value = null;
  isEditingPromo.value = false;
  promoTitle.value = '';
  promoDescription.value = '';
  promoImage.value = null;
  promoFile.value.value = ''
  currentPromosBlockId.value = null
  errors.value.promoTitle = false;
  errors.value.promoImage = false;
};


const stocks = ref([]);
const oneStock = ref([]);
const isEditingStock = ref(false);
const stockTitle = ref('');
const stockDescription = ref('');
const stockImage = ref(null);
const stockFile = ref(null);
const stockPreview = ref(null);
const stockStart = ref('');
const stockEnd = ref('')
const stockArchived = ref(false);
const currentStockId = ref(null);

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
const fetchStocksOne = async (idPromo) => {
  try {
    const response = await axios.get(`/promos/${idPromo}`, {
      headers: {},
    });
    oneStock.value = response.data;

    stockPreview.value = oneStock.value.image;
    isEditingStock.value = true;
    currentStockId.value = oneStock.value.id;
    stockTitle.value = oneStock.value.title;
    stockDescription.value = oneStock.value.description;
    stockStart.value = oneStock.value.start;
    stockEnd.value = oneStock.value.end;
    stockArchived.value = oneStock.value.is_archived;
    stockProd.value = oneStock.value.products;
    errors.value.stockTitle = false;
    errors.value.stockDescription = false;
    errors.value.stockImage = false;
    errors.value.stockStart = false;
    errors.value.stockEnd = false;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleFileChangeStock = (event) => {
  const file = event.target.files[0];
  if (file) {
    stockImage.value = file;
    stockPreview.value = URL.createObjectURL(file);
  }
};
const createStock = async () => {
  isLoading.value = true;
  errors.value.stockTitle = false;
  errors.value.stockDescription = false;
  errors.value.stockImage = false;
  errors.value.stockStart = false;
  errors.value.stockEnd = false;
  errors.value.stockTitle = !stockTitle.value;
  errors.value.stockDescription = !stockDescription.value;
  errors.value.stockImage = !stockImage.value;
  errors.value.stockStart = !stockStart.value;
  errors.value.stockEnd = !stockEnd.value;
  try {
    const formData = new FormData();
    formData.append('title', stockTitle.value);
    formData.append('description', stockDescription.value);
    formData.append('image', stockImage.value);
    formData.append('start', stockStart.value);
    formData.append('end', stockEnd.value);
    formData.append('is_archived', stockArchived.value);

    await axios.post(`/promos`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchStocks();
    resetStock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const updateStock = async () => {
  isLoading.value = true;
  errors.value.stockTitle = false;
  errors.value.stockDescription = false;
  errors.value.stockStart = false;
  errors.value.stockEnd = false;
  errors.value.stockTitle = !stockTitle.value;
  errors.value.stockDescription = !stockDescription.value;
  errors.value.stockStart = !stockStart.value;
  errors.value.stockEnd = !stockEnd.value;
  try {
    const formData = new FormData();
    formData.append('title', stockTitle.value);
    formData.append('description', stockDescription.value);
    if (stockImage.value) {
      formData.append('image', stockImage.value);
    }
    formData.append('start', stockStart.value);
    formData.append('end', stockEnd.value);
    formData.append('is_archived', stockArchived.value);

    await axios.post(`/promos/${currentStockId.value}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchStocks();
    closeDialogUpdate();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const deleteStock = async (idStock) => {
  isLoading.value = true;
  try {
    await axios.delete(`/promos/${idStock}`, {
      headers: {},
    });
    await fetchStocks();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const stockProd = ref([]);
const editStock = (stock) => {
  fetchStocksOne(stock.id);
  openDialogUpdate();
};
const resetStock = () => {
  stockPreview.value = null;
  isEditingStock.value = false;
  stockTitle.value = '';
  stockDescription.value = '';
  stockImage.value = null;
  stockFile.value.value = ''
  stockStart.value = '';
  stockEnd.value = '';
  stockArchived.value = false;
  currentStockId.value = null
  stockProd.value = [];
  errors.value.stockTitle = false;
  errors.value.stockDescription = false;
  errors.value.stockImage = false;
  errors.value.stockStart = false;
  errors.value.stockEnd = false;
};

const allProductsFull = ref([]);
const productProd = ref(null)

const fetchAllProductsFull = async () => {
  try {
    const response = await axios.get(`/products-for-select`);
    allProductsFull.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};

const addPromoProd = async () => {
  isLoading.value = true;
  try {
    await axios.post(`/promos/${currentStockId.value}/products/${productProd.value}`, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    fetchStocksOne(currentStockId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const deletePromoProd = async (isProd) => {
  isLoading.value = true;
  try {
    await axios.delete(`/promos/${currentStockId.value}/products/${isProd}`, {
      headers: {},
    });
    fetchStocksOne(currentStockId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};

const visibleDialogUpdate = ref(false);
const openDialogUpdate = () => {
  visibleDialogUpdate.value = true;
};
const closeDialogUpdate = () => {
  activeTab.value = "Главная";
  visibleDialogUpdate.value = false;
  resetStock();
  fetchStocks();
};
const activeTab = ref("Главная");
</script>

<template>
<div class="admin-panel__content">
  <h2>Управление страницей акции</h2>
  <h3>Блоки</h3>
  <form class="admin-panel__content_form" v-if="!isEditingPromo" @submit.prevent="createPromoBlock">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="promoTitle"
        placeholder="Введите название"
        :class="{ error: errors.promoTitle }"
    />
    <Editor @export-html="handleExportHtmlPromoBlock"/>
    <div class="input__wrapper">
      <input ref="promoFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangePromo" accept="image/*" multiple>
      <label for="input__file" class="input__file-button" :class="{ error: errors.promoImage }">
          <span class="input__file-icon-wrapper">
            <img v-if="promoPreview" class="input__file-icon" :src="promoPreview" alt="Выбрать файл"
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
  <form class="admin-panel__content_form" v-if="isEditingPromo" @submit.prevent="updatePromoBlock">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="promoTitle"
        placeholder="Введите название"
        :class="{ error: errors.promoTitle }"
    />
    <Editor :initialHtml="promoDescription" @export-html="handleExportHtmlPromoBlock"/>
    <div class="input__wrapper">
      <input ref="promoFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangePromo" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="promoPreview" class="input__file-icon" :src="promoPreview" alt="Выбрать файл"
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
    <button class="main_btn" type="submit" @click="resetPromoBlock" v-if="!isLoading">Отмена</button>
  </form>
  <table>
    <thead>
    <tr>
      <th>Название</th>
      <th>Описание</th>
      <th>Фото</th>
      <th style="width: 100px">Изменить</th>
      <th style="width: 100px">Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="section in promo.sections" :key="section.id">
      <td>{{ section.title }}</td>
      <td>{{ section.html }}</td>
      <td>
        <img v-if="section.image" :src="section.image" alt="Фото" width="50"/>
      </td>
      <td>
        <button @click="editPromoBlock(section)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deletePromoBlock(section.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <h3>Акции</h3>
  <form class="admin-panel__content_form" @submit.prevent="createStock">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="stockTitle"
        placeholder="Введите название"
        :class="{ error: errors.stockTitle }"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="stockDescription"
        placeholder="Введите описание"
        :class="{ error: errors.stockDescription }"
    />
    <input
        type="date"
        class="basket__form_input admin-panel__content_input"
        v-model="stockStart"
        placeholder="Введите дату начала"
        :class="{ error: errors.stockStart }"
    />
    <input
        type="date"
        class="basket__form_input admin-panel__content_input"
        v-model="stockEnd"
        placeholder="Введите дату конца"
        :class="{ error: errors.stockEnd }"
    />
    В архив
    <input
        type="checkbox"
        class="basket__form_input admin-panel__content_input"
        v-model="stockArchived"
        placeholder="Архив"
    />
    <div class="input__wrapper">
      <input ref="stockFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeStock" accept="image/*" multiple>
      <label for="input__file" class="input__file-button" :class="{ error: errors.stockImage }">
          <span class="input__file-icon-wrapper">
            <img v-if="stockPreview" class="input__file-icon" :src="stockPreview" alt="Выбрать файл"
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
      <span v-else>Создать акцию</span>
    </button>
  </form>
  <table>
    <thead>
    <tr>
      <th>Название</th>
      <th>Описание</th>
      <th>Фото</th>
      <th>Дата старта</th>
      <th>Дата окончания</th>
      <th>В архиве</th>
      <th style="width: 100px">Изменить</th>
      <th style="width: 100px">Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="stock in stocks" :key="stock.id">
      <td>{{ stock.title }}</td>
      <td>{{ stock.description }}</td>
      <td>
        <img v-if="stock.image" :src="stock.image" alt="Фото" width="50"/>
      </td>
      <td>{{ formatDate(stock.start) }}</td>
      <td>{{ formatDate(stock.end) }}</td>
      <td><input type="checkbox" disabled v-model="stock.is_archived"/></td>
      <td>
        <button @click="editStock(stock)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deleteStock(stock.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <div class="admin__dialog" v-if="visibleDialogUpdate" @click="closeDialogUpdate">
    <div class="admin__dialog_container admin__dialog_container-prod" @click.stop>
      <div class="admin__dialog_tabs">
        <p
            class="admin__dialog_tabs-item"
            :class="{ active: activeTab === 'Главная' }"
            @click="activeTab = 'Главная'"
        >
          Главная
        </p>
        <p
            class="admin__dialog_tabs-item"
            :class="{ active: activeTab === 'Товары' }"
            @click="activeTab = 'Товары'"
        >
          Товары
        </p>
      </div>
      <div
          class="admin__dialog_content"
          v-if="activeTab === 'Главная'"
      >
        <h3 class="admin__dialog_title">Изменение акции</h3>
        <form class="admin-panel__content_form-dialog" @submit.prevent="updateStock">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="stockTitle"
              placeholder="Введите название"
              :class="{ error: errors.stockTitle }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="stockDescription"
              placeholder="Введите описание"
              :class="{ error: errors.stockDescription }"
          />
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="stockStart"
              placeholder="Введите дату начала"
              :class="{ error: errors.stockStart }"
          />
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="stockEnd"
              placeholder="Введите дату конца"
              :class="{ error: errors.stockEnd }"
          />
          В архив
          <input
              type="checkbox"
              class="basket__form_input admin-panel__content_input"
              v-model="stockArchived"
              placeholder="Архив"
          />
          <div class="input__wrapper">
            <input ref="stockFile" type="file" id="input__file" class="input input__file"
                   @change="handleFileChangeStock" accept="image/*" multiple>
            <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="stockPreview" class="input__file-icon" :src="stockPreview" alt="Выбрать файл"
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
            <span v-else>Изменить акцию</span>
          </button>
        </form>
      </div>
      <div
          class="admin__dialog_content"
          v-if="activeTab === 'Товары'"
      >
        <h3 class="admin__dialog_title">Привязанные товары</h3>
        <form
            class="admin-panel__content_form-dialog"
            @submit.prevent="addPromoProd"
        >
          <div class="admin__dialog_grid">
            <select v-model="productProd" class="basket__form_input admin-panel__content_select"  style="height: 100%">
              <option value="" disabled>Выберите товар</option>
              <option v-for="prod in allProductsFull" :key="prod.id" :value="prod.id">
                {{ prod.name }}
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
              <span v-else>Добавить товар</span>
            </button>
          </div>
        </form>
        <table>
          <thead>
          <tr>
            <th>Название</th>
            <th style="width: 100px">Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="prod in stockProd" :key="prod.id">
            <td>{{ prod.name }}</td>
            <td>
              <button @click="deletePromoProd(prod.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>