<script setup>
import Editor from "~/components/editor.vue";
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchAllProducts();
    await fetchCategory();
    await fetchOptions();
  }
});

const isLoading = ref(false);

const errors = ref({
  productPrice: false,
  productDescription: false,
  productName: false,
  productCategory: false,
});

const productName = ref('');
const productCategory = ref(null);
const productDescription = ref('');
const productPrice = ref(null);
const productTop = ref(false)
const isEditingProduct = ref(false);
const currentProductId = ref(null);
const oneProd = ref([]);

const productPhoto = ref(null);
const productFile = ref(null);
const productOrder = ref(null);
const productPhoto1 = ref(null);
const productFile1 = ref(null);
const productOrder1 = ref(null);
const productPhoto2 = ref(null);
const productFile2 = ref(null);
const productOrder2 = ref(null);
const productPhoto3 = ref(null);
const productFile3 = ref(null);
const productOrder3 = ref(null);
const productPhoto4 = ref(null);
const productFile4 = ref(null);
const productOrder4 = ref(null);
const productPhoto5 = ref(null);
const productFile5 = ref(null);
const productOrder5 = ref(null);
const productPhoto6 = ref(null);
const productFile6 = ref(null);
const productOrder6 = ref(null);
const productPhoto7 = ref(null);
const productFile7 = ref(null);
const productOrder7 = ref(null);
const productPhoto8 = ref(null);
const productFile8 = ref(null);
const productOrder8 = ref(null);
const productPhoto9 = ref(null);
const productFile9 = ref(null);
const productOrder9 = ref(null);

const productOption = ref(null);
const valueByOption = ref([]);
const idByOption = ref('');
const productOptionValue = ref(null);
const productPropertieTitle = ref(null);
const productPropertieDescription = ref('');
const productFilePropertie = ref(null);
const productPhotoPropertie = ref(null);
const productTextFile = ref(null);
const productTextPropertie = ref(null);
const isEditingPropertie = ref(false);
const currentPropertieId = ref(null)
const isEditingProductPhoto = ref(false)
const currentProductPhotoId = ref(null)
const allProducts = ref([]);
const allCategories = ref([]);
const categories = ref([]);
const options = ref([]);

