<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchEmails();
    await fetchEmailTypes();
  }
});

const isLoading = ref(false);

const errors = ref({
  emailName: false,
  emailNumber: false,
  emailType: false,
});

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
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
}
const deleteEmail = async (idEmail) => {
  isLoading.value = true;
  try {
    await axios.delete(`/emails/${idEmail}`, {
      headers: {},
    });
    await fetchEmails();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
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
  isLoading.value = true;
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
  } finally {
    isLoading.value = false;
  }
}
const deleteEmailValue = async (idEmail, idType) => {
  isLoading.value = true;
  try {
    await axios.delete(`/email-types/${idType}/emails/${idEmail}`, {
      headers: {},
    });
    await fetchEmailTypes();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
<div class="admin-panel__content">
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
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Добавить почту</span>
    </button>
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
    <button
        class="main_btn"
        type="submit"
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
        :style="{ padding: isLoading ? '2px 50px' : '18px 50px' }"
    >
      <span v-if="isLoading"><img src="../../public/loading.gif" alt="Загрузка" width="50"/></span>
      <span v-else>Привязать почту</span>
    </button>
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
</template>

<style scoped lang="scss">

</style>