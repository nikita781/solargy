<script setup>
import Editor from "~/components/editor.vue";
import {onMounted, ref} from "vue";
import axios from "axios";
import PromoStockDialog from "~/components/Admin/PromoStockDialog.vue";

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

const fetchStocks = async (opts = {}) => {
  try {
    const response = await axios.get(`/promos`, {
      params: opts.bust ? { _ts: Date.now() } : undefined,
      headers: opts.bust ? { "Cache-Control": "no-cache", Pragma: "no-cache" } : undefined,
    });
    stocks.value = response.data;
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error);
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
  productProd.value = null;
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

const visibleDialogUpdate = ref(false);
const dialogMode = ref("create"); // "create" | "edit"
const dialogPromoId = ref(null);
const dialogSeed = ref(null);

const openCreateStock = () => {
  dialogMode.value = "create";
  dialogPromoId.value = null;
  dialogSeed.value = null;
  visibleDialogUpdate.value = true;
};

const editStock = (stock) => {
  dialogMode.value = "edit";
  dialogPromoId.value = stock.id;
  dialogSeed.value = null;
  visibleDialogUpdate.value = true;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getNewestPromoId = () => {
  let maxId = null;
  for (const p of stocks.value || []) {
    const n = Number(p?.id);
    if (Number.isFinite(n)) maxId = maxId === null ? n : Math.max(maxId, n);
  }
  return maxId;
};

const duplicateStock = async (stock) => {
  isLoading.value = true;
  try {
    // 1) создаем дубликат на бэке
    const resp = await axios.post(`/promos/${stock.id}/duplicate`);

    // 2) если бэк вернул id — супер
    const newIdFromResp = resp?.data?.id ?? resp?.data?.data?.id ?? null;

    // 3) обновляем список (и даем бэку время, если там задержка/кэш)
    for (let i = 0; i < 6; i++) {
      await fetchStocks({ bust: true });

      // если знаем id — ждем пока появится в списке
      if (newIdFromResp) {
        const exists = (stocks.value || []).some((p) => String(p.id) === String(newIdFromResp));
        if (exists) break;
      } else {
        // если id не знаем — просто подождем 1-2 попытки, чтобы список обновился
        if ((stocks.value || []).length) break;
      }

      await sleep(200 + i * 150);
    }

    const fallbackId = getNewestPromoId();
    const idToOpen = newIdFromResp || fallbackId;
    if (!idToOpen) return;

    // 4) открываем модалку сразу в edit на новом id
    dialogMode.value = "edit";
    dialogPromoId.value = idToOpen;
    dialogSeed.value = null;
    visibleDialogUpdate.value = true;
  } catch (e) {
    console.error("Ошибка дублирования:", e?.response?.data || e);
  } finally {
    isLoading.value = false;
  }
};


const onSavedStock = async () => {
  await fetchStocks({ bust: true });
};
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
  <button class="main_btn" type="button" @click="openCreateStock" style="width: fit-content">
    Создать акцию
  </button>
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
      <th style="width: 110px">Дублировать</th>
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
        <button @click="duplicateStock(stock)" class="admin-panel__content_btn" :disabled="isLoading">
          Дублировать
        </button>
      </td>
      <td>
        <button @click="deleteStock(stock.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <PromoStockDialog
      v-model="visibleDialogUpdate"
      :mode="dialogMode"
      :promo-id="dialogPromoId"
      :seed="dialogSeed"
      :all-products="allProductsFull"
      @saved="onSavedStock"
  />
</div>
</template>

<style scoped lang="scss">

</style>