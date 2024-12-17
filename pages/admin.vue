<script setup>
import axios from "axios";
import {onMounted} from "vue";
import Editor from '~/components/editor.vue';

const nameUser = ref('');
const passwordUser = ref('');
const result = ref([]);
const activeTab = ref("Главная");

const isAuthenticated = ref(false);

const fetchAdmin = async () => {
  try {
    await axios.get('https://api.solargy.shop/sanctum/csrf-cookie', {withCredentials: true});
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
    await fetchContact();
    await fetchCompanies();
    await fetchPromo();
    await fetchStocks();
    await fetchPlace();
    await fetchDelivery();
    await fetchSocials();

  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

//---------------------------------------------------------------------------------
// Главная

const mainBanners = ref([]);
const titleBanner = ref('');
const descriptionBanner = ref('');
const numberBanner = ref('');
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
    if (numberBanner.value) {
      formData.append('order', numberBanner.value);
    }
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
    if (numberBanner.value) {
      formData.append('order', numberBanner.value);
    }
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
  numberBanner.value = '';
  fileBanners.value.value = ''
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
  try {
    const formData = new FormData();
    formData.append('title', titleSlider.value);
    formData.append('image', photoSlider.value);
    if (numberSlider.value) {
      formData.append('order', numberSlider.value);
    }

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
    if (numberSlider.value) {
      formData.append('order', numberSlider.value);
    }
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
  numberSlider.value = '';
  fileSlider.value.value = ''
};

//---------------------------------------------------------------------------------
// Категории

const categories = ref([])
const categoriesLevel = ref([])
const allCategories = ref([]);
const parentCategory = ref(null);
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
    if (parentCategory.value) {
      formData.append('parent_id', parentCategory.value);
    }

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
const flattenCategories = (categories) => {
  const result = [];
  const traverse = (categoryList, parentId = null) => {
    categoryList.forEach((category) => {
      result.push({
        id: category.id,
        name: category.name,
        level: category.level,
        parent_id: category.parent_id,
        parentId, // Добавляем информацию о родительской категории
      });

      if (category.children && category.children.length > 0) {
        traverse(category.children, category.id); // Обрабатываем дочерние категории
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
    categoriesLevel.value = categories.value.filter(category => category.level === 0);
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
    if (parentCategory.value) {
      formData.append('parent_id', parentCategory.value);
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
  parentCategory.value = category.parent_id;
  photoCategory.value = null;
};
const resetCategory = () => {
  isEditingCat.value = false;
  currentCategoryId.value = null;
  nameCategory.value = '';
  photoCategory.value = null;
  fileCategory.value.value = ''
  parentCategory.value = null;
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

const fetchValueByOption = async (optionId) => {
  try {
    const response = await axios.get(`/options/${optionId}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
        'Authorization': `Bearer ${result.value.token}`,
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
    formData.append('photos[0][order]', productOrder.value);
    if (productPhoto.value) {
      formData.append('photos[0][photo]', productPhoto.value);
    }

    await axios.post(`/products/${oneProd.value.id}?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
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
    // const valueId = await fetchOptionsById(idOption);
    await axios.delete(`/products/${oneProd.value.id}/values/${idOption}`, {
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

const handleExportHtmlAbout_usBlock = (html) => {
  about_usDescription.value = html;
}
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
const updateAbout_usBlock = async () => {
  try {
    const formData = new FormData();
    formData.append('sections[0][id]', currentAbout_usBlockId.value);
    formData.append('sections[0][title]', about_usTitle.value);
    formData.append('sections[0][html]', about_usDescription.value);
    if (about_usImage.value) {
      formData.append('sections[0][image]', about_usImage.value);
    }

    await axios.post(`/pages/2?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchAbout_usBlock();
    resetAbout_usBlock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteAbout_usBlock = async (idBlock) => {
  try {
    await axios.delete(`/pages/${idBlock}`, {
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
    teams.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const handleFileChangeTeam = (event) => {
  const file = event.target.files[0];
  if (file) {
    teamImage.value = file;
  }
};
const createTeams = async () => {
  try {
    const formData = new FormData();
    formData.append('name', teamName.value);
    formData.append('description', teamDescription.value);
    formData.append('image', teamImage.value);
    formData.append('phone', teamPhone.value);
    formData.append('email', teamEmail.value);

    await axios.post(`/teams`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchTeams();
    teamName.value = '';
    teamDescription.value = '';
    teamPhone.value = '';
    teamEmail.value = '';
    teamImage.value = null;
    teamFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateTeams = async () => {
  try {
    const formData = new FormData();
    formData.append('name', teamName.value);
    formData.append('description', teamDescription.value);
    if (teamImage.value) {
      formData.append('image', teamImage.value);
    }
    formData.append('phone', teamPhone.value);
    formData.append('email', teamEmail.value);

    await axios.post(`/teams/${currentTeamId.value}?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchTeams();
    teamName.value = '';
    teamDescription.value = '';
    teamPhone.value = '';
    teamEmail.value = '';
    teamImage.value = null;
    teamFile.value.value = ''
    isEditingTeam.value = false;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteTeam = async (idTeam) => {
  try {
    await axios.delete(`/teams/${idTeam}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchTeams();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editTeam = (team) => {
  isEditingTeam.value = true;
  currentTeamId.value = team.id;
  teamName.value = team.name;
  teamDescription.value = team.description;
  teamPhone.value = team.phone;
  teamEmail.value = team.email;
};
const resetTeam = () => {
  isEditingTeam.value = false;
  teamName.value = '';
  teamDescription.value = '';
  teamPhone.value = '';
  teamEmail.value = '';
  teamImage.value = null;
  teamFile.value.value = ''
  currentTeamId.value = null
};

//---------------------------------------------------------------------------------
// Контакты

const contacts = ref([]);
const addressContact = ref('');
const emailContact = ref('');
const phoneContact = ref('');
const mapContact = ref('');

const fetchContact = async () => {
  try {
    const response = await axios.get(`/contacts`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    contacts.value = response.data;
    addressContact.value = contacts.value[0].address;
    emailContact.value = contacts.value[0].email;
    phoneContact.value = contacts.value[0].phone;
    mapContact.value = contacts.value[0].map;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const updateContact = async () => {
  try {
    const formData = new FormData();
    formData.append('address', addressContact.value);
    formData.append('email', emailContact.value);
    formData.append('phone', phoneContact.value);
    formData.append('map', mapContact.value);

    await axios.post(`/contacts/1?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchContact();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};


const companies = ref([]);
const companyName = ref('');
const companyMainName = ref('');
const companyOffice = ref('');
const companyProduction = ref('');
const companyPhone = ref('');
const companyEmail = ref('');
const isEditingCompany = ref(false);
const currentCompanyId = ref(null);

const customName = ref('');
const customValue = ref('');
const customEditing = ref(false);
const currentCustomId = ref(null);
const currentCompanyCustomId = ref(null);

const fetchCompanies = async () => {
  try {
    const response = await axios.get(`/companies`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    companies.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const createCompany = async () => {
  try {
    const data = {
      name: companyName.value,
      details: [
        {
          name: companyMainName.value,
          office: companyOffice.value,
          production: companyProduction.value,
          phone: companyPhone.value,
          email: companyEmail.value,
        },
      ],
    };

    await axios.post(`/companies`, data, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCompanies();
    companyName.value = '';
    companyMainName.value = '';
    companyOffice.value = '';
    companyProduction.value = '';
    companyPhone.value = '';
    companyEmail.value = '';
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateCompany = async () => {
  try {
    const data = {
      name: companyName.value,
      details: [
        {
          name: companyMainName.value,
          office: companyOffice.value,
          production: companyProduction.value,
          phone: companyPhone.value,
          email: companyEmail.value,
        },
      ],
    };

    await axios.post(`/companies/${currentCompanyId.value}?_method=patch`, data, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCompanies();
    resetCompany();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteCompany = async (idCompany) => {
  try {
    await axios.delete(`/companies/${idCompany}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchCompanies();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editCompany = (company) => {
  resetCustom();
  customEditing.value = false;
  isEditingCompany.value = true;
  currentCompanyId.value = company.id;
  companyName.value = company.name;
  companyMainName.value = company.details.name;
  companyOffice.value = company.details.office;
  companyProduction.value = company.details.production;
  companyPhone.value = company.details.phone;
  companyEmail.value = company.details.email;
};
const resetCompany = () => {
  isEditingCompany.value = false;
  companyName.value = '';
  companyMainName.value = '';
  companyOffice.value = '';
  companyProduction.value = '';
  companyPhone.value = '';
  companyEmail.value = '';
  currentCompanyId.value = null
};
const createCustom = async () => {
  try {
    const formData = new FormData();
    formData.append('custom-details[0][title]', customName.value);
    formData.append('custom-details[0][value]', customValue.value);

    await axios.post(`/companies/${currentCompanyId.value}?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCompanies();
    customName.value = '';
    customValue.value = '';
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateCustom = async () => {
  try {
    const formData = new FormData();
    formData.append('custom-details[0][id]', currentCustomId.value);
    formData.append('custom-details[0][title]', customName.value);
    formData.append('custom-details[0][value]', customValue.value);

    await axios.post(`/companies/${currentCompanyCustomId.value}?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCompanies();
    resetCustom();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const editCustom = (custom, company) => {
  resetCompany();
  isEditingCompany.value = false;
  customEditing.value = true;
  customValue.value = custom.value;
  customName.value = custom.title;
  currentCustomId.value = custom.id;
  currentCompanyCustomId.value = company;
};
const resetCustom = () => {
  customEditing.value = false;
  customValue.value = '';
  customName.value = '';
  currentCustomId.value = '';
  currentCompanyCustomId.value = '';
};
const deleteCustomDetails = async (idCustom) => {
  try {
    await axios.delete(`/custom-details/${idCustom}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchCompanies();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

//---------------------------------------------------------------------------------
// Контакты

const promo = ref([]);
const isEditingPromo = ref(false);
const promoTitle = ref('');
const promoDescription = ref('');
const promoImage = ref(null);
const promoFile = ref(null);
const currentPromosBlockId = ref(null);

const fetchPromo = async () => {
  try {
    const response = await axios.get(`/pages/1`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
  }
};
const handleExportHtmlPromoBlock = (html) => {
  promoDescription.value = html;
}
const createPromoBlock = async () => {
  try {
    const formData = new FormData();
    formData.append('sections[0][title]', promoTitle.value);
    formData.append('sections[0][html]', promoDescription.value);
    formData.append('sections[0][image]', promoImage.value);

    await axios.post(`/pages/1?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPromo();
    promoTitle.value = '';
    promoDescription.value = '';
    promoImage.value = null;
    promoFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updatePromoBlock = async () => {
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
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPromo();
    resetPromoBlock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deletePromoBlock = async (idBlock) => {
  try {
    await axios.delete(`/pages/${idBlock}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchPromo();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editPromoBlock = (block) => {
  isEditingPromo.value = true;
  currentPromosBlockId.value = block.id;
  promoTitle.value = block.title;
  promoDescription.value = block.html;
};
const resetPromoBlock = () => {
  isEditingPromo.value = false;
  promoTitle.value = '';
  promoDescription.value = '';
  promoImage.value = null;
  promoFile.value.value = ''
  currentPromosBlockId.value = null
};


const stocks = ref([]);
const isEditingStock = ref(false);
const stockTitle = ref('');
const stockDescription = ref('');
const stockImage = ref(null);
const stockFile = ref(null);
const stockStart = ref('');
const stockEnd = ref('')
const stockArchived = ref(false);
const currentStockId = ref(null);

const fetchStocks = async () => {
  try {
    const response = await axios.get(`/promos`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    stocks.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const handleFileChangeStock = (event) => {
  const file = event.target.files[0];
  if (file) {
    stockImage.value = file;
  }
};
const createStock = async () => {
  // const isArchive = ref('');
  // if (stockArchived.value) {
  //   isArchive.value = 'true';
  // } else {
  //   isArchive.value = 'false';
  // }
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
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchStocks();
    stockTitle.value = '';
    stockDescription.value = '';
    stockStart.value = '';
    stockEnd.value = '';
    stockArchived.value = false;
    stockImage.value = null;
    stockFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateStock = async () => {
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
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchStocks();
    isEditingStock.value = false;
    stockTitle.value = '';
    stockDescription.value = '';
    stockStart.value = '';
    stockEnd.value = '';
    stockArchived.value = false;
    stockImage.value = null;
    stockFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteStock = async (idStock) => {
  try {
    await axios.delete(`/promos/${idStock}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchStocks();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editStock = (stock) => {
  isEditingStock.value = true;
  currentStockId.value = stock.id;
  stockTitle.value = stock.title;
  stockDescription.value = stock.description;
  stockStart.value = stock.start;
  stockEnd.value = stock.end;
  stockArchived.value = stock.is_archived;
};
const resetStock = () => {
  isEditingStock.value = false;
  stockTitle.value = '';
  stockDescription.value = '';
  stockImage.value = null;
  stockFile.value.value = ''
  stockStart.value = '';
  stockEnd.value = '';
  stockArchived.value = false;
  currentStockId.value = null
};

//---------------------------------------------------------------------------------
// Где купить

const place = ref([]);
const marketplacesPlace = ref([]);
const partnersPlace = ref([]);
const retailersPlace = ref([]);
const storesPlace = ref([]);
const placeName = ref('');
const placeUrl = ref('')
const placeImg = ref(null);
const placeFile = ref(null);
const placeSelect = ref('');
const isEditingPlace = ref(false);
const currentPlaceId = ref(false);

const fetchPlace = async () => {
  try {
    const response = await axios.get(`/purchase-place`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
  }
};
const createPlace = async () => {
  try {
    const formData = new FormData();
    formData.append('name', placeName.value);
    formData.append('type', placeSelect.value);
    formData.append('image', placeImg.value);
    if (placeUrl.value) {
      formData.append('url', placeUrl.value);
    }

    await axios.post(`/purchase-place`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPlace();
    placeName.value = '';
    placeSelect.value = '';
    placeUrl.value = '';
    placeImg.value = null;
    placeFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updatePlace = async () => {
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
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPlace();
    resetPlace();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deletePlace = async (idPlace) => {
  try {
    await axios.delete(`/purchase-place/${idPlace}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchPlace();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editPlace = (place) => {
  isEditingPlace.value = true;
  currentPlaceId.value = place.id;
  placeName.value = place.name;
  placeUrl.value = place.url;
  placeSelect.value = place.type;
};
const resetPlace = () => {
  isEditingPlace.value = false;
  placeName.value = '';
  placeUrl.value = '';
  placeImg.value = null;
  placeFile.value.value = ''
  placeSelect.value = ''
  currentPlaceId.value = null
};

//---------------------------------------------------------------------------------
// Доставка

const delivery = ref([]);
const isEditingDelivery = ref(false);
const currentDeliveryId = ref(null);
const deliveryTitle = ref('');
const deliveryDescription = ref('');
const deliveryImage = ref(null);
const deliveryFile = ref(null);

const fetchDelivery = async () => {
  try {
    const response = await axios.get(`/pages/3`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
  }
};
const handleExportHtmlDelivery = (html) => {
  deliveryDescription.value = html;
}
const createDelivery = async () => {
  try {
    const formData = new FormData();
    formData.append('sections[0][title]', deliveryTitle.value);
    formData.append('sections[0][html]', deliveryDescription.value);
    formData.append('sections[0][image]', deliveryImage.value);

    await axios.post(`/pages/3?_method=patch`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchDelivery();
    deliveryTitle.value = '';
    deliveryDescription.value = '';
    deliveryImage.value = null;
    deliveryFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateDelivery = async () => {
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
        'Authorization': `Bearer ${result.value.token}`,
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
  }
}
const deleteDelivery = async (idBlock) => {
  try {
    await axios.delete(`/pages/${idBlock}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchDelivery();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editDelivery = (block) => {
  isEditingDelivery.value = true;
  currentDeliveryId.value = block.id;
  deliveryTitle.value = block.title;
  deliveryDescription.value = block.html;
};
const resetDelivery = () => {
  isEditingDelivery.value = false;
  deliveryTitle.value = '';
  deliveryDescription.value = '';
  deliveryImage.value = null;
  deliveryFile.value.value = ''
  currentDeliveryId.value = null
};

//---------------------------------------------------------------------------------
// Соц сети

const socials = ref([]);
const socialPlatform = ref('')
const socialUrl = ref('');
const socialImage = ref(null);
const socialFile = ref(null)
const socialImageFooter = ref(null);
const socialFileFooter = ref(null)
const isEditingSocial = ref(false);
const currentSocialId = ref(null);

const fetchSocials = async () => {
  try {
    const response = await axios.get(`/socials`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
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
  }
};
const handleFileChangeSocialFooter = (event) => {
  const file = event.target.files[0];
  if (file) {
    socialImageFooter.value = file;
  }
};
const createSocial = async () => {
  try {
    const formData = new FormData();
    formData.append('platform', socialPlatform.value);
    formData.append('url', socialUrl.value);
    formData.append('image', socialImage.value);
    formData.append('image_footer', socialImageFooter.value);

    await axios.post(`/socials`, formData, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchSocials();
    resetSocial();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateSocial = async () => {
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
        'Authorization': `Bearer ${result.value.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchSocials();
    resetSocial();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteSocial = async (idSocial) => {
  try {
    await axios.delete(`/socials/${idSocial}`, {
      headers: {
        'Authorization': `Bearer ${result.value.token}`,
      },
    });
    await fetchSocials();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editSocial = (block) => {
  isEditingSocial.value = true;
  currentSocialId.value = block.id;
  socialPlatform.value = block.platform;
  socialUrl.value = block.url;
};
const resetSocial = () => {
  isEditingSocial.value = false;
  socialPlatform.value = '';
  socialUrl.value = '';
  socialImage.value = null;
  socialFile.value.value = ''
  socialImageFooter.value = null;
  socialFileFooter.value.value = ''
  currentSocialId.value = null
};

</script>

<template>
  <div class="admin">
    <h2 class="main_title">{{ isAuthenticated ? 'Админ панель' : 'Вход в админ панель' }}</h2>
    <div class="admin__auth" v-if="!isAuthenticated" @keydown.enter="fetchAdmin">
      <input type="email" class="basket__form_input" v-model="nameUser" placeholder="Введите логин">
      <input type="password" class="basket__form_input" v-model="passwordUser" placeholder="Введите пароль">
      <button class="main_btn" @click="fetchAdmin()">Войти</button>
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
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Контакты' }"
            @click="activeTab = 'Контакты'"
        >
          Контакты
        </p>
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Акции' }"
            @click="activeTab = 'Акции'"
        >
          Акции
        </p>
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Где купить' }"
            @click="activeTab = 'Где купить'"
        >
          Где купить
        </p>
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Доставка' }"
            @click="activeTab = 'Доставка'"
        >
          Доставка
        </p>
        <p
            class="admin-panel__menu_item"
            :class="{ active: activeTab === 'Соц сети' }"
            @click="activeTab = 'Соц сети'"
        >
          Соц сети
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
          <input
              type="number"
              class="basket__form_input admin-panel__content_input"
              v-model="numberBanner"
              placeholder="Введите порядок"
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
          <input
              type="number"
              class="basket__form_input admin-panel__content_input"
              v-model="numberBanner"
              placeholder="Введите порядок"
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

      <div class="admin-panel__content" v-if="activeTab === 'Категории'">
        <h2>Управление категориями</h2>
        <form class="admin-panel__content_form" v-if="!isEditingCat" @submit.prevent="createCategory">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="nameCategory"
              placeholder="Введите имя категории"
          />
          <select v-model="parentCategory" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите родительскую категорию</option>
            <option v-for="cat in categoriesLevel" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
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
          <select v-model="parentCategory" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите родительскую категорию</option>
            <option v-for="cat in categoriesLevel" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <input
              type="file"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeCategory"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Сохранить изменения</button>
          <button class="main_btn" type="button" @click="resetCategory">Отмена</button>
        </form>
        <table v-for="category in categories" :key="category.id">
          <thead>
          <tr>
            <th>Название</th>
            <th>Уровень</th>
            <th>Фото</th>
            <th>Дочерние элементы</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr>
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
          <tr v-for="cat in category.children" :key="cat.id">
            <td>{{ cat.name }}</td>
            <td>{{ cat.level }}</td>
            <td>
              <img :src="cat.photo" alt="Фото" width="50"/>
            </td>
            <td>
<!--              <span v-if="cat.children.length > 0">-->
<!--                {{ cat.children.length }} дочерних элемента(ов)-->
<!--              </span>-->
<!--              <span v-else>Нет</span>-->
              Дочерняя
            </td>
            <td>
              <button @click="editCategory(cat)" class="admin-panel__content_btn">Изменить</button>
            </td>
            <td>
              <button @click="deleteCategory(cat.id)" class="admin-panel__content_btn">Удалить</button>
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
                <th>Изменить</th>
                <th>Удалить</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="value in option.values" :key="value.id">
                <td>{{ value.value }}</td>
                <td>{{ value.price }}</td>
                <td>
                  <img :src="value.image" alt="Фото" width="50"/>
                </td>
                <td>
                  <button @click="editOptionValue(option.id, value)" class="admin-panel__content_btn">Изменить</button>
                </td>
                <td>
                  <button @click="deleteOptionValue(option.id, value.id)" class="admin-panel__content_btn">Удалить
                  </button>
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
          <button class="main_btn" @click="resetProduct">Отмена</button>
        </form>
        <h3 v-if="isEditingProduct">Добавить картинку</h3>
        <form class="admin-panel__content_form" v-if="isEditingProduct && !isEditingProductPhoto" @submit.prevent="addProductPhoto">
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
        <form class="admin-panel__content_form" v-if="isEditingProduct && isEditingProductPhoto" @submit.prevent="updateProductPhoto">
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
            <td>{{product.order}}</td>
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
          <Editor @export-html="handleExportHtmlAbout_usBlock"/>
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
          <Editor :initialHtml="about_usDescription" @export-html="handleExportHtmlAbout_usBlock"/>
          <input
              type="file"
              ref="fileBanners"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeAbout_usBlock"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Изменить блок</button>
          <button class="main_btn" type="submit" @click="resetAbout_usBlock">Отмена</button>
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
          <tr v-for="section in about_usBlock.sections" :key="section.id">
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
            <td>{{ formatDate(patent.date) }}</td>
            <td>
              <button @click="deletePatents(patent.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
        <h3>Команда</h3>
        <form class="admin-panel__content_form" v-if="!isEditingTeam" @submit.prevent="createTeams">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="teamName"
              placeholder="Введите ФИО"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="teamDescription"
              placeholder="Введите описание"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="teamPhone"
              placeholder="Введите телефон"
          />
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="teamEmail"
              placeholder="Введите почту"
          />
          <input
              type="file"
              ref="teamFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeTeam"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingTeam" @submit.prevent="updateTeams">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="teamName"
              placeholder="Введите ФИО"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="teamDescription"
              placeholder="Введите описание"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="teamPhone"
              placeholder="Введите телефон"
          />
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="teamEmail"
              placeholder="Введите почту"
          />
          <input
              type="file"
              ref="teamFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeTeam"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Изменить</button>
          <button class="main_btn" @click="resetTeam">Отмена</button>
        </form>
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Фото</th>
            <th>Телефон</th>
            <th>Почта</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="patent in teams" :key="patent.id">
            <td>{{ patent.id }}</td>
            <td>{{ patent.name }}</td>
            <td>{{ patent.description }}</td>
            <td>
              <img :src="patent.image" alt="Фото" width="50"/>
            </td>
            <td>{{ patent.phone }}</td>
            <td>{{ patent.email }}</td>
            <td>
              <button @click="editTeam(patent)" class="admin-panel__content_btn">Изменить</button>
            </td>
            <td>
              <button @click="deleteTeam(patent.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="admin-panel__content" v-if="activeTab === 'Контакты'">
        <h2>Управление страницей контакты</h2>
        <h3>Данные</h3>
        <form class="admin-panel__content_form" @submit.prevent="updateContact">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="addressContact"
              placeholder="Введите адрес"
          />
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="emailContact"
              placeholder="Введите почту"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="phoneContact"
              placeholder="Введите телефон"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="mapContact"
              placeholder="Введите координаты: x, y"
          />
          <button class="main_btn" type="submit">Изменить</button>
        </form>
        <table>
          <thead>
          <tr>
            <th>Адрес</th>
            <th>Почта</th>
            <th>Телефон</th>
            <th>Координаты</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="contact in contacts" :key="contact.id">
            <td>{{ contact.address }}</td>
            <td>{{ contact.email }}</td>
            <td>{{ contact.phone }}</td>
            <td>{{ contact.map }}</td>
          </tr>
          </tbody>
        </table>
        <h3>Компании</h3>
        <form class="admin-panel__content_form" v-if="!isEditingCompany" @submit.prevent="createCompany">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyName"
              placeholder="Введите название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyMainName"
              placeholder="Введите полное название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyOffice"
              placeholder="Введите адрес офиса"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyProduction"
              placeholder="Введите производство"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyPhone"
              placeholder="Введите телефон"
          />
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="companyEmail"
              placeholder="Введите почту"
          />
          <button class="main_btn" type="submit">Создать компанию</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingCompany" @submit.prevent="updateCompany">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyName"
              placeholder="Введите название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyMainName"
              placeholder="Введите полное название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyOffice"
              placeholder="Введите адрес офиса"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyProduction"
              placeholder="Введите производство"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyPhone"
              placeholder="Введите телефон"
          />
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="companyEmail"
              placeholder="Введите почту"
          />
          <button class="main_btn" type="submit">Изменить компанию</button>
          <button class="main_btn" @click="resetCompany">Отмена</button>
        </form>
        <h3 v-if="isEditingCompany">Кастомный параметр</h3>
        <form class="admin-panel__content_form" v-if="isEditingCompany" @submit.prevent="createCustom">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="customName"
              placeholder="Введите название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="customValue"
              placeholder="Введите значение"
          />
          <button class="main_btn" type="submit">Добавить параметр</button>
          <button class="main_btn" @click="resetCompany">Отмена</button>
        </form>
        <form class="admin-panel__content_form" v-if="customEditing" @submit.prevent="updateCustom">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="customName"
              placeholder="Введите название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="customValue"
              placeholder="Введите значение"
          />
          <button class="main_btn" type="submit">Изменить параметр</button>
          <button class="main_btn" @click="resetCustom">Отмена</button>
        </form>
        <div
            class="admin-panel__content_info_item"
            v-for="company in companies" :key="company.id"
        >
          <div class="admin-panel__content_info_content">
            <p>{{ company.name }}</p>
            <button @click="editCompany(company)" class="admin-panel__content_btn">Изменить</button>
            <button @click="deleteCompany(company.id)" class="admin-panel__content_btn">Удалить</button>
          </div>
          <table>
            <thead>
            <tr>
              <th>Название</th>
              <th>Офис</th>
              <th>Производство</th>
              <th>Телефон</th>
              <th>Почта</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>{{ company.details.name }}</td>
              <td>{{ company.details.office }}</td>
              <td>{{ company.details.production }}</td>
              <td>{{ company.details.phone }}</td>
              <td>{{ company.details.email }}</td>
            </tr>
            </tbody>
          </table>
          <table>
            <thead>
            <tr>
              <th>Название</th>
              <th>Значение</th>
              <th>Изменить</th>
              <th>Удалить</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="value in company['custom-details']" :key="value.id">
              <td>{{ value.title }}</td>
              <td>{{ value.value }}</td>
              <td>
                <button @click="editCustom(value, company.id)" class="admin-panel__content_btn">Изменить</button>
              </td>
              <td>
                <button @click="deleteCustomDetails(value.id)" class="admin-panel__content_btn">Удалить</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-panel__content" v-if="activeTab === 'Акции'">
        <h2>Управление страницей акции</h2>
        <h3>Блоки</h3>
        <form class="admin-panel__content_form" v-if="!isEditingPromo" @submit.prevent="createPromoBlock">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="promoTitle"
              placeholder="Введите название"
          />
          <Editor @export-html="handleExportHtmlPromoBlock"/>
          <input
              type="file"
              ref="promoFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangePromo"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать блок</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingPromo" @submit.prevent="updatePromoBlock">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="promoTitle"
              placeholder="Введите название"
          />
          <Editor :initialHtml="promoDescription" @export-html="handleExportHtmlPromoBlock"/>
          <input
              type="file"
              ref="promoFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangePromo"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Изменить блок</button>
          <button class="main_btn" type="submit" @click="resetPromoBlock">Отмена</button>
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
          <tr v-for="section in promo.sections" :key="section.id">
            <td>{{ section.title }}</td>
            <td>{{ section.html }}</td>
            <td>
              <img :src="section.image" alt="Фото" width="50"/>
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
        <form class="admin-panel__content_form" v-if="!isEditingStock" @submit.prevent="createStock">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="stockTitle"
              placeholder="Введите название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="stockDescription"
              placeholder="Введите описание"
          />
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="stockStart"
              placeholder="Введите дату начала"
          />
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="stockEnd"
              placeholder="Введите дату конца"
          />
          В архив
          <input
              type="checkbox"
              class="basket__form_input admin-panel__content_input"
              v-model="stockArchived"
              placeholder="Архив"
          />
          <input
              type="file"
              ref="stockFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeStock"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать акцию</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingStock" @submit.prevent="updateStock">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="stockTitle"
              placeholder="Введите название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="stockDescription"
              placeholder="Введите описание"
          />
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="stockStart"
              placeholder="Введите дату начала"
          />
          <input
              type="date"
              class="basket__form_input admin-panel__content_input"
              v-model="stockEnd"
              placeholder="Введите дату конца"
          />
          В архив
          <input
              type="checkbox"
              class="basket__form_input admin-panel__content_input"
              v-model="stockArchived"
              placeholder="Архив"
          />
          <input
              type="file"
              ref="stockFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeStock"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Изменить акцию</button>
          <button class="main_btn" @click="resetStock">Отмена</button>
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
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="stock in stocks" :key="stock.id">
            <td>{{ stock.title }}</td>
            <td>{{ stock.description }}</td>
            <td>
              <img :src="stock.image" alt="Фото" width="50"/>
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
      </div>

      <div class="admin-panel__content" v-if="activeTab === 'Где купить'">
        <h2>Управление страницей Где купить?</h2>
        <form class="admin-panel__content_form" v-if="!isEditingPlace" @submit.prevent="createPlace">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="placeName"
              placeholder="Введите название"
          />
          <select v-model="placeSelect" class="basket__form_input admin-panel__content_select">
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
          <input
              type="file"
              ref="placeFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangePlace"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать пункт</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingPlace" @submit.prevent="updatePlace">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="placeName"
              placeholder="Введите название"
          />
          <select v-model="placeSelect" class="basket__form_input admin-panel__content_select">
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
          <input
              type="file"
              ref="placeFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangePlace"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Изменить пункт</button>
          <button class="main_btn" @click="resetPlace">Отмена</button>
        </form>
        <div class="admin-panel__content_info_item">
          Маркетплейсы
          <table>
            <thead>
            <tr>
              <th>Название</th>
              <th>Ссылка</th>
              <th>Иконка</th>
              <th>Изменить</th>
              <th>Удалить</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="place in marketplacesPlace" :key="place.id">
              <td>{{ place.name }}</td>
              <td>{{ place.url }}</td>
              <td>
                <img :src="place.image" alt="Фото" width="50"/>
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
              <th>Изменить</th>
              <th>Удалить</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="place in partnersPlace" :key="place.id">
              <td>{{ place.name }}</td>
              <td>{{ place.url }}</td>
              <td>
                <img :src="place.image" alt="Фото" width="50"/>
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
              <th>Изменить</th>
              <th>Удалить</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="place in retailersPlace" :key="place.id">
              <td>{{ place.name }}</td>
              <td>{{ place.url }}</td>
              <td>
                <img :src="place.image" alt="Фото" width="50"/>
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
              <th>Изменить</th>
              <th>Удалить</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="place in storesPlace" :key="place.id">
              <td>{{ place.name }}</td>
              <td>{{ place.url }}</td>
              <td>
                <img :src="place.image" alt="Фото" width="50"/>
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

      <div class="admin-panel__content" v-if="activeTab === 'Доставка'">
        <h2>Управление страницей доставка</h2>
        <form class="admin-panel__content_form" v-if="!isEditingDelivery" @submit.prevent="createDelivery">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="deliveryTitle"
              placeholder="Введите название"
          />
          <Editor @export-html="handleExportHtmlDelivery"/>
          <input
              type="file"
              ref="deliveryFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeDelivery"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать блок</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingDelivery" @submit.prevent="updateDelivery">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="deliveryTitle"
              placeholder="Введите название"
          />
          <Editor :initialHtml="deliveryDescription" @export-html="handleExportHtmlDelivery"/>
          <input
              type="file"
              ref="deliveryFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeDelivery"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Изменить блок</button>
          <button class="main_btn" @click="resetDelivery">Отмена</button>
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
              <img :src="section.image" alt="Фото" width="50"/>
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

      <div class="admin-panel__content" v-if="activeTab === 'Соц сети'">
        <h2>Управление страницей доставка</h2>
        <form class="admin-panel__content_form" v-if="!isEditingSocial" @submit.prevent="createSocial">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="socialPlatform"
              placeholder="Введите название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="socialUrl"
              placeholder="Введите ссылку"
          />
          Фото основное
          <input
              type="file"
              ref="socialFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeSocial"
              accept="image/*"
          />
          Фото для подвала
          <input
              type="file"
              ref="socialFileFooter"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeSocialFooter"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Создать соц сеть</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingSocial" @submit.prevent="updateSocial">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="socialPlatform"
              placeholder="Введите название"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="socialUrl"
              placeholder="Введите ссылку"
          />
          Фото основное
          <input
              type="file"
              ref="socialFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeSocial"
              accept="image/*"
          />
          Фото для подвала
          <input
              type="file"
              ref="socialFileFooter"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeSocialFooter"
              accept="image/*"
          />
          <button class="main_btn" type="submit">Изменить соц сеть</button>
          <button class="main_btn" @click="resetSocial">Отмена</button>
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
              <img :src="social.image" alt="Фото" width="50"/>
            </td>
            <td>
              <img :src="social.image_footer" alt="Фото" width="50"/>
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