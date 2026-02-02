<script setup>
import axios from "axios";
import {onMounted, ref} from "vue";
import Editor from '~/components/editor.vue';
import { useAsyncData } from '#app';

const { data: seos, error } = await useAsyncData("fetchSeos", () =>
    axios.get(`/seos`).then((res) => res.data)
);

const deliverySeo = ref(null);

const defaultSeo = {
  title: "SOLARGY SHOP - Световые панели для вашего дома и бизнеса",
  description: "SOLARGY SHOP предлагает световые панели высокого качества по доступным ценам. Энергосберегающие технологии, широкий ассортимент и доставка по всей России.",
  keywords: "световые панели, солнечные панели, энергосбережение, купить световые панели, панели для дома, панели для бизнеса, Solargy Shop, солнечные батареи, возобновляемая энергия",
  author: "Solargy"
};

if (seos.value) {
  deliverySeo.value = seos.value.find((seo) => seo.url === "admin");

  if (deliverySeo.value) {
    const seoFields = deliverySeo.value.seos.reduce((acc, item) => {
      acc[item.name] = item.content;
      return acc;
    }, {});
    useHead({
      title: seoFields.title || defaultSeo.title,
      meta: [
        { name: "description", content: seoFields.description || defaultSeo.description },
        { name: "keywords", content: seoFields.keywords || defaultSeo.keywords },
        { name: "author", content: seoFields.author || defaultSeo.author },
      ],
    });
  } else {
    useHead({
      title: defaultSeo.title,
      meta: [
        { name: "description", content: defaultSeo.description },
        { name: "keywords", content: defaultSeo.keywords },
        { name: "author", content: defaultSeo.author },
      ],
    });
  }
} else {
  useHead({
    title: defaultSeo.title,
    meta: [
      { name: "description", content: defaultSeo.description },
      { name: "keywords", content: defaultSeo.keywords },
      { name: "author", content: defaultSeo.author },
    ],
  });
}

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
    await axios.get('https://api.solargy.shop/sanctum/csrf-cookie', {withCredentials: true});
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
            Товары / Услуги
          </p>
          <p
              class="admin-panel__menu_item"
              :class="{ active: activeTab === 'Новости' }"
              @click="activeTab = 'Новости'"
          >
            Новости
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
          <p
              class="admin-panel__menu_item"
              :class="{ active: activeTab === 'SEO' }"
              @click="activeTab = 'SEO'"
          >
            SEO
          </p>
          <button class="main_btn" @click="exitAdmin">Выйти</button>
        </div>
      </div>
      <AdminMain v-if="activeTab === 'Главная'"/>
      <AdminCategory v-if="activeTab === 'Категории'"/>
      <AdminOption v-if="activeTab === 'Параметры товара'"/>
      <AdminProduct v-if="activeTab === 'Товары'"/>
      <AdminNews v-if="activeTab === 'Новости'"/>
      <AdminAboutUs  v-if="activeTab === 'О нас'"/>
      <AdminContact v-if="activeTab === 'Контакты'"/>
      <AdminStock v-if="activeTab === 'Акции'"/>
      <AdminPlace v-if="activeTab === 'Где купить'"/>
      <AdminDelivery v-if="activeTab === 'Доставка'"/>
      <AdminSocial v-if="activeTab === 'Соц сети'"/>
      <AdminEmail v-if="activeTab === 'Почты'"/>
      <AdminSeo v-if="activeTab === 'SEO'"/>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>