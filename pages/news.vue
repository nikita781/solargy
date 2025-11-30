<script setup>
import {onMounted, ref} from "vue";
import axios from 'axios';
import {useRoute, useRouter} from 'vue-router';
import Toastify from "toastify-js";
import {useAsyncData} from "#app";

const route = useRoute();
const router = useRouter();
const newsId = ref(null);
const news = ref([]);

const newsIdURL = route.params.newsId;
if (!newsIdURL) {
  await router.push('/');
} else {
  newsId.value = newsIdURL.match(/^\d+/)?.[0] || null;
}

const defaultSeo = {
  title: "SOLARGY SHOP - Световые панели для вашего дома и бизнеса",
  description: "SOLARGY SHOP предлагает световые панели высокого качества по доступным ценам. Энергосберегающие технологии, широкий ассортимент и доставка по всей России.",
  keywords: "световые панели, солнечные панели, энергосбережение, купить световые панели, панели для дома, панели для бизнеса, Solargy Shop, солнечные батареи, возобновляемая энергия",
  author: "Solargy"
};

const {data: seos, error} = await useAsyncData("fetchSeos", async () => {
  if (!newsId.value) return null;
  try {
    const response = await axios.get(`/news/${newsId.value}`);
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

const fetchNews = async (idNews) => {
  try {
    const response = await axios.get(`/news/${idNews}`);
    news.value = response.data;

  } catch (error) {
    console.error('Ошибка загрузки акции:', error.response?.data || error);
  }
};

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function removeEmojis(text) {
  if (!text) return '';
  return text.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g,
      ''
  );
}

function getVkEmbedLink(url) {
  if (!url) return '';

  // Ищем и обычные видео, и клипы:
  //     video-192371408_456243321
  //     clip-50151764_456246819
  const match = url.match(/(?:video|clip)-(-?\d+)_([0-9]+)/);

  if (!match) {
    // Если не нашли нужный формат — отдаем как есть
    return url;
  }

  let oid = match[1]; // может быть '50151764' или '-50151764'
  const id = match[2];

  // В embed oid должен быть с минусом (для сообществ)
  if (!oid.startsWith('-')) {
    oid = '-' + oid;
  }

  return `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${id}&hd=1`;
}


const visibleDialog = ref(false);
const openDialog = () => {
  visibleDialog.value = true;
};
const closeDialog = () => {
  visibleDialog.value = false;
};

function copyLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url)
  Toastify({
    text: "Ссылка скопирована!",
    duration: 3000,
    gravity: "top", // Позиция: "top" или "bottom"
    position: "right", // Позиция: "left", "center" или "right"
    backgroundColor: "#28a745",
    stopOnFocus: true,
  }).showToast();
}

function shareToVK() {
  const currentUrl = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  window.open(`https://vk.com/share.php?url=${currentUrl}&title=${news.value.title}`, '_blank');
}

function shareToTelegram() {
  const currentUrl = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(document.title);
  window.open(`https://t.me/share/url?url=${currentUrl}&text=${news.value.title}`, '_blank');
}

function shareToOk() {
  const currentUrl = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  window.open(`https://connect.ok.ru/offer?url=${currentUrl}&title=${news.value.title}`, '_blank');
}

const visibleRef = ref(false);
const showImg = () => {
  visibleRef.value = true;
};
const onHide = () => (visibleRef.value = false);

function transformAllImagesInHtml(html) {
  if (!html) return '';

  // 1. Парсим HTML-строку в DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');


  // Проверка на .columns с двумя .column
  doc.querySelectorAll('.columns').forEach((columns) => {
    const columnChildren = columns.querySelectorAll(':scope > .column');
    if (columnChildren.length === 2) {
      columns.classList.add('columns--two');
    }
  });

  // 3. Возвращаем обновлённую HTML-строку
  return doc.body.innerHTML;
}

const visibleRefHtml = ref(false);
const imgsHtml = ref([]);
const indexRefHtml = ref(0);
const showImgHtml = (index) => {
  visibleRefHtml.value = true;
  indexRefHtml.value = index;
};
const onHideHtml = () => {
  visibleRefHtml.value = false;
};

