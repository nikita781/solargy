<script setup>
import {onMounted, ref, computed} from 'vue';
import axios from 'axios';
import {useRoute, useRouter} from 'vue-router';
import { useAsyncData } from '#app';

const route = useRoute();
const router = useRouter();
const promoId = ref(null);
const promo = ref(null);

const promoIdURL = route.params.promoId;
if (!promoIdURL) {
  await router.push('/');
} else {
  promoId.value = promoIdURL.match(/^\d+/)?.[0] || null;
}

const defaultSeo = {
  title: "SOLARGY SHOP - Световые панели для вашего дома и бизнеса",
  description: "SOLARGY SHOP предлагает световые панели высокого качества по доступным ценам. Энергосберегающие технологии, широкий ассортимент и доставка по всей России.",
  keywords: "световые панели, солнечные панели, энергосбережение, купить световые панели, панели для дома, панели для бизнеса, Solargy Shop, солнечные батареи, возобновляемая энергия",
  author: "Solargy"
};

const {data: seos, error} = await useAsyncData("fetchSeos", async () => {
  if (!promoId.value) return null;
  try {
    const response = await axios.get(`/promos/${promoId.value}`);
    return response.data;
  } catch (err) {
    console.error("Ошибка запроса SEO:", err);
    return null;
  }
});

useHead(() => {
  const deliverySeo = seos?.value;

  if (!deliverySeo) {
    return {
      title: defaultSeo.title,
      meta: [
        {name: "description", content: defaultSeo.description},
        {name: "keywords", content: defaultSeo.keywords},
        {name: "author", content: defaultSeo.author},
      ],
    };
  }

  return {
    title: deliverySeo.title || defaultSeo.title,
    meta: [
      {name: "description", content: deliverySeo.description || defaultSeo.description},
      {name: "keywords", content: deliverySeo.keywords || defaultSeo.keywords},
      {name: "author", content: deliverySeo.author || defaultSeo.author},
    ],
  };
});

const fetchPromo = async (idPromo) => {
  try {
    const response = await axios.get(`/promos/${idPromo}`);
    promo.value = response.data || null;
  } catch (error) {
    console.error('Ошибка загрузки акции:', error.response?.data || error);
    promo.value = null;
  }
};

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

const visibleRef = ref(false);
const showImg = () => {
  visibleRef.value = true;
};
const onHide = () => (visibleRef.value = false);

const convertDateToText = (dateString) => {
  if (!dateString) return '';

  const parts = dateString.split('-');
  if (parts.length < 2) return dateString;

  const [year, month, day = '01'] = parts;

  const dd = day.padStart(2, '0');
  const mm = month.padStart(2, '0');

  return `${dd}.${mm}.${year}`;
};

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

const findImage = (photos) => {
  if (photos?.length) {
    const image = photos.find((item) => item.type === "image" || item.type === null);
    return image ? image.photo : "/S.png";
  }
  return "/S.png";
};

watch(() => route.fullPath, () => {
  const promoIdURL = route.params.promoId;
  if (promoIdURL) {
    promoId.value = promoIdURL.match(/^\d+/)?.[0] || null;
  }
  fetchPromo(promoId.value);
});

const promoProducts = computed(() => {
  if (!promo.value || !Array.isArray(promo.value.products)) return [];
  return promo.value.products;
});

const hasPromoProducts = computed(() => promoProducts.value.length > 0);

onMounted(() => {
  const promoIdURL = route.params.promoId;
  if (promoIdURL) {
    promoId.value = promoIdURL.match(/^\d+/)?.[0] || null;
  }
  fetchPromo(promoId.value);
});
</script>

<template>
  <div class="promo" v-if="promo">
    <div class="card__main_links">
      <NuxtLink to="/" class="card__main_link">Главная</NuxtLink>
      <IconsSun/>
      <NuxtLink to="/stocks"
                class="card__main_link">
        Акции
      </NuxtLink>
      <IconsSun color="#EF7F1A"/>
      <NuxtLink class="card__main_link card__main_link-active">{{ capitalize(promo?.title) }}</NuxtLink>
    </div>
    <div class="promo__block" v-if="promo">
      <h2 class="main_title">{{promo?.title}}</h2>
      <div class="promo__main">
        <NuxtImg v-if="promo?.image" format="webp" @click="() => showImg()" loading="lazy" preload class="promo__main_img" :src='promo?.image' alt=""/>
        <VueEasyLightbox
            :visible="visibleRef"
            :imgs="promo?.image"
            @hide="onHide"
            class="card__main_img-full"
        />
        <div class="promo__main_content">
          <p class="promo__main_text">{{ promo.description }}</p>
          <p class="promo__main_data" v-if="promo.end">До {{ convertDateToText(promo.end) }}</p>
        </div>
      </div>
    </div>
    <div class="promo__prod" v-if="hasPromoProducts">
        <div class="best-product__header">
          <h2 class="main_title">Товары, участвующие в акции</h2>
        </div>
        <div class="best-product__items">
          <div
              class="best-product__item"
              v-for="product in promo.products"
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
                Заказать
              </NuxtLink>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>