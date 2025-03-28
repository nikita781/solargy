<script setup>
import {Swiper, SwiperSlide} from "swiper/vue";
import {Mousewheel, Navigation, Pagination} from "swiper";
import {useRoute, useRouter} from 'vue-router';
import {ref, reactive, onMounted, nextTick, computed} from "vue";
import 'swiper/css';
import axios from "axios";
import {useBasketStore} from '@/stores/basket';
import {useAsyncData} from '#app';

const route = useRoute();
const router = useRouter();
const productId = ref();

const productIdURL = route.params.productId;
if (!productIdURL) {
  await router.push('/');
} else {
  productId.value = productIdURL.match(/^\d+/)?.[0] || null;
}

const defaultSeo = {
  title: "SOLARGY SHOP - Световые панели для вашего дома и бизнеса",
  description: "SOLARGY SHOP предлагает световые панели высокого качества по доступным ценам. Энергосберегающие технологии, широкий ассортимент и доставка по всей России.",
  keywords: "световые панели, солнечные панели, энергосбережение, купить световые панели, панели для дома, панели для бизнеса, Solargy Shop, солнечные батареи, возобновляемая энергия",
  author: "Solargy"
};

const {data: seos, error} = await useAsyncData("fetchSeos", async () => {
  if (!productId.value) return null;
  try {
    const response = await axios.get(`/products/${productId.value}`);
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
    title: deliverySeo.name || defaultSeo.title,
    meta: [
      {name: "description", content: deliverySeo.description || defaultSeo.description},
      {name: "keywords", content: deliverySeo.keywords || defaultSeo.keywords},
      {name: "author", content: deliverySeo.author || defaultSeo.author},
    ],
  };
});

const basketStore = useBasketStore();
const basketItems = computed(() => basketStore.items);
const existingItem = ref([]);

const findItemInBasket = (product, selectedOptions) => {
  return basketItems.value.find((basketItem) => {
    if (basketItem.name !== product.name) return false;

    if (basketItem.options.length !== Object.values(selectedOptions).length) return false;

    return basketItem.options.every((opt, index) => {
      return opt.values.value === Object.values(selectedOptions)[index].values.value;
    });
  });
};

const product = ref([]);
const category = ref([]);
const products = ref([]);
const selectedOptions = ref({});

const fetchProduct = async () => {
  try {
    const response = await axios.get(`/products/${productId.value}`);
    product.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки продукта:', error.response?.data || error);
  }
};
const fetchCategory = async () => {
  try {
    const response = await axios.get(`/categories/${product.value.category_id}`);
    category.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки продукта:', error.response?.data || error);
  }
};
const recommendation = ref(null);
const property = ref(null);