const fetchOptions = async () => {
  try {
    const response = await axios.get('/options');
    options.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
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
const flattenCategories = (categories) => {
  const result = [];
  const traverse = (categoryList, parentId = null) => {
    categoryList.forEach((category) => {
      result.push({
        id: category.id,
        name: category.name,
        level: category.level,
        parent_id: category.parent_id,
        parentId,
      });

      if (category.children && category.children.length > 0) {
        traverse(category.children, category.id);
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
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const fetchValueByOption = async (optionId) => {
  try {
    const response = await axios.get(`/options/${optionId}`, {
      headers: {},
    });
    idByOption.value = response.data.id;
    valueByOption.value = response.data.values;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const createProductOptionValue = async () => {
  try {
    const formData = new FormData();
    formData.append('options[0][id]', idByOption.value);
    formData.append('options[0][values][0][id]', productOptionValue.value);

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
    productOptionValue.value = '';
    idByOption.value = '';
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleExportHtmlPropertie = (html) => {
  productPropertieDescription.value = html;
};
const createProduct = async () => {
  errors.value.productCategory = false;
  errors.value.productName = false;
  errors.value.productDescription = false;
  errors.value.productPrice = false;
  errors.value.productCategory = !productCategory.value;
  errors.value.productName = !productName.value;
  errors.value.productDescription = !productDescription.value;
  errors.value.productPrice = !productPrice.value;
  try {
    const topProd = ref(0);
    if (productTop.value === true) {
      topProd.value = 1;
    }
    const formData = new FormData();
    formData.append('category_id', productCategory.value);
    formData.append('name', productName.value);
    formData.append('description', productDescription.value);
    formData.append('price', productPrice.value);
    formData.append('is_top', topProd.value);

    await axios.post(`/products`, formData, {
      headers: {},
    });
    await fetchAllProducts();
    resetProduct();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateProduct = async () => {
  errors.value.productCategory = false;
  errors.value.productName = false;
  errors.value.productDescription = false;
  errors.value.productPrice = false;
  errors.value.productCategory = !productCategory.value;
  errors.value.productName = !productName.value;
  errors.value.productDescription = !productDescription.value;
  errors.value.productPrice = !productPrice.value;
  try {
    const topProd = ref(0);
    if (productTop.value === true) {
      topProd.value = 1;
    }

    const formData = new FormData();
    formData.append('category_id', productCategory.value);
    formData.append('name', productName.value);
    formData.append('description', productDescription.value);
    formData.append('price', productPrice.value);
    formData.append('is_top', topProd.value);

    await axios.post(`/products/${currentProductId.value}?_method=patch`, formData, {
      headers: {},
    });
    await fetchAllProducts();
    resetProduct();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editProduct = (product) => {
  isEditingProduct.value = true;
  currentProductId.value = product.id;
  productName.value = product.name;
  productPrice.value = product.price;
  productDescription.value = product.description;
  productCategory.value = product.category_id.id;
  productTop.value = product.is_top;
  errors.value.productCategory = false;
  errors.value.productName = false;
  errors.value.productDescription = false;
  errors.value.productPrice = false;
};
const resetProduct = () => {
  isEditingProduct.value = false;
  currentProductId.value = null;
  productName.value = '';
  productDescription.value = '';
  productCategory.value = null;
  productPrice.value = null;
  productTop.value = false;
  errors.value.productCategory = false;
  errors.value.productName = false;
  errors.value.productDescription = false;
  errors.value.productPrice = false;
};
const fetchProductById = async (productId) => {
  try {
    const response = await axios.get(`/products/${productId}`, {
      headers: {},
    });
    oneProd.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const deleteProductPhoto = async (idValue) => {
  try {
    await axios.delete(`/productPhoto/${idValue}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const handleFileChangeProductPhoto = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto.value = file;
  }
};
const handleFileChangeProductPhoto1 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto1.value = file;
  }
};
const handleFileChangeProductPhoto2 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto2.value = file;
  }
};
const handleFileChangeProductPhoto3 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto3.value = file;
  }
};
const handleFileChangeProductPhoto4 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto4.value = file;
  }
};
const handleFileChangeProductPhoto5 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto5.value = file;
  }
};
const handleFileChangeProductPhoto6 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto6.value = file;
  }
};
const handleFileChangeProductPhoto7 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto7.value = file;
  }
};
const handleFileChangeProductPhoto8 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto8.value = file;
  }
};
const handleFileChangeProductPhoto9 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto9.value = file;
  }
};

const addProductPhoto = async () => {
  try {
    const formData = new FormData();
    formData.append('photos[0][photo]', productPhoto.value);
    if (productOrder.value) {
      formData.append('photos[0][order]', productOrder.value);
    }
    if (productPhoto1.value) {
      formData.append('photos[1][photo]', productPhoto1.value);
      if (productOrder1.value) {
        formData.append('photos[1][order]', productOrder1.value);
      }
    }
    if (productPhoto2.value) {
      formData.append('photos[2][photo]', productPhoto2.value);
      if (productOrder2.value) {
        formData.append('photos[2][order]', productOrder2.value);
      }
    }
    if (productPhoto3.value) {
      formData.append('photos[3][photo]', productPhoto3.value);
      if (productOrder3.value) {
        formData.append('photos[3][order]', productOrder3.value);
      }
    }
    if (productPhoto4.value) {
      formData.append('photos[4][photo]', productPhoto4.value);
      if (productOrder4.value) {
        formData.append('photos[4][order]', productOrder4.value);
      }
    }
    if (productPhoto5.value) {
      formData.append('photos[5][photo]', productPhoto5.value);
      if (productOrder5.value) {
        formData.append('photos[5][order]', productOrder5.value);
      }
    }
    if (productPhoto6.value) {
      formData.append('photos[6][photo]', productPhoto6.value);
      if (productOrder6.value) {
        formData.append('photos[6][order]', productOrder6.value);
      }
    }
    if (productPhoto7.value) {
      formData.append('photos[7][photo]', productPhoto7.value);
      if (productOrder7.value) {
        formData.append('photos[7][order]', productOrder7.value);
      }
    }
    if (productPhoto8.value) {
      formData.append('photos[8][photo]', productPhoto8.value);
      if (productOrder8.value) {
        formData.append('photos[8][order]', productOrder8.value);
      }
    }
    if (productPhoto9.value) {
      formData.append('photos[9][photo]', productPhoto9.value);
      if (productOrder9.value) {
        formData.append('photos[9][order]', productOrder9.value);
      }
    }

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchProductById(currentProductId.value);
    productPhoto.value = null;
    productFile.value.value = ''
    productOrder.value = '';
    productPhoto1.value = null;
    productFile1.value.value = ''
    productOrder1.value = '';
    productPhoto2.value = null;
    productFile2.value.value = ''
    productOrder2.value = '';
    productPhoto3.value = null;
    productFile3.value.value = ''
    productOrder3.value = '';
    productPhoto4.value = null;
    productFile4.value.value = ''
    productOrder4.value = '';
    productPhoto5.value = null;
    productFile5.value.value = ''
    productOrder5.value = '';
    productPhoto6.value = null;
    productFile6.value.value = ''
    productOrder6.value = '';
    productPhoto7.value = null;
    productFile7.value.value = ''
    productOrder7.value = '';
    productPhoto8.value = null;
    productFile8.value.value = ''
    productOrder8.value = '';
    productPhoto9.value = null;
    productFile9.value.value = ''
    productOrder9.value = '';
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateProductPhoto = async () => {
  try {
    const formData = new FormData();
    formData.append('photos[0][id]', currentProductPhotoId.value);
    if (productOrder.value) {
      formData.append('photos[0][order]', productOrder.value);
    }
    if (productPhoto.value) {
      formData.append('photos[0][photo]', productPhoto.value);
    }

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchProductById(currentProductId.value);
    productPhoto.value = null;
    productFile.value.value = ''
    productOrder.value = '';
    await resetProductPhoto();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const resetProductPhoto = async () => {
  isEditingProductPhoto.value = false;
  productPhoto.value = null;
  productFile.value = null;
  productOrder.value = null;
}
const editProductPhoto = async (photo) => {
  currentProductPhotoId.value = photo.id;
  isEditingProductPhoto.value = true;
  productOrder.value = photo.order;
}
const addProductOption = async () => {
  try {
    const valueId = await fetchOptionsById(productOption.value);
    const formData = new FormData();
    formData.append('options[0][id]', productOption.value);

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchProductById(currentProductId.value);
    productOption.value = null;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const fetchOptionsById = async (optionId) => {
  try {
    const response = await axios.get(`/options/${optionId}`, {
      headers: {},
    });
    return response.data.values[0].id;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const deleteProductOption = async (idOption) => {
  try {
    // const valueId = await fetchOptionsById(idOption);
    await axios.delete(`/products/${oneProd.value.id}/values/${idOption}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleFileChangeProductPropertie = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhotoPropertie.value = file;
  }
};
const handleFileChangeText = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (
      file.type === 'text/plain' ||
      file.type === 'application/json' ||
      file.name.endsWith('.csv')
  ) {
    productTextPropertie.value = file;
  }
}
const addProductPropertie = async () => {
  try {
    const title = ref('');
    if (productPropertieTitle.value === '1') {
      title.value = 'property'
    }
    if (productPropertieTitle.value === '2') {
      title.value = 'recommendation'
    }
    const formData = new FormData();
    formData.append('properties[0][title]', title.value);
    formData.append('properties[0][html]', productPropertieDescription.value);
    if (productTextPropertie.value) {
      formData.append('properties[0][file]', productTextPropertie.value);
    }
    if (productPhotoPropertie.value) {
      formData.append('properties[0][image]', productPhotoPropertie.value);
    }

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchProductById(currentProductId.value);
    productPropertieTitle.value = '';
    productPropertieDescription.value = '';
    productTextPropertie.value = null;
    productPhotoPropertie.value = null;
    productFilePropertie.value.value = '';
    productTextFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateProductPropertie = async () => {
  try {
    const title = ref('');
    if (productPropertieTitle.value === '1') {
      title.value = 'property'
    }
    if (productPropertieTitle.value === '2') {
      title.value = 'recommendation'
    }
    const formData = new FormData();
    formData.append('properties[0][id]', currentPropertieId.value);
    formData.append('properties[0][title]', title.value);
    formData.append('properties[0][html]', productPropertieDescription.value);
    if (productTextPropertie.value) {
      formData.append('properties[0][file]', productTextPropertie.value);
    }
    if (productPhotoPropertie.value) {
      formData.append('properties[0][image]', productPhotoPropertie.value);
    }

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchProductById(currentProductId.value);
    isEditingPropertie.value = false;
    productPropertieTitle.value = '';
    productPropertieDescription.value = '';
    productTextPropertie.value = null;
    productPhotoPropertie.value = null;
    productFilePropertie.value.value = '';
    productTextFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const editProductPropertie = (propertie) => {
  isEditingPropertie.value = true;
  currentPropertieId.value = propertie.id;
  if (propertie.title === 'property') {
    productPropertieTitle.value = '1';
  } else {
    productPropertieTitle.value = '2';
  }
  productPropertieDescription.value = propertie.html;
};
const resetProductPropertie = () => {
  isEditingPropertie.value = false;
  currentPropertieId.value = null;
  productPropertieTitle.value = '';
  productPropertieDescription.value = '';
  productTextPropertie.value = null;
  productPhotoPropertie.value = null;
  productFilePropertie.value.value = '';
  productTextFile.value.value = ''
};
const deleteProductPropertie = async (idPropertie) => {
  try {
    await axios.delete(`/productProperties/${idPropertie}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const deleteProduct = async (idOptions) => {
  try {
    await axios.delete(`/products/${idOptions}`, {
      headers: {},
    });
    await fetchAllProducts();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

watch(() => currentProductId.value, () => {
  fetchProductById(currentProductId.value);
});
</script>

<template>
<div class="admin-panel__content">
  <h2>Управление товарами</h2>
  <form class="admin-panel__content_form" v-if="!isEditingProduct" @submit.prevent="createProduct">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="productName"
        placeholder="Введите имя товара"
        :class="{ error: errors.productName }"
    />
    <textarea
        class="basket__form_input admin-panel__content_textarea"
        v-model="productDescription"
        placeholder="Введите описание"
        :class="{ error: errors.productDescription }"
    ></textarea>
    Категория
    <select v-model="productCategory" :class="{ error: errors.productCategory }"
            class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option v-for="category in allCategories" :key="category.id" :value="category.id">
        {{ category.name }}
      </option>
    </select>
    Топ товар
    <input
        type="checkbox"
        class="basket__form_input admin-panel__content_input"
        v-model="productTop"
        placeholder="Топ товар"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="productPrice"
        placeholder="Введите цену"
        :class="{ error: errors.productPrice }"
    />
    <button class="main_btn" type="submit">Создать товар</button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingProduct" @submit.prevent="updateProduct">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="productName"
        placeholder="Введите имя товара"
        :class="{ error: errors.productName }"
    />
    <textarea
        class="basket__form_input admin-panel__content_textarea"
        v-model="productDescription"
        placeholder="Введите описание"
        :class="{ error: errors.productDescription }"
    ></textarea>
    Категория
    <select v-model="productCategory" :class="{ error: errors.productCategory }"
            class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option v-for="category in allCategories" :key="category.id" :value="category.id">
        {{ category.name }}
      </option>
    </select>
    Топ товар
    <input
        type="checkbox"
        class="basket__form_input admin-panel__content_input"
        v-model="productTop"
        placeholder="Топ товар"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="productPrice"
        placeholder="Введите цену"
        :class="{ error: errors.productPrice }"
    />
    <button class="main_btn" type="submit">Изменить товар</button>
    <button class="main_btn" @click="resetProduct">Отмена</button>
  </form>
  <h3 v-if="isEditingProduct">Добавить картинку</h3>
  <form class="admin-panel__content_form" v-if="isEditingProduct && !isEditingProductPhoto"
        @submit.prevent="addProductPhoto">
    <input
        type="file"
        ref="productFile"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto"
        accept="image/*"
    />
    <input
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto"
        type="file"
        ref="productFile1"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto1"
        accept="image/*"
    />
    <input
        v-if="productPhoto"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder1"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto1"
        type="file"
        ref="productFile2"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto2"
        accept="image/*"
    />
    <input
        v-if="productPhoto1"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder2"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto2"
        type="file"
        ref="productFile3"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto3"
        accept="image/*"
    />
    <input
        v-if="productPhoto2"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder3"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto3"
        type="file"
        ref="productFile4"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto4"
        accept="image/*"
    />
    <input
        v-if="productPhoto3"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder4"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto4"
        type="file"
        ref="productFile5"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto5"
        accept="image/*"
    />
    <input
        v-if="productPhoto4"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder5"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto5"
        type="file"
        ref="productFile6"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto6"
        accept="image/*"
    />
    <input
        v-if="productPhoto5"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder6"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto6"
        type="file"
        ref="productFile7"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto7"
        accept="image/*"
    />
    <input
        v-if="productPhoto6"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder7"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto7"
        type="file"
        ref="productFile8"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto8"
        accept="image/*"
    />
    <input
        v-if="productPhoto7"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder8"
        placeholder="Введите порядок фото"
    />

    <input
        v-if="productPhoto8"
        type="file"
        ref="productFile9"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto9"
        accept="image/*"
    />
    <input
        v-if="productPhoto8"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder9"
        placeholder="Введите порядок фото"
    />
    <button class="main_btn" type="submit">Добавить</button>
    <button class="main_btn" @click="resetProduct">Отмена</button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingProduct && isEditingProductPhoto"
        @submit.prevent="updateProductPhoto">
    <input
        type="file"
        ref="productFile"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPhoto"
        accept="image/*"
    />
    <input
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder"
        placeholder="Введите порядок фото"
    />
    <button class="main_btn" type="submit">Изменить</button>
    <button class="main_btn" @click="resetProductPhoto">Отмена</button>
  </form>
  <table v-if="isEditingProduct">
    <thead>
    <tr>
      <th>Фото</th>
      <th>Порядок</th>
      <th>Изменить</th>
      <th>Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="product in oneProd.photos" :key="product.id">
      <td>
        <img :src="product.photo" alt="Фото" width="100"/>
      </td>
      <td>{{ product.order }}</td>
      <td>
        <button @click="editProductPhoto(product)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deleteProductPhoto(product.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <h3 v-if="isEditingProduct">Добавить параметр</h3>
  <form class="admin-panel__content_form" v-if="isEditingProduct" @submit.prevent="addProductOption">
    <select v-model="productOption" class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ option.name }}
      </option>
    </select>
    <button class="main_btn" type="submit">Добавить</button>
    <button class="main_btn" @click="resetProduct">Отмена</button>
  </form>
  <div
      v-if="isEditingProduct"
      class="admin-panel__content_info_item"
      v-for="option in oneProd.options"
      :key="option.id"
  >
    <div class="admin-panel__content_info_content">
      <p>{{ option.name }}</p>
    </div>
    <table>
      <thead>
      <tr>
        <th>Параметр</th>
        <th>Цена</th>
        <th>Фото</th>
        <th>Отвязка</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="value in option.values" :key="value.id">
        <td>{{ value.value }}</td>
        <td>{{ value.price }}</td>
        <td>
          <img :src="value.image" alt="Фото" width="100"/>
        </td>
        <td>
          <button @click="deleteProductOption(value.id)" class="admin-panel__content_btn">Отвязать</button>
        </td>
      </tr>
      </tbody>
    </table>
    <form class="admin-panel__content_form" @submit.prevent="createProductOptionValue">
      <select
          v-model="productOptionValue"
          class="basket__form_input admin-panel__content_select"
          @focus="fetchValueByOption(option.id)"
      >
        <option value="" disabled>Выберите параметр</option>
        <option v-for="value in valueByOption" :key="value.id" :value="value.id">
          {{ value.value }}
        </option>
      </select>
      <button class="main_btn" type="submit">Привязать</button>
    </form>
  </div>
  <h3 v-if="isEditingProduct">Добавить таб (максимум 2)</h3>
  <form class="admin-panel__content_form"
        v-if="isEditingProduct && !isEditingPropertie && oneProd.properties.length !== 2"
        @submit.prevent="addProductPropertie">
    <select v-model="productPropertieTitle" class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option value='1'>
        Характеристики
      </option>
      <option value='2'>
        Рекомендации
      </option>
    </select>
    <Editor @export-html="handleExportHtmlPropertie"/>
    <label class="admin-panel__content_label">Изображение</label>
    <input
        type="file"
        ref="productFilePropertie"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPropertie"
        accept="image/*"
    />
    <label class="admin-panel__content_label">Текстовый файл</label>
    <input
        type="file"
        ref="productTextFile"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeText"
        accept="text/plain,.csv,.json"
    />
    <button class="main_btn" type="submit">Добавить</button>
    <button class="main_btn" @click="resetProduct">Отмена</button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingProduct && isEditingPropertie"
        @submit.prevent="updateProductPropertie">
    <select v-model="productPropertieTitle" class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option value='1'>
        Характеристики
      </option>
      <option value='2'>
        Рекомендации
      </option>
    </select>
    <!--          <textarea-->
    <!--              class="basket__form_input admin-panel__content_textarea"-->
    <!--              v-model="productPropertieDescription"-->
    <!--              placeholder="Введите описание"-->
    <!--          ></textarea>-->
    <Editor :initialHtml="productPropertieDescription" @export-html="handleExportHtmlPropertie"/>
    <label class="admin-panel__content_label">Изображение</label>
    <input
        type="file"
        ref="productFilePropertie"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeProductPropertie"
        accept="image/*"
    />
    <label class="admin-panel__content_label">Текстовый файл</label>
    <input
        type="file"
        ref="productTextFile"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeText"
        accept="text/plain,.csv,.json"
    />
    <button class="main_btn" type="submit">Изменить</button>
    <button class="main_btn" @click="resetProductPropertie">Отмена</button>
  </form>
  <table v-if="isEditingProduct">
    <thead>
    <tr>
      <th>Название</th>
      <th>Контент</th>
      <th>Изменить</th>
      <th>Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="propertie in oneProd.properties" :key="propertie.id">
      <td>{{ propertie.title === 'recommendation' ? 'Характеристики' : 'Рекомендации' }}</td>
      <td>{{ propertie.html }}</td>
      <td>
        <button @click="editProductPropertie(propertie)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deleteProductPropertie(propertie.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <table>
    <thead>
    <tr>
      <th>Название</th>
      <th>Категория</th>
      <th>Описание</th>
      <th>Цена</th>
      <th>Топ</th>
      <th>Изменить</th>
      <th>Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="product in allProducts" :key="product.id">
      <td>{{ product.name }}</td>
      <td>{{ product.category_id.name }}</td>
      <td>{{ product.description }}</td>
      <td>{{ product.price }}</td>
      <td><input type="checkbox" disabled v-model="product.is_top"/></td>
      <td>
        <button @click="editProduct(product)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deleteProduct(product.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
</div>
</template>

<style scoped lang="scss">

</style>