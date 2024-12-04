<script setup>
import {Swiper, SwiperSlide} from "swiper/vue";
import {Navigation, Pagination} from "swiper";
import {ref, reactive, onMounted, nextTick} from "vue";
import 'swiper/css';

const swiperRight = ref(null);
const swiperLeft = ref(null);

const slides = ref([
  {id: 1, image: "/749a80e5f27431b23b4c00f2a3044ecc_1.jpg"},
  {id: 2, image: "/b19088382893005f5bf8775f1c1c47f0.jpg"},
  {id: 3, image: "/b55656a245bbba6b914d0bce33c061ae.jpg"},
  {id: 4, image: "/748e7c4f244ec319b30a48a0cbb53a60.jpg"},
  {id: 5, image: "/749a80e5f27431b23b4c00f2a3044ecc_1.jpg"},
  {id: 6, image: "/b19088382893005f5bf8775f1c1c47f0.jpg"},
  {id: 7, image: "/b55656a245bbba6b914d0bce33c061ae.jpg"},
  {id: 8, image: "/748e7c4f244ec319b30a48a0cbb53a60.jpg"},
]);

const selected = ref([
  {
    id: 1,
    name: "Место установки световода",
    select: [
      {id: 1, image: "/7186d647977c7aa42528bbf2c8d8fda4.jpg", name: "В грунт"},
    ],
  },
  {
    id: 2,
    name: "Диаметр световода",
    select: [
      {id: 1, name: "250 мм"},
      {id: 2, name: "500 мм"},
      {id: 3, name: "750 мм"},
      {id: 4, name: "1000 мм"},
    ],
  },
  {
    id: 3,
    name: "Цвет световода",
    select: [
      {id: 1, image: "/748e7c4f244ec319b30a48a0cbb53a60.jpg", name: "Белый"},
      {id: 2, image: "/748e7c4f244ec319b30a48a0cbb53a60.jpg", name: "Черный"},
      {id: 3, image: "/748e7c4f244ec319b30a48a0cbb53a60.jpg", name: "Серый"},
    ],
  },
]);

const menuVisible = ref(false);
const currentSelect = ref(null);
const currentIndex = ref(null);
const currentSelectedId = ref(null);

const openMenu = async (select, index) => {
  currentSelect.value = select;
  currentIndex.value = index;
  currentSelectedId.value = select.select[0].id;

  if (select.select.length <= 1) {
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
  selected.value[currentIndex.value].select = [item, ...selected.value[currentIndex.value].select.filter(i => i.id !== item.id)];
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

const selectedSlide = ref(slides.value[0]);

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
    nextEl: swiperRight.value,
    prevEl: swiperLeft.value,
  },
});

const tabs = [
  { title: 'Характеристики' },
  { title: 'Требования и рекомендации к монтажу' },
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

const bestProduct = ref([
  {
    id: 1,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 2,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 3,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 4,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
])

onMounted(async () => {
  await nextTick();
  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });
  swiperConfig.navigation = {
    nextEl: swiperRight.value,
    prevEl: swiperLeft.value,
  };
});

const selectSlide = (slide) => {
  selectedSlide.value = slide;
};
</script>

