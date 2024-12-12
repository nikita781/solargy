<script setup>
import {ref, computed} from "vue";
import { useBasketStore } from "@/stores/basket";
import axios from "axios";

const basketStore = useBasketStore();
const basketItems = computed(() => basketStore.items);
const nameUser = ref("");
const phoneUser = ref("");

const totalBasketPrice = computed(() =>
    basketStore.items.reduce((total, item) => total + item.price * item.quantity, 0)
);

function removeFromBasket(itemId) {
  basketStore.removeItem(itemId);
}

const quantityPlus = (itemId) => {
  const item = basketStore.items.find((i) => i.id === itemId);
  if (item) {
    basketStore.updateQuantity(itemId, item.quantity + 1);
  }
};
const quantityMinus = (itemId) => {
  const item = basketStore.items.find((i) => i.id === itemId);
  if (item && item.quantity > 1) {
    basketStore.updateQuantity(itemId, item.quantity - 1);
  }
};

const application = ref(false);
const toggleApplication = () => {
  if (basketStore.items.length === 0) {
    return;
  }
  basketStore.updateUserInfoPrice(totalBasketPrice.value);
  application.value = !application.value;
}

const formOpen = ref(false);
const toggleFormOpen = () => {
  if (!nameUser.value.trim() || !phoneUser.value.trim()) {
    return;
  }
  basketStore.updateUserInfo(nameUser.value, phoneUser.value);
  addOrder();
  console.log(basketStore.items);
  basketStore.clearBasket();
  formOpen.value = !formOpen.value;
}

const addOrder = async () => {
  try {
    const formData = new FormData();
    formData.append('userinfo[0][name]', basketStore.userInfo.name);
    formData.append('userinfo[0][phone]', basketStore.userInfo.phone);
    formData.append('userinfo[0][price]', basketStore.userInfo.price);
    formData.append('items', basketStore.items);

    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}: ${value}`);
    // }

    const response = await axios.post(`/order`, formData);
    console.log(response)
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};

const bestProduct = ref([
  {
    id: 1,
    image: '/75236749dd72ea0afb0b2d94972f703a.jpg',
    title: 'Услуга 1',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье',
    price: 'От 50 500 ₽'
  },
  {
    id: 2,
    image: '/0d4f7e87c393a27afa380d0092b07450.jpg',
    title: 'Услуга 2',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье',
    price: 'От 50 500 ₽'
  },
  {
    id: 3,
    image: '/65ec75eead25e6cc3f7647d5f4185a3b.png',
    title: 'Услуга 3',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье',
    price: 'От 50 500 ₽'
  },
  {
    id: 4,
    image: '/8d330c37e0c0e33514c7dcfe99ca661c.jpg',
    title: 'Услуга 4',
    description: 'Встраиваемый световод в стену. Тоннель дневного света имеет круглое и квадратное светоприемное устье',
    price: 'От 50 500 ₽'
  },
])
</script>

<template>
  <div>
    <div class="basket" v-if="!formOpen">
      <h2 class="main_title">Корзина</h2>
      <div class="basket__container">
        <div class="basket__items" v-if="!application && basketItems.length > 0">
          <div
              class="basket__item"
              v-for="(item, index) in basketItems"
              :key="index"
          >
            <div class="basket__item_content">
              <img :src="item.photo" alt="">
              <div class="basket__item_info">
                <p class="basket__item_title">{{ item.name }}</p>
                <div class="basket__item_characteristic">
                  <div v-for="(option, index) in item.options" :key="index">
                    <p class="basket__item_inf">
                      {{ option.name }}: <span>{{ option.value.value }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="basket__item_cont">
              <div class="card__main_final-cont">
                <div
                    class="card__main_final-btn"
                    @click="quantityMinus(item.id)"
                >
                  <IconsMinus :color="item.quantity === 1 ? '#cccccc' : '#EF7F1A'"/>
                </div>
                <div class="card__main_final-quantity">{{ item.quantity }}</div>
                <div
                    class="card__main_final-btn"
                    @click="quantityPlus(item.id)"
                >
                  <IconsPlus color="#EF7F1A"/>
                </div>
              </div>
              <p class="basket__item_price">{{ item.price * item.quantity }} ₽</p>
              <IconsTrash @click="removeFromBasket(item.id)" />
            </div>
          </div>
        </div>
        <div class="basket__empty" v-if="!application && basketItems.length === 0">
          <p>Ваша корзина пуста. Добавьте товары, чтобы продолжить покупки.</p>
        </div>
        <div class="basket__form-cont" v-if="application">
          <p class="basket__form_title">Покупатель</p>
          <div class="basket__form_content">
            <div class="basket__form_input-cont">
              <p class="basket__form_input-title">Ваше имя <span>*</span></p>
              <input type="text" class="basket__form_input" v-model="nameUser" placeholder="Введите ФИО">
            </div>
            <div class="basket__form_input-cont">
              <p class="basket__form_input-title">Ваш телефон <span>*</span></p>
              <input type="text" class="basket__form_input" v-model="phoneUser" placeholder="Введите номер телефона">
            </div>
          </div>
        </div>
        <div class="basket__button-cont">
          <div class="basket__title-cont">
            <p class="basket__title">Итого</p>
            <p class="basket__title">{{totalBasketPrice}} ₽</p>
          </div>
          <button v-if="!application" class="main_btn basket__button" @click="toggleApplication">Перейти к оформлению</button>
          <button v-if="application" class="main_btn basket__button" @click="toggleFormOpen">Оформить заявку</button>
        </div>
      </div>
    </div>
    <div class="basket__successfully" v-if="formOpen">
      <IconsSunSuccessfully/>
      <p class="basket__successfully_title">Ваша заявка принята!</p>
      <p class="basket__successfully_subtitle">Скоро с вами свяжется наш менеджер для уточнения<br>деталей заявки</p>
      <NuxtLink to="/" class="main_btn basket__successfully_btn">На главную</NuxtLink>
    </div>
    <div class="card__product" style="padding-top: unset" v-if="!application">
      <div class="card__product__header">
        <h2 class="main_title">Дополнительные услуги</h2>
      </div>
      <div class="best-product__items">
        <div
            class="best-product__item"
            v-for="(product, index) in bestProduct"
            :key="index"
        >
          <img class="best-product__item_img" :src="product.image" alt="">
          <div class="best-product__item_content">
            <p class="best-product__item_title">{{ product.title }}</p>
            <p class="best-product__item_desc">{{ product.description }}</p>
          </div>
          <div class="best-product__item_container">
            <p class="best-product__item_price">{{ product.price }}</p>
            <NuxtLink to="/card" class="best-product__item_btn">Заказать</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>