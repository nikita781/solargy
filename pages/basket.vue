<script setup>
import { ref, computed, onMounted } from "vue";
import { useBasketStore } from "@/stores/basket";
import axios from "axios";
import { useAsyncData } from "#app";
import Toastify from "toastify-js";
import BasketFileUpload from "@/components/BasketFileUpload.vue";

const { data: seos, error } = await useAsyncData("fetchSeos", () =>
    axios.get(`/seos`).then((res) => res.data)
);

const deliverySeo = ref(null);

const defaultSeo = {
  title: "SOLARGY SHOP - Световые панели для вашего дома и бизнеса",
  description:
      "SOLARGY SHOP предлагает световые панели высокого качества по доступным ценам. Энергосберегающие технологии, широкий ассортимент и доставка по всей России.",
  keywords:
      "световые панели, солнечные панели, энергосбережение, купить световые панели, панели для дома, панели для бизнеса, Solargy Shop, солнечные батареи, возобновляемая энергия",
  author: "Solargy",
};

if (seos.value) {
  deliverySeo.value = seos.value.find((seo) => seo.url === "basket");

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

const basketStore = useBasketStore();
const basketItems = computed(() => basketStore.items);
const nameUser = ref("");
const phoneUser = ref("");
const emailUser = ref("");
const agreePdn = ref(false);

const attachedFiles = ref([]);

const city = ref("");
const company_name = ref("");
const object_address = ref("");
const description = ref("");
const contact_method = ref("");
const request_features = ref([]);
const isKeoOpen = ref(false);

const errors = ref({
  name: false,
  phone: false,
  email: false,
  agreePdn: false,
});

const totalBasketPrice = computed(() =>
    basketStore.items.reduce((total, item) => {
      const price = parseFloat(item.price._value || item.price);
      return total + price * item.quantity;
    }, 0)
);

function removeFromBasket(itemId) {
  basketStore.removeItem(itemId);
}

const quantityPlus = (itemId) => {
  const item = basketStore.items.find((i) => i.id === itemId);
  if (item) basketStore.updateQuantity(itemId, item.quantity + 1);
};
const quantityMinus = (itemId) => {
  const item = basketStore.items.find((i) => i.id === itemId);
  if (item && item.quantity > 1) basketStore.updateQuantity(itemId, item.quantity - 1);
};

const onInput = (event) => {
  let input = event.target.value.replace(/\D/g, "");

  if (!input.startsWith("7")) {
    input = "7" + input.slice(1);
  }

  if (input.length > 11) input = input.slice(0, 11);

  phoneUser.value = input.replace(
      /^(\d{1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/,
      (_, p1, p2, p3, p4, p5) =>
          `+${p1} ${p2 ? "(" + p2 : ""}${p3 ? ") " + p3 : ""}${p4 ? "-" + p4 : ""}${p5 ? "-" + p5 : ""}`
  );
};

const application = ref(false);
const toggleApplication = () => {
  if (basketStore.items.length === 0) return;
  basketStore.updateUserInfoPrice(totalBasketPrice.value);
  application.value = !application.value;
};

const formOpen = ref(false);
const toggleFormOpen = () => {
  errors.value.name = false;
  errors.value.phone = false;
  errors.value.email = false;
  errors.value.agreePdn = false;

  errors.value.name = !nameUser.value.trim();
  errors.value.phone = !phoneUser.value.trim();
  errors.value.email = !emailUser.value.trim();
  errors.value.agreePdn = !agreePdn.value;

  if (errors.value.name || errors.value.phone || errors.value.email || errors.value.agreePdn) {
    Toastify({
      text: "Заполните все обязательные поля и подтвердите согласие на обработку персональных данных!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#ff4545",
      stopOnFocus: true,
    }).showToast();
    return;
  }

  if (phoneUser.value.replace(/\D/g, "").length !== 11) {
    errors.value.phone = true;
    Toastify({
      text: "Неверный номер телефона!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#ff4545",
      stopOnFocus: true,
    }).showToast();
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailUser.value)) {
    errors.value.email = true;
    Toastify({
      text: "Неверный формат Email!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#ff4545",
      stopOnFocus: true,
    }).showToast();
    return;
  }

  basketStore.updateUserInfo(nameUser.value, phoneUser.value, emailUser.value);
  addOrder();
  basketStore.clearBasket();
  formOpen.value = !formOpen.value;
};

function generateSlug(name) {
  const cyrillicToLatinMap = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
    ъ: "",
    ь: "",
  };

  const transliterate = (str) => {
    return str
        .toLowerCase()
        .split("")
        .map((char) => cyrillicToLatinMap[char] || char)
        .join("");
  };

  return transliterate(name).replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();
}

const toggleKeo = () => {
  isKeoOpen.value = !isKeoOpen.value;
};

const toggleRequestFeature = (key) => {
  const idx = request_features.value.indexOf(key);
  if (idx === -1) request_features.value.push(key);
  else request_features.value.splice(idx, 1);
};

const addOrder = async () => {
  try {
    const formData = new FormData();
    formData.append("email-type", 1);
    formData.append("userInfo[0][name]", basketStore.userInfo.name);
    formData.append("userInfo[0][phone]", basketStore.userInfo.phone);
    formData.append("userInfo[0][email]", basketStore.userInfo.email || emailUser.value);
    formData.append("userInfo[0][price]", basketStore.userInfo.price);

    basketStore.items.forEach((item, index) => {
      formData.append(`items[${index}][name]`, item.name);
      formData.append(`items[${index}][photo]`, item.photo);
      formData.append(`items[${index}][price]`, item.price);
      formData.append(`items[${index}][quantity]`, item.quantity);
      formData.append(`items[${index}][url]`, item.url);
      item.options.forEach((option, optionIndex) => {
        formData.append(`items[${index}][options][${optionIndex}][name]`, option.name);
        formData.append(`items[${index}][options][${optionIndex}][values][0][value]`, option.values.value);
      });
    });

    const hasKeoData =
        city.value ||
        company_name.value ||
        object_address.value ||
        description.value ||
        request_features.value.length ||
        contact_method.value;

    if (hasKeoData) {
      formData.append("keoInfo[0][city]", city.value || "");
      formData.append("keoInfo[0][company_name]", company_name.value || "");
      formData.append("keoInfo[0][object_address]", object_address.value || "");
      formData.append("keoInfo[0][description]", description.value || "");
      formData.append("keoInfo[0][contact_method]", contact_method.value || "");

      request_features.value.forEach((feature, index) => {
        formData.append(`keoInfo[0][request_features][${index}]`, feature);
      });
    }

    attachedFiles.value.forEach((file, index) => {
      formData.append(`attachment[${index}]`, file);
    });

    await axios.post(`/order`, formData);
  } catch (error) {
    console.error("Ошибка:", error.response?.data || error);
  }
};

const servicesCategoryId = ref(null);

const servicesProducts = ref([]);
const servicesPage = ref(1);
const servicesTotalPages = ref(0);
const servicesItemsPerPage = 8;

const normalizeName = (v) => String(v ?? "").trim().toLowerCase();

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
      if (category.children && category.children.length > 0) traverse(category.children);
    });
  };
  traverse(categories);
  return result;
};

