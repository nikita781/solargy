<script setup>
import {nextTick, ref} from 'vue';
import {useRoute} from 'vue-router'
import axios from "axios";

const route = useRoute()

const submenuRefs = ref(new Map());

const isMenuOpen = ref(false);
const isSearchOpen = ref(false);
const isMenuOpenPhone = ref(false);
const isSearch = ref(false);
const showSearch = ref(false);
const searchQuery = ref('');
const searchResult = ref([]);
const categories = ref([])

const fetchCategory = async () => {
  try {
    const response = await axios.get('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const contacts = ref([]);
const fetchContact = async () => {
  try {
    const response = await axios.get(`/contacts`);
    contacts.value = response.data[0];
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const tabs = ref([]);
const fetchTabs = async () => {
  try {
    const response = await axios.get('/categories');
    tabs.value = response.data;
    // console.log(tabs.value)
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error.response?.data || error);
  }
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    return;
  }

  try {
    const response = await axios.get(`/search?q=${searchQuery.value}`);
    searchResult.value = response.data;
    console.log(searchResult.value)
    if (searchResult.value.length > 0) {
      openMenuSearch();
    }
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error.response?.data || error);
  }
};

const openMenuMain = () => {
  isMenuOpen.value = true;
};

const openMenuSearch = () => {
  isSearchOpen.value = true;
  console.log(isSearchOpen.value)
};

const toggleMenuPhone = () => {
  isMenuOpenPhone.value = !isMenuOpenPhone.value;
};

const toggleMenuSearch = () => {
  if (isSearch.value) {
    closeSearch();
  } else {
    isSearch.value = true;
    setTimeout(() => (showSearch.value = true), 10);
  }
};

const closeSearch = () => {
  if (isSearch.value) {
    showSearch.value = false;
    isSearchOpen.value = false;
    setTimeout(() => (isSearch.value = false), 300);
  }
}

watch(isMenuOpen, (newValue) => {
  const container = document.querySelector('.container');
  if (container) {
    if (newValue) {
      container.classList.add('active');
    } else {
      container.classList.remove('active');
    }
  }
});
watch(isSearchOpen, (newValue) => {
  const container = document.querySelector('.container');
  if (container) {
    if (newValue) {
      container.classList.add('active');
    } else {
      container.classList.remove('active');
    }
  }
});

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
  pageData.value = true;

  const menu = document.querySelector(".slide-out-menu");
  if (menu) {
    menu.classList.add("visible");
  }
};

const closeMenu = () => {
  const menu = document.querySelector(".slide-out-menu");
  if (menu) {
    menu.classList.remove("visible");

    pageData.value = false;
    setTimeout(() => {
      menuVisible.value = false;
    }, 300);
  }
};

watch(() => route.fullPath, () => {
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
  return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
}

const handleContainerClick = () => {
  if (isMenuOpen.value) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  fetchCategory();
  fetchContact();
  fetchTabs();
  const container = document.querySelector('.container');
  if (container) {
    container.addEventListener('click', handleContainerClick);
  }
});
onBeforeUnmount(() => {
  const container = document.querySelector('.container');
  if (container) {
    container.removeEventListener('click', handleContainerClick);
  }
});
</script>

<template>
  <header class="header">
    <div class="header__info">
      <div class="header__info_container-text">
        <NuxtLink to="/stocks" :class="{ active: route.name === 'stocks' }">Акция</NuxtLink>
        <NuxtLink to="/order" :class="{ active: route.name === 'order' }">Где купить?</NuxtLink>
        <NuxtLink to="/delivery" :class="{ active: route.name === 'delivery' }">Доставка</NuxtLink>
      </div>
      <a class="header__info_container-phone">
        <IconsPhone/>
        <p>{{ contacts.phone }}</p>
      </a>
    </div>
    <div class="header__main" v-if="!isSearch">
      <NuxtLink to="/">
        <IconsLogo class="header__main_logo"/>
      </NuxtLink>
      <nav class="header__main_nav">
        <div
            class="header__main_nav-container"
            :class="{ active: route.name === 'catalog' }"
            @mouseenter="openMenuMain"
        >
          <NuxtLink to="/catalog">КАТАЛОГ</NuxtLink>
          <IconsArrow class="header__main_nav-arrow"
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
        <NuxtLink to="/basket">
          <IconsBasket :class="{ active: route.name === 'basket' }"/>
        </NuxtLink>
        <IconsMenu class="header__main_menu-btn" @click="openMenu"/>
      </div>
      <div v-if="menuVisible" class="slide-out-menu">
        <div class="menu-header">
          <h3>Меню</h3>
          <IconsCross @click="closeMenu"/>
        </div>
        <div class="header__info_container-text-phone">
          <NuxtLink to="/stocks" :class="{ active: route.name === 'stocks' }">Акция</NuxtLink>
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
                <img :src="block.photo" alt=""/>
                <div class="header__menu_info">
                  <NuxtLink :to="`/catalog/${block.id}-${generateSlug(block.name)}/`" class="header__menu_name">
                    {{ block.name }}
                  </NuxtLink>
                  <div v-for="(menuItem, menuIndex) in block.products" :key="menuIndex"
                       class="header__menu_item-container">
                    <div class="header__menu_item-arrow" @click="toggleSubmenu(blockIndex, menuIndex)">
                      <NuxtLink :to="`/card/${menuItem.id}-${generateSlug(menuItem.name)}/`" class="header__menu_item">
                        {{ menuItem.name }}
                      </NuxtLink>
                      <!--                      <IconsArrow v-if="menuItem.subitems.length" color="#EF7F1A" />-->
                    </div>
                    <!--                    <div-->
                    <!--                        class="header__menu_subitem-container"-->
                    <!--                        :style="{ display: submenuRefs.get(`${blockIndex}-${menuIndex}`) ? 'flex' : 'none' }"-->
                    <!--                    >-->
                    <!--                      <p v-for="(subItem, subIndex) in menuItem.subitems" :key="subIndex" class="header__menu_subitem">-->
                    <!--                        {{ subItem }}-->
                    <!--                      </p>-->
                    <!--                    </div>-->
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
    <div class="header__main-search" v-if="isSearch" :class="{ 'is-visible': showSearch }">
      <div class="header__main-search-cont">
        <div class="header__main-search_container">
          <input class="header__main-search_input" v-model="searchQuery" name="search" type="text"
                 placeholder="Искать"/>
          <IconsSearch @click="handleSearch"/>
        </div>
        <IconsCross class="header__main-search_close" color="#cccccc" @click="closeSearch"/>
      </div>
    </div>
    <div class="header__menu" :style="{ display: isSearchOpen ? 'grid' : 'none'}">
      <div
          v-for="(search, index) in searchResult"
          :key="index"
          class="header__menu_container-search"
      >
        <NuxtLink
            class="header__menu_container-search"
            :to="`/card/${search.id}-${generateSlug(search.name)}/`"
        >
          <img :src="search.photos[0].photo" alt=""/>
          <p class="header__menu_name">{{ search.name }}</p>
        </NuxtLink>
      </div>
    </div>
    <div class="header__menu" :style="{ display: isMenuOpen ? 'grid' : 'none'}">
      <div
          v-for="(block, blockIndex) in categories"
          :key="blockIndex"
          class="header__menu_container"
      >
        <img :src="block.photo" alt=""/>
        <div class="header__menu_info">
          <NuxtLink :to="`/catalog/${block.id}-${generateSlug(block.name)}/`" class="header__menu_name">{{
              block.name
            }}
          </NuxtLink>
          <div v-for="(menuItem, menuIndex) in block.products" :key="menuIndex" class="header__menu_item-container">
            <div class="header__menu_item-arrow" @click="toggleSubmenu(blockIndex, menuIndex)">
              <NuxtLink :to="`/card/${menuItem.id}-${generateSlug(menuItem.name)}/`" class="header__menu_item">
                {{ menuItem.name }}
              </NuxtLink>
              <!--              <IconsArrow v-if="menuItem.subitems.length" color="#EF7F1A" />-->
            </div>
            <!--            <div-->
            <!--                class="header__menu_subitem-container"-->
            <!--                :style="{ display: submenuRefs.get(`${blockIndex}-${menuIndex}`) ? 'flex' : 'none' }"-->
            <!--            >-->
            <!--              <p v-for="(subItem, subIndex) in menuItem.subitems" :key="subIndex" class="header__menu_subitem">-->
            <!--                {{ subItem }}-->
            <!--              </p>-->
            <!--            </div>-->
          </div>
        </div>
      </div>
    </div>

  </header>
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

  position: absolute;
  top: 0;
  right: 0;
  width: calc(100% - 100px);
  min-height: calc(100vh - 122px);
  background-color: #fff;
  border-left: 1px solid #ccc;
  padding: 82px 50px 40px 50px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  gap: 30px;

  @media screen and (max-width: $x-small) {
    width: calc(100% - 60px);
    padding: 70px 30px 40px 30px;
    min-height: calc(100vh - 110px);
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