<script setup>
import {onMounted, ref, computed} from 'vue';
import axios from 'axios';
import {useRoute, useRouter} from 'vue-router';

const route = useRoute();
const router = useRouter();
const tabs = ref([]);
const allCategories = ref([]);
const activeTab = ref(0);
const products = ref([]);
const page = ref(1);
const totalPages = ref(0);
const itemsPerPage = 8;

const flattenCategoriesWithChildren = (categories) => {
  const result = [];

  const traverse = (categoryList) => {
    categoryList.forEach((category) => {
      result.push({
        id: category.id,
        name: category.name,
        parent_id: category.parent_id,
        level: category.level,
      });

      if (category.children && category.children.length > 0) {
        traverse(category.children);
      }
    });
  };

  traverse(categories);
  return result;
};

const fetchTabs = async () => {
  try {
    const response = await axios.get('/categories');
    const categories = response.data;

    allCategories.value = flattenCategoriesWithChildren(categories);

    tabs.value = [
      {id: 0, name: 'Все'},
      ...allCategories.value,
    ];
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error.response?.data || error);
  }
};

const fetchProducts = async () => {
  try {
    const categoryParam = activeTab.value !== 0 ? `&category=${activeTab.value}` : '';
    const response = await axios.get(`/products?page=${page.value}${categoryParam}`);
    totalPages.value = response.data.meta.last_page || 0;
    products.value = response.data.data || [];
  } catch (error) {
    console.error('Ошибка загрузки продуктов:', error.response?.data || error);
  }
};

watch(() => route.fullPath, () => {
  const categoryIdURL = route.params.catalogId;
  if (categoryIdURL) {
    categoryId.value = categoryIdURL.match(/^\d+/)?.[0] || null;
  }
  if (categoryId.value) {
    changeTab(parseInt(categoryId.value, 10));
  }
  fetchTabs();
  fetchProducts();
});

function generateSlug(name) {
  const cyrillicToLatinMap = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
    ы: 'y', э: 'e', ю: 'yu', я: 'ya', ъ: '', ь: ''
  };

  const transliterate = (str) => {
    return str
        .split('')
        .map(char => cyrillicToLatinMap[char] || char)
        .join('');
  };

  return transliterate(name)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
}

const changeTab = (tabId) => {
  activeTab.value = tabId;
  page.value = 1;
  fetchProducts();
};

const paginatedProducts = computed(() => products.value.slice(0, itemsPerPage));

const goToPage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchProducts();
  }
};

const pagesInRange = computed(() => {
  const range = [];
  const start = Math.max(2, page.value - 4);
  const end = Math.min(totalPages.value - 1, page.value + 4);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
});

const categoryId = ref(null);

onMounted(() => {
  const categoryIdURL = route.params.catalogId;
  if (categoryIdURL) {
    categoryId.value = categoryIdURL.match(/^\d+/)?.[0] || null;
  }

  if (categoryId.value) {
    changeTab(parseInt(categoryId.value, 10));
  }
  fetchTabs();
  fetchProducts();
});
</script>

<template>
  <div class="catalog">
    <div class="catalog__tabs">
      <p
          v-for="tab in tabs"
          :key="tab.id"
          class="catalog__tab"
          :class="{ active: tab.id === activeTab }"
          @click="changeTab(tab.id)"
      >
        {{ tab.name }}
      </p>
    </div>

    <div class="catalog__product">
      <div class="best-product__items">
        <div
            v-for="product in paginatedProducts"
            :key="product.id"
            class="best-product__item"
        >
          <NuxtLink
              :to="`/card/${product.id}-${generateSlug(product.name)}/`"
          >
            <img
                class="best-product__item_img"
                :src="product.photos[0]?.photo"
                alt="Product Image"
            />
          </NuxtLink>
          <div class="best-product__item_content">
            <NuxtLink :to="`/card/${product.id}-${generateSlug(product.name)}/`" class="best-product__item_title">{{ product.name }}</NuxtLink>
            <p class="best-product__item_desc">{{ product.description }}</p>
          </div>
          <div class="best-product__item_container">
            <p class="best-product__item_price">От {{ product.price }} ₽</p>
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

    <div class="pagination" v-if="totalPages > 1">
      <button
          class="arrow-left"
          @click="goToPage(page - 1)"
          :disabled="page === 1"
      >
      </button>
      <span
          class="pagination__number"
          :class="{ active: page === 1 }"
          @click="goToPage(1)"
      >
        1
      </span>
      <span v-if="page > 6">...</span>
      <span
          v-for="pageNum in pagesInRange"
          :key="pageNum"
          class="pagination__number"
          :class="{ active: pageNum === page }"
          @click="goToPage(pageNum)"
      >
        {{ pageNum }}
      </span>
      <span v-if="page < totalPages - 5">...</span>
      <span
          class="pagination__number"
          :class="{ active: page === totalPages }"
          @click="goToPage(totalPages)"
      >
        {{ totalPages }}
      </span>
      <button
          class="arrow-right"
          @click="goToPage(page + 1)"
          :disabled="page === totalPages"
      >
      </button>
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
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
  align-items: center;
  margin-bottom: 70px;
  @media screen and (max-width: $medium) {
    margin-bottom: 40px;
  }
  @media screen and (max-width: $small) {
    gap: 6px;
  }

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
    @media screen and (max-width: $small) {
      transform: rotate(90deg) scale(0.8);
    }

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
    @media screen and (max-width: $small) {
      transform: rotate(-90deg) scale(0.8);
    }

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
    @media screen and (max-width: $small) {
      font-size: 16px;
    }

    &.active {
      color: #EF7F1A;
    }
  }
}
</style>