const fetchServicesCategoryId = async () => {
  try {
    const response = await axios.get("/categories");
    const flat = flattenCategoriesWithChildren(response.data);

    const services = flat.find((c) => normalizeName(c.name) === normalizeName("Услуги"));
    servicesCategoryId.value = services?.id ?? null;
  } catch (error) {
    console.error("Ошибка загрузки категорий (для услуг):", error.response?.data || error);
    servicesCategoryId.value = null;
  }
};

const fetchServicesProducts = async () => {
  try {
    if (!servicesCategoryId.value) {
      servicesProducts.value = [];
      servicesTotalPages.value = 0;
      return;
    }

    const resp = await axios.get(`/products?page=${servicesPage.value}&category=${servicesCategoryId.value}`);
    servicesTotalPages.value = resp.data.meta?.last_page || 0;
    servicesProducts.value = resp.data.data || [];
  } catch (error) {
    console.error("Ошибка загрузки услуг:", error.response?.data || error);
  }
};

const servicesPaginatedProducts = computed(() =>
    servicesProducts.value.slice(0, servicesItemsPerPage)
);

const goToServicesPage = (newPage) => {
  if (newPage >= 1 && newPage <= servicesTotalPages.value) {
    servicesPage.value = newPage;
    fetchServicesProducts();
  }
};

