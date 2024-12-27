<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";
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
  deliverySeo.value = seos.value.find((seo) => seo.url === "about_us");

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

const blocks = ref([]);
const patents = ref([]);
const teams = ref([]);

const fetchBlocks = async () => {
  try {
    const response = await axios.get(`/pages/2`);
    blocks.value = response.data.sections;
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};
const fetchPatents = async () => {
  try {
    const response = await axios.get(`/patents`);
    patents.value = response.data.data;
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};
const fetchTeams = async () => {
  try {
    const response = await axios.get(`/teams`);
    teams.value = response.data;
  } catch (error) {
    console.error('Ошибка с сервера:', error.response.data);
    console.error('Ошибка загрузки баннеров:', error);
  }
};
const handleDownload = async (fileUrl, file_name) => {
  try {
    const fileName = fileUrl.split('/').pop();
    const response = await axios.get(`/download/patents/${fileName}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file_name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Ошибка при скачивании:', error);
    alert('Ошибка при скачивании');
  }
};

onMounted(() => {
  fetchBlocks();
  fetchPatents();
  fetchTeams();
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
</script>

<template>
  <div>
    <div v-if="blocks[0]" class="about_us__header">
      <div class="about_us__header_page">
        <div class="about_us__header_info">
          <h1 class="about_us__header_title">{{ blocks[0].title }}</h1>
          <p class="about_us__header_subtitle editor__content" v-html="blocks[0].html"></p>
        </div>
        <div class="about_us__header_img">
          <NuxtImg format="webp" preload :src="blocks[0].image" alt="Header Image" />
        </div>
      </div>
    </div>
    <div class="about_us__content">
      <div
          v-for="(block, index) in blocks.slice(1)"
          :key="block.id"
          class="about_us__content_container"
      >
        <div
            v-if="index % 2 === 0"
            class="about_us__content_info"
        >
          <h2 class="main_title">{{ block.title }}</h2>
          <p class="about_us__content_text editor__content" v-html="block.html"></p>
          <a href="https://solargy.ru" target="_blank" v-if="index === 0" class="main_btn">Узнать больше</a>
        </div>
        <div
            :class="[
            'about_us__content_img',
            index % 2 === 0 ? 'order-last' : ''
          ]"
            :style="{ backgroundImage: `url('${block.image}')` }"
        ></div>
        <div
            v-if="index % 2 !== 0"
            class="about_us__content_info"
        >
          <h2 class="main_title">{{ block.title }}</h2>
          <p class="about_us__content_text editor__content" v-html="block.html"></p>
        </div>
      </div>
    </div>
    <div class="about_us__patents">
      <h2 class="main_title">Наши каталоги</h2>
      <div class="about_us__patents_items">
        <div
            v-for="(patent, index) in patents"
            :key="patent.id"
            class="about_us__patents_item"
        >
          <div class="about_us__patents_item-svg">
            <IconsPatent />
          </div>
          <div class="about_us__patents_info">
            <p class="about_us__patents_name">
              {{ patent.title }}
            </p>
            <a
                class="about_us__patents_download"
                target="_blank"
                :href="patent.file"
            >
              <p>Посмотреть</p>
              <IconsDownload />
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="about_us__team">
      <h2 class="main_title">Наша команда</h2>
      <div class="about_us__team_items">
        <div v-for="team in teams" :key="team.id" class="about_us__team_item">
          <div class="about_us__team_container">
            <NuxtImg format="webp" loading="lazy" preload class="about_us__team_img" :src="team.image" alt=""/>
            <p class="about_us__team_name">{{ team.name }}</p>
            <p class="about_us__team_subtitle">{{ team.description }}</p>
          </div>
          <div>
            <a :href="`tel:${team.phone}`" class="about_us__team_phone">{{ team.phone }}</a>
            <p class="about_us__team_email">{{ team.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>