const handleImageClickHtml = (event) => {
  const target = event.target;
  // Проверяем, кликнули ли по IMG
  if (target.tagName === 'IMG') {
    // Ищем ближайший контейнер .image-block ИЛИ .gallery
    const parent = target.closest('.image-block, .gallery');
    if (parent) {
      // Собираем ВСЕ изображения из .image-block и .gallery
      const imgElements = Array.from(
          document.querySelectorAll(
              '.editor__content .image-block img, .editor__content .gallery img'
          )
      );

      // Формируем массив src для лайтбокса
      imgsHtml.value = imgElements.map((img) => img.src);

      // Находим индекс кликнутого изображения
      const clickedIndex = imgElements.findIndex((img) => img === target);

      // Если индекс найден, показываем изображение в лайтбоксе
      if (clickedIndex !== -1) {
        showImgHtml(clickedIndex);
      }
    }
  }
};

watch(() => route.fullPath, () => {
  const newsIdURL = route.params.newsId;
  if (newsIdURL) {
    newsId.value = newsIdURL.match(/^\d+/)?.[0] || null;
  }
  fetchNews(newsId.value);
});

onMounted(() => {
  const newsIdURL = route.params.newsId;
  if (newsIdURL) {
    newsId.value = newsIdURL.match(/^\d+/)?.[0] || null;
  }
  fetchNews(newsId.value);
});
</script>

<template>
  <div class="blog" v-if="news">
    <div class="card__main_links" style="flex-wrap: nowrap">
      <NuxtLink to="/blog" class="card__main_link">Новости</NuxtLink>
      <IconsSun/>
      <NuxtLink :to="`/blog/${news?.type}`"
                class="card__main_link">
        {{capitalize(news?.type)}}
      </NuxtLink>
      <IconsSun color="#EF7F1A"/>
      <NuxtLink class="card__main_link card__main_link-active card__main_link-long">{{ removeEmojis(news?.title) }}</NuxtLink>
    </div>
    <div class="news__image">
      <iframe
          v-if="news?.video"
          width="100%"
          height="100%"
          :src="getVkEmbedLink(news?.video)"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
          frameborder="0"
          allowfullscreen
          class="vkvideo"
      ></iframe>
      <NuxtImg v-else @click="() => showImg()" format="webp" preload loading="lazy" class="news__image-photo" :src="news?.image" alt=""/>
      <VueEasyLightbox
          :visible="visibleRef"
          :imgs="news?.image"
          @hide="onHide"
          class="card__main_img-full"
      />
    </div>
    <div class="news__header">
      <div class="news__title_container">
        <p class="news__title">{{news?.title}}</p>
        <div class="card__main_header-item" @click="openDialog">
          <IconsShare />
          <p class="card__main_header-text">Поделиться</p>
        </div>
      </div>
      <div class="news__info">
        <p
            class="blog__filter_item active"
            style="width: fit-content; cursor: default"
        >
          {{ news?.type }}
        </p>
        <p class="news__date">Дата публикации: {{news?.date}}</p>
      </div>
    </div>
    <div
        class="editor__content"
        v-html="transformAllImagesInHtml(news?.html)"
        @click="handleImageClickHtml"
    ></div>
    <VueEasyLightbox
        :visible="visibleRefHtml"
        :imgs="imgsHtml"
        :index="indexRefHtml"
        @hide="onHideHtml"
        class="card__main_img-full"
    />
    <div class="admin__dialog" v-if="visibleDialog" @click="closeDialog" style="z-index: 1">
      <div class="card__dialog" @click.stop>
        <div class="card__dialog_header">
          <p>Поделиться</p>
          <IconsCross @click="closeDialog" />
        </div>
        <div class="card__dialog_mess">
          <img src="/VK Logo 1.svg" alt="VK" @click="shareToVK" style="cursor: pointer;" />
          <img src="/tg%201.svg" alt="TG" @click="shareToTelegram" style="cursor: pointer;" />
          <img src="/ok_%201.svg" alt="OK" @click="shareToOk" style="cursor: pointer;" />
        </div>
        <div class="card__dialog_copy" @click="copyLink">
          <p>Скопировать ссылку</p>
          <img src="/Link.svg" alt="">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>