const servicesPagesInRange = computed(() => {
  const range = [];
  const start = Math.max(2, servicesPage.value - 4);
  const end = Math.min(servicesTotalPages.value - 1, servicesPage.value + 4);

  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

const findImage = (photos) => {
  if (photos?.length) {
    const image = photos.find((item) => item.type === "image" || item.type === null);
    return image ? image.photo : "/S.png";
  }
  return "/S.png";
};

onMounted(async () => {
  await fetchServicesCategoryId();
  await fetchServicesProducts();
});
</script>

<template>
  <div>
    <div class="basket" v-if="!formOpen">
      <div class="card__main_links basket__links" v-if="application">
        <NuxtLink @click="application = false" class="card__main_link" style="cursor: pointer">
          Корзина
        </NuxtLink>
        <IconsSun color="#EF7F1A" />
        <NuxtLink class="card__main_link card__main_link-active">Оформление заявки</NuxtLink>
      </div>

      <h2 class="main_title">{{ application ? "Оформление заявки" : "Корзина" }}</h2>

      <div class="basket__container">
        <div class="basket__content">
          <div class="basket__form-cont" v-if="application">
            <p class="basket__form_title">Покупатель</p>

            <div class="basket__form-container">
              <div class="basket__form_input-cont">
                <p class="basket__form_input-title">Ваше имя <span>*</span></p>
                <input
                    type="text"
                    :class="{ error: errors.name }"
                    class="basket__form_input"
                    v-model="nameUser"
                    placeholder="Введите ФИО"
                />
              </div>

              <div class="basket__form_content">
                <div class="basket__form_input-cont">
                  <p class="basket__form_input-title">Ваше Email <span>*</span></p>
                  <input
                      type="email"
                      class="basket__form_input"
                      :class="{ error: errors.email }"
                      v-model="emailUser"
                      placeholder="Введите Email"
                  />
                </div>

                <div class="basket__form_input-cont">
                  <p class="basket__form_input-title">Ваш телефон <span>*</span></p>
                  <input
                      type="text"
                      :class="{ error: errors.phone }"
                      @input="onInput"
                      class="basket__form_input"
                      v-model="phoneUser"
                      placeholder="Введите номер телефона"
                  />
                </div>
              </div>

              <div class="basket__form_checkbox">
                <input type="checkbox" v-model="agreePdn" :class="{ error: errors.agreePdn }" />
                <div>
                  <p>
                    Я соглашаюсь на
                    <a
                        href="/Политика_в_отношении_обработки_персональных_данных.docx"
                        target="_blank"
                        rel="noopener"
                    >
                      обработку персональных данных
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div
                class="basket__form_subtitle"
                :class="{ 'basket__form_subtitle--open': isKeoOpen }"
                @click="toggleKeo"
            >
              Дополнительная информация о проекте
              <IconsArrow color="#171717" />
            </div>

            <div class="basket__form-container" v-show="isKeoOpen">
              <div class="basket__form_input-cont">
                <p class="basket__form_input-title">Город</p>
                <input type="text" class="basket__form_input" v-model="city" placeholder="Введите название города" />
              </div>

              <div class="basket__form_input-cont">
                <p class="basket__form_input-title">Наименование организации</p>
                <input
                    type="text"
                    class="basket__form_input"
                    v-model="company_name"
                    placeholder="Введите ООО организации"
                />
              </div>

              <div class="basket__form_input-cont">
                <p class="basket__form_input-title">Адрес местоположения объекта</p>
                <input type="text" class="basket__form_input" v-model="object_address" placeholder="Введите адрес" />
              </div>

              <div class="basket__form_input-cont">
                <p class="basket__form_input-title">Выберите способ связи</p>
                <div class="basket__form_radio-cont-4">
                  <div class="basket__form_radio-item" :class="{ active: contact_method === 'telegram' }" @click="contact_method = 'telegram'">
                    Telegram
                  </div>
                  <div class="basket__form_radio-item" :class="{ active: contact_method === 'whatsapp' }" @click="contact_method = 'whatsapp'">
                    WhatsApp
                  </div>
                  <div class="basket__form_radio-item" :class="{ active: contact_method === 'phone' }" @click="contact_method = 'phone'">
                    Звонок
                  </div>
                  <div class="basket__form_radio-item" :class="{ active: contact_method === 'email' }" @click="contact_method = 'email'">
                    Email
                  </div>
                </div>
              </div>

              <div class="basket__form_input-cont">
                <p class="basket__form_input-title">Выберите особенности запроса</p>
                <div class="basket__form_radio-cont-2">
                  <div class="basket__form_radio-item" :class="{ active: request_features.includes('before_expertise') }" @click="toggleRequestFeature('before_expertise')">
                    Перед сдачей в экспертизу
                  </div>
                  <div class="basket__form_radio-item" :class="{ active: request_features.includes('after_expertise') }" @click="toggleRequestFeature('after_expertise')">
                    Проект после экспертизы
                  </div>
                  <div class="basket__form_radio-item" :class="{ active: request_features.includes('keo_calc') }" @click="toggleRequestFeature('keo_calc')">
                    Расчет КЕО
                  </div>
                  <div class="basket__form_radio-item" :class="{ active: request_features.includes('system_selection') }" @click="toggleRequestFeature('system_selection')">
                    Подбор системы
                  </div>
                </div>
              </div>

              <div class="basket__form_input-cont">
                <p class="basket__form_input-title">Описание</p>
                <textarea class="basket__form_input basket__form_textarea" v-model="description" placeholder="Опишите, что необходимо выполнить"></textarea>
              </div>

              <div class="basket__form_input-cont">
                <p class="basket__form_input-title">Прикрепленные файлы</p>
                <BasketFileUpload v-model:files="attachedFiles" />
              </div>
            </div>
          </div>

          <p class="basket__items-title" v-if="application">Список товаров</p>

          <div class="basket__items" v-if="basketItems.length > 0">
            <div class="basket__item" v-for="(item, index) in basketItems" :key="index">
              <div class="basket__item_content">
                <div class="basket__item_characteristic-phone">
                  <div v-for="(option, index) in item.options" :key="index">
                    <p class="basket__item_inf">{{ option.name }}: <span>{{ option.values.value }}</span></p>
                  </div>
                </div>

                <NuxtImg format="webp" preload :src="item.photo" alt="" />

                <div class="basket__item_info">
                  <p class="basket__item_title">{{ item.name }}</p>
                  <div class="basket__item_characteristic">
                    <div v-for="(option, index) in item.options" :key="index">
                      <p class="basket__item_inf">{{ option.name }}: <span>{{ option.values.value }}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="basket__item_cont">
                <div class="card__main_final-cont" v-if="!application">
                  <div class="card__main_final-btn card__main_final-btn-left" @click="quantityMinus(item.id)">
                    <IconsMinus :color="item.quantity === 1 ? '#cccccc' : '#EF7F1A'" />
                  </div>
                  <div class="card__main_final-quantity">{{ item.quantity }}</div>
                  <div class="card__main_final-btn card__main_final-btn-right" @click="quantityPlus(item.id)">
                    <IconsPlus color="#EF7F1A" />
                  </div>
                </div>

                <p class="basket__item_price">{{ item.price * item.quantity }} ₽</p>
                <IconsTrash v-if="!application" class="basket__item_trash" @click="removeFromBasket(item.id)" />
              </div>
            </div>
          </div>

          <div class="basket__empty" v-if="!application && basketItems.length === 0">
            <p>Ваша корзина пуста. Добавьте товары, чтобы продолжить покупки.</p>
          </div>
        </div>

        <div class="basket__button-container">
          <div class="basket__button-cont">
            <div class="basket__title-cont">
              <p class="basket__title">Итого</p>
              <p class="basket__title">{{ totalBasketPrice }} ₽</p>
            </div>
            <button v-if="!application" class="main_btn basket__button" @click="toggleApplication">
              Перейти к оформлению
            </button>
            <button v-if="application" class="main_btn basket__button" @click="toggleFormOpen">
              Оформить заявку
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="basket__successfully" v-if="formOpen">
      <IconsSunSuccessfully />
      <p class="basket__successfully_title">Ваша заявка принята!</p>
      <p class="basket__successfully_subtitle">
        Скоро с вами свяжется наш менеджер для уточнения<br />деталей заявки
      </p>
      <NuxtLink to="/" class="main_btn basket__successfully_btn">На главную</NuxtLink>
    </div>

    <div class="card__product__cont" v-if="!application && servicesCategoryId">
      <div class="card__product" style="padding-top: unset">
        <div class="card__product__header">
          <h2 class="main_title">Дополнительные услуги</h2>
        </div>

        <div class="catalog__product">
          <div class="best-product__items">
            <div
                class="best-product__item"
                v-for="product in servicesPaginatedProducts"
                :key="product.id"
            >
              <NuxtLink
                  :to="`/card/${product.id}-${generateSlug(product.name)}/`"
                  v-if="product?.photos?.length"
              >
                <NuxtImg
                    format="webp"
                    preload
                    loading="lazy"
                    class="best-product__item_img"
                    :src="findImage(product.photos)"
                    alt=""
                />
                <p class="best-product__item_top" v-if="product?.is_top">Хит</p>
              </NuxtLink>

              <NuxtLink
                  :to="`/card/${product.id}-${generateSlug(product.name)}/`"
                  v-else
              >
                <NuxtImg
                    format="webp"
                    preload
                    loading="lazy"
                    class="best-product__item_img contain"
                    src="/S.png"
                    alt=""
                />
                <p class="best-product__item_top" v-if="product?.is_top">Хит</p>
              </NuxtLink>

              <div class="best-product__item_content">
                <NuxtLink
                    :to="`/card/${product.id}-${generateSlug(product.name)}/`"
                    class="best-product__item_title"
                >
                  {{ product.name }}
                </NuxtLink>
                <p class="best-product__item_desc">{{ product.description }}</p>
              </div>

              <div class="best-product__item_container">
                <p class="best-product__item_price">От {{ product.price }} ₽</p>
                <NuxtLink
                    class="best-product__item_btn"
                    :to="`/card/${product.id}-${generateSlug(product.name)}/`"
                >
                  Посмотреть
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination" v-if="servicesTotalPages > 1">
          <button
              class="arrow-left"
              @click="goToServicesPage(servicesPage - 1)"
              :disabled="servicesPage === 1"
          ></button>

          <span
              class="pagination__number"
              :class="{ active: servicesPage === 1 }"
              @click="goToServicesPage(1)"
          >
            1
          </span>

          <span v-if="servicesPage > 6">...</span>

          <span
              v-for="pageNum in servicesPagesInRange"
              :key="pageNum"
              class="pagination__number"
              :class="{ active: pageNum === servicesPage }"
              @click="goToServicesPage(pageNum)"
          >
            {{ pageNum }}
          </span>

          <span v-if="servicesPage < servicesTotalPages - 5">...</span>

          <span
              class="pagination__number"
              :class="{ active: servicesPage === servicesTotalPages }"
              @click="goToServicesPage(servicesTotalPages)"
          >
            {{ servicesTotalPages }}
          </span>

          <button
              class="arrow-right"
              @click="goToServicesPage(servicesPage + 1)"
              :disabled="servicesPage === servicesTotalPages"
          ></button>
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

.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
  align-items: center;

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
      content: "";
      position: absolute;
      width: 3px;
      height: 100%;
      background-color: #ef7f1a;
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
      content: "";
      position: absolute;
      width: 3px;
      height: 100%;
      background-color: #ef7f1a;
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
    color: #9b9b9b;

    @media screen and (max-width: $small) {
      font-size: 16px;
    }

    &.active {
      color: #ef7f1a;
    }
  }
}
</style>
