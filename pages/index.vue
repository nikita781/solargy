<script setup>
import {ref, onMounted, onUnmounted} from 'vue';
import {Swiper, SwiperSlide} from 'swiper/vue';
import 'swiper/css';
import {Navigation, Pagination} from 'swiper';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
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
  deliverySeo.value = seos.value.find((seo) => seo.url === "index");

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


const swiperRight = ref(null);
const swiperLeft = ref(null);

const swiperConfig = reactive({
  modules: [Navigation, Pagination],
  spaceBetween: 50,
  loop: true,
  speed: 500,
  navigation: {
    nextEl: null, // Будет настроено в onMounted
    prevEl: null, // Будет настроено в onMounted
  },
  pagination: {
    el: '.swiper__pagination',
    clickable: true,
  },
});

const swiperInstance = ref(null);

function generateSlug(name) {
  const cyrillicToLatinMap = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
    ы: 'y', э: 'e', ю: 'yu', я: 'ya', ъ: '', ь: ''
  };

  const transliterate = (str) => {
    return str
        .toLowerCase()
        .split('')
        .map(char => cyrillicToLatinMap[char] || char)
        .join('');
  };

  return transliterate(name)
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
}

const { data: banners } = await useAsyncData("banners", async () => {
  const response = await axios.get(`/main-banners`);
  return response.data;
});
// const banners = ref([]);
//
// const fetchBanners = async () => {
//   try {
//     const response = await axios.get('/main-banners');
//     banners.value = response.data;
//   } catch (error) {
//     console.error('Ошибка с сервера:', error.response.data);
//     console.error('Ошибка загрузки баннеров:', error);
//   }
// };
const { data: topProduct } = await useAsyncData("topProduct", async () => {
  const response = await axios.get(`/products?top=1`);
  return response.data;
});
// const topProduct = ref([]);
//
// const fetchTopProducts = async () => {
//   try {
//     const response = await axios.get('/products?top=1');
//     topProduct.value = response.data;
//   } catch (error) {
//     console.error('Ошибка с сервера:', error.response.data);
//     console.error('Ошибка загрузки баннеров:', error);
//   }
// };
const { data: types } = await useAsyncData("types", async () => {
  const response = await axios.get(`/sub-banners`);
  return response.data;
});
// const types = ref([]);
//
// const fetchTypes = async () => {
//   try {
//     const response = await axios.get('/sub-banners');
//     types.value = response.data;
//   } catch (error) {
//     console.error('Ошибка с сервера:', error.response.data);
//     console.error('Ошибка загрузки баннеров:', error);
//   }
// };
const { data: categories } = await useAsyncData("categories", async () => {
  const response = await axios.get(`/categories`);
  return response.data;
});
// const categories = ref([]);
//
// const fetchCategories = async () => {
//   try {
//     const response = await axios.get('/categories');
//     categories.value = response.data;
//   } catch (error) {
//     console.error('Ошибка с сервера:', error.response.data);
//     console.error('Ошибка загрузки баннеров:', error);
//   }
// };

const currentSlideIndex = ref(0);

const changeSlide = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % banners.value.length;
};

const goToSlide = (index) => {
  currentSlideIndex.value = index;
  clearInterval(interval);
  interval = setInterval(changeSlide, 5000);
};

let interval;

const nameUser = ref('');
const email = ref('');
const comment = ref('');
const errors = ref({
  name: false,
  email: false,
  comment: false
});

