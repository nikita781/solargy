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
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const errors = ref({

});
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
      <AdminAboutUs  v-if="activeTab === 'О нас'"/>
      <AdminContact v-if="activeTab === 'Контакты'"/>
      <AdminStock v-if="activeTab === 'Акции'"/>
      <AdminPlace v-if="activeTab === 'Где купить'"/>
      <AdminDelivery v-if="activeTab === 'Доставка'"/>
      <AdminSocial v-if="activeTab === 'Соц сети'"/>
      <AdminEmail v-if="activeTab === 'Почты'"/>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>