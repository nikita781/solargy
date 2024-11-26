<script setup>
import { ref } from 'vue';

const submenuRefs = ref(new Map());

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

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
  <div class="header">
    <div class="header__info">
      <div class="header__info_container-text">
        <NuxtLink>Акция</NuxtLink>
        <NuxtLink>Где купить?</NuxtLink>
      </div>
      <a href="tel: +78002000602" class="header__info_container-phone">
        <IconsPhone/>
        <p>8 (800) 200 06 02</p>
      </a>
    </div>
    <div class="header__main">
      <IconsLogo class="header__main_logo"/>
      <nav class="header__main_nav">
        <div class="header__main_nav-container" @click="toggleMenu">
          <p>КАТАЛОГ</p>
          <IconsArrow class="header__main_nav-arrow" :style="{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"/>
        </div>
        <NuxtLink>О НАС</NuxtLink>
        <NuxtLink>КОНТАКТЫ</NuxtLink>
      </nav>
      <div class="header__main_menu">
        <IconsSearch/>
        <IconsBasket/>
      </div>
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

  </div>
</template>

<style scoped lang="scss">

</style>