const addSuppurt = async () => {
  errors.value.name = false;
  errors.value.email = false;
  errors.value.comment = false;
  errors.value.name = !nameUser.value.trim();
  errors.value.email = !email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  errors.value.email = !email.value.trim();
  errors.value.comment = !comment.value.trim();
  if (!errors.value.name && !errors.value.email && !errors.value.comment) {
    if (!emailRegex.test(email.value)) {
      errors.value.email = !emailRegex.test(email.value);
      Toastify({
        text: "Не верный формат почты",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ff4545",
        stopOnFocus: true,
      }).showToast();
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', nameUser.value);
      formData.append('email', email.value);
      formData.append('comment', comment.value);
      formData.append('email-type', 3);

      await axios.post(`/support`, formData);
      reset();
      Toastify({
        text: "Заявка успешно отправлена!",
        duration: 3000,
        gravity: "top", // Позиция: "top" или "bottom"
        position: "right", // Позиция: "left", "center" или "right"
        backgroundColor: "#28a745",
        stopOnFocus: true,
      }).showToast();
    } catch (error) {
      console.error('Ошибка:', error.response?.data || error);
      Toastify({
        text: "Не удалось отправить заявку. Попробуйте снова.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ff4545",
        stopOnFocus: true,
      }).showToast();
    }
  } else {
    Toastify({
      text: "Заполните все поля!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#ff4545",
      stopOnFocus: true,
    }).showToast();
  }
};

const reset = () => {
  nameUser.value = '';
  email.value = '';
  comment.value = '';
};

// const onSwiperInit = (swiper) => {
//   nextTick(() => {
//     swiper.slideNext(0); // Переходим на следующий слайд
//   });
// };

onMounted(() => {
  // fetchBanners();
  // fetchTopProducts();
  // fetchTypes();
  // fetchCategories();
  interval = setInterval(changeSlide, 5000);
  swiperConfig.navigation.nextEl = swiperRight.value;
  swiperConfig.navigation.prevEl = swiperLeft.value;
});

onUnmounted(() => {
  clearInterval(interval);
});

const findImage = (photos) => {
  if (photos?.length) {
    const image = photos.find((item) => item.type === "image" || item.type === null);
    return image ? image.photo : "/S.png";
  }
  return "/S.png";
};
</script>

