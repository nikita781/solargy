<script setup>
import {computed, onMounted, ref} from "vue";
import axios, {all} from "axios";
import EditorProd from "~/components/UI/editorProd.vue";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchAllProducts();
    await fetchCategory();
    await fetchOptions();
    await fetchImgs();
    await fetchProductPrice();
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
const productPreview = ref(null);
const productOrder = ref(null);
const productPhoto1 = ref(null);
const productFile1 = ref(null);
const productPreview1 = ref(null);
const productOrder1 = ref(null);
const productPhoto2 = ref(null);
const productFile2 = ref(null);
const productPreview2 = ref(null);
const productOrder2 = ref(null);
const productPhoto3 = ref(null);
const productFile3 = ref(null);
const productPreview3 = ref(null);
const productOrder3 = ref(null);
const productPhoto4 = ref(null);
const productFile4 = ref(null);
const productPreview4 = ref(null);
const productOrder4 = ref(null);
const productPhoto5 = ref(null);
const productFile5 = ref(null);
const productPreview5 = ref(null);
const productOrder5 = ref(null);
const productPhoto6 = ref(null);
const productFile6 = ref(null);
const productPreview6 = ref(null);
const productOrder6 = ref(null);
const productPhoto7 = ref(null);
const productFile7 = ref(null);
const productPreview7 = ref(null);
const productOrder7 = ref(null);
const productPhoto8 = ref(null);
const productFile8 = ref(null);
const productPreview8 = ref(null);
const productOrder8 = ref(null);
const productPhoto9 = ref(null);
const productFile9 = ref(null);
const productPreview9 = ref(null);
const productOrder9 = ref(null);

const productOption = ref(null);
const valueByOption = ref([]);
const idByOption = ref('');
const productOptionValue = ref(null);
const productPropertieTitle = ref(null);
const productPropertieDescription = ref('');
const productFilePropertie = ref(null);
const productPhotoPropertie = ref(null);
const productPreviewPropertie = ref(null);
const productTextFile = ref(null);
const productTextPropertie = ref(null);
const isEditingPropertie = ref(false);
const currentPropertieId = ref(null)
const isEditingProductPhoto = ref(false)
const currentProductPhotoId = ref(null)
const allProducts = ref([]);
const allProductsSearch = ref([]);
const allCategories = ref([]);
const categories = ref([]);
const options = ref([]);
const searchQuery = ref('');
const productProd = ref(null)
const productSearch = ref('')
const isSearch = ref(false);

const page = ref(1);
const totalPages = ref(0);
const itemsPerPage = 10;

