<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute()

const submenuRefs = ref(new Map());

const isMenuOpen = ref(false);
const isSearch = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleMenuSearch = () => {
  isSearch.value = !isSearch.value;
};

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

const toggleSubmenu = (blockIndex, menuIndex) => {
  const key = `${blockIndex}-${menuIndex}`;
  const currentState = submenuRefs.value.get(key) || false;
  submenuRefs.value.set(key, !currentState);
};

const blocks = [
  {
    name: "Светопроводящие системы",
    image: "/88fea1154150a63a7cce1416c1d61201.jpg",
    menuItems: [
      {
        title: "Световод",
        subitems: ["CEO SOLARGY SW C", "Solargy SW F", "Solargy SW W", "Solargy WL W"],
      },
      {
        title: "Зенитный фонарь",
        subitems: [],
      },
      {
        title: "Шахтный фонарь",
        subitems: [],
      },
      {
        title: "Световой колодец",
        subitems: [],
      },
      {
        title: "Светоскоп",
        subitems: [],
      },
    ],
  },
  {
    name: "Солнцезащитные устройства",
    image: "/44dbb9cc01fa843514392aeb5314b96e.jpg",
    menuItems: [
      {
        title: "Электрокарнизы ONVIZ",
        subitems: [],
      },
      {
        title: "Козырек солнечный",
        subitems: [],
      },
      {
        title: "Солнцезащитная панель",
        subitems: [],
      },
      {
        title: "Солнцезащитная электропленка",
        subitems: [],
      },
      {
        title: "Жалюзи стеклянные",
        subitems: [],
      },
    ],
  },
  {
    name: "Дополнительные товары",
    image: "/0d4f7e87c393a27afa380d0092b07450.jpg",
    menuItems: [
      {
        title: "Товар 1",
        subitems: [],
      },
      {
        title: "Товар 2",
        subitems: [],
      },
      {
        title: "Товар 3",
        subitems: [],
      },
      {
        title: "Товар 4",
        subitems: [],
      },
      {
        title: "Товар 5",
        subitems: [],
      },
    ],
  },
];
</script>

<template>
  <header class="header">
    <div class="header__info">
      <div class="header__info_container-text">
        <NuxtLink to="/stocks" :class="{ active: route.name === 'stocks' }">Акция</NuxtLink>
        <NuxtLink to="/order" :class="{ active: route.name === 'order' }">Где купить?</NuxtLink>
        <NuxtLink to="/delivery" :class="{ active: route.name === 'delivery' }">Доставка</NuxtLink>
      </div>
      <a href="tel: +78002000602" class="header__info_container-phone">
        <IconsPhone/>
        <p>8 (800) 200 06 02</p>
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
        >
          <NuxtLink to="/catalog">КАТАЛОГ</NuxtLink>
          <IconsArrow @click="toggleMenu" class="header__main_nav-arrow" :style="{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"/>
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
      </div>
    </div>
    <div class="header__main-search" v-if="isSearch">
      <div class="header__main-search_container">
        <input class="header__main-search_input" name="search" type="text" placeholder="Искать"/>
        <IconsSearch/>
      </div>
      <IconsCross class="header__main-search_close" color="#cccccc" @click="toggleMenuSearch"/>
    </div>
    <div class="header__menu" :style="{ display: isMenuOpen ? 'grid' : 'none'}">
      <div
          v-for="(block, blockIndex) in blocks"
          :key="blockIndex"
          class="header__menu_container"
      >
        <img :src="block.image" alt="" />
        <div class="header__menu_info">
          <p class="header__menu_name">{{ block.name }}</p>
          <div v-for="(menuItem, menuIndex) in block.menuItems" :key="menuIndex" class="header__menu_item-container">
            <div class="header__menu_item-arrow" @click="toggleSubmenu(blockIndex, menuIndex)">
              <p class="header__menu_item">{{ menuItem.title }}</p>
              <IconsArrow v-if="menuItem.subitems.length" color="#EF7F1A" />
            </div>
            <div
                class="header__menu_subitem-container"
                :style="{ display: submenuRefs.get(`${blockIndex}-${menuIndex}`) ? 'flex' : 'none' }"
            >
              <p v-for="(subItem, subIndex) in menuItem.subitems" :key="subIndex" class="header__menu_subitem">
                {{ subItem }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </header>
</template>

<style scoped lang="scss">

</style>