<template>
  <div>
    <div class="head"
         :style="{
          '--background-image': `url(${banners[currentSlideIndex]?.image})`,
         }"
    >
      <div class="head__background"></div>
      <div class="head__black"></div>
      <div class="head__content-main">
        <div class="head__info">
          <h2 class="head__info_title">{{ banners[currentSlideIndex]?.title }}</h2>
          <p class="head__info_subtitle">{{ banners[currentSlideIndex]?.description }}</p>
          <NuxtLink v-if="banners[currentSlideIndex]?.product" :to="`/card/${banners[currentSlideIndex]?.product.id}-${generateSlug(banners[currentSlideIndex]?.product.name)}/`" class="main_btn head__info_btn">Перейти к товару</NuxtLink>
        </div>
        <NuxtLink
            class="head__img-container"
            v-if="banners[currentSlideIndex]?.product"
            :to="`/card/${banners[currentSlideIndex]?.product.id}-${generateSlug(banners[currentSlideIndex]?.product.name)}/`"
            :style="{
              'background-image': `url(${banners[currentSlideIndex]?.image})`,
            }"
        >
          <div class="head__img-container-black"></div>
          <h2 class="head__info_title-little">{{ banners[currentSlideIndex]?.product.name }}</h2>
          <p class="head__info_subtitle">от {{ banners[currentSlideIndex]?.product.price }} р</p>
        </NuxtLink>
        <div class="head__pagination">
          <div
              v-for="(slide, index) in banners"
              :key="slide.id"
              class="head__pagination-item"
              :class="{ active: currentSlideIndex === index, inactive: currentSlideIndex !== index }"
              @click="goToSlide(index)"
          >
            <div class="inner"></div>
            <div class="border"></div>
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="head__content">
      <div class="head__content_title-container">
        <p class="head__content_title_slash">/</p>
        <h2 class="head__content_title">Системы комплексного естественного освещения </h2>
      </div>
      <div class="head__content_info-container">
        <h3 class="head__content_info">Компания
          <NuxtLink to="/about_us">«Соларжи»</NuxtLink>
          является единственным в России разработчиком
          систем передачи и транспортирования света
          в удаленные помещения — световодов,
          получившая грант от Фонда содействия инновациям
        </h3>
      </div>
    </div>
    <div class="best-product">
      <div class="best-product_page">
        <div class="best-product__header">
          <h2 class="main_title">Лучшие предложения</h2>
          <NuxtLink to="/catalog" class="main_btn">Перейти в каталог</NuxtLink>
        </div>
        <div class="best-product__items">
          <div
              class="best-product__item"
              v-for="product in topProduct.data"
              :key="product.id"
          >
            <NuxtLink
                :to="`/card/${product.id}-${generateSlug(product.name)}/`"
                v-if="product?.photos[0]?.photo"
            >
              <NuxtImg format="webp" preload loading="lazy" class="best-product__item_img" :src="findImage(product.photos)" alt=""/>
              <p class="best-product__item_top" v-if='product?.is_top'>Хит</p>
            </NuxtLink>
            <NuxtLink
                :to="`/card/${product.id}-${generateSlug(product.name)}/`"
                v-else
            >
              <NuxtImg format="webp" preload loading="lazy" class="best-product__item_img" src="/S.png" alt=""/>
              <p class="best-product__item_top" v-if='product?.is_top'>Хит</p>
            </NuxtLink>
            <div class="best-product__item_content">
              <NuxtLink :to="`/card/${product.id}-${generateSlug(product.name)}/`" class="best-product__item_title">
                {{ product?.name }}
              </NuxtLink>
              <p class="best-product__item_desc">{{ product?.description }}</p>
            </div>
            <div class="best-product__item_container">
              <p class="best-product__item_price">от {{ product?.price }} ₽</p>
              <NuxtLink
                  class="best-product__item_btn"
                  :to="`/card/${product.id}-${generateSlug(product.name)}/`"
              >
                Посмотреть
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="types">
      <h2 class="main_title">Виды систем естественного освещения</h2>
      <div class="swiper__container">
        <Swiper
            v-bind="swiperConfig"
            ref="swiperInstance"
            @swiper="onSwiperInit"
        >
          <SwiperSlide v-for="(type, index) in types" :key="index" ref="swiperInstance">
            <div
                class="swiper__slide"
                :style="{ 'background-image': `url(${type.image})` }"
            >
              <p class="swiper__title">{{ type.title }}</p>
            </div>
          </SwiperSlide>
        </Swiper>

        <div
            ref="swiperRight"
            class="swiper__right"
        >
          <IconsBtnSlide/>
        </div>
        <div ref="swiperLeft" class="swiper__left">
          <IconsBtnSlide/>
        </div>

        <div class="swiper__pagination_container">
          <div class="swiper__pagination"></div>
        </div>
      </div>
    </div>
    <div class="category-prod">
      <h2 class="main_title">Категории товаров</h2>
      <div class="category-prod__container">
        <div
            v-for="(category, index) in categories"
            :key="index"
            class="category-prod__item"
            :style="{ backgroundImage: `url(${category?.photo})` }"
        >
          <div class="category-prod__content">
            <p class="category-prod__title">{{ category?.name }}</p>
            <NuxtLink
                :to="`/catalog/${category.id}-${generateSlug(category.name)}/`"
                class="main_btn category-prod__btn"
            >
              Открыть каталог
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div class="questions">
      <h2 class="main_title">Остались вопросы?</h2>
      <div class="questions__container">
        <div class="questions__info">
          <p class="questions__info_description">Напишите нам и менеджер ответит вам в ближайшее время</p>
          <NuxtImg format="webp" loading="lazy" preload class="questions__info_img" src="/583400127_1734363646.png" alt=""/>
        </div>
        <div class="questions__form">
          <div class="questions__form_container">
            <p class="questions__form_title">Оставьте свое обращение</p>
            <div class="questions__form_inputs">
              <p class="questions__form_name">Ваше имя</p>
              <input class="questions__form_input" type="text" v-model="nameUser" placeholder="Введите имя" :class="{ error: errors.name }">
              <p class="questions__form_name">Ваш e-mail</p>
              <input class="questions__form_input" type="email" v-model="email" placeholder="Введите e-mail" :class="{ error: errors.email }">
              <p class="questions__form_name">Комментарий</p>
              <textarea class="questions__form_textarea" v-model="comment" placeholder="Введите комментарий" :class="{ error: errors.comment }"></textarea>
            </div>
            <button class="main_btn questions__form_btn" @click="addSuppurt">Отправить заявку</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>