<template>
  <div class="card">
    <div class="card__main">
      <div class="card__main_links">
        <NuxtLink to="#" class="card__main_link">Каталог</NuxtLink>
        <IconsSun/>
        <NuxtLink to="#" class="card__main_link">Светопроводящие системы</NuxtLink>
        <IconsSun color="#EF7F1A"/>
        <NuxtLink to="#" class="card__main_link card__main_link-active">Solargy SW F</NuxtLink>
      </div>
      <div class="card__main_content">
        <div class="card__main_gallery">
          <div class="card__main_swiper">
            <div ref="swiperLeft">
              <IconsArrow class="card__main_swiper-top" color="#EF7F1A"/>
            </div>
            <Swiper v-bind="swiperConfig">
              <SwiperSlide
                  v-for="(slide, index) in slides"
                  :key="slide.id"
                  :class="{ active: slide.id === selectedSlide.id }"
                  @click="selectSlide(slide)"
              >
                <div
                    class="swiper__slide"
                    :style="{ 'background-image': `url(${slide.image})` }"
                ></div>
              </SwiperSlide>
            </Swiper>
            <div ref="swiperRight">
              <IconsArrow class="card__main_swiper-bottom" color="#EF7F1A"/>
            </div>
          </div>
          <div class="card__main_img">
            <img :src="selectedSlide.image" alt="Selected Image"/>
          </div>
        </div>
        <div class="card__main_info">
          <div>
            <h1 class="card__main_title">Грунтовый Solargy SW F</h1>
            <p class="card__main_price">50 800 ₽</p>
          </div>
          <p class="card__main_description">Световод SW — это полый трубчатый световод (Точечный зенитный фонарь) серии
            SW разработанный для освещения любых типов помещения: от санузлов и коридоров до ледовых арен и складских
            помещений. Световод равномерно освещает большие площади на высоте не менее 5 м. Светорассеиватель модели SW
            идеально подходит для любого типа потолка.</p>
          <div class="card__main_select-cont">
            <div
                v-for="(select, index) in selected"
                :key="select.id"
            >
              <div class="card__main_select" @click="openMenu(select, index)">
                <p class="card__main_select-title">{{ select.name }}</p>
                <div class="card__main_select-item">
                  <div class="card__main_select-name">
                    <img v-if="select.select[0].image" :src="select.select[0].image" alt="">
                    <p>{{ select.select[0].name }}</p>
                  </div>
                  <div class="card__main_select-btn">
                    <p
                        class="card__main_select-btn-text"
                        :class="{ active: select.select.length > 1 }"
                    >
                      Другие варианты
                    </p>
                    <IconsPlus :color="select.select.length > 1 ? '#EF7F1A' : '#cccccc'"/>
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
                  v-for="item in currentSelect?.select"
                  :key="item.id"
                  :class="{ active: item.id === currentSelectedId }"
                  @click="selectItem(item)"
              >
                <img v-if="item.image" :src="item.image" alt=""/>
                <span>{{ item.name }}</span>
              </li>
            </ul>
          </div>
          <div class="card__main_final">
            <div class="card__main_final-cont">
              <div class="card__main_final-btn" @click="quantityMinus"><IconsMinus :color='quantity === 1 ? "#cccccc" : "#EF7F1A"' /></div>
              <div class="card__main_final-quantity">{{quantity}}</div>
              <div class="card__main_final-btn" @click="quantityPlus"><IconsPlus color="#EF7F1A"/></div>
            </div>
            <button class="main_btn">Добавить в корзину</button>
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
        <ul v-if="activeTab === 0" class="card__tabs_info">
          <li>Температурный диапазон: от -65 до +50С</li>
          <li>Поверхность купола рекомендуется протирать влажной тряпкой 2 раза в год.</li>
          <li>Запрещается оказывать физическое воздействие на изделие.</li>
        </ul>
        <div v-if="activeTab === 1">
          <p>Контент для вкладки "Требования и рекомендации к монтажу"</p>
        </div>
      </div>
    </div>
    <div class="card__product">
      <div class="card__product__header">
        <h2 class="main_title">Сопутствующие товары</h2>
      </div>
      <div class="card__product__items">
        <div
            class="card__product__item"
            v-for="(product, index) in bestProduct"
            :key="index"
        >
          <img class="card__product__item_img" :src="product.image" alt="">
          <div class="card__product__item_content">
            <p class="card__product__item_title">{{ product.title }}</p>
            <p class="card__product__item_desc">{{ product.description }}</p>
          </div>
          <div class="card__product__item_container">
            <p class="card__product__item_price">{{ product.price }}</p>
            <NuxtLink to="/card" class="card__product__item_btn">Заказать</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.swiper {
  margin-top: unset;
  width: 100%;
  height: 400px;

  &-slide {
    width: 86px;
    height: 88px;
    cursor: pointer;

    &.active {
      border: 1px solid #EF7F1A;
    }
  }
}

.slide-out-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 550px;
  height: 100%;
  background-color: #fff;
  border-left: 1px solid #ccc;
  padding: 40px 80px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;

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
