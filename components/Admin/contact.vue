<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchContact();
    await fetchCompanies();
  }
});

const isLoading = ref(false);

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
});

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
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
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
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
}
const updateCompany = async () => {
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
}
const deleteCompany = async (idCompany) => {
  isLoading.value = true;
  try {
    await axios.delete(`/companies/${idCompany}`, {
      headers: {},
    });
    await fetchCompanies();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
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
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
}
const updateCustom = async () => {
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
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
  isLoading.value = true;
  try {
    await axios.delete(`/custom-details/${idCustom}`, {
      headers: {},
    });
    await fetchCompanies();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
<div class="admin-panel__content">
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
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Создать компанию</span>
    </button>
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
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Изменить компанию</span>
    </button>
    <button class="main_btn" @click="resetCompany" v-if="!isLoading">Отмена</button>
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
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Добавить параметр</span>
    </button>
    <button class="main_btn" @click="resetCompany" v-if="!isLoading">Отмена</button>
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
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Изменить параметр</span>
    </button>
    <button class="main_btn" @click="resetCustom" v-if="!isLoading">Отмена</button>
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
        <th style="width: 100px">Изменить</th>
        <th style="width: 100px">Удалить</th>
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
</template>

<style scoped lang="scss">

</style>