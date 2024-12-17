<script setup>
import {Swiper, SwiperSlide} from "swiper/vue";
import {Navigation, Pagination} from "swiper";
import {useRoute, useRouter} from 'vue-router';
import {ref, reactive, onMounted, nextTick} from "vue";
import 'swiper/css';
import axios from "axios";
import {useBasketStore} from '@/stores/basket';

const basketStore = useBasketStore();
const route = useRoute();
const router = useRouter();

const productId = ref();
const product = ref([]);
const category = ref([]);
const products = ref([]);
const selectedOptions = ref({});

const fetchProduct = async () => {
  try {
    const response = await axios.get(`/products/${productId.value}`);
    product.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки продукта:', error.response?.data || error);
  }
};
const fetchCategory = async () => {
  try {
    const response = await axios.get(`/categories/${product.value.category_id}`);
    category.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки продукта:', error.response?.data || error);
  }
};
const fetchProducts = async () => {
  try {
    const response = await axios.get(`/products`);
    products.value = response.data.data;
  } catch (error) {
    console.error('Ошибка загрузки продукта:', error.response?.data || error);
  }
};

const swiperRight = ref(null);
const swiperLeft = ref(null);

const menuVisible = ref(false);
const currentSelect = ref(null);
const currentIndex = ref(null);
const currentSelectedId = ref(null);

const openMenu = async (select, index) => {
  currentSelect.value = select;
  currentIndex.value = index;
  currentSelectedId.value = select.values[0].id;

  if (select.values.length <= 1) {
    return;
  }

  menuVisible.value = true;
  await nextTick();

  setTimeout(() => {
    const menu = document.querySelector(".slide-out-menu");
    if (menu) {
      menu.classList.add("visible");
    }
  }, 10);
};

const closeMenu = () => {
  const menu = document.querySelector(".slide-out-menu");
  if (menu) {
    menu.classList.remove("visible");

    setTimeout(() => {
      menuVisible.value = false;
      currentSelect.value = null;
      currentIndex.value = null;
    }, 300);
  }
};

const selectItem = (item) => {
  // Обновляем выбранную опцию для конкретного товара
  const optionIndex = product.value.options.findIndex(option => option.id === currentSelect.value.id);

  if (optionIndex >= 0) {
    // Обновляем values для конкретной опции товара
    product.value.options[optionIndex].values = [item, ...product.value.options[optionIndex].values.filter(i => i.id !== item.id)];
  }

  // Обновляем selectedOptions
  selectedOptions.value[product.value.options[currentIndex.value].id] = {
    name: product.value.options[currentIndex.value].name,
    values: item,
  };

  // Обновляем текущий выбранный элемент
  currentSelectedId.value = item.id;

  closeMenu();
};

const quantity = ref(1);
const quantityPlus = () => {
  quantity.value++;
}
const quantityMinus = () => {
  if (quantity.value === 1) {
    return;
  }
  quantity.value--;
}

const selectedSlide = ref(null);

const swiperConfig = reactive({
  modules: [Navigation, Pagination],
  spaceBetween: 16,
  slidesPerView: 4,
  slidesPerGroup: 1,
  speed: 500,
  loop: false,
  watchSlidesProgress: true,
  direction: "vertical",
  navigation: {
    nextEl: '.card__main_swiper-bottom',
    prevEl: '.card__main_swiper-top',
  },
});

const tabs = [
  {title: 'Характеристики'},
  {title: 'Требования и рекомендации к монтажу'},
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

function generateSlug(name) {
  name = String(name);
  return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
}

const addToBasket = () => {
  const basketItem = {
    id: product.value.id,
    name: product.value.name,
    photo: product.value.photos[0].photo,
    price: product.value.price,
    options: Object.values(selectedOptions.value),
    quantity: quantity.value,
  };

  basketStore.addToBasket(basketItem);
};

watch(() => route.fullPath, async () => {
  const productIdURL = route.params.productId;
  if (!productIdURL) {
    await router.push('/');
  }
  productId.value = productIdURL.match(/^\d+/)?.[0] || null;
  await fetchProduct();
  await fetchCategory();
  await fetchProducts();
  selectedSlide.value = product.value?.photos[0];
  selectedOptions.value = {};
  product.value.options.forEach((option) => {
    selectedOptions.value[option.id] = {
      name: option.name,
      values: option.values[0],
    };
  });
  await nextTick();
  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });
});

