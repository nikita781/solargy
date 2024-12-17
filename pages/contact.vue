<script setup>
import {nextTick, onMounted, ref} from 'vue';
import axios from "axios";

const tabs = [
  { title: 'ООО «Соларжи 18»' },
  { title: 'ТОО «Торговый дом Art Group»' },
];

const contacts = ref([])
const companies = ref([])
const socials = ref([]);

const fetchSocials = async () => {
  try {
    const response = await axios.get(`/socials`);
    socials.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const fetchContacts = async () => {
  try {
    const response = await axios.get(`/contacts`);
    contacts.value = response.data[0];
    if (contacts.value.map) {
      contacts.value.map = contacts.value.map
          .split(',')
          .map(coord => parseFloat(coord.trim()));
    }
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};
const fetchCompanies = async () => {
  try {
    const response = await axios.get(`/companies`);
    companies.value = response.data;
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};

const activeTab = ref(0);

const setActiveTab = (index) => {
  activeTab.value = index;
};

const tabsRef = ref([]);
const sliderStyle = computed(() => {
  if (tabsRef.value.length === 0 || activeTab.value === null) return {};

  const activeTabElement = tabsRef.value[activeTab.value];
  const left = activeTabElement?.offsetLeft || 0;
  const width = activeTabElement?.offsetWidth || 0;

  return {
    left: `${left}px`,
    width: `${width}px`,
  };
});

const nameUser = ref('');
const phone = ref('+7 ');
const comment = ref('');

const addSuppurt = async () => {
  try {
    const formData = new FormData();
    formData.append('name', nameUser.value);
    formData.append('phone', phone.value);
    formData.append('comment', comment.value);

    await axios.post(`/call`, formData);
    reset();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const reset = () => {
  nameUser.value = '';
  phone.value = '';
  comment.value = '';
};

const onInput = (event) => {
  let input = event.target.value.replace(/\D/g, '');

  if (!input.startsWith('7')) {
    input = '7' + input.slice(1);
  }

  if (input.length > 11) input = input.slice(0, 11);

  phone.value = input.replace(
      /^(\d{1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/,
      (_, p1, p2, p3, p4, p5) =>
          `+${p1} ${p2 ? '(' + p2 : ''}${p3 ? ') ' + p3 : ''}${p4 ? '-' + p4 : ''}${p5 ? '-' + p5 : ''}`
  );
};

onMounted(async () => {
  await fetchSocials();
  await fetchContacts();
  await fetchCompanies();

  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });

  const script = document.createElement('script');
  script.src = 'https://api-maps.yandex.ru/2.1/?apikey=38e8671e-3c02-48e7-8432-c204818d7056&lang=ru_RU';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    const interval = setInterval(() => {
      if (contacts.value.map && contacts.value.map.length === 2) {
        clearInterval(interval);
        ymaps.ready(init);
      }
    }, 100);
  };

  function init() {
    if (!contacts.value.map || contacts.value.map.length !== 2) {
      console.error('Координаты карты отсутствуют или некорректны:', contacts.value.map);
      return;
    }
    const myMap = new ymaps.Map("map", {
      center: contacts.value.map,
      zoom: 16,
      controls: []
    }, {
      suppressMapOpenBlock: true,
      yandexMapDisablePoi: true,
    });

    const myPlacemark = new ymaps.Placemark(contacts.value.map, {}, {
      iconLayout: 'default#image',
      iconImageHref: '/Point.png',
      iconImageSize: [100, 100],
      iconImageOffset: [-50, -100]
    });

    myMap.geoObjects.add(myPlacemark);
  }
});
</script>

<template>
  <div class="contact">
    <div class="contact__main">
      <div class="contact__address">
        <h2 class="main_title">Как нас найти</h2>
        <div id="map" class="contact__address_map"></div>
        <div class="contact__address_info">
          <h2 class="contact__address_title">{{ contacts.address }}</h2>
          <div class="contact__address_contact">
            <p class="contact__address_phone">{{ contacts.phone }}</p>
            <p class="contact__address_email">{{ contacts.email }}</p>
          </div>
          <div class="contact__address_vk">
            <p class="contact__address_text">Официальные аккаунты Solargy в соцсетях</p>
            <div class="contact__address_container">
              <div
                  v-for="place in socials"
                  :key="place.id"
              >
                <NuxtLink :to="place.url">
                  <img :src="place.image" alt="">
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="contact__questions">
        <h2 class="main_title">У вас остались вопросы?</h2>
        <div class="questions__form">
          <div class="questions__form_container">
            <p class="questions__form_title">Обратный звонок</p>
            <div class="questions__form_inputs">
              <p class="questions__form_name">Ваше имя</p>
              <input class="questions__form_input" type="text" v-model="nameUser" placeholder="Введите имя">
              <p class="questions__form_name">Ваш телефон</p>
              <input class="questions__form_input" type="text" @input="onInput"  v-model="phone" placeholder="Введите телефон">
              <p class="questions__form_name">Комментарий</p>
              <textarea style="min-height: 152px" class="questions__form_textarea" v-model="comment" placeholder="Введите комментарий"></textarea>
            </div>
            <button class="main_btn questions__form_btn" @click="addSuppurt">Заказать звонок</button>
          </div>
        </div>
      </div>
    </div>
    <div class="contact__tabs">
      <div class="card__tabs_cont">
        <p
            v-for="(tab, index) in companies"
            :key="index"
            :class="['card__tabs_item', { active: activeTab === index }]"
            @click="setActiveTab(index)"
        >
          {{ tab.name }}
        </p>
        <div
            class="slider"
            :style="sliderStyle"
        ></div>
      </div>

      <div class="card__tabs_content">
        <div
            v-for="(tab, index) in companies"
            :key="index"
        >
          <div
              v-if="activeTab === index"
              class="contact__tabs_info"
          >
            <div class="contact__tabs_content">
              <p class="contact__tabs_title">Название</p>
              <p class="contact__tabs_text">{{ tab.details.name }}</p>
            </div>
            <div class="contact__tabs_content">
              <p class="contact__tabs_title">Офис</p>
              <p class="contact__tabs_text">{{ tab.details.office }}</p>
            </div>
            <div class="contact__tabs_content">
              <p class="contact__tabs_title">Производство</p>
              <p class="contact__tabs_text">{{ tab.details.production }}</p>
            </div>
            <div class="contact__tabs_content">
              <p class="contact__tabs_title">Телефон</p>
              <p class="contact__tabs_text">{{ tab.details.phone }}</p>
            </div>
            <div class="contact__tabs_content">
              <p class="contact__tabs_title">Почта</p>
              <p class="contact__tabs_text">{{ tab.details.email }}</p>
            </div>
            <div
                v-for="(custom, index) in tab['custom-details']"
                :key="index"
            >
              <div class="contact__tabs_content">
                <p class="contact__tabs_title">{{ custom.title }}</p>
                <p class="contact__tabs_text">{{ custom.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>