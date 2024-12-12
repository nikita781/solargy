import { defineStore } from 'pinia';

export const useBasketStore = defineStore('basket', {
    state: () => ({
        items: [], // Список товаров в корзине
        userInfo: {
            name: '',
            phone: '',
            price: 0,
        },
    }),
    getters: {
        totalPrice: (state) =>
            state.items.reduce((total, item) => total + item.price, 0),
    },
    actions: {
        addToBasket(item) {
            const existingItem = this.items.find((i) => i.id === item.id);

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                this.items.push(item);
            }
        },
        removeItem(itemId) {
            this.items = this.items.filter((item) => item.id !== itemId); // Удаление товара
        },
        updateUserInfo(name, phone) {
            this.userInfo.name = name;
            this.userInfo.phone = phone;
        },
        updateUserInfoPrice(price) {
            this.userInfo.price = price;
        },
        updateQuantity(itemId, quantity) {
            const item = this.items.find((i) => i.id === itemId);
            item.quantity = quantity;
        },
        clearBasket() {
            this.items = [];
            this.userInfo.name = '';
            this.userInfo.phone = '';
            this.userInfo.price = 0;
        },
    },
});