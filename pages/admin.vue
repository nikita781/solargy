<script setup>
import axios from "axios";
import {onMounted} from "vue";

const nameUser = ref('');
const passwordUser = ref('');
const result = ref([]);
const activeTab = ref("Главная");

const isAuthenticated = ref(false);

const fetchAdmin = async () => {
  try {
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {withCredentials: true});
    const response = await axios.post(`/login?email=${nameUser.value}&password=${passwordUser.value}`, {withCredentials: true});
    result.value = response.data;
    isAuthenticated.value = true;

    await fetchMainBanners();
    await fetchSubBanners();
    await fetchAllProducts();
    await fetchCategory();
    await fetchOptions();
    await fetchAbout_usBlock();
    await fetchPatents();
    await fetchTeams();

  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

//---------------------------------------------------------------------------------
// Главная

const mainBanners = ref([]);
const titleBanner = ref('');
const descriptionBanner = ref('');
const photoBanners = ref(null);
const fileBanners = ref(null);
const productBanners = ref([]);
const isEditingBanners = ref(false);
const allProducts = ref([]);
const currentBannerId = ref(null)

const handleFileChangeMainBanner = (event) => {
  const file = event.target.files[0];
  if (file) {
    photoBanners.value = file;
  }
};
const fetchAllProducts = async () => {
  try {
    const response = await axios.get('/all-products', {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    allProducts.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const createMainBanners = async () => {
  try {
    const formData = new FormData();
    formData.append('title', titleBanner.value);
    formData.append('description', descriptionBanner.value);
    formData.append('image', photoBanners.value);
    formData.append('product_id', productBanners.value);

    await axios.post(`/main-banners`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchMainBanners();
    resetMainBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateMainBanners = async () => {
  try {
    const formData = new FormData();
    formData.append('title', titleBanner.value);
    formData.append('description', descriptionBanner.value);
    formData.append('product_id', productBanners.value);
    if (photoBanners.value) {
      formData.append('image', photoBanners.value);
    }
    await axios.post(`/main-banners/${currentBannerId.value}?_method=PATCH`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchMainBanners();
    resetMainBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
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
  try {
    await axios.delete(`/main-banners/${idBanner}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchMainBanners();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editMainBanners = (banner) => {
  isEditingBanners.value = true;
  currentBannerId.value = banner.id;
  titleBanner.value = banner.title;
  descriptionBanner.value = banner.description;
  productBanners.value = banner.product.id;
  photoBanners.value = null;
}
const resetMainBanners = () => {
  isEditingBanners.value = false;
  currentBannerId.value = null;
  titleBanner.value = '';
  descriptionBanner.value = '';
  photoBanners.value = null;
  productBanners.value = null;
  fileBanners.value.value = ''
};


const subBanners = ref([]);
const titleSlider = ref('');
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
  try {
    const formData = new FormData();
    formData.append('title', titleSlider.value);
    formData.append('image', photoSlider.value);

    await axios.post(`/sub-banners`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
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
  try {
    const formData = new FormData();
    formData.append('title', titleSlider.value);
    if (photoSlider.value) {
      formData.append('image', photoSlider.value);
    }
    await axios.post(`/sub-banners/${currentSliderId.value}?_method=PATCH`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
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
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
  photoSlider.value = null;
}
const resetSubBanners = () => {
  isEditingSlider.value = false;
  currentSliderId.value = null;
  titleSlider.value = '';
  photoSlider.value = null;
  fileSlider.value.value = ''
};

//---------------------------------------------------------------------------------
// Категории

const categories = ref([])
const nameCategory = ref('');
const photoCategory = ref(null);
const fileCategory = ref(null);
const isEditingCat = ref(false);
const currentCategoryId = ref(null);

const handleFileChangeCategory = (event) => {
  const file = event.target.files[0];
  if (file) {
    photoCategory.value = file;
  }
};
const createCategory = async () => {
  try {
    const formData = new FormData();
    formData.append('name', nameCategory.value);
    formData.append('photo', photoCategory.value);

    await axios.post(`/categories`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCategory();
    resetCategory();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const fetchCategory = async () => {
  try {
    const response = await axios.get('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateCategory = async () => {
  try {
    const formData = new FormData();
    formData.append('name', nameCategory.value);
    if (photoCategory.value) {
      formData.append('photo', photoCategory.value);
    }
    await axios.post(`/categories/${currentCategoryId.value}?_method=PATCH`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCategory();
    resetCategory();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editCategory = (category) => {
  isEditingCat.value = true;
  currentCategoryId.value = category.id;
  nameCategory.value = category.name;
  photoCategory.value = null;
};
const resetCategory = () => {
  isEditingCat.value = false;
  currentCategoryId.value = null;
  nameCategory.value = '';
  photoCategory.value = null;
  fileCategory.value.value = ''
};
const deleteCategory = async (idCategory) => {
  try {
    await axios.delete(`/categories/${idCategory}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchCategory();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

//---------------------------------------------------------------------------------
// Параметры товара

const options = ref([]);
const nameOptions = ref('');
const isEditingOptions = ref(false);
const currentOptionsId = ref(null);

const createOptions = async () => {
  try {
    const formData = new FormData();
    formData.append('name', nameOptions.value);

    await axios.post(`/options`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchOptions();
    resetOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateOptions = async () => {
  try {
    const formData = new FormData();
    formData.append('name', nameOptions.value);

    await axios.post(`/options/${currentOptionsId.value}?_method=PATCH`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchOptions();
    resetOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
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
  try {
    await axios.delete(`/options/${idOptions}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editOptions = (options) => {
  isEditingOptions.value = true;
  currentOptionsId.value = options.id;
  nameOptions.value = options.name;
};
const resetOptions = () => {
  isEditingOptions.value = false;
  currentOptionsId.value = null;
  nameOptions.value = '';
};

const optionValue = ref('')
const optionPrice = ref(null)
const optionPhoto = ref(null);
const optionFile = ref(null);
const optionId = ref(null)
const idEditingOptionValue = ref(false);
const currentOptionValueId = ref(null);

const handleFileChangeOption = (event) => {
  const file = event.target.files[0];
  if (file) {
    optionPhoto.value = file;
  }
};
const createOptionValue = async () => {
  try {
    const formData = new FormData();
    formData.append('values[0][value]', optionValue.value);
    formData.append('values[0][price]', optionPrice.value);
    formData.append('values[0][image]', optionPhoto.value);

    await axios.post(`/options/${optionId.value}?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchOptions();
    resetOptionValue();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateOptionValue = async () => {
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
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchOptions();
    resetOptionValue();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const deleteOptionValue = async (idOptions, idValue) => {
  try {
    await axios.delete(`/options/${idOptions}/values/${idValue}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchOptions();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editOptionValue = (idOptions, options) => {
  idEditingOptionValue.value = true;
  currentOptionValueId.value = options.id;
  optionValue.value = options.value;
  optionPrice.value = options.price;
  optionPhoto.value = null;
  optionId.value = idOptions;
};
const resetOptionValue = () => {
  idEditingOptionValue.value = false;
  currentOptionValueId.value = null;
  optionValue.value = '';
  optionPrice.value = '';
  optionPhoto.value = null;
  optionId.value = null;
  optionFile.value.value = ''
};

//---------------------------------------------------------------------------------
// Товары

const productName = ref('');
const productCategory = ref(null);
const productDescription = ref('');
const productPrice = ref(null);
const productTop = ref(false)
const isEditingProduct = ref(false);
const currentProductId = ref(null);
const oneProd = ref([]);
const productPhoto = ref(null);
const productFile = ref(null)
const productOption = ref(null);
const productPropertieTitle = ref(null);
const productPropertieDescription = ref('');
const productFilePropertie = ref(null);
const productPhotoPropertie = ref(null);
const productTextFile = ref(null);
const productTextPropertie = ref(null);
const isEditingPropertie = ref(false);
const currentPropertieId = ref(null)

const createProduct = async () => {
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
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchAllProducts();
    resetProduct();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateProduct = async () => {
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
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
};
const resetProduct = () => {
  isEditingProduct.value = false;
  currentProductId.value = null;
  productName.value = '';
  productDescription.value = '';
  productCategory.value = null;
  productPrice.value = null;
  productTop.value = false;
};
const fetchProductById = async (productId) => {
  try {
    const response = await axios.get(`/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    oneProd.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const deleteProductPhoto = async (idValue) => {
  try {
    await axios.delete(`/productPhoto/${idValue}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
const addProductPhoto = async () => {
  try {
    const formData = new FormData();
    formData.append('photos[0][photo]', productPhoto.value);

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchProductById(currentProductId.value);
    productPhoto.value = null;
    productFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const addProductOption = async () => {
  try {
    const valueId = await fetchOptionsById(productOption.value);
    const formData = new FormData();
    formData.append('options[0][id]', productOption.value);
    formData.append('options[0][values][0][id]', valueId);

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
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
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    return response.data.values[0].id;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const deleteProductOption = async (idOption) => {
  try {
    const valueId = await fetchOptionsById(idOption);
    await axios.delete(`/products/${oneProd.value.id}/values/${valueId}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
        'Authorization': `Bearer ${result.value.token}`,
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
        'Authorization': `Bearer ${result.value.token}`,
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
const deleteProductPropertie = async (idPropertie) => {
  try {
    await axios.delete(`/productProperties/${idPropertie}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchProductById(currentProductId.value);
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

watch(() => currentProductId.value, () => {
  fetchProductById(currentProductId.value);
});

//---------------------------------------------------------------------------------
// О нас

const about_usBlock = ref([]);
const about_usTitle = ref('');
const about_usDescription = ref('');
const about_usImage = ref(null);
const about_usFile = ref(null);
const isEditingAbout_usBlock = ref(false);
const currentAbout_usBlockId = ref(null);

const fetchAbout_usBlock = async () => {
  try {
    const response = await axios.get(`/pages/2`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    about_usBlock.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const handleFileChangeAbout_usBlock = (event) => {
  const file = event.target.files[0];
  if (file) {
    about_usImage.value = file;
  }
};
const createAbout_usBlock = async () => {
  try {
    const formData = new FormData();
    formData.append('sections[0][title]', about_usTitle.value);
    formData.append('sections[0][html]', about_usDescription.value);
    formData.append('sections[0][image]', about_usImage.value);

    await axios.post(`/pages/2?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchAbout_usBlock();
    about_usTitle.value = '';
    about_usDescription.value = '';
    about_usImage.value = null;
    about_usFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteAbout_usBlock = async (idBlock) => {
  try {
    await axios.delete(`/page/${idBlock}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchAbout_usBlock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editAbout_usBlock = (block) => {
  isEditingAbout_usBlock.value = true;
  currentAbout_usBlockId.value = block.id;
  about_usTitle.value = block.title;
  about_usDescription.value = block.html;
};
const resetAbout_usBlock = () => {
  isEditingAbout_usBlock.value = false;
  about_usTitle.value = '';
  about_usDescription.value = '';
  about_usImage.value = null;
  about_usFile.value.value = ''
  currentAbout_usBlockId.value = null
};


const patents = ref([]);
const isEditingPatent = ref(false);
const patentName = ref('');
const patentDate = ref('');
const patentFile = ref(null);
const patentText = ref(null)

const fetchPatents = async () => {
  try {
    const response = await axios.get(`/patents`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    patents.value = response.data.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const handleFileChangePatent = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (
      file.type === 'text/plain' ||
      file.type === 'application/json' ||
      file.name.endsWith('.csv')
  ) {
    patentText.value = file;
  }
};
const createProductPatent = async () => {
  try {
    const formData = new FormData();
    formData.append('title', patentName.value);
    formData.append('date', patentDate.value);
    formData.append('file', patentText.value);

    await axios.post(`/patents`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPatents();
    patentName.value = '';
    patentDate.value = '';
    patentText.value = null;
    patentFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deletePatents = async (idPatent) => {
  try {
    await axios.delete(`/patents/${idPatent}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchPatents();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};


const teams = ref([]);
const isEditingTeam = ref(false);
const teamName = ref('');
const teamDescription = ref('');
const teamImage = ref(null);
const teamFile = ref(null);
const teamPhone = ref('');
const teamEmail = ref('');
const currentTeamId = ref(null);

const fetchTeams = async () => {
  try {
    const response = await axios.get(`/teams`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    teams.value = response.data.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};

</script>

<template>
  <div class="admin">
    <h2 class="main_title">{{ isAuthenticated ? 'Админ панель' : 'Введите данные' }}</h2>
    <div class="admin__auth" v-if="!isAuthenticated">
      Admin@admin.com
      <input type="email" class="basket__form_input" v-model="nameUser" placeholder="Введите логин">
      secret-password
      <input type="password" class="basket__form_input" v-model="passwordUser" placeholder="Введите пароль">
      <button class="main_btn" @click="fetchAdmin()">Отправить</button>
    </div>
    <div class="admin-panel" v-else>
      <div class="admin-panel__menu">
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Главная' }"
            @click="activeTab = 'Главная'"
        >
          Главная
        </p>
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Категории' }"
            @click="activeTab = 'Категории'"
        >
          Категории
        </p>
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Параметры товара' }"
            @click="activeTab = 'Параметры товара'"
        >
          Параметры товара
        </p>
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Товары' }"
            @click="activeTab = 'Товары'"
        >
          Товары
        </p>
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'О нас' }"
            @click="activeTab = 'О нас'"
        >
          О нас
        </p>
      </div>
      <div class="admin-panel__content" v-if="activeTab === 'Главная'">
        <h2>Добро пожаловать!</h2>
        <h3>Главный слайдер</h3>
        <form class="admin-panel__content_form" v-if="!isEditingBanners" @submit.prevent="createMainBanners">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="titleBanner"
              placeholder="Введите название"
          />
          <textarea
              class="basket__form_input admin-panel__content_textarea"
              v-model="descriptionBanner"
              placeholder="Введите описание"
          ></textarea>
          Продукт
          <select v-model="productBanners" class="basket__form_input admin-panel__content_select">
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
          <button class="main_btn" type="submit">Создать слайд</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingBanners" @submit.prevent="updateMainBanners">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="titleBanner"
              placeholder="Введите название"
          />
          <textarea
              class="basket__form_input admin-panel__content_textarea"
              v-model="descriptionBanner"
              placeholder="Введите описание"
          ></textarea>
          Продукт
          <select v-model="productBanners" class="basket__form_input admin-panel__content_select">
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
          <button class="main_btn" type="submit">Изменить слайд</button>
          <button class="main_btn" type="button" @click="resetMainBanners">Отмена</button>
        </form>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Фото</th>
            <th>Продукт</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="banner in mainBanners" :key="banner.id">
            <td>{{ banner.id }}</td>
            <td>{{ banner.title }}</td>
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
          />
          <input
              type="file"
              ref="fileSlider"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeSubBanners"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать слайд</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingSlider" @submit.prevent="updateSubBanners">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="titleSlider"
              placeholder="Введите название"
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
            <th>ID</th>
            <th>Название</th>
            <th>Фото</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="banner in subBanners" :key="banner.id">
            <td>{{ banner.id }}</td>
            <td>{{ banner.title }}</td>
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

      <div class="admin-panel__content" v-if="activeTab === 'Категории'">
        <h2>Управление категориями</h2>
        <form class="admin-panel__content_form" v-if="!isEditingCat" @submit.prevent="createCategory">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="nameCategory"
              placeholder="Введите имя категории"
          />
          <input
              type="file"
              ref="fileCategory"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeCategory"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать категорию</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingCat" @submit.prevent="updateCategory">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="nameCategory"
              placeholder="Введите новое имя категории"
          />
          <input
              type="file"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeCategory"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Сохранить изменения</button>
          <button class="main_btn" type="button" @click="resetCategory">Отмена</button>
        </form>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Уровень</th>
            <th>Фото</th>
            <th>Дочерние элементы</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.id }}</td>
            <td>{{ category.name }}</td>
            <td>{{ category.level }}</td>
            <td>
              <img :src="category.photo" alt="Фото" width="50"/>
            </td>
            <td>
              <span v-if="category.children.length > 0">
                {{ category.children.length }} дочерних элемента(ов)
              </span>
              <span v-else>Нет</span>
            </td>
            <td>
              <button @click="editCategory(category)" class="admin-panel__content_btn">Изменить</button>
            </td>
            <td>
              <button @click="deleteCategory(category.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="admin-panel__content" v-if="activeTab === 'Параметры товара'">
        <h2>Управление параметрами товара</h2>
        <h3>Параметры</h3>
        <div class="admin-panel__content_info">
          <form class="admin-panel__content_form" v-if="!isEditingOptions" @submit.prevent="createOptions">
            <input
                type="text"
                class="basket__form_input admin-panel__content_input"
                v-model="nameOptions"
                placeholder="Введите имя параметра"
            />
            <button class="main_btn" type="submit">Создать параметр</button>
          </form>
          <form class="admin-panel__content_form" v-if="isEditingOptions" @submit.prevent="updateOptions">
            <input
                type="text"
                class="basket__form_input admin-panel__content_input"
                v-model="nameOptions"
                placeholder="Введите имя параметра"
            />
            <button class="main_btn" type="submit">Изменить параметр</button>
            <button class="main_btn" type="button" @click="resetOptions">Отмена</button>
          </form>
          <h3>Пункт</h3>
          <form class="admin-panel__content_form" v-if="!idEditingOptionValue" @submit.prevent="createOptionValue">
            <input
                type="text"
                class="basket__form_input admin-panel__content_input"
                v-model="optionValue"
                placeholder="Введите имя пункта"
            />
            <input
                type="number"
                class="basket__form_input admin-panel__content_input"
                v-model="optionPrice"
                placeholder="Введите цену пункта"
            />
            <input
                type="file"
                ref="optionFile"
                class="basket__form_input admin-panel__content_input"
                @change="handleFileChangeOption"
                accept="image/*"
            />
            Параметр
            <select v-model="optionId" class="basket__form_input admin-panel__content_select">
              <option value="" disabled>Выберите продукт</option>
              <option v-for="option in options" :key="option.id" :value="option.id">
                {{ option.name }}
              </option>
            </select>
            <button class="main_btn" type="submit">Создать пункт</button>
          </form>
          <form class="admin-panel__content_form" v-if="idEditingOptionValue" @submit.prevent="updateOptionValue">
            <input
                type="text"
                class="basket__form_input admin-panel__content_input"
                v-model="optionValue"
                placeholder="Введите имя пункта"
            />
            <input
                type="number"
                class="basket__form_input admin-panel__content_input"
                v-model="optionPrice"
                placeholder="Введите цену пункта"
            />
            <input
                type="file"
                ref="optionFile"
                class="basket__form_input admin-panel__content_input"
                @change="handleFileChangeOption"
                accept="image/*"
            />
            Параметр
            <select v-model="optionId" class="basket__form_input admin-panel__content_select">
              <option value="" disabled>Выберите продукт</option>
              <option v-for="option in options" :key="option.id" :value="option.id">
                {{ option.name }}
              </option>
            </select>
            <button class="main_btn" type="submit">Изменить пункт</button>
            <button class="main_btn" type="button" @click="resetOptionValue">Отмена</button>
          </form>
          <div
              class="admin-panel__content_info_item"
              v-for="option in options" :key="option.id"
          >
            <div class="admin-panel__content_info_content">
              <p>ID {{ option.id }}, name {{ option.name }}</p>
              <button @click="editOptions(option)" class="admin-panel__content_btn">Изменить</button>
              <button @click="deleteOptions(option.id)" class="admin-panel__content_btn">Удалить</button>
            </div>
            <table>
              <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Фото</th>
                <th>Изменить</th>
                <th>Удалить</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="value in option.values" :key="value.id">
                <td>{{ value.id }}</td>
                <td>{{ value.value }}</td>
                <td>{{ value.price }}</td>
                <td>
                  <img :src="value.image" alt="Фото" width="50"/>
                </td>
                <td>
                  <button @click="editOptionValue(option.id, value)" class="admin-panel__content_btn">Изменить</button>
                </td>
                <td>
                  <button @click="deleteOptionValue(option.id, value.id)" class="admin-panel__content_btn">Удалить</button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="admin-panel__content" v-if="activeTab === 'Товары'">
        <h2>Управление товарами</h2>
        <form class="admin-panel__content_form" v-if="!isEditingProduct" @submit.prevent="createProduct">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="productName"
              placeholder="Введите имя товара"
          />
          <textarea
              class="basket__form_input admin-panel__content_textarea"
              v-model="productDescription"
              placeholder="Введите описание"
          ></textarea>
          Категория
          <select v-model="productCategory" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите категорию</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
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
              type="number"
              class="basket__form_input admin-panel__content_input"
              v-model="productPrice"
              placeholder="Введите цену"
          />
          <button class="main_btn" type="submit">Создать товар</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingProduct" @submit.prevent="updateProduct">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="productName"
              placeholder="Введите имя товара"
          />
          <textarea
              class="basket__form_input admin-panel__content_textarea"
              v-model="productDescription"
              placeholder="Введите описание"
          ></textarea>
          Категория
          <select v-model="productCategory" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите категорию</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
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
              type="number"
              class="basket__form_input admin-panel__content_input"
              v-model="productPrice"
              placeholder="Введите цену"
          />
          <button class="main_btn" type="submit">Изменить товар</button>
          <button class="main_btn" type="submit" @click="resetProduct">Отмена</button>
        </form>
        <h3 v-if="isEditingProduct">Добавить картинку</h3>
        <form class="admin-panel__content_form" v-if="isEditingProduct" @submit.prevent="addProductPhoto">
          <input
              type="file"
              ref="productFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeProductPhoto"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Добавить</button>
          <button class="main_btn" type="submit" @click="resetProduct">Отмена</button>
        </form>
        <table v-if="isEditingProduct">
          <thead>
          <tr>
            <th>ID</th>
            <th>Фото</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="product in oneProd.photos" :key="product.id">
            <td>{{ product.id }}</td>
            <td>
              <img :src="product.photo" alt="Фото" width="100"/>
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
          <button class="main_btn" type="submit" @click="resetProduct">Отмена</button>
        </form>
        <table v-if="isEditingProduct">
          <thead>
          <tr>
            <th>ID</th>
            <th>Параметр</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="option in oneProd.options" :key="option.id">
            <td>{{ option.id }}</td>
            <td>{{ option.name }}</td>
            <td>
              <button @click="deleteProductOption(option.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
        <h3 v-if="isEditingProduct">Добавить таб (максимум 2)</h3>
        <form class="admin-panel__content_form" v-if="isEditingProduct && !isEditingPropertie" @submit.prevent="addProductPropertie">
          <select v-model="productPropertieTitle" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите категорию</option>
            <option value='1'>
              Характеристики
            </option>
            <option value='2'>
              Рекомендации
            </option>
          </select>
          <textarea
              class="basket__form_input admin-panel__content_textarea"
              v-model="productPropertieDescription"
              placeholder="Введите описание"
          ></textarea>
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
          <button class="main_btn" type="submit" @click="resetProduct">Отмена</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingProduct && isEditingPropertie" @submit.prevent="updateProductPropertie">
          <select v-model="productPropertieTitle" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите категорию</option>
            <option value='1'>
              Характеристики
            </option>
            <option value='2'>
              Рекомендации
            </option>
          </select>
          <textarea
              class="basket__form_input admin-panel__content_textarea"
              v-model="productPropertieDescription"
              placeholder="Введите описание"
          ></textarea>
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
          <button class="main_btn" type="submit" @click="resetProduct">Отмена</button>
        </form>
        <table v-if="isEditingProduct">
          <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Контент</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="propertie in oneProd.properties" :key="propertie.id">
            <td>{{ propertie.id }}</td>
            <td>{{ propertie.title }}</td>
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
            <th>ID</th>
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
            <td>{{ product.id }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.category_id.name }}</td>
            <td>{{ product.description }}</td>
            <td>{{ product.price }}</td>
            <td><input type="checkbox" disabled v-model="product.is_top"/></td>
            <td>
              <button @click="editProduct(product)" class="admin-panel__content_btn">Изменить</button>
            </td>
            <td>
              <button @click="deleteOptionValue(product.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="admin-panel__content" v-if="activeTab === 'О нас'">
        <h2>Управление страницей о нас</h2>
        <h3>Блоки</h3>
        <form class="admin-panel__content_form" v-if="!isEditingAbout_usBlock" @submit.prevent="createAbout_usBlock">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="about_usTitle"
              placeholder="Введите название"
          />
          <textarea
              class="basket__form_input admin-panel__content_textarea"
              v-model="about_usDescription"
              placeholder="Введите описание"
          ></textarea>
          <input
              type="file"
              ref="fileBanners"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeAbout_usBlock"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать блок</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingAbout_usBlock" @submit.prevent="updateAbout_usBlock">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="about_usTitle"
              placeholder="Введите название"
          />
          <textarea
              class="basket__form_input admin-panel__content_textarea"
              v-model="about_usDescription"
              placeholder="Введите описание"
          ></textarea>
          <input
              type="file"
              ref="fileBanners"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeAbout_usBlock"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Изменить блок</button>
          <button class="main_btn" type="submit" @click="resetAbout_usBlock">Назад</button>
        </form>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Фото</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="section in about_usBlock.sections" :key="section.id">
            <td>{{ section.id }}</td>
            <td>{{ section.title }}</td>
            <td>{{ section.html }}</td>
            <td>
              <img :src="section.image" alt="Фото" width="50"/>
            </td>
            <td>
              <button @click="editAbout_usBlock(section)" class="admin-panel__content_btn">Изменить</button>
            </td>
            <td>
              <button @click="deleteAbout_usBlock(section.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
        <h3>Патенты</h3>
        <form class="admin-panel__content_form" v-if="!isEditingPatent" @submit.prevent="createProductPatent">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="patentName"
              placeholder="Введите название"
          />
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="patentDate"
              placeholder="Введите дату"
          />
          <label class="admin-panel__content_label">Текстовый файл</label>
          <input
              type="file"
              ref="patentText"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangePatent"
              accept="text/plain,.csv,.json"
          />
          <button class="main_btn" type="submit">Создать</button>
        </form>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Дата</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="patent in patents" :key="patent.id">
            <td>{{ patent.id }}</td>
            <td>{{ patent.title }}</td>
            <td>{{ patent.date }}</td>
            <td>
              <button @click="deletePatents(patent.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

img {
  border-radius: 4px;
}
</style>