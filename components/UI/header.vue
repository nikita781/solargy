<script setup>
import {computed, nextTick, ref} from 'vue';
import {useRoute} from 'vue-router'
import axios from "axios";
import {useBasketStore} from "~/stores/basket.js";

const route = useRoute()
const basketStore = useBasketStore();
const basketItems = computed(() => basketStore.items);
const totalBasketQuantity = computed(() =>
    basketStore.items.reduce((total, item) => total + item.quantity, 0)
);

const submenuRefs = ref(new Map());

const isMenuOpen = ref(false);
const isSearchOpen = ref(false);
const isMenuOpenPhone = ref(false);
const isSearch = ref(false);
const showSearch = ref(false);
const searchQuery = ref('');
const searchResult = ref([]);
// const categories = ref([])
//
// const fetchCategory = async () => {
//   try {
//     const response = await axios.get('/categories');
//     categories.value = response.data;
//   } catch (error) {
//     console.error('Ошибка:', error.response?.data || error);
//   }
// };

const { data: categories } = await useAsyncData("categories", async () => {
  const response = await axios.get(`/categories`);
  return response.data;
});
const { data: contacts } = await useAsyncData("contacts", async () => {
  const response = await axios.get(`/contacts`);
  return response.data[0];
});
// const contacts = ref([]);
// const fetchContact = async () => {
//   try {
//     const response = await axios.get(`/contacts`);
//     contacts.value = response.data[0];
//   } catch (error) {
//     console.error('Ошибка:', error.response?.data || error);
//   }
// };

// const tabs = ref([]);
// const fetchTabs = async () => {
//   try {
//     const response = await axios.get('/categories');
//     tabs.value = response.data;
//     // console.log(tabs.value)
//   } catch (error) {
//     console.error('Ошибка загрузки категорий:', error.response?.data || error);
//   }
// };

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    return;
  }

  try {
    const response = await axios.get(`/search-fast?q=${searchQuery.value}`);
    searchResult.value = response.data;
    openMenuSearch();
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error.response?.data || error);
  }
};

const openMenuMain = () => {
  isMenuOpen.value = true;
};

const openMenuSearch = () => {
  isSearchOpen.value = true;
};

const toggleMenuPhone = () => {
  isMenuOpenPhone.value = !isMenuOpenPhone.value;
};

const toggleMenuSearch = () => {
  if (isSearch.value) {
    closeSearch();
  } else {
    handleContainerClick();
    isSearch.value = true;
    setTimeout(() => (showSearch.value = true), 10);
  }
};

const closeSearch = () => {
  if (isSearch.value) {
    searchQuery.value = '';
    showSearch.value = false;
    isSearchOpen.value = false;
    setTimeout(() => (isSearch.value = false), 300);
  }
}

watch(isMenuOpen, (newValue) => {
  const container = document.querySelector('.container-content');
  if (container) {
    if (newValue) {
      container.classList.add('active');
    } else {
      container.classList.remove('active');
    }
  }
  // const containerMain = document.querySelector('.container');
  // if (containerMain) {
  //   if (newValue) {
  //     containerMain.classList.add('active');
  //   } else {
  //     containerMain.classList.remove('active');
  //   }
  // }
});
watch(isSearchOpen, (newValue) => {
  const container = document.querySelector('.container-content');
  if (container) {
    if (newValue) {
      container.classList.add('active');
    } else {
      container.classList.remove('active');
    }
  }
  // const containerMain = document.querySelector('.container');
  // if (containerMain) {
  //   if (newValue) {
  //     containerMain.classList.add('active');
  //   } else {
  //     containerMain.classList.remove('active');
  //   }
  // }
});

// Состояние раскрытия для каждого блока
const expandedBlocks = ref([]);

// Инициализируем массив `expandedBlocks` в зависимости от количества категорий
categories.value.forEach(() => expandedBlocks.value.push(false));

// Возвращаем видимые элементы для каждого блока
const getVisibleItems = (blockIndex) => {
  const block = categories.value[blockIndex];
  if (expandedBlocks.value[blockIndex]) {
    return block.products;
  }
  return block.products.slice(0, 4);
};

// Переключение состояния меню для конкретного блока
function toggleMenu(blockIndex) {
  expandedBlocks.value[blockIndex] = !expandedBlocks.value[blockIndex];
}

