<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";
import Editor from '~/components/editor.vue';

const nameUser = ref('');
const passwordUser = ref('');
const result = ref([]);
const activeTab = ref("Главная");

const isAuthenticated = ref(null);

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchContact();
    await fetchCompanies();
    await fetchPromo();
    await fetchStocks();
    await fetchPlace();
    await fetchDelivery();
    await fetchSocials();
    await fetchEmails();
    await fetchEmailTypes();

    isAuthenticated.value = true;
  } else {
    isAuthenticated.value = false;
  }
});
const exitAdmin = () => {
  localStorage.removeItem('authToken');
  isAuthenticated.value = false;
}

const fetchAdmin = async () => {
  try {
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {withCredentials: true});
    const response = await axios.post(`/login?email=${nameUser.value}&password=${passwordUser.value}`, {withCredentials: true});
    result.value = response.data;
    isAuthenticated.value = true;

    localStorage.setItem('authToken', result.value.token);

    await fetchContact();
    await fetchCompanies();
    await fetchPromo();
    await fetchStocks();
    await fetchPlace();
    await fetchDelivery();
    await fetchSocials();
    await fetchEmails();
    await fetchEmailTypes();

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

const errors = ref({
  addressContact: false,
  emailContact: false,
  phoneContact: false,
  mapContact: false,

  companyName: false,
  companyMainName: false,
  companyOffice: false,
  companyProduction: false,
  companyPhone: false,
  companyEmail: false,

  customName: false,
  customValue: false,

  promoTitle: false,
  promoImage: false,

  stockTitle: false,
  stockDescription: false,
  stockImage: false,
  stockStart: false,
  stockEnd: false,

  placeName: false,
  placeSelect: false,
  placeImg: false,

  deliveryTitle: false,
  deliveryImage: false,

  socialPlatform: false,
  socialUrl: false,
  socialImage: false,
  socialImageFooter: false,

  emailName: false,
  emailNumber: false,
  emailType: false,
});

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
      headers: {},
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
  errors.value.addressContact = false;
  errors.value.emailContact = false;
  errors.value.phoneContact = false;
  errors.value.mapContact = false;
  errors.value.addressContact = !addressContact.value;
  errors.value.emailContact = !emailContact.value;
  errors.value.phoneContact = !phoneContact.value;
  errors.value.mapContact = !mapContact.value;
  try {
    const formData = new FormData();
    formData.append('address', addressContact.value);
    formData.append('email', emailContact.value);
    formData.append('phone', phoneContact.value);
    formData.append('map', mapContact.value);

    await axios.post(`/contacts/1?_method=patch`, formData, {
      headers: {},
    });
    await fetchContact();
    errors.value.addressContact = false;
    errors.value.emailContact = false;
    errors.value.phoneContact = false;
    errors.value.mapContact = false;
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
      headers: {},
    });
    companies.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const createCompany = async () => {
  errors.value.companyName = false;
  errors.value.companyMainName = false;
  errors.value.companyOffice = false;
  errors.value.companyProduction = false;
  errors.value.companyPhone = false;
  errors.value.companyEmail = false;
  errors.value.companyName = !companyName.value;
  errors.value.companyMainName = !companyMainName.value;
  errors.value.companyOffice = !companyOffice.value;
  errors.value.companyProduction = !companyProduction.value;
  errors.value.companyPhone = !companyPhone.value;
  errors.value.companyEmail = !companyEmail.value;
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

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCompanies();
    resetCompany();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateCompany = async () => {
  errors.value.companyName = false;
  errors.value.companyMainName = false;
  errors.value.companyOffice = false;
  errors.value.companyProduction = false;
  errors.value.companyPhone = false;
  errors.value.companyEmail = false;
  errors.value.companyName = !companyName.value;
  errors.value.companyMainName = !companyMainName.value;
  errors.value.companyOffice = !companyOffice.value;
  errors.value.companyProduction = !companyProduction.value;
  errors.value.companyPhone = !companyPhone.value;
  errors.value.companyEmail = !companyEmail.value;
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
      headers: {},
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
  errors.value.companyName = false;
  errors.value.companyMainName = false;
  errors.value.companyOffice = false;
  errors.value.companyProduction = false;
  errors.value.companyPhone = false;
  errors.value.companyEmail = false;
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
  errors.value.companyName = false;
  errors.value.companyMainName = false;
  errors.value.companyOffice = false;
  errors.value.companyProduction = false;
  errors.value.companyPhone = false;
  errors.value.companyEmail = false;
};
const createCustom = async () => {
  errors.value.customName = false;
  errors.value.customValue = false;
  errors.value.customName = !customName.value;
  errors.value.customValue = !customValue.value;
  try {
    const formData = new FormData();
    formData.append('custom-details[0][title]', customName.value);
    formData.append('custom-details[0][value]', customValue.value);

    await axios.post(`/companies/${currentCompanyId.value}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchCompanies();
    resetCustom();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateCustom = async () => {
  errors.value.customName = false;
  errors.value.customValue = false;
  errors.value.customName = !customName.value;
  errors.value.customValue = !customValue.value;
  try {
    const formData = new FormData();
    formData.append('custom-details[0][id]', currentCustomId.value);
    formData.append('custom-details[0][title]', customName.value);
    formData.append('custom-details[0][value]', customValue.value);

    await axios.post(`/companies/${currentCompanyCustomId.value}?_method=patch`, formData, {
      headers: {

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
  errors.value.customName = false;
  errors.value.customValue = false;
};
const resetCustom = () => {
  customEditing.value = false;
  customValue.value = '';
  customName.value = '';
  currentCustomId.value = '';
  currentCompanyCustomId.value = '';
  errors.value.customName = false;
  errors.value.customValue = false;
};
const deleteCustomDetails = async (idCustom) => {
  try {
    await axios.delete(`/custom-details/${idCustom}`, {
      headers: {},
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
  }
};
const handleExportHtmlPromoBlock = (html) => {
  promoDescription.value = html;
}
const createPromoBlock = async () => {
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
  }
}
const updatePromoBlock = async () => {
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
  }
}
const deletePromoBlock = async (idBlock) => {
  try {
    await axios.delete(`/pages/${idBlock}`, {
      headers: {},
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
  errors.value.promoTitle = false;
  errors.value.promoImage = false;
};
const resetPromoBlock = () => {
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
      headers: {},
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
  }
}
const updateStock = async () => {
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
    resetStock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteStock = async (idStock) => {
  try {
    await axios.delete(`/promos/${idStock}`, {
      headers: {},
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
  errors.value.stockTitle = false;
  errors.value.stockDescription = false;
  errors.value.stockImage = false;
  errors.value.stockStart = false;
  errors.value.stockEnd = false;
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
  errors.value.stockTitle = false;
  errors.value.stockDescription = false;
  errors.value.stockImage = false;
  errors.value.stockStart = false;
  errors.value.stockEnd = false;
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
  }
};
const createPlace = async () => {
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
  }
}
const updatePlace = async () => {
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
    formData.append('url', placeUrl.value);

    await axios.post(`/purchase-place/${currentPlaceId.value}?_method=patch`, formData, {
      headers: {

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
      headers: {},
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
  errors.value.placeName = false;
  errors.value.placeSelect = false;
  errors.value.placeImg = false;
};
const resetPlace = () => {
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
  }
};
const handleExportHtmlDelivery = (html) => {
  deliveryDescription.value = html;
}
const createDelivery = async () => {
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
  }
}
const updateDelivery = async () => {
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
  }
}
const deleteDelivery = async (idBlock) => {
  try {
    await axios.delete(`/pages/${idBlock}`, {
      headers: {},
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
  errors.value.deliveryTitle = false;
  errors.value.deliveryImage = false;
};
const resetDelivery = () => {
  isEditingDelivery.value = false;
  deliveryTitle.value = '';
  deliveryDescription.value = '';
  deliveryImage.value = null;
  deliveryFile.value.value = ''
  currentDeliveryId.value = null
  errors.value.deliveryTitle = false;
  errors.value.deliveryImage = false;
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
  }
};
const handleFileChangeSocialFooter = (event) => {
  const file = event.target.files[0];
  if (file) {
    socialImageFooter.value = file;
  }
};
const createSocial = async () => {
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
  }
}
const updateSocial = async () => {
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
  }
}
const deleteSocial = async (idSocial) => {
  try {
    await axios.delete(`/socials/${idSocial}`, {
      headers: {},
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
  errors.value.socialPlatform = false;
  errors.value.socialUrl = false;
  errors.value.socialImage = false;
  errors.value.socialImageFooter = false;
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
  errors.value.socialPlatform = false;
  errors.value.socialUrl = false;
  errors.value.socialImage = false;
  errors.value.socialImageFooter = false;
};

//---------------------------------------------------------------------------------
// Почты

const emails = ref([]);
const emailName = ref('');

const emailTypes = ref([]);
const emailType = ref(null);
const emailNumber = ref(null);

const fetchEmails = async () => {
  try {
    const response = await axios.get(`/emails`, {
      headers: {},
    });
    emails.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const createEmails = async () => {
  errors.value.emailName = false;
  errors.value.emailName = !emailName.value;
  try {
    const formData = new FormData();
    formData.append('email', emailName.value);

    await axios.post(`/emails`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchEmails();
    emailName.value = ''
    errors.value.emailName = false;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteEmail = async (idEmail) => {
  try {
    await axios.delete(`/emails/${idEmail}`, {
      headers: {},
    });
    await fetchEmails();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const fetchEmailTypes = async () => {
  try {
    const response = await axios.get(`/email-types`, {
      headers: {},
    });
    emailTypes.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const createEmailValue = async () => {
  errors.value.emailType = false;
  errors.value.emailNumber = false;
  errors.value.emailType = !emailType.value;
  errors.value.emailNumber = !emailNumber.value;
  try {
    const formData = new FormData();
    formData.append('email_id', emailNumber.value);

    await axios.post(`/email-types/${emailType.value}?_method=patch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchEmailTypes();
    emailType.value = ''
    emailNumber.value = ''
    errors.value.emailType = false;
    errors.value.emailNumber = false;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteEmailValue = async (idEmail, idType) => {
  try {
    await axios.delete(`/email-types/${idType}/emails/${idEmail}`, {
      headers: {},
    });
    await fetchEmailTypes();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

</script>

<template>
  <div class="admin">
    <h2 class="main_title" v-if="isAuthenticated === false">Вход в админ панель</h2>
    <h2 class="main_title" v-else>Админ панель</h2>
    <div class="admin__auth" v-if="isAuthenticated === false" @keydown.enter="fetchAdmin">
      <input type="email" class="basket__form_input" v-model="nameUser" placeholder="Введите логин">
      <input type="password" class="basket__form_input" v-model="passwordUser" placeholder="Введите пароль">
      <button class="main_btn" @click="fetchAdmin()">Войти</button>
    </div>
    <div class="admin-panel" v-else>
      <div class="admin-panel__menu-cont">
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
          <p
              class="admin-panel__menu_item"
              :class="{ active: activeTab === 'Почты' }"
              @click="activeTab = 'Почты'"
          >
            Почты
          </p>
          <button class="main_btn" @click="exitAdmin">Выйти</button>
        </div>
      </div>
      <AdminMain v-if="activeTab === 'Главная'"/>
      <AdminCategory v-if="activeTab === 'Категории'"/>
      <AdminOption v-if="activeTab === 'Параметры товара'"/>
      <AdminProduct v-if="activeTab === 'Товары'"/>
      <AdminAbout_us  v-if="activeTab === 'О нас'"/>

      <div class="admin-panel__content" v-if="activeTab === 'Контакты'">
        <h2>Управление страницей контакты</h2>
        <h3>Данные</h3>
        <form class="admin-panel__content_form" @submit.prevent="updateContact">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="addressContact"
              placeholder="Введите адрес"
              :class="{ error: errors.addressContact }"
          />
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="emailContact"
              placeholder="Введите почту"
              :class="{ error: errors.emailContact }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="phoneContact"
              placeholder="Введите телефон"
              :class="{ error: errors.phoneContact }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="mapContact"
              placeholder="Введите координаты: x, y"
              :class="{ error: errors.mapContact }"
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
              :class="{ error: errors.companyName }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyMainName"
              placeholder="Введите полное название"
              :class="{ error: errors.companyMainName }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyOffice"
              placeholder="Введите адрес офиса"
              :class="{ error: errors.companyOffice }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyProduction"
              placeholder="Введите производство"
              :class="{ error: errors.companyProduction }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyPhone"
              placeholder="Введите телефон"
              :class="{ error: errors.companyPhone }"
          />
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="companyEmail"
              placeholder="Введите почту"
              :class="{ error: errors.companyEmail }"
          />
          <button class="main_btn" type="submit">Создать компанию</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingCompany" @submit.prevent="updateCompany">
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyName"
              placeholder="Введите название"
              :class="{ error: errors.companyName }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyMainName"
              placeholder="Введите полное название"
              :class="{ error: errors.companyMainName }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyOffice"
              placeholder="Введите адрес офиса"
              :class="{ error: errors.companyOffice }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyProduction"
              placeholder="Введите производство"
              :class="{ error: errors.companyProduction }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="companyPhone"
              placeholder="Введите телефон"
              :class="{ error: errors.companyPhone }"
          />
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="companyEmail"
              placeholder="Введите почту"
              :class="{ error: errors.companyEmail }"
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
              :class="{ error: errors.customName }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="customValue"
              placeholder="Введите значение"
              :class="{ error: errors.customValue }"
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
              :class="{ error: errors.customName }"
          />
          <input
              type="text"
              class="basket__form_input admin-panel__content_input"
              v-model="customValue"
              placeholder="Введите значение"
              :class="{ error: errors.customValue }"
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
              :class="{ error: errors.promoTitle }"
          />
          <Editor @export-html="handleExportHtmlPromoBlock"/>
          <input
              type="file"
              ref="promoFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangePromo"
              accept="image/*"
              :class="{ error: errors.promoImage }"
          />
          <button class="main_btn" type="submit">Создать блок</button>
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
          <input
              type="file"
              ref="stockFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeStock"
              accept="image/*"
              :class="{ error: errors.stockImage }"
          />
          <button class="main_btn" type="submit">Создать акцию</button>
        </form>
        <form class="admin-panel__content_form" v-if="isEditingStock" @submit.prevent="updateStock">
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
              :class="{ error: errors.deliveryTitle }"
          />
          <Editor @export-html="handleExportHtmlDelivery"/>
          <input
              type="file"
              ref="deliveryFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeDelivery"
              accept="image/*"
              :class="{ error: errors.deliveryImage }"
          />
          <button class="main_btn" type="submit">Создать блок</button>
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
          <input
              type="file"
              ref="socialFile"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeSocial"
              accept="image/*"
              :class="{ error: errors.socialImage }"
          />
          Фото для подвала
          <input
              type="file"
              ref="socialFileFooter"
              class="basket__form_input admin-panel__content_input"
              @change="handleFileChangeSocialFooter"
              accept="image/*"
              :class="{ error: errors.socialImageFooter }"
          />
          <button class="main_btn" type="submit">Создать соц сеть</button>
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

      <div class="admin-panel__content" v-if="activeTab === 'Почты'">
        <h2>Управление почтами обратной связи</h2>
        <h3>Почты</h3>
        <form class="admin-panel__content_form" @submit.prevent="createEmails">
          <input
              type="email"
              class="basket__form_input admin-panel__content_input"
              v-model="emailName"
              placeholder="Введите почту"
              :class="{ error: errors.emailName }"
          />
          <button class="main_btn" type="submit">Добавить почту</button>
        </form>
        <table>
          <thead>
          <tr>
            <th>Почта</th>
            <th>Изменить</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="email in emails" :key="email.id">
            <td>{{ email.email }}</td>
            <td>
              <button @click="deleteEmail(email.id)" class="admin-panel__content_btn">Удалить</button>
            </td>
          </tr>
          </tbody>
        </table>
        <h3>Привязки</h3>
        <form class="admin-panel__content_form" @submit.prevent="createEmailValue">
          Тип
          <select v-model="emailType"
                  class="basket__form_input admin-panel__content_select"
                  :class="{ error: errors.emailType }"
          >
            <option value="" disabled>Выберите категорию</option>
            <option value='1'>
              Заказы
            </option>
            <option value='2'>
              Звонки
            </option>
            <option value='3'>
              Поддержка
            </option>
          </select>
          Почта
          <select v-model="emailNumber" :class="{ error: errors.emailNumber }" class="basket__form_input admin-panel__content_select">
            <option value="" disabled>Выберите родительскую категорию</option>
            <option v-for="email in emails" :key="email.id" :value="email.id">
              {{ email.email }}
            </option>
          </select>
          <button class="main_btn" type="submit">Привязать почту</button>
        </form>
        <div class="admin-panel__content_info_item">
          Для заказов
          <table>
            <thead>
            <tr>
              <th>Почта</th>
              <th>Изменить</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="email in emailTypes?.[0]?.email" :key="email.id">
              <td>{{ email.email }}</td>
              <td>
                <button @click="deleteEmailValue(email.id, 1)" class="admin-panel__content_btn">Отвязать</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="admin-panel__content_info_item">
          Для звонков
          <table>
            <thead>
            <tr>
              <th>Почта</th>
              <th>Изменить</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="email in emailTypes?.[1]?.email" :key="email.id">
              <td>{{ email.email }}</td>
              <td>
                <button @click="deleteEmailValue(email.id, 2)" class="admin-panel__content_btn">Отвязать</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="admin-panel__content_info_item">
          Для поддержки
          <table>
            <thead>
            <tr>
              <th>Почта</th>
              <th>Изменить</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="email in emailTypes?.[2]?.email" :key="email.id">
              <td>{{ email.email }}</td>
              <td>
                <button @click="deleteEmailValue(email.id, 3)" class="admin-panel__content_btn">Отвязать</button>
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