<script setup>
import {ref} from "vue";

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

const application = ref(false);
const toggleApplication = () => {
  application.value = !application.value;
}

const formOpen = ref(false);
const toggleFormOpen = () => {
  formOpen.value = !formOpen.value;
}

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
        <div class="basket__items" v-if="!application">
          <div class="basket__item">
            <div class="basket__item_content">
              <img src="/a64845b2ddf97aa28ae693147c1cb957_1.jpg" alt="">
              <div class="basket__item_info">
                <p class="basket__item_title">Грунтовый Solargy SW F</p>
                <div class="basket__item_characteristic">
                  <p class="basket__item_inf">Место установки световода: <span>В грунт</span></p>
                  <p class="basket__item_inf">Диаметр световода: <span>250 мм</span></p>
                  <p class="basket__item_inf">Цвет световода: <span>250 мм</span></p>
                </div>
              </div>
            </div>
            <div class="card__main_final-cont">
              <div class="card__main_final-btn" @click="quantityMinus">
                <IconsMinus :color='quantity === 1 ? "#cccccc" : "#EF7F1A"'/>
              </div>
              <div class="card__main_final-quantity">{{ quantity }}</div>
              <div class="card__main_final-btn" @click="quantityPlus">
                <IconsPlus color="#EF7F1A"/>
              </div>
            </div>
            <p class="basket__item_price">50 800 ₽</p>
            <IconsTrash/>
          </div>
        </div>
        <div class="basket__form-cont" v-if="application">
          <p class="basket__form_title">Покупатель</p>
          <div class="basket__form_content">
            <div class="basket__form_input-cont">
              <p class="basket__form_input-title">Ваше имя <span>*</span></p>
              <input type="text" class="basket__form_input" placeholder="Введите ФИО">
            </div>
            <div class="basket__form_input-cont">
              <p class="basket__form_input-title">Ваш телефон <span>*</span></p>
              <input type="text" class="basket__form_input" placeholder="Введите номер телефона">
            </div>
          </div>
        </div>
        <div class="basket__button-cont">
          <div class="basket__title-cont">
            <p class="basket__title">Итого</p>
            <p class="basket__title">50 800 ₽</p>
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
      <div class="card__product__items">
        <div
            class="card__product__item"
            v-for="(product, index) in bestProduct"
            :key="index"
        >
          <img class="card__product__item_img" :src="product.image" alt="">
          <div class="card__product__item_content">
            <p class="card__product__item_title">{{ product.title }}</p>
            <p class="card__product__item_desc">{{ product.description }}</p>
          </div>
          <div class="card__product__item_container">
            <p class="card__product__item_price">{{ product.price }}</p>
            <NuxtLink to="/card" class="card__product__item_btn">Заказать</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>