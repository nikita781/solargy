<script setup>
import {nextTick, onMounted} from "vue";
import axios from "axios";

const delivery = ref([]);

const fetchDelivery = async () => {
  try {
    const response = await axios.get(`/pages/3`);
    delivery.value = response.data;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

onMounted(async () => {
  await fetchDelivery();
  const script = document.createElement('script');
  script.src = 'https://api-maps.yandex.ru/2.1/?apikey=38e8671e-3c02-48e7-8432-c204818d7056&lang=ru_RU';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    ymaps.ready(init);
  };

  function init() {
    const myMap = new ymaps.Map("map", {
      center: [56.856468, 53.213258],
      zoom: 13,
      controls: []
    }, {
      suppressMapOpenBlock: true,
      yandexMapDisablePoi: true,
    });

    const myPolygon = new ymaps.Polygon(
        [
          [
            [56.835643, 53.248718],
            [56.832079, 53.206484],
            [56.837335, 53.205620],
            [56.837016, 53.201312],
            [56.843431, 53.200164],
            [56.843328, 53.197747],
            [56.844481, 53.196589],
            [56.848767, 53.197533],
            [56.849931, 53.196503],
            [56.860267, 53.194816],
            [56.861249, 53.187903],
            [56.861143, 53.183612],
            [56.866277, 53.180913],
            [56.876241, 53.179873],
            [56.876342, 53.183414],
            [56.877330, 53.184658],
            [56.881849, 53.186561],
            [56.881141, 53.193299],
            [56.876716, 53.193795],
            [56.876857, 53.199717],
            [56.875553, 53.207702],
            [56.875917, 53.222315],
            [56.864389, 53.223162],
            [56.861580, 53.221210],
            [56.861686, 53.225780],
            [56.859429, 53.237475],
            [56.846553, 53.240842],
            [56.841720, 53.239876],
            [56.835643, 53.248718],
          ]
        ],
        {
          hintContent: "Зона бесплатной доставки"
        },
        {
          fillColor: "rgba(0,165,0,0.42)",
          strokeColor: "rgba(0,205,0,0.71)",
          strokeWidth: 4,
        }
    );

    myMap.geoObjects.add(myPolygon);
  }
});
</script>

<template>
  <div class="stocks">
    <div class="stocks__main">
      <div class="stocks__main_links">
        <NuxtLink to="/" class="stocks__main_link">Главная</NuxtLink>
        <IconsSun color="#EF7F1A"/>
        <NuxtLink class="stocks__main_link stocks__main_link-active">Доставка</NuxtLink>
      </div>
      <h2 class="main_title">Доставка</h2>
      <div class="stocks__delivery">
        <div
            class="stocks__delivery_item"
            v-for="block in delivery.sections"
            :key="block.id"
        >
          <div v-html="block.html" class="editor__content"></div>
        </div>
      </div>
    </div>
    <div class="stocks__map">
      <h2 class="main_title">Зона бесплатной доставки</h2>
      <div id="map" class="stocks__map_main"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>