const fetchProducts = async () => {
  try {
    const response = await axios.get(`/products`);
    products.value = response.data.data;

    for (const product of products.value) {
      recommendation.value = product.properties.find(
          (property) => property.title === "recommendation"
      );
      if (recommendation.value) {
        break;
      }
    }
    for (const product of products.value) {
      property.value = product.properties.find(
          (property) => property.title === "property"
      );
      if (property.value) {
        break;
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки продукта:', error.response?.data || error);
  }
};

const swiperRight = ref(null);
const swiperLeft = ref(null);

const menuVisible = ref(false);
const currentSelect = ref(null);
const currentIndex = ref(null);
const currentSelectedId = ref(null);

const openMenu = async (select, index) => {
  currentSelect.value = select;
  currentIndex.value = index;

  // Проверяем, есть ли уже выбранный элемент. Если нет, устанавливаем текущий выбранный элемент
  if (!currentSelectedId.value || currentSelect.value.id !== select.id) {
    currentSelectedId.value = select.values[0].id;
  }

  // Если в меню только один элемент, просто выходим
  if (select.values.length <= 1) {
    return;
  }

  // Делаем меню видимым
  menuVisible.value = true;
  await nextTick();

  // Добавляем CSS-класс с небольшой задержкой
  setTimeout(() => {
    const menu = document.querySelector(".slide-out-menu");
    if (menu) {
      menu.classList.add("visible");
    }
  }, 10);
};

const closeMenu = () => {
  const menu = document.querySelector(".slide-out-menu");
  if (menu) {
    menu.classList.remove("visible");

    setTimeout(() => {
      menuVisible.value = false;
      currentSelect.value = null;
      currentIndex.value = null;
    }, 300);
  }
};

const selectItem = (item) => {
  const optionIndex = product.value.options.findIndex(
      (option) => option.id === currentSelect.value.id
  );

  if (optionIndex >= 0) {
    selectedOptions.value[product.value.options[currentIndex.value].id] = {
      name: product.value.options[currentIndex.value].name,
      values: item,
    };
  }

  currentSelectedId.value = item.id;

  existingItem.value = findItemInBasket(product.value, selectedOptions.value);

  quantity.value = 1;

  closeMenu();
};

const getSelectedValue = (select) => {
  const selectedOption = selectedOptions.value[select.id];
  if (selectedOption) {
    return selectedOption.values;
  }
  return select.values[0]; // Фоллбэк, если ничего не выбрано
};

const quantity = ref(1);
const quantityPlus = () => {
  quantity.value++;
}
const quantityMinus = () => {
  if (quantity.value === 1) {
    return;
  }
  quantity.value--;
}

const quantityPlusBasket = (itemId) => {
  const item = basketStore.items.find((i) => i.id === itemId);
  if (item) {
    basketStore.updateQuantity(itemId, item.quantity + 1);
  }
}
const quantityMinusBasket = (itemId) => {
  const item = basketStore.items.find((i) => i.id === itemId);
  if (item && item.quantity > 1) {
    basketStore.updateQuantity(itemId, item.quantity - 1);
  }
}

const selectedSlide = ref(null);

const swiperConfig = reactive({
  modules: [Navigation, Pagination, Mousewheel],
  spaceBetween: 16,
  slidesPerView: 4,
  slidesPerGroup: 1,
  speed: 500,
  loop: true,
  watchSlidesProgress: true,
  direction: "vertical",
  mousewheel: {
    forceToAxis: true,
    sensitivity: 1,
  },
  navigation: {
    nextEl: '.card__main_swiper-bottom',
    prevEl: '.card__main_swiper-top',
  },
});

const tabs = [
  {title: 'Характеристики'},
  {title: 'Требования и рекомендации к монтажу'},
];

const imgs = ref([]);

const activeTab = ref(0);

const setActiveTab = (index) => {
  activeTab.value = index;
};

const tabsRef = ref([]);
const sliderStyle = computed(() => {
  if (tabsRef.value.length === 0 || activeTab.value === null) return {};

  const activeTabElement = tabsRef.value[activeTab.value];
  const left = activeTabElement?.offsetLeft || 0;
  const width = activeTabElement?.offsetWidth || 0;

  return {
    left: `${left}px`,
    width: `${width}px`,
  };
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

const addToBasket = () => {
  const basketItem = {
    id: basketStore.items.length + 1,
    name: product.value.name,
    photo: product.value.photos[0].photo,
    price: totalPrice,
    url: window.location.href,
    options: Object.values(selectedOptions.value),
    quantity: quantity.value,
  };
  basketStore.addToBasket(basketItem);
  existingItem.value = findItemInBasket(product.value, selectedOptions.value);
  window.location.reload();
};

watch(() => route.fullPath, async () => {
  const productIdURL = route.params.productId;
  productId.value = productIdURL.match(/^\d+/)?.[0] || null;
  await fetchProduct();
  await fetchCategory();
  await fetchProducts();
  imgs.value = [];
  imgs.value = (product.value?.photos || [])
      .filter(item => item.type !== 'video')
      .map(item => item.photo);
  selectedSlide.value = product.value?.photos[0];
  selectedOptions.value = {};
  product.value.options.forEach((option) => {
    selectedOptions.value[option.id] = {
      name: option.name,
      values: option.values[0],
    };
  });
  existingItem.value = findItemInBasket(product.value, selectedOptions.value);
  await nextTick();
  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });
});

watch(() => menuVisible.value, () => {
  const container = document.querySelector('.container');
  if (container && menuVisible.value === true) {
    setTimeout(() => {
      container.addEventListener('click', closeMenu);
    }, 0);
  } else if (container && menuVisible.value === false) {
    container.removeEventListener('click', closeMenu);
  }
});

onMounted(async () => {
  const productIdURL = route.params.productId;
  if (!productIdURL) {
    await router.push('/');
  } else {
    productId.value = productIdURL.match(/^\d+/)?.[0] || null;
  }
  await fetchProduct();
  await fetchCategory();
  await fetchProducts();
  imgs.value = [];
  imgs.value = (product.value?.photos || [])
      .filter(item => item.type !== 'video')
      .map(item => item.photo);
  selectedSlide.value = product.value?.photos[0];
  selectedOptions.value = {};
  product.value.options.forEach((option) => {
    selectedOptions.value[option.id] = {
      name: option.name,
      values: option.values[0],
    };
  });
  existingItem.value = findItemInBasket(product.value, selectedOptions.value);
  await nextTick();
  await nextTick(() => {
    tabsRef.value = document.querySelectorAll('.card__tabs_item');
  });
});

const photosNoVideo = computed(() => {
  // Если product.value или product.value.photos ещё не доступны,
  // подставляем пустой массив, иначе фильтруем
  return (product.value?.photos || []).filter(item => item.type !== 'video');
});

watch(() => product.value, () => {
  // Обновляем imgs
  imgs.value = photosNoVideo.value.map(photo => photo.photo);
}, { immediate: true });

const indexRef = ref(0);
const selectSlide = (slide, index) => {
  selectedSlide.value = slide;
  // Если это фото (image), то найдём индекс в photosNoVideo
    // Смотрим, где он лежит в «безвидео» массивах
    const idx = photosNoVideo.value.findIndex(item => item.id === slide.id);
    if (idx !== -1) {
      indexRef.value = idx;
    }

    // Если хотим сразу открыть лайтбокс:
    // visibleRef.value = true;
    // но если у вас логика открытия другая — оставьте как есть.
};

const totalPrice = computed(() => {
  // Базовая цена товара
  let basePrice = parseFloat(product.value?.price || 0);

  // Если нет опций или нет вовсе option_prices — вернём базовую цену
  if (!product.value?.options?.length) {
    // При желании можно дописать логику, которая всё равно добавит цену опций.
    return basePrice;
  }

  // Массив выбранных опций вида [{ optionId, value }, ...]
  const selectedOptionsArray = Object.keys(selectedOptions.value).map(optionId => ({
    optionId,
    value: selectedOptions.value[optionId]?.values?.value || null,
  }));

  // Структура для хранения «лучшего совпадения»
  let bestMatch = {
    size: 0,                      // Число совпавших (option_id, value)
    price: basePrice,            // Какая цена у этого bestMatch
    matchedPairs: [],            // Какие пары option_id::value попали в это совпадение
  };

  // Перебираем все возможные варианты цен из option_prices
  product.value.option_prices.forEach(optionPrice => {
    const details = optionPrice.options_details; // массив [{option_id, value}, ...]

    // Проверяем, все ли пары в `details` присутствуют в выбранных пользователем
    const isSubset = details.every(detail =>
        selectedOptionsArray.some(sel =>
            sel.optionId == detail.option_id && sel.value == detail.value
        )
    );

    if (isSubset) {
      // Подсчитываем, сколько всего пар совпало
      const matchedCount = details.length;
      // Если это совпадение больше, чем текущее «лучшее» — обновляем
      if (matchedCount > bestMatch.size) {
        bestMatch.size = matchedCount;
        bestMatch.price = parseFloat(optionPrice.price);
        // Сохраняем конкретные (option_id, value), чтобы потом знать, какие остались «свободные»
        bestMatch.matchedPairs = details.map(
            d => `${d.option_id}::${d.value}`
        );
      } else if (matchedCount === bestMatch.size) {
        // Если нужно логику для «ничья»:
        // выбираем, например, ту, у которой цена выше
        const newPrice = parseFloat(optionPrice.price);
        if (newPrice > bestMatch.price) {
          bestMatch.price = newPrice;
          bestMatch.matchedPairs = details.map(
              d => `${d.option_id}::${d.value}`
          );
        }
        // Или можно ничего не делать, если нам важен первый найденный
      }
    }
  });

  // После этого в bestMatch лежит «лучшая» (самая полная) подстановка
  // Если ничего не подошло (size=0), значит будем просто складывать «базовую + все опции»,
  // но логика ниже это тоже учтёт, т.к. price в этом случае = basePrice

  // Сюда суммируем цены от опций, которые не вошли в bestMatch
  let priceFromUnmatchedOptions = 0;

  // Проходимся по всем выбранным опциям
  selectedOptionsArray.forEach(selected => {
    const pairId = `${selected.optionId}::${selected.value}`;

    // Если эта пара не была учтена в bestMatch (не совпала),
    // значит нам нужно к цене bestMatch (или basePrice) прибавить цену конкретной опции.
    if (!bestMatch.matchedPairs.includes(pairId)) {
      // Ищем саму опцию в product.options, чтобы узнать её цену
      const option = product.value.options.find(
          opt => opt.id == selected.optionId
      );
      if (option) {
        // Ищем выбранное значение
        const selectedValue = option.values.find(
            val => val.value == selected.value
        );
        if (selectedValue && selectedValue.price) {
          priceFromUnmatchedOptions += parseFloat(selectedValue.price);
        }
      }
    }
  });

  // Итоговая цена: цена «лучшего совпадения» + цены оставшихся опций
  return bestMatch.price + priceFromUnmatchedOptions;
});

const visibleRef = ref(false);
const showImg = (idx) => {
  visibleRef.value = true;
};
const onHide = () => (visibleRef.value = false);

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

const handleDownload = async (fileUrl, file_name) => {
  try {
    const fileName = fileUrl.split('/').pop();

    const response = await axios.get(`/download/fileLibrary/${fileName}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {type: response.headers['content-type']});
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

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function getContentWithoutTables(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('table').forEach((table) => table.remove());

  return doc.body.innerHTML;
}

function toggleTab(title) {
  switch (title) {
    case 'property':
      return 'Характеристики'
    case 'description':
      return 'Описание'
    case 'photo':
      return 'Фото товара'
    case 'instruction':
      return 'Инструкции'
    case 'recommendation':
      return 'Рекомендации'
    case 'guaranty':
      return 'Гарантии'
  }
}

// Функция для получения только таблиц
function getTables(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const tables = Array.from(doc.querySelectorAll('table'));
  return tables.map((table) => table.outerHTML).join('');
}

function removeFromBasket(itemId) {
  basketStore.removeItem(itemId);
  existingItem.value = findItemInBasket(product.value, selectedOptions.value);
  quantity.value = 1;
}

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

function getVkEmbedLink(url) {
  // Пытаемся найти в ссылке шаблон 'video-<oid>_<id>'
  const match = url.match(/video\-([\-0-9]+)\_([0-9]+)/);
  if (!match) {
    // Если не нашли, возвращаем исходную ссылку или подставляем fallback
    return url;
  }
  // match[1] = -224743475, match[2] = 456239218
  const oid = match[1];
  const id = match[2];
  // Собираем формат, который нужен для iframe
  return `https://vkvideo.ru/video_ext.php?oid=-${oid}&id=${id}&hd=1`;
}
</script>

<template>
  <div class="card">
    <div class="card__main">
      <div class="card__main_links">
        <NuxtLink to="/catalog" class="card__main_link">Каталог</NuxtLink>
        <IconsSun/>
        <NuxtLink v-if="category && category.name" :to="`/catalog/${category?.id}-${generateSlug(category?.name)}/`"
                  class="card__main_link">
          {{ capitalize(category.name) }}
        </NuxtLink>
        <IconsSun color="#EF7F1A"/>
        <NuxtLink class="card__main_link card__main_link-active">{{ capitalize(product.name) }}</NuxtLink>
      </div>
      <div class="card__main_content">
        <div class="card__main_gallery">
          <div class="card__main_swiper">
            <div ref="swiperLeft">
              <IconsArrow class="card__main_swiper-top" color="#EF7F1A"/>
            </div>
            <client-only>
              <Swiper v-bind="swiperConfig" v-if="product.photos">
                <SwiperSlide
                    v-for="(slide, index) in product.photos"
                    :key="index"
                    v-if="selectedSlide"
                >
                  <div
                      class="swiper__slide"
                      @click="selectSlide(slide, index)"
                      :class="{ active: slide.id === selectedSlide.id }"
                  >
                    <!-- Если это изображение -->
                    <template v-if="slide.type === 'image' || slide.type === null">
                      <div
                          class="swiper__slide-img"
                          :style="{ backgroundImage: `url(${slide.photo})` }"
                      ></div>
                    </template>

                    <!-- Если это видео -->
                    <template v-else-if="slide.type === 'video'">
                      <!-- Тут ставьте превью, которое хотите:
                           либо своя картинка, либо первый кадр, если есть ссылка -->
                      <img src="/play.png" alt="Video preview" class="swiper__slide-video" />
                    </template>
                  </div>
                </SwiperSlide>
              </Swiper>
            </client-only>
            <div ref="swiperRight">
              <IconsArrow class="card__main_swiper-bottom" color="#EF7F1A"/>
            </div>
          </div>
          <div class="card__main_img" v-if="selectedSlide">
            <!-- Если тип = image, оставляем как раньше -->
            <template v-if="selectedSlide.type === 'image' || selectedSlide.type === null">
              <NuxtImg
                  format="webp"
                  preload
                  class="card__main_img-pict"
                  :src="selectedSlide?.photo"
                  alt="Selected Image"
                  @click="() => showImg(indexRef.value)"
              />
            </template>

            <!-- Если тип = video, выводим iframe ВК-плеера -->
            <template v-else-if="selectedSlide.type === 'video'">
              <div class="card__main_img-pict">
                <!-- Тут нужно корректно получить embed-ссылку.
                     Для демонстрации просто ставлю :src="selectedSlide.photo".
                     Но на практике, возможно, придётся подменить 'video-' на 'video_embed-'
                     или вообще использовать https://vk.com/video_ext.php?...
                     Всё зависит от реальной схемы встраивания.
                -->
                <iframe
                    width="100%"
                    height="100%"
                    :src="getVkEmbedLink(selectedSlide.photo)"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
                    frameborder="0"
                    allowfullscreen
                ></iframe>
              </div>
            </template>
            <VueEasyLightbox
                :visible="visibleRef"
                :imgs="imgs"
                :index="indexRef"
                @hide="onHide"
                class="card__main_img-full"
            />
          </div>
          <div class="card__main_img" v-else>
            <NuxtImg format="webp" preload class="card__main_img-pict-default" src="/S.png" alt="Selected Image"/>
          </div>
        </div>
        <div class="card__main_info">
          <div>
            <h1 class="card__main_title">{{ product.name }}</h1>
            <p class="card__main_price">{{ totalPrice }} ₽</p>
          </div>
          <p class="card__main_description">{{ product.description }}</p>
          <div class="card__main_select-cont">
            <div
                v-for="(select, index) in product.options"
                :key="select.id"
            >
              <div class="card__main_select" @click="openMenu(select, index)">
                <p class="card__main_select-title">{{ select.name }}</p>
                <div class="card__main_select-item">
                  <div class="card__main_select-name">
                    <NuxtImg
                        format="webp"
                        preload
                        v-if="getSelectedValue(select)?.image"
                        :src="getSelectedValue(select)?.image"
                        alt=""
                    />
                    <p>{{ getSelectedValue(select)?.value }}</p>
                  </div>
                  <div class="card__main_select-btn">
                    <p
                        class="card__main_select-btn-text"
                        :class="{ active: select.values.length > 1 }"
                    >
                      Другие варианты
                    </p>
                    <IconsPlus :color="select.values.length > 1 ? '#EF7F1A' : '#cccccc'"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="menuVisible" class="slide-out-menu">
            <div class="menu-header">
              <h3>{{ currentSelect?.name }}</h3>
              <IconsCross @click="closeMenu"/>
            </div>
            <ul>
              <li
                  v-for="item in currentSelect?.values"
                  :key="item.id"
                  :class="{ active: item.id === currentSelectedId }"
                  @click="selectItem(item)"
              >
                <NuxtImg format="webp" loading="lazy" preload v-if="item.image" :src="item.image" alt=""/>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </div>
          <div class="card__main_final">
            <div v-if="!existingItem" class="card__main_final-cont">
              <div class="card__main_final-btn card__main_final-btn-left" @click="quantityMinus">
                <IconsMinus :color='quantity === 1 ? "#cccccc" : "#EF7F1A"'/>
              </div>
              <div class="card__main_final-quantity">{{ quantity }}</div>
              <div class="card__main_final-btn card__main_final-btn-right" @click="quantityPlus">
                <IconsPlus color="#EF7F1A"/>
              </div>
            </div>
            <div v-else class="card__main_final-cont">
              <div class="card__main_final-btn card__main_final-btn-left" @click="quantityMinusBasket(existingItem.id)">
                <IconsMinus :color='existingItem.quantity === 1 ? "#cccccc" : "#EF7F1A"'/>
              </div>
              <div class="card__main_final-quantity">{{ existingItem.quantity }}</div>
              <div class="card__main_final-btn card__main_final-btn-right" @click="quantityPlusBasket(existingItem.id)">
                <IconsPlus color="#EF7F1A"/>
              </div>
            </div>
            <NuxtLink v-if="!existingItem" class="main_btn" @click="addToBasket">Добавить в корзину</NuxtLink>
            <NuxtLink v-else class="card__main_final-button">
              <p>В корзине</p>
              <IconsCross color="#fff" @click="removeFromBasket(existingItem.id)"/>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    <div
        class="card__tabs"
        v-if="product?.properties?.[0]"
    >
      <div class="card__tabs_cont">
        <p
            v-for="(property, index) in product?.properties || []"
            :key="index"
            class="card__tabs_item"
            :class="{ active: activeTab === index }"
            @click="setActiveTab(index)"
        >
          {{ toggleTab(property.title) }}
        </p>
        <div
            class="slider"
            :style="sliderStyle"
        ></div>
      </div>
      <div class="card__tabs_content">
        <div
            v-for="(property, index) in product.properties"
            :key="index"
            class="card__tabs_info"
        >
          <div class="card__tabs_container" v-if="activeTab === index">
            <div
                class="editor__content"
                v-html="property.html"
                @click="handleImageClickHtml"
            ></div>
            <VueEasyLightbox
                :visible="visibleRefHtml"
                :imgs="imgsHtml"
                :index="indexRefHtml"
                @hide="onHideHtml"
                class="card__main_img-full"
            />
            <div class="card__tabs_container-files">
              <a
                  v-if="property.files"
                  v-for="file in property.files"
                  @click.prevent="handleDownload(file.file, file.filename)"
                  download
                  class="card__tabs_file_link main_btn"
              >
                <div class="card__tabs_file_link">
                  <IconsDownload color="#fff"/>
                </div>
                {{ file.filename }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card__product__cont" v-if="product.related_products">
      <div class="card__product" v-if="product.related_products.length > 0">
        <div class="card__product__header">
          <h2 class="main_title">Сопутствующие товары</h2>
        </div>
        <div class="best-product__items">
          <div
              class="best-product__item"
              v-for="(product, index) in product.related_products"
              :key="index"
          >
            <a
                :href="`/card/${product.id}-${generateSlug(product.name)}/`"
                v-if="product?.photo"
            >
              <NuxtImg format="webp" loading="lazy" preload class="best-product__item_img"
                       :src="product?.photo"
                       alt=""/>
            </a>
            <a
                :href="`/card/${product.id}-${generateSlug(product.name)}/`"
                v-else
            >
              <NuxtImg format="webp" loading="lazy" preload class="best-product__item_img" src="/S.png" alt=""/>
            </a>
            <div class="best-product__item_content">
              <a :href="`/card/${product.id}-${generateSlug(product.name)}/`"
                 class="best-product__item_title">{{ product.name }}</a>
              <p class="best-product__item_desc">{{ product.description }}</p>
            </div>
            <div class="best-product__item_container">
              <p class="best-product__item_price">от {{ product?.price }} ₽</p>
              <a
                  class="best-product__item_btn"
                  :href="`/card/${product.id}-${generateSlug(product.name)}/`"
              >
                Посмотреть
              </a>
            </div>
          </div>
        </div>
      </div>
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
.vel-img {
  object-fit: contain;
}

.swiper {
  margin-top: unset;
  width: 100%;
  height: 400px;
  @media screen and (max-width: $x-small) {
    height: 240px;
  }

  &-slide {
    width: 86px;
    height: 88px;
    cursor: pointer;
    @media screen and (max-width: $x-small) {
      width: 46px;
      height: 48px;
    }
  }

  &__slide {
    height: calc(100% - 2px);
    width: calc(100% - 2px);
    cursor: pointer;

    &.active {
      border: 1px solid #EF7F1A;
    }
    &-img {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
    &-video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

.slide-out-menu {
  position: fixed;
  top: 0;
  right: 0;
  max-width: 550px;
  width: calc(100% - 160px);
  height: calc(100% - 80px);
  background-color: #fff;
  border-left: 1px solid #ccc;
  padding: 40px 80px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;

  overflow-y: auto;

  @media screen and (max-width: $x-small) {
    padding: 30px;
    width: calc(100% - 60px);
    height: calc(100% - 60px);
  }

  &.visible {
    transform: translateX(0);
    opacity: 1;
  }

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 60px;
    padding-bottom: 20px;
    border-bottom: 1px solid #cccccc;
    @media screen and (max-width: $small) {
      margin-bottom: 20px;
    }

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

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;

    li {
      padding: 10px;
      cursor: pointer;
      height: 48px;
      display: flex;
      align-items: center;
      transition: background-color 0.3s;
      border: 1px solid #cccccc;
      border-radius: 8px;
      @media screen and (max-width: $small) {
        height: 30px;
      }

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        border: 1px solid #EF7F1A;
      }

      img {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        margin-right: 12px;
        object-fit: cover;
      }

      span {
        font-size: 18px;
        line-height: 18px;
        letter-spacing: 1px;
      }
    }
  }
}
</style>