const toggleSubmenu = (blockIndex, menuIndex) => {
  const key = `${blockIndex}-${menuIndex}`;
  const currentState = submenuRefs.value.get(key) || false;
  submenuRefs.value.set(key, !currentState);
};

const menuVisible = ref(false);
const pageData = useState('pageData', () => false);

const openMenu = async (select, index) => {
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
    }, 300);
  }
};

watch(() => route.fullPath, () => {
  handleContainerClick();
  closeSearch();
  isSearchOpen.value = false;
  searchQuery.value = '';
});
watch(
    () => route.path,
    () => {
      closeMenu();
    }
);

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

const handleContainerClick = () => {
  if (isMenuOpen.value) {
    isMenuOpen.value = false;
  }
};

const convertDateToText = (dateString) => {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];

  const [year, month] = dateString.split('-').map(Number);
  const monthName = months[month - 1];

  return `До конца ${monthName} ${year} года`;
};

onMounted(() => {
  // fetchCategory();
  // fetchContact();
  // fetchTabs();
  // const container = document.querySelector('.container');
  // if (container) {
  //   container.addEventListener('click', handleContainerClick);
  // }
  const containerContent = document.querySelector('.container-content');
  if (containerContent) {
    containerContent.addEventListener('mouseenter', handleContainerClick);
    containerContent.addEventListener('click', closeSearch);
  }
});
onBeforeUnmount(() => {
  // const container = document.querySelector('.container');
  // if (container) {
  //   container.removeEventListener('click', handleContainerClick);
  // }
  const containerContent = document.querySelector('.container-content');
  if (containerContent) {
    containerContent.addEventListener('mouseenter', handleContainerClick);
    containerContent.addEventListener('click', closeSearch);
  }
});
</script>

<template>
  <div>
    <header class="header">
      <div class="header__info">
        <div class="header__info_page">
          <div class="header__info_container-text">
<!--            <NuxtLink to="/stocks" :class="{ active: route.name === 'stocks' }">Акции</NuxtLink>-->
            <NuxtLink to="/order" :class="{ active: route.name === 'order' }">Где купить?</NuxtLink>
            <NuxtLink to="/delivery" :class="{ active: route.name === 'delivery' }">Доставка</NuxtLink>
          </div>
          <NuxtLink :to="`tel: ${contacts.phone}`" class="header__info_container-phone">
            <IconsPhone/>
            <p>{{ contacts.phone }}</p>
          </NuxtLink>
        </div>
      </div>
      <div class="header__main" v-if="!isSearch">
        <div class="header__main_page">
          <NuxtLink to="/">
            <IconsLogo
                class="header__main_logo"/>
          </NuxtLink>
          <nav class="header__main_nav">
            <div
                class="header__main_nav-container"
                :class="{ active: route.name === 'catalog' || route.fullPath.includes('card') }"
                @mouseenter="openMenuMain"
            >
              <NuxtLink to="/catalog">КАТАЛОГ</NuxtLink>
              <IconsArrowHeader class="header__main_nav-arrow"
                          :style="{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"/>
            </div>
            <NuxtLink
                class="header__main_nav-item"
                :class="{ active: route.name === 'about_us' }"
                to="/about_us"
            >
              О НАС
            </NuxtLink>
            <NuxtLink
                class="header__main_nav-item"
                :class="{ active: route.name === 'contact' }"
                to="/contact"
            >
              КОНТАКТЫ
            </NuxtLink>
          </nav>
          <div class="header__main_menu">
            <IconsSearch @click="toggleMenuSearch"/>
            <NuxtLink to="/basket" class="header__main_menu_basket">
              <IconsBasket :class="{ active: route.name === 'basket' }"/>
              <div v-if="totalBasketQuantity > 0" class="header__main_menu_basket_quantity">{{ totalBasketQuantity }}
              </div>
            </NuxtLink>
            <IconsMenu class="header__main_menu-btn" @click="openMenu"/>
          </div>
          <div v-if="menuVisible" class="slide-out-menu">
            <div class="menu-header">
              <h3>Меню</h3>
              <IconsCross @click="closeMenu"/>
            </div>
            <div class="header__info_container-text-phone">