onMounted(async () => {
  const productIdURL = route.params.productId;
  if (!productIdURL) {
    await router.push('/');
  }
  productId.value = productIdURL.match(/^\d+/)?.[0] || null;
  await fetchProduct();
  await fetchCategory();
  await fetchProducts();
  selectedSlide.value = product.value?.photos[0];
  selectedOptions.value = {};
  product.value.options.forEach((option) => {
    selectedOptions.value[option.id] = {
      name: option.name,
      values: option.values[0],
    };
  });
  await nextTick();
  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });
});

const selectSlide = (slide) => {
  selectedSlide.value = slide;
};

const handleDownload = async (fileUrl, file_name) => {
  try {
    const fileName = fileUrl.split('/').pop();

    const response = await axios.get(`/download/productPropertyFiles/${fileName}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {type: response.headers['content-type']});
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file_name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Ошибка при скачивании:', error);
    alert('Ошибка при скачивании');
  }
};
</script>

<template>
  <div class="card">
    <div class="card__main">
      <div class="card__main_links">
        <NuxtLink to="/catalog" class="card__main_link">Каталог</NuxtLink>
        <IconsSun/>
        <NuxtLink :to="`/catalog/${category.id}-${generateSlug(category.name)}/`" class="card__main_link">
          {{ category.name }}
        </NuxtLink>
        <IconsSun color="#EF7F1A"/>
        <NuxtLink class="card__main_link card__main_link-active">{{ product.name }}</NuxtLink>
      </div>
      <div class="card__main_content">
        <div class="card__main_gallery">
          <div class="card__main_swiper">
            <div ref="swiperLeft">
              <IconsArrow class="card__main_swiper-top" color="#EF7F1A"/>
            </div>
            <client-only>
              <Swiper v-bind="swiperConfig">
                <SwiperSlide
                    v-for="(slide, index) in product.photos"
                    :key="index"
                >
                  <div
                      class="swiper__slide"
                      :style="{ 'background-image': `url(${slide.photo})` }"
                      @click="selectSlide(slide)"

                  ></div>
                </SwiperSlide>
              </Swiper>
            </client-only>
            <div ref="swiperRight">
              <IconsArrow class="card__main_swiper-bottom" color="#EF7F1A"/>
            </div>
          </div>
          <div class="card__main_img">
            <img :src="selectedSlide?.photo" alt="Selected Image"/>
          </div>
        </div>
        <div class="card__main_info">
          <div>
            <h1 class="card__main_title">{{ product.name }}</h1>
            <p class="card__main_price">{{ product.price }} ₽</p>
          </div>
          <p class="card__main_description">{{ product.description }}</p>
          <div class="card__main_select-cont">
            <div
                v-for="(select, index) in product.options"
                :key="select.id"
            >
              <div class="card__main_select" @click="openMenu(select, index)">
                <p class="card__main_select-title">{{ select.name }}</p>
                <div class="card__main_select-item">
                  <div class="card__main_select-name">
                    <img v-if="select.values[0]?.image" :src="select.values[0]?.image" alt="">
                    <p>{{ select.values[0]?.value }}</p>
                  </div>
                  <div class="card__main_select-btn">
                    <p
                        class="card__main_select-btn-text"
                        :class="{ active: select.values.length > 1 }"
                    >
                      Другие варианты
                    </p>
                    <IconsPlus :color="select.values.length > 1 ? '#EF7F1A' : '#cccccc'"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="menuVisible" class="slide-out-menu">
            <div class="menu-header">
              <h3>{{ currentSelect?.name }}</h3>
              <IconsCross @click="closeMenu"/>
            </div>
            <ul>
              <li
                  v-for="item in currentSelect?.values"
                  :key="item.id"
                  :class="{ active: item.id === currentSelectedId }"
                  @click="selectItem(item)"
              >
                <img v-if="item.image" :src="item.image" alt=""/>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </div>
          <div class="card__main_final">
            <div class="card__main_final-cont">
              <div class="card__main_final-btn" @click="quantityMinus">
                <IconsMinus :color='quantity === 1 ? "#cccccc" : "#EF7F1A"'/>
              </div>
              <div class="card__main_final-quantity">{{ quantity }}</div>
              <div class="card__main_final-btn" @click="quantityPlus">
                <IconsPlus color="#EF7F1A"/>
              </div>
            </div>
            <NuxtLink class="main_btn" @click="addToBasket">Добавить в корзину</NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div class="card__tabs">
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
        <div
            v-for="(property, index) in product.properties"
            :key="index"
            class="card__tabs_info"
        >
          <div class="card__tabs_container" v-if="activeTab === index">
            <img
                v-if="property.image"
                :src="property.image"
                :alt="`Image for ${property.title}`"
                class="card__tabs_image"
            />
            <div class="editor__content" v-html="property.html"></div>
            <a
                v-if="property.file"
                @click.prevent="handleDownload(property.file, property.file_name)"
                download
                class="card__tabs_file_link main_btn"
            >
              {{ property.file_name }}
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="card__product">
      <div class="card__product__header">
        <h2 class="main_title">Сопутствующие товары</h2>
      </div>
      <div class="best-product__items">
        <div
            class="best-product__item"
            v-for="(product, index) in products.slice(0, 4)"
            :key="index"
        >
          <NuxtLink
              :to="`/card/${product.id}-${generateSlug(product.name)}/`"
          >
            <img class="best-product__item_img" :src="product?.photos[0].photo" alt="">
          </NuxtLink>
          <div class="best-product__item_content">
            <NuxtLink :to="`/card/${product.id}-${generateSlug(product.name)}/`" class="best-product__item_title">{{ product.name }}</NuxtLink>
            <p class="best-product__item_desc">{{ product.description }}</p>
          </div>
          <div class="best-product__item_container">
            <p class="best-product__item_price">{{ product.price }}</p>
            <NuxtLink
                class="best-product__item_btn"
                :to="`/card/${product.id}-${generateSlug(product.name)}/`"
            >
              Заказать
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$x-small: 575.98px;
$small: 767.98px;
$medium: 991.98px;
$large: 1199.98px;
$x-large: 1399.98px;
$big: 1592.98px;
$x-big: 1829.98px;
.swiper {
  margin-top: unset;
  width: 100%;
  height: 400px;
  @media screen and (max-width: $x-small) {
    height: 240px;
  }

  &-slide {
    width: 86px;
    height: 88px;
    cursor: pointer;
    @media screen and (max-width: $x-small) {
      width: 46px;
      height: 48px;
    }
  }

  &__slide {
    height: calc(100% - 2px);
    width: calc(100% - 2px);

    &.active {
      border: 1px solid #EF7F1A;
    }
  }
}

.slide-out-menu {
  position: fixed;
  top: 0;
  right: 0;
  max-width: 550px;
  width: calc(100% - 160px);
  height: calc(100% - 80px);
  background-color: #fff;
  border-left: 1px solid #ccc;
  padding: 40px 80px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;

  overflow-y: auto;

  @media screen and (max-width: $x-small) {
    padding: 30px;
    width: calc(100% - 60px);
    height: calc(100% - 60px);
  }

  &.visible {
    transform: translateX(0);
    opacity: 1;
  }

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 60px;
    padding-bottom: 20px;
    border-bottom: 1px solid #cccccc;
    @media screen and (max-width: $small) {
      margin-bottom: 20px;
    }

    h3 {
      margin: 0;
      font-size: 22px;
      line-height: 26px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: 'Exo 2 Bold', serif;
    }

    svg {
      cursor: pointer;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;

    li {
      padding: 10px;
      cursor: pointer;
      height: 48px;
      display: flex;
      align-items: center;
      transition: background-color 0.3s;
      border: 1px solid #cccccc;
      border-radius: 8px;
      @media screen and (max-width: $small) {
        height: 30px;
      }

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        border: 1px solid #EF7F1A;
      }

      img {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        margin-right: 12px;
        object-fit: cover;
      }

      span {
        font-size: 18px;
        line-height: 18px;
        letter-spacing: 1px;
      }
    }
  }
}
</style>
