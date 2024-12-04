<script setup>
import { ref } from 'vue';

const tabs = ref([
  { id: 1, name: "Все" },
  { id: 2, name: "Светопроводящие системы" },
  { id: 3, name: "Солнцезащитные устройства" },
  { id: 4, name: "Дополнительные материалы" },
]);

const activeTab = ref(1);

const setActiveTab = (tabId) => {
  activeTab.value = tabId;
};

const products = ref([
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
  {
    id: 5,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 6,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 7,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 8,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
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
  {
    id: 5,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 6,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 7,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 8,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
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
  {
    id: 5,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 6,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 7,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 8,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
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
  {
    id: 5,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 6,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 7,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 8,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
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
  {
    id: 5,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 6,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 7,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 8,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
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
  {
    id: 5,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 6,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 7,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 8,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
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
  {
    id: 5,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 6,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 7,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 8,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
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
  {
    id: 5,
    image: '/a64845b2ddf97aa28ae693147c1cb957_1.jpg',
    title: 'Световой колодец',
    description: 'Это не просто конструкции для естественного освещения, это уникальные элементы дизайна.',
    price: 'От 50 500 ₽'
  },
  {
    id: 6,
    image: '/749a80e5f27431b23b4c00f2a3044ecc_1.jpg',
    title: 'Solargy SW F',
    description: 'Грунтовый световод. Используют для освещения стилобатных помещений.',
    price: 'От 50 500 ₽'
  },
  {
    id: 7,
    image: '/3a171a3c74adf79a1578478a9b2db556_1.jpg',
    title: 'Solargy WL W',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье.',
    price: 'От 50 500 ₽'
  },
  {
    id: 8,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
  {
    id: 9,
    image: '/840f5fbc2eadd78837bba644f8206392_1.jpg',
    title: 'Solargy SW W',
    description: 'Стеновой световод. Используют при необходимости установить световод на стене.',
    price: 'От 50 500 ₽'
  },
])

const itemsPerPage = 8;
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage));

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return products.value.slice(start, end);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const pagesInRange = computed(() => {
  const range = [];
  const start = Math.max(2, currentPage.value - 4);
  const end = Math.min(totalPages.value - 1, currentPage.value + 4);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
});
</script>

<template>
  <div class="catalog">
    <!-- Табы -->
    <div class="catalog__tabs">
      <p
          v-for="tab in tabs"
          :key="tab.id"
          class="catalog__tab"
          :class="{ active: tab.id === activeTab }"
          @click="setActiveTab(tab.id)"
      >
        {{ tab.name }}
      </p>
    </div>

    <!-- Продукты -->
    <div class="catalog__product">
      <div class="best-product__items">
        <div
            class="best-product__item"
            v-for="(prod, index) in paginatedProducts"
            :key="index"
        >
          <img class="best-product__item_img" :src="prod.image" alt="" />
          <div class="best-product__item_content">
            <p class="best-product__item_title">{{ prod.title }}</p>
            <p class="best-product__item_desc">{{ prod.description }}</p>
          </div>
          <div class="best-product__item_container">
            <p class="best-product__item_price">{{ prod.price }}</p>
            <button class="best-product__item_btn">Заказать</button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="arrow-left" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"></button>
      <span
          class="pagination__number"
          :class="{ active: currentPage === 1 }"
          @click="goToPage(1)"
      >
      1
      </span>
      <span class="pagination__number" v-if="currentPage > 6">...</span>
      <span
          v-for="page in pagesInRange"
          :key="page"
          class="pagination__number"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
      >
      {{ page }}
      </span>
      <span class="pagination__number" v-if="currentPage < totalPages - 5">...</span>
      <span
          class="pagination__number"
          :class="{ active: currentPage === totalPages }"
          @click="goToPage(totalPages)"
      >
      {{ totalPages }}
      </span>
      <button class="arrow-right" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"></button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pagination {
  display: flex;
  gap: 18px;
  justify-content: center;
  align-items: center;
  margin-bottom: 70px;

  .arrow-left {
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 15px;
    height: 19px;
    outline: none;
    border: none;
    transform: rotate(90deg);
    background-color: transparent;
    margin-right: 10px;
    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 3px;
      height: 100%;
      background-color: #EF7F1A;
    }
    &::before {
      transform: rotate(-45deg);
      left: 0;
      top: 0;
    }
    &::after {
      transform: rotate(45deg);
      right: 0;
      top: 0;
    }
  }

  .arrow-right {
    cursor: pointer;
    position: relative;
    display: inline-block;
    width: 15px;
    height: 19px;
    outline: none;
    border: none;
    transform: rotate(-90deg);
    background-color: transparent;
    margin-left: 10px;
    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 3px;
      height: 100%;
      background-color: #EF7F1A;
    }
    &::before {
      transform: rotate(-45deg);
      left: 0;
      top: 0;
    }
    &::after {
      transform: rotate(45deg);
      right: 0;
      top: 0;
    }
  }

  &__number {
    font-size: 20px;
    margin: 0 5px;
    cursor: pointer;
    color: #9B9B9B;

    &.active {
      color: #EF7F1A;
    }
  }
}
</style>