const fetchOptions = async () => {
  try {
    const response = await axios.get('/options');
    options.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const fetchSearchOptions = async (query) => {
  try {
    const response = await axios.get(`/search/options?q=${query}`);
    options.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleSearch = async () => {
  if (searchQuery.value.trim() === '') {
    await fetchOptions();
  } else {
    await fetchSearchOptions(searchQuery.value);
  }
};
const fetchAllProducts = async () => {
  try {
    const response = await axios.get(`/all-products?page=${page.value}`);
    totalPages.value = response.data.meta.last_page || 0;
    allProducts.value = response.data.data || [];
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const fetchSearchProduct = async () => {
  try {
    const response = await axios.get(`/search-fast?q=${productSearch.value}`);
    allProductsSearch.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
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
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
};
const handleExportHtmlPropertie = (html) => {
  productPropertieDescription.value = html;
};
const createProduct = async () => {
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
};
const updateProduct = async () => {
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
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
  formattedOptions.value = null;
  selectedValues.value = null
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
  isLoading.value = true;
  try {
    await axios.delete(`/productPhoto/${idValue}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};

const handleFileChangeProductPhoto = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto.value = file;
    productPreview.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto1 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto1.value = file;
    productPreview1.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto2 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto2.value = file;
    productPreview2.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto3 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto3.value = file;
    productPreview3.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto4 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto4.value = file;
    productPreview4.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto5 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto5.value = file;
    productPreview5.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto6 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto6.value = file;
    productPreview6.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto7 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto7.value = file;
    productPreview7.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto8 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto8.value = file;
    productPreview8.value = URL.createObjectURL(file);
  }
};
const handleFileChangeProductPhoto9 = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhoto9.value = file;
    productPreview9.value = URL.createObjectURL(file);
  }
};

const addProductPhoto = async () => {
  isLoading.value = true;
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
    productPreview.value = null
    productOrder.value = '';
    productPhoto1.value = null;
    productFile1.value.value = ''
    productPreview1.value = null
    productOrder1.value = '';
    productPhoto2.value = null;
    productFile2.value.value = ''
    productPreview2.value = null
    productOrder2.value = '';
    productPhoto3.value = null;
    productFile3.value.value = ''
    productPreview3.value = null
    productOrder3.value = '';
    productPhoto4.value = null;
    productFile4.value.value = ''
    productPreview4.value = null
    productOrder4.value = '';
    productPhoto5.value = null;
    productFile5.value.value = ''
    productPreview5.value = null
    productOrder5.value = '';
    productPhoto6.value = null;
    productFile6.value.value = ''
    productPreview6.value = null
    productOrder6.value = '';
    productPhoto7.value = null;
    productFile7.value.value = ''
    productPreview7.value = null
    productOrder7.value = '';
    productPhoto8.value = null;
    productFile8.value.value = ''
    productPreview8.value = null
    productOrder8.value = '';
    productPhoto9.value = null;
    productFile9.value.value = ''
    productPreview9.value = null
    productOrder9.value = '';
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const updateProductPhoto = async () => {
  isLoading.value = true;
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
    productPreview.value = null
    productOrder.value = '';
    await resetProductPhoto();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const resetProductPhoto = async () => {
  isEditingProductPhoto.value = false;
  productPhoto.value = null;
  productFile.value = null;
  productOrder.value = null;
  productPreview.value = null
}
const editProductPhoto = async (photo) => {
  currentProductPhotoId.value = photo.id;
  isEditingProductPhoto.value = true;
  productOrder.value = photo.order;
  productPreview.value = photo.photo;
}
function getIdByName(name) {
  const foundOption = options.value.find(option => option.name === name);
  return foundOption ? foundOption.id : null;
}
const addProductOption = async () => {
  isLoading.value = true;
  try {
    const valueId = await getIdByName(productOption.value);
    const formData = new FormData();
    // formData.append('options[0][id]', productOption.value);
    formData.append('options[0][id]',valueId);

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchProductById(currentProductId.value);
    productOption.value = null;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const fetchOptionsById = async (optionId) => {
  try {
    const response = await axios.get(`/options/${optionId}`, {
      headers: {},
    });
    return response.data.values[0].id;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const deleteProductOptionFull = async (idOption) => {
  isLoading.value = true;
  try {
    // const valueId = await fetchOptionsById(idOption);
    await axios.delete(`/products/${oneProd.value.id}/options/${idOption}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const deleteProductOption = async (idOption) => {
  isLoading.value = true;
  try {
    // const valueId = await fetchOptionsById(idOption);
    await axios.delete(`/products/${oneProd.value.id}/values/${idOption}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const handleFileChangeProductPropertie = (event) => {
  const file = event.target.files[0];
  if (file) {
    productPhotoPropertie.value = file;
    productPreviewPropertie.value = URL.createObjectURL(file);
  }
};
const handleFileChangeText = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const allowedExtensions = ['.pdf', '.dwg', '.docx'];
  const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (allowedExtensions.includes(fileExtension)) {
    productTextPropertie.value = file;
  } else {
    alert('Недопустимый формат файла. Пожалуйста, загрузите файл в формате PDF, DWG или DOCX.');
  }
};

const addProductPropertie = async () => {
  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('properties[0][title]', productPropertieTitle.value);
    formData.append('properties[0][html]', productPropertieDescription.value);
    if (optionFile.value) {
      formData.append('properties[0][from-library]', true);
      formData.append('properties[0][file-library]', optionFile.value);
      formData.append('properties[0][filename]', optionFileName.value);
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
    optionFile.value = null;
    optionFileName.value = null;
    productPropertieTitle.value = '';
    productPropertieDescription.value = '';
    productTextPropertie.value = null;
    productPhotoPropertie.value = null;
    productFilePropertie.value.value = '';
    productTextFile.value.value = ''
    productPreviewPropertie.value = null
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const addProductProd = async () => {
  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('related_product_ids[0][id]', productProd.value);

    await axios.post(`/products/${oneProd.value.id}/related`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchProductById(currentProductId.value);
    productProd.value = '';
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
}
const deleteProductProd = async (idPropertie) => {
  isLoading.value = true;
  try {
    await axios.delete(`/products/${oneProd.value.id}/related/${idPropertie}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const updateProductPropertie = async () => {
  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('properties[0][id]', currentPropertieId.value);
    formData.append('properties[0][title]', productPropertieTitle.value);
    formData.append('properties[0][html]', productPropertieDescription.value);
    if (optionFile.value) {
      formData.append('properties[0][from-library]', true);
      formData.append('properties[0][file-library]', optionFile.value);
      formData.append('properties[0][filename]', optionFileName.value);
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
    optionFile.value = null;
    optionFileName.value = null;
    isEditingPropertie.value = false;
    productPropertieTitle.value = '';
    productPropertieDescription.value = '';
    productTextPropertie.value = null;
    productPhotoPropertie.value = null;
    productFilePropertie.value.value = '';
    productTextFile.value.value = ''
    productPreviewPropertie.value = false;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
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
  switch (propertie.title) {
    case 'property':
      productPropertieTitle.value = 'property';
      break
    case 'description':
      productPropertieTitle.value = 'description';
      break
    case 'photo':
      productPropertieTitle.value = 'photo';
      break
    case 'instruction':
      productPropertieTitle.value = 'instruction';
      break
    case 'recommendation':
      productPropertieTitle.value = 'recommendation';
      break
    case 'guaranty':
      productPropertieTitle.value = 'guaranty';
      break
  }
  productPropertieDescription.value = propertie.html;
  productPreviewPropertie.value = propertie.image;
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
  productPreviewPropertie.value = null;
};
const resetProductPreviewPropertie = () => {
  productPhotoPropertie.value = null;
  productFilePropertie.value.value = '';
  productPreviewPropertie.value = null;
};
const deleteProductPropertie = async (idPropertie) => {
  isLoading.value = true;
  try {
    await axios.delete(`/productProperties/${idPropertie}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const deleteProduct = async (idOptions) => {
  isLoading.value = true;
  try {
    await axios.delete(`/products/${idOptions}`, {
      headers: {},
    });
    await fetchAllProducts();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const copyProduct = async (idOptions) => {
  isLoading.value = true;
  try {
    await axios.post(`/products/${idOptions}/copy`, {
      headers: {},
    });
    await fetchAllProducts();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};

watch(() => currentProductId.value, () => {
  fetchProductById(currentProductId.value);
});

function toggleTab(title) {
  switch (title) {
    case 'property':
      return 'Характеристики'
    case 'description':
      return 'Описание'
    case 'photo':
      return 'Фото товара'
    case 'instruction':
      return 'Инструкции'
    case 'recommendation':
      return 'Рекомендации'
    case 'guaranty':
      return 'Гарантии'
  }
}

const paginatedProducts = computed(() => allProducts.value.slice(0, itemsPerPage));

const goToPage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchAllProducts();
  }
};
const pagesInRange = computed(() => {
  const range = [];
  const start = Math.max(2, page.value - 4);
  const end = Math.min(totalPages.value - 1, page.value + 4);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
});

function searchProduct() {
  if (productSearch.value.trim() !== '') {
    fetchSearchProduct()
    isSearch.value = true
  } else {
    isSearch.value = false
  }
}

const visibleDialog = ref(false);
const files = ref([]);
const productTextFileName = ref(null);
const optionFile = ref(null);
const optionFileName = ref('');
const openDialog = () => {
  visibleDialog.value = true;
};
const closeDialog = () => {
  visibleDialog.value = false;
};
const fetchImgs = async () => {
  try {
    const response = await axios.get('/library-files');
    files.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const resetDialogPreview = () => {
  productFilePropertie.value.value = '';
  productTextFile.value.value = ''
  productTextFileName.value = null
};
const addImage = async () => {
  try {
    const formData = new FormData();
    formData.append('file', productTextPropertie.value);
    formData.append('file_name', productTextFileName.value);

    await axios.post(`/library-files`, formData, {
      headers: {},
    });
    await fetchImgs();
    resetDialogPreview();
    productFilePropertie.value.value = '';
    productTextFile.value.value = ''
    productTextFileName.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    productFilePropertie.value.value = '';
    productTextFile.value.value = ''
    productTextFileName.value = ''
  }
};
const deleteImg = async (imgId) => {
  try {
    await axios.delete(`/library-files/${imgId}`, {
      headers: {},
    });
    await fetchImgs();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const selectPhoto = (file) => {
  optionFile.value = file.file;
  optionFileName.value = file.file_name;
  closeDialog()
};
const resetPhoto = () => {
  optionFile.value = null;
  optionFileName.value = null;
};



const selectedValues = ref({});
const totalPrice = ref(null);
const filteredProducts = ref([]);

const formattedOptions = computed(() => {
  const result = {};
  for (const [optionId, valueId] of Object.entries(selectedValues.value)) {
    result[optionId] = valueId;
  }
  return result;
});
const fetchProductPrice = async () => {
  try {
    const response = await axios.get('/product-option-prices');
    filteredProducts.value = response.data.filter(item => item.product_id === oneProd.value.id);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const addProductPrice = async () => {
  isLoading.value = true;
  try {
    console.log(formattedOptions.value);

    // Формируем объект JSON вместо FormData
    const payload = {
      product_id: oneProd.value.id,
      price: totalPrice.value,
      options: formattedOptions.value, // Должен быть объект типа {6: 40, 24: 48}
    };

    console.log(payload);

    // Отправка данных с Content-Type: application/json
    await axios.post(`/product-option-prices`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await fetchProductById(currentProductId.value)
    // Сбрасываем значения после успешной отправки
    formattedOptions.value = null;
    selectedValues.value = {};
    totalPrice.value = '';
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
const deleteProductPrice = async (imgId) => {
  try {
    await axios.delete(`/product-option-prices/${imgId}`, {
      headers: {},
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
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
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Создать товар</span>
    </button>
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
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Изменить товар</span>
    </button>
    <button class="main_btn" @click="resetProduct" v-if="!isLoading">Отмена</button>
  </form>
  <h3 v-if="isEditingProduct">Добавить картинку</h3>
  <form class="admin-panel__content_form" v-if="isEditingProduct && !isEditingProductPhoto"
        @submit.prevent="addProductPhoto">
<!--    <input-->
<!--        type="file"-->
<!--        ref="productFile"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper">
      <input ref="productFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview" class="input__file-icon" :src="productPreview" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto"-->
<!--        type="file"-->
<!--        ref="productFile1"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto1"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto">
      <input ref="productFile1" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto1" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview1" class="input__file-icon" :src="productPreview1" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder1"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto1"-->
<!--        type="file"-->
<!--        ref="productFile2"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto2"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto1">
      <input ref="productFile2" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto2" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview2" class="input__file-icon" :src="productPreview2" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto1"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder2"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto2"-->
<!--        type="file"-->
<!--        ref="productFile3"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto3"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto2">
      <input ref="productFile3" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto3" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview3" class="input__file-icon" :src="productPreview3" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto2"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder3"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto3"-->
<!--        type="file"-->
<!--        ref="productFile4"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto4"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto3">
      <input ref="productFile4" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto4" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview4" class="input__file-icon" :src="productPreview4" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto3"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder4"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto4"-->
<!--        type="file"-->
<!--        ref="productFile5"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto5"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto4">
      <input ref="productFile5" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto5" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview5" class="input__file-icon" :src="productPreview5" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto4"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder5"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto5"-->
<!--        type="file"-->
<!--        ref="productFile6"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto6"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto5">
      <input ref="productFile6" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto6" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview6" class="input__file-icon" :src="productPreview6" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto5"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder6"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto6"-->
<!--        type="file"-->
<!--        ref="productFile7"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto7"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto6">
      <input ref="productFile7" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto7" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview7" class="input__file-icon" :src="productPreview7" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto6"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder7"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto7"-->
<!--        type="file"-->
<!--        ref="productFile8"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto8"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto7">
      <input ref="productFile8" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto8" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview8" class="input__file-icon" :src="productPreview8" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto7"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder8"
        placeholder="Введите порядок фото"
    />

<!--    <input-->
<!--        v-if="productPhoto8"-->
<!--        type="file"-->
<!--        ref="productFile9"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeProductPhoto9"-->
<!--        accept="image/*"-->
<!--    />-->
    <div class="input__wrapper" v-if="productPhoto8">
      <input ref="productFile9" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto9" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview9" class="input__file-icon" :src="productPreview9" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        v-if="productPhoto8"
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder9"
        placeholder="Введите порядок фото"
    />
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Добавить</span>
    </button>
    <button class="main_btn" @click="resetProduct" v-if="!isLoading">Отмена</button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingProduct && isEditingProductPhoto"
        @submit.prevent="updateProductPhoto">
    <div class="input__wrapper">
      <input ref="productFile" type="file" id="input__file" class="input input__file"
             @change="handleFileChangeProductPhoto" accept="image/*" multiple>
      <label for="input__file" class="input__file-button">
          <span class="input__file-icon-wrapper">
            <img v-if="productPreview" class="input__file-icon" :src="productPreview" alt="Выбрать файл"
                 width="50" height="50px">
          </span>
        <span class="input__file-button-text">Выберите картинку</span>
      </label>
    </div>
    <input
        type="number"
        class="basket__form_input admin-panel__content_input"
        v-model="productOrder"
        placeholder="Введите порядок фото"
    />
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Изменить</span>
    </button>
    <button class="main_btn" @click="resetProductPhoto" v-if="!isLoading">Отмена</button>
  </form>
  <table v-if="isEditingProduct">
    <thead>
    <tr>
      <th>Фото</th>
      <th>Порядок</th>
      <th style="width: 100px">Изменить</th>
      <th style="width: 100px">Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="product in oneProd.photos" :key="product.id">
      <td>
        <img v-if="product.photo" :src="product.photo" alt="Фото" width="100"/>
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
<!--    <input-->
<!--        v-model="searchQuery"-->
<!--        @input="handleSearch"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        type="text"-->
<!--        placeholder="Введите запрос для поиска"-->
<!--    />-->
<!--    <select v-model="productOption" class="basket__form_input admin-panel__content_select">-->
<!--      <option value="" disabled>Выберите категорию</option>-->
<!--      <option v-for="option in options" :key="option.id" :value="option.id">-->
<!--        {{ option.name }}-->
<!--      </option>-->
<!--    </select>-->
    <input list="test" placeholder="Введите запрос для поиска" class="basket__form_input admin-panel__content_input" v-model="productOption">
    <datalist id="test">
      <option v-for="option in options" :key="option.id" :value="option.name">
      </option>
    </datalist>
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Добавить</span>
    </button>
    <button class="main_btn" @click="resetProduct" v-if="!isLoading">Отмена</button>
  </form>
  <div
      v-if="isEditingProduct"
      class="admin-panel__content_info_item"
      v-for="option in oneProd.options"
      :key="option.id"
  >
    <div class="admin-panel__content_info_content">
      <p>{{ option.name }}</p>
      <div></div>
      <button @click="deleteProductOptionFull(option.id)" class="admin-panel__content_btn">Отвязать</button>
    </div>
    <table>
      <thead>
      <tr>
        <th>Параметр</th>
        <th>Цена</th>
        <th>Фото</th>
        <th style="width: 100px">Отвязка</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="value in option.values" :key="value.id">
        <td>{{ value.value }}</td>
        <td>{{ value.price }}</td>
        <td>
          <img v-if="value.image" :src="value.image" alt="Фото" width="100"/>
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
      <button
          class="main_btn"
          type="submit"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
          :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
      >
        <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
        <span v-else>Привязать</span>
      </button>
    </form>
  </div>
  <h3 v-if="isEditingProduct">Добавить кастомную цену</h3>
  <form class="admin-panel__content_form" v-if="isEditingProduct">
    <input
        v-model="totalPrice"
        class="basket__form_input admin-panel__content_input"
        type="number"
        placeholder="Цена"
    />
    <div v-for="option in oneProd.options" :key="option.id" class="option-block">
      <label :for="`select-${option.id}`">{{ option.name }}</label>
      <select
          :id="`select-${option.id}`"
          v-model="selectedValues[option.id]"
          class="basket__form_input admin-panel__content_select"
      >
        <option value="" disabled>Выберите значение</option>
        <option
            v-for="value in option.values"
            :key="value.id"
            :value="value.id"
        >
          {{ value.value }}
        </option>
      </select>
    </div>
    <button
        class="main_btn"
        @click="addProductPrice"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Добавить цену</span>
    </button>
    <button class="main_btn" @click="resetProduct" v-if="!isLoading">Отмена</button>
  </form>
  <div
      v-if="isEditingProduct"
      class="admin-panel__content_info_item"
      v-for="option in oneProd.option_prices"
      :key="option.id"
  >
    <div class="admin-panel__content_info_content">
      <p>{{ option.price }}</p>
      <div></div>
      <button @click="deleteProductPrice(option.id)" class="admin-panel__content_btn">Удалить</button>
    </div>
    <div>
      <table>
        <thead>
        <tr>
          <th>Параметр</th>
          <th>Значение</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(value, key) in option.options_details" :key="key">
          <td>{{ value.option }}</td>
          <td>{{ value.value }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
  <h3 v-if="isEditingProduct">Добавить таб (максимум 6)</h3>
  <form
      class="admin-panel__content_form admin-panel__content_form-long"
      v-if="isEditingProduct && !isEditingPropertie && oneProd.properties.length !== 6"
      @submit.prevent="addProductPropertie"
  >
    <select v-model="productPropertieTitle" class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option value='property'>
        Характеристики
      </option>
      <option value='description'>
        Описание
      </option>
      <option value='photo'>
        Фото товара
      </option>
      <option value='instruction'>
        Инструкции
      </option>
      <option value='recommendation'>
        Рекомендации
      </option>
      <option value='guaranty'>
        Гарантии
      </option>
    </select>
    <EditorProd @export-html="handleExportHtmlPropertie"/>
<!--    <div class="input__wrapper">-->
<!--      <input ref="productFilePropertie" type="file" id="input__file" class="input input__file-reset"-->
<!--             @change="handleFileChangeProductPropertie" accept="image/*" multiple>-->
<!--      <label for="input__file" class="input__file-button-reset">-->
<!--          <span class="input__file-icon-wrapper">-->
<!--            <img v-if="productPreviewPropertie" class="input__file-icon" :src="productPreviewPropertie" alt="Выбрать файл"-->
<!--                 width="50" height="50px">-->
<!--          </span>-->
<!--        <span class="input__file-button-text">Выберите картинку</span>-->
<!--        <span class="input__file-icon-reset" @click.prevent="resetProductPreviewPropertie">-->
<!--            <IconsCross color="#fff"/>-->
<!--          </span>-->
<!--      </label>-->
<!--    </div>-->
    <button type="button" class="main_btn" @click="openDialog">Библиотека файлов</button>
    <button v-if="optionFile || optionFileName" type="button" class="main_btn" @click="resetPhoto">Отменить выбор</button>
<!--    <label class="admin-panel__content_label">Текстовый файл</label>-->
<!--    <input-->
<!--        type="file"-->
<!--        ref="productTextFile"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeText"-->
<!--        accept=".pdf,.dwg,.docx"-->
<!--    />-->
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Добавить</span>
    </button>
    <button class="main_btn" @click="resetProduct" v-if="!isLoading">Отмена</button>
  </form>
  <form
      class="admin-panel__content_form admin-panel__content_form-long" v-if="isEditingProduct && isEditingPropertie"
      @submit.prevent="updateProductPropertie"
  >
    <select v-model="productPropertieTitle" class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите категорию</option>
      <option value='property'>
        Характеристики
      </option>
      <option value='description'>
        Описание
      </option>
      <option value='photo'>
        Фото товара
      </option>
      <option value='instruction'>
        Инструкции
      </option>
      <option value='recommendation'>
        Рекомендации
      </option>
      <option value='guaranty'>
        Гарантии
      </option>
    </select>
    <!--          <textarea-->
    <!--              class="basket__form_input admin-panel__content_textarea"-->
    <!--              v-model="productPropertieDescription"-->
    <!--              placeholder="Введите описание"-->
    <!--          ></textarea>-->
    <EditorProd :initialHtml="productPropertieDescription" @export-html="handleExportHtmlPropertie"/>
<!--    <label class="admin-panel__content_label">Изображение</label>-->
<!--    <div class="input__wrapper">-->
<!--      <input ref="productFilePropertie" type="file" id="input__file" class="input input__file-reset"-->
<!--             @change="handleFileChangeProductPropertie" accept="image/*" multiple>-->
<!--      <label for="input__file" class="input__file-button-reset">-->
<!--          <span class="input__file-icon-wrapper">-->
<!--            <img v-if="productPreviewPropertie" class="input__file-icon" :src="productPreviewPropertie" alt="Выбрать файл"-->
<!--                 width="50" height="50px">-->
<!--          </span>-->
<!--        <span class="input__file-button-text">Выберите картинку</span>-->
<!--        <span class="input__file-icon-reset" @click.prevent="resetProductPreviewPropertie">-->
<!--            <IconsCross color="#fff"/>-->
<!--          </span>-->
<!--      </label>-->
<!--    </div>-->
    <button type="button" class="main_btn" @click="openDialog">Библиотека файлов</button>
    <button v-if="optionFile || optionFileName" type="button" class="main_btn" @click="resetPhoto">Отменить выбор</button>
<!--    <label class="admin-panel__content_label">Текстовый файл</label>-->
<!--    <input-->
<!--        type="file"-->
<!--        ref="productTextFile"-->
<!--        class="basket__form_input admin-panel__content_input"-->
<!--        @change="handleFileChangeText"-->
<!--        accept=".pdf,.dwg,.docx"-->
<!--    />-->
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Изменить</span>
    </button>
    <button class="main_btn" @click="resetProductPropertie" v-if="!isLoading">Отмена</button>
  </form>
  <table v-if="isEditingProduct">
    <thead>
    <tr>
      <th>Название</th>
      <th>Контент</th>
      <th style="width: 100px">Изменить</th>
      <th style="width: 100px">Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="propertie in oneProd.properties" :key="propertie.id">
      <td>{{ toggleTab(propertie.title) }}</td>
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
  <h3 v-if="isEditingProduct">Добавить сопутствующий товар</h3>
  <form
      class="admin-panel__content_form" v-if="isEditingProduct"
      @submit.prevent="addProductProd"
  >
    <select v-model="productProd" class="basket__form_input admin-panel__content_select">
      <option value="" disabled>Выберите товар</option>
      <option v-for="prod in allProducts" :key="prod.id" :value="prod.id">
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
    <button class="main_btn" @click="resetProduct" v-if="!isLoading">Отмена</button>
  </form>
  <table v-if="isEditingProduct">
    <thead>
    <tr>
      <th>Название</th>
      <th style="width: 100px">Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="prod in oneProd.related_products" :key="prod.id">
      <td>{{ prod.name }}</td>
      <td>
        <button @click="deleteProductProd(prod.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <input
      type="text"
      class="basket__form_input admin-panel__content_input"
      v-model="productSearch"
      placeholder="Поиск"
      @input="searchProduct"
  />
  <table v-if="!isSearch">
    <thead>
    <tr>
      <th>Название</th>
      <th>Категория</th>
      <th>Описание</th>
      <th>Цена</th>
      <th>Топ</th>
      <th style="width: 100px">Изменить</th>
      <th style="width: 100px">Дублирование</th>
      <th style="width: 100px">Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="product in paginatedProducts" :key="product.id">
      <td>{{ product.name }}</td>
      <td>{{ product.category_id.name }}</td>
      <td>{{ product.description }}</td>
      <td>{{ product.price }}</td>
      <td><input type="checkbox" disabled v-model="product.is_top"/></td>
      <td>
        <button @click="editProduct(product)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="copyProduct(product.id)" class="admin-panel__content_btn">Дублировать</button>
      </td>
      <td>
        <button @click="deleteProduct(product.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <table v-if="isSearch">
    <thead v-if="allProductsSearch.products.length > 0">
    <tr>
      <th>Название</th>
      <th>Категория</th>
      <th>Описание</th>
      <th>Цена</th>
      <th>Топ</th>
      <th style="width: 100px">Изменить</th>
      <th style="width: 100px">Дублирование</th>
      <th style="width: 100px">Удалить</th>
    </tr>
    </thead>
    <tbody v-if="allProductsSearch.products.length > 0">
    <tr v-for="product in allProductsSearch.products" :key="product.id">
      <td>{{ product.name }}</td>
      <td>{{ product.category_id.name }}</td>
      <td>{{ product.description }}</td>
      <td>{{ product.price }}</td>
      <td><input type="checkbox" disabled v-model="product.is_top"/></td>
      <td>
        <button @click="editProduct(product)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="copyProduct(product.id)" class="admin-panel__content_btn">Дублировать</button>
      </td>
      <td>
        <button @click="deleteProduct(product.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <div class="pagination" v-if="totalPages > 1 && !isSearch">
    <button
        class="arrow-left"
        @click="goToPage(page - 1)"
        :disabled="page === 1"
    >
    </button>
    <span
        class="pagination__number"
        :class="{ active: page === 1 }"
        @click="goToPage(1)"
    >
        1
      </span>
    <span v-if="page > 6">...</span>
    <span
        v-for="pageNum in pagesInRange"
        :key="pageNum"
        class="pagination__number"
        :class="{ active: pageNum === page }"
        @click="goToPage(pageNum)"
    >
        {{ pageNum }}
      </span>
    <span v-if="page < totalPages - 5">...</span>
    <span
        class="pagination__number"
        :class="{ active: page === totalPages }"
        @click="goToPage(totalPages)"
    >
        {{ totalPages }}
      </span>
    <button
        class="arrow-right"
        @click="goToPage(page + 1)"
        :disabled="page === totalPages"
    >
    </button>
  </div>
  <div class="admin__dialog" v-if="visibleDialog" @click="closeDialog">
    <div class="admin__dialog_container" @click.stop>
      <h4>Библиотека файлов</h4>
      <div class="admin__dialog_form-file">
        <input
            type="file"
            ref="productTextFile"
            class="basket__form_input admin-panel__content_input"
            @change="handleFileChangeText"
            accept=".pdf,.dwg,.docx"
        />
        <input
            type="text"
            class="basket__form_input admin-panel__content_input"
            v-model="productTextFileName"
            placeholder="Введите название"
        />
        <button class="main_btn" @click="addImage">Добавить файл</button>
      </div>
      <div class="admin__dialog_imgs">
        <div
            v-for="file in files" :key="file.id"
            @click="selectPhoto(file)"
            class="admin__dialog_file"
        >
          <p>{{file.file_name}}</p>
          <div @click.stop="deleteImg(file.id)" class="admin__dialog_trash">
            <IconsTrash color="#fff"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
$x-small: 575.98px;
$small: 767.98px;
$medium: 991.98px;
$large: 1199.98px;
$x-large: 1399.98px;
$big: 1592.98px;
$x-big: 1829.98px;

.option-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
  align-items: center;
  margin-bottom: 70px;
  @media screen and (max-width: $medium) {
    margin-bottom: 40px;
  }
  @media screen and (max-width: $small) {
    gap: 6px;
  }

  .arrow-left {
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 15px;
    height: 19px;
    outline: none;
    border: none;
    transform: rotate(90deg);
    background-color: transparent;
    margin-right: 10px;
    @media screen and (max-width: $small) {
      transform: rotate(90deg) scale(0.8);
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 3px;
      height: 100%;
      background-color: #EF7F1A;
    }

    &::before {
      transform: rotate(-45deg);
      left: 0;
      top: 0;
    }

    &::after {
      transform: rotate(45deg);
      right: 0;
      top: 0;
    }
  }

  .arrow-right {
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 15px;
    height: 19px;
    outline: none;
    border: none;
    transform: rotate(-90deg);
    background-color: transparent;
    margin-left: 10px;
    @media screen and (max-width: $small) {
      transform: rotate(-90deg) scale(0.8);
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 3px;
      height: 100%;
      background-color: #EF7F1A;
    }

    &::before {
      transform: rotate(-45deg);
      left: 0;
      top: 0;
    }

    &::after {
      transform: rotate(45deg);
      right: 0;
      top: 0;
    }
  }

  &__number {
    font-size: 20px;
    margin: 0 5px;
    cursor: pointer;
    color: #9B9B9B;
    @media screen and (max-width: $small) {
      font-size: 16px;
    }

    &.active {
      color: #EF7F1A;
    }
  }
}
</style>