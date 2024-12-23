<script setup>

import axios from "axios";
import {nextTick, onMounted} from "vue";
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
  deliverySeo.value = seos.value.find((seo) => seo.url === "order");

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


const place = ref([]);
const marketplacesPlace = ref([]);
const partnersPlace = ref([]);
const retailersPlace = ref([]);
const storesPlace = ref([]);

const fetchPlace = async () => {
  try {
    const response = await axios.get(`/purchase-place`);
    place.value = response.data;
    marketplacesPlace.value = place.value.filter((item) => item.type === "marketplace");
    partnersPlace.value = place.value.filter((item) => item.type === "partner");
    retailersPlace.value = place.value.filter((item) => item.type === "retailer");
    storesPlace.value = place.value.filter((item) => item.type === "store");
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

onMounted(() => {
  fetchPlace();
});
</script>

<template>
  <div class="stocks">
    <div class="stocks__main">
      <div class="stocks__main_links">
        <NuxtLink to="/" class="stocks__main_link">Главная</NuxtLink>
        <IconsSun color="#EF7F1A"/>
        <NuxtLink class="stocks__main_link stocks__main_link-active">Где купить?</NuxtLink>
      </div>
      <h2 class="main_title">Где купить?</h2>
      <div class="stocks__order">
        <div class="stocks__order_item">
          <h3 class="stocks__order_title">Маркетплейсы</h3>
          <div
              v-for="place in marketplacesPlace"
              :key="place.id"
          >
            <NuxtLink :to="place.url" class="stocks__order_text">
              {{ place.name }}
            </NuxtLink>
          </div>
        </div>
        <div class="stocks__order_item">
          <h3 class="stocks__order_title">Дилеры и партнеры</h3>
          <div
              v-for="place in partnersPlace"
              :key="place.id"
          >
            <NuxtLink :to="place.url" class="stocks__order_text">
              {{ place.name }}
            </NuxtLink>
          </div>
        </div>
        <div class="stocks__order_item">
          <h3 class="stocks__order_title">Розничные магазины</h3>
          <div
              v-for="place in retailersPlace"
              :key="place.id"
          >
            <NuxtLink :to="place.url" class="stocks__order_text">
              {{ place.name }}
            </NuxtLink>
          </div>
        </div>
        <div class="stocks__order_item">
          <h3 class="stocks__order_title">Торговые сети</h3>
          <div
              v-for="place in storesPlace"
              :key="place.id"
          >
            <NuxtLink :to="place.url" class="stocks__order_text">
              {{ place.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>