<!--              <NuxtLink to="/stocks" :class="{ active: route.name === 'stocks' }">Акции</NuxtLink>-->
              <NuxtLink to="/order" :class="{ active: route.name === 'order' }">Где купить?</NuxtLink>
              <NuxtLink to="/delivery" :class="{ active: route.name === 'delivery' }">Доставка</NuxtLink>
            </div>
            <nav class="header__main_nav-phone">
              <div
                  class="header__main_nav-container"
                  :class="{ active: route.name === 'catalog' }"
              >
                <NuxtLink to="/catalog">КАТАЛОГ</NuxtLink>
                <IconsArrow @click="toggleMenuPhone" class="header__main_nav-arrow"
                            :style="{ transform: isMenuOpenPhone ? 'rotate(180deg)' : 'rotate(0deg)' }"/>
              </div>
              <div v-if="isMenuOpenPhone" class="header__menu-phone">
                <div class="header__menu header__menu-phone" :style="{ display: isMenuOpenPhone ? 'grid' : 'none'}">
                  <div
                      v-for="(block, blockIndex) in categories"
                      :key="blockIndex"
                      class="header__menu_container"
                  >
                    <NuxtImg format="webp" loading="lazy" preload :src="block.photo" alt=""/>
                    <div class="header__menu_info">
                      <NuxtLink :to="`/catalog/${block.id}-${generateSlug(block.name)}/`" class="header__menu_name">{{
                          block.name
                        }}
                      </NuxtLink>
                      <div v-for="(cat, menuIndex) in block.children" :key="menuIndex"
                           class="header__menu_item-container">
                        <div class="header__menu_item-arrow">
                          <NuxtLink :to="`/catalog/${cat.id}-${generateSlug(cat.name)}/`"
                                    class="header__menu_item">
                            {{ cat.name }}
                          </NuxtLink>
                          <IconsArrow v-if="cat.products.length" color="#EF7F1A"
                                      @click="toggleSubmenu(blockIndex, menuIndex)"/>
                        </div>
                        <div
                            class="header__menu_subitem-container"
                            :style="{ display: submenuRefs.get(`${blockIndex}-${menuIndex}`) ? 'flex' : 'none' }"
                        >
                          <div v-for="(subItem, subIndex) in cat.products" :key="subIndex" class="header__menu_subitem">
                            <NuxtLink :to="`/card/${subItem.id}-${generateSlug(subItem.name)}/`"
                                      class="header__menu_item">
                              {{ subItem.name }}
                            </NuxtLink>
                          </div>
                        </div>
                      </div>
                      <div v-for="(menuItem, menuIndex) in block.products" :key="menuIndex"
                           class="header__menu_item-container">
                        <div class="header__menu_item-arrow" @click="toggleSubmenu(blockIndex, menuIndex)">
                          <NuxtLink :to="`/card/${menuItem.id}-${generateSlug(menuItem.name)}/`"
                                    class="header__menu_item">
                            {{ menuItem.name }}
                          </NuxtLink>
                          <!--              <IconsArrow v-if="menuItem.subitems.length" color="#EF7F1A" />-->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <NuxtLink
                  class="header__main_nav-item"
                  :class="{ active: route.name === 'about_us' }"
                  to="/about_us"
              >
                О НАС
              </NuxtLink>
              <NuxtLink
                  class="header__main_nav-item"
                  :class="{ active: route.name === 'contact' }"
                  to="/contact"
              >
                КОНТАКТЫ
              </NuxtLink>
            </nav>
          </div>
        </div>
      </div>
      <div class="header__main-search" v-if="isSearch" :class="{ 'is-visible': showSearch }">
        <div class="header__main-search-cont">
          <div class="header__main-search_container">
            <input class="header__main-search_input" v-model="searchQuery" name="search" type="text"
                   placeholder="Искать" @keydown.enter="handleSearch"/>
            <IconsSearch @click="handleSearch"/>
          </div>
          <IconsCross class="header__main-search_close" color="#cccccc" @click="closeSearch"/>
        </div>
      </div>
      <div class="header__menu header__menu_search" :style="{ display: isSearchOpen ? 'grid' : 'none'}">
        <div class="header__menu_title">
          <h3>Товары</h3>
          <p>{{ searchResult?.products?.length }}</p>
        </div>
        <div class="header__menu_container-search-cont">
          <div
              v-if="searchResult?.products"
              v-for="(search, index) in searchResult?.products"
              :key="index"
              class="header__menu_container-search"
          >
            <a
                class="header__menu_container-search"
                :href="`/card/${search.id}-${generateSlug(search.name)}/`"
            >
              <NuxtImg format="webp" loading="lazy" preload v-if="search.photos.length > 0" :src="search.photos[0].photo" alt=""/>
              <p class="header__menu_name">{{ search.name }}</p>
            </a>
          </div>
        </div>
        <div class="header__menu_title">
          <h3>Акции</h3>
          <p>{{ searchResult?.newPromos?.length }}</p>
        </div>
        <div class="header__menu_container-search-cont">
          <div
              v-if="searchResult?.newPromos"
              v-for="(search, index) in searchResult?.newPromos"
              :key="index"
              class="header__menu_container-search"
          >
            <NuxtLink
                class="header__menu_container-search"
                :to="`/stocks`"
            >
              <NuxtImg format="webp" loading="lazy" preload :src="search.image" alt=""/>
              <div class="header__menu_container-search-info">
                <p class="header__menu_name">{{ search.title }}</p>
                <p class="header__menu_data">{{ convertDateToText(search.end) }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>
        <NuxtLink :to="{ path: '/search', query: { q: searchQuery } }" class="main_btn" style="overflow: hidden">Найти для "{{searchQuery}}"</NuxtLink>
      </div>
      <div class="header__menu" :style="{ display: isMenuOpen ? 'grid' : 'none'}">
        <div
            v-for="(block, blockIndex) in categories"
            :key="blockIndex"
            class="header__menu_container"
        >
          <NuxtImg format="webp" loading="lazy" preload :src="block.photo" alt=""/>
          <div class="header__menu_info">
            <NuxtLink :to="`/catalog/${block.id}-${generateSlug(block.name)}/`" class="header__menu_name">{{
                block.name
              }}
            </NuxtLink>
            <div v-for="(cat, menuIndex) in block.children" :key="menuIndex"
                 class="header__menu_item-container">
              <div class="header__menu_item-arrow">
                <NuxtLink :to="`/catalog/${cat.id}-${generateSlug(cat.name)}/`"
                          class="header__menu_item">
                  {{ cat.name }}
                </NuxtLink>
                <IconsArrow v-if="cat.products.length" color="#EF7F1A" @click="toggleSubmenu(blockIndex, menuIndex)"/>
              </div>
              <div
                  class="header__menu_subitem-container"
                  :style="{ display: submenuRefs.get(`${blockIndex}-${menuIndex}`) ? 'flex' : 'none' }"
              >
                <div v-for="(subItem, subIndex) in cat.products" :key="subIndex" class="header__menu_subitem">
                  <NuxtLink :to="`/card/${subItem.id}-${generateSlug(subItem.name)}/`"
                            class="header__menu_item">
                    {{ subItem.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>
            <div
                v-for="(menuItem, menuIndex) in getVisibleItems(blockIndex)"
                :key="menuIndex"
                class="header__menu_item-container"
            >
              <div class="header__menu_item-arrow">
                <a
                    :href="`/card/${menuItem.id}-${generateSlug(menuItem.name)}/`"
                    class="header__menu_item"
                >
                  {{ menuItem.name }}
                </a>
              </div>
            </div>
            <button
                v-if="block.products.length > 4"
                @click.stop="toggleMenu(blockIndex)"
                class="main_btn"
                style="padding: 5px 10px"
            >
              {{ expandedBlocks[blockIndex] ? 'Скрыть' : 'Ещё' }}
            </button>
          </div>
        </div>
      </div>

    </header>
    <div class="header__plug"></div>
  </div>
</template>

<style scoped lang="scss">
.slide-out-menu {
  $x-small: 575.98px;
  $small: 767.98px;
  $medium: 991.98px;
  $large: 1199.98px;
  $x-large: 1399.98px;
  $big: 1592.98px;
  $x-big: 1829.98px;

  position: fixed;
  top: 0;
  right: 0;
  width: calc(100% - 100px);
  height: calc(100% - 122px);
  background-color: #fff;
  border-left: 1px solid #ccc;
  padding: 82px 50px 40px 50px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 30px;

  @media screen and (max-width: $x-small) {
    width: calc(100% - 60px);
    padding: 70px 30px 40px 30px;
    height: calc(100% - 110px);
  }

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
}
</style>