<script setup>
import {nextTick, onMounted, ref} from 'vue';

const tabs = [
  { title: 'ООО «Соларжи 18»' },
  { title: 'ТОО «Торговый дом Art Group»' },
];

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

onMounted(async () => {
  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });

  const script = document.createElement('script');
  script.src = 'https://api-maps.yandex.ru/2.1/?apikey=38e8671e-3c02-48e7-8432-c204818d7056&lang=ru_RU';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    ymaps.ready(init);
  };

  function init() {
    const myMap = new ymaps.Map("map", {
      center: [56.858479, 53.300998],
      zoom: 16,
      controls: []
    }, {
      suppressMapOpenBlock: true,
      yandexMapDisablePoi: true,
    });
    const myPlacemark = new ymaps.Placemark([56.858479, 53.300998], {}, {
      iconLayout: 'default#image',
      iconImageHref: '/Point.png',
      iconImageSize: [100, 100],
      iconImageOffset: [-50, -100]
    });

    // Добавление метки на карту
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
          <h2 class="contact__address_title">г. Ижевск,<br>Проспект конструктора М.Т. Калашникова, 7</h2>
          <div class="contact__address_contact">
            <p class="contact__address_phone">8(800) 200 06 02</p>
            <p class="contact__address_email">info@solargy.ru</p>
          </div>
          <div class="contact__address_vk">
            <p class="contact__address_text">Официальные аккаунты Solargy в соцсетях</p>
            <img src="/vk%201.png" alt="">
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
              <input class="questions__form_input" type="text" name="name" placeholder="Введите имя">
              <p class="questions__form_name">Ваш телефон</p>
              <input class="questions__form_input" type="number" name="phone" placeholder="Введите телефон">
              <p class="questions__form_name">Комментарий</p>
              <textarea style="min-height: 152px" class="questions__form_textarea" name="comment" placeholder="Введите комментарий"></textarea>
            </div>
            <button class="main_btn questions__form_btn">Заказать звонок</button>
          </div>
        </div>
      </div>
    </div>
    <div class="contact__tabs">
      <div class="card__tabs_cont">
        <p
            v-for="(tab, index) in tabs"
            :key="index"
            :class="['card__tabs_item', { active: activeTab === index }]"
            @click="setActiveTab(index)"
        >
          {{ tab.title }}
        </p>
        <div
            class="slider"
            :style="sliderStyle"
        ></div>
      </div>

      <div class="card__tabs_content">
        <div v-if="activeTab === 0" class="contact__tabs_info">
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Название организации</p>
            <p class="contact__tabs_text">Общество с органиченной ответственностью «Соларжи 18»</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Офис</p>
            <p class="contact__tabs_text">г. Ижевск, Проспект конструктора М.Т. Калашникова, 7</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Производство</p>
            <p class="contact__tabs_text">Удмуртская Республика, Завьяловский район, д. Старое Мартьяново, Центральная, 54</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Почта</p>
            <p class="contact__tabs_text">info@solargy.ru</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Телефон</p>
            <p class="contact__tabs_text">8 (800) 200 06 02</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">ОГРН</p>
            <p class="contact__tabs_text">1141841008506</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">ИНН</p>
            <p class="contact__tabs_text">1841046936</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">КПП</p>
            <p class="contact__tabs_text">184101001</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">ОКПО</p>
            <p class="contact__tabs_text">29992459</p>
          </div>
        </div>
        <div v-if="activeTab === 1" class="contact__tabs_info">
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Название организации</p>
            <p class="contact__tabs_text">Представительство в Казахстане ТОО «Торговый дом Art Group»</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Офис</p>
            <p class="contact__tabs_text">г. Астана, проспект Мангилик Ел, 19/2</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Почта</p>
            <p class="contact__tabs_text">sales@solargy.kz</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">Телефон</p>
            <p class="contact__tabs_text">+7 (747) 256 76 11</p>
          </div>
          <div class="contact__tabs_content">
            <p class="contact__tabs_title">БИН</p>
            <p class="contact__tabs_text">170340017533</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>