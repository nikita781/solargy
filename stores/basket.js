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
            state.items.reduce(
                (total, item) => total + parseFloat(item.price) * item.quantity,
                0
            ),
    },
    actions: {
        // Инициализация корзины из localStorage при загрузке
        loadBasketFromStorage() {
            if (process.client) {
                const storedItems = localStorage.getItem('basketItems');
                if (storedItems) {
                    this.items = JSON.parse(storedItems);
                }
            }
        },

        // Сохранение корзины в localStorage
        saveBasketToStorage() {
            localStorage.setItem('basketItems', JSON.stringify(this.items));
        },

        // Добавление товара в корзину
        addToBasket(item) {
            const existingItem = this.items.find((i) => {
                if (i.name !== item.name) return false;

                return (
                    i.options.length === item.options.length &&
                    i.options.every((opt, index) => {
                        const matchingOption = item.options[index];
                        return opt.values.value === matchingOption.values.value;
                    })
                );
            });

            if (existingItem) {
                // Если товар с такими же параметрами уже есть, увеличиваем количество
                existingItem.quantity += item.quantity;
            } else {
                // Если товара нет, добавляем его в корзину
                this.items.push(item);
            }

            // Обновляем localStorage
            this.saveBasketToStorage();
        },

        // Удаление товара из корзины
        removeItem(itemId) {
            this.items = this.items.filter((item) => item.id !== itemId);

            // Обновляем localStorage
            this.saveBasketToStorage();
        },

        // Обновление количества товара
        updateQuantity(itemId, quantity) {
            const item = this.items.find((i) => i.id === itemId);
            if (item) {
                item.quantity = quantity;
            }

            // Обновляем localStorage
            this.saveBasketToStorage();
        },
        updateUserInfo(name, phone) {
            this.userInfo.name = name;
            this.userInfo.phone = phone;
        },
        updateUserInfoPrice(price) {
            this.userInfo.price = price;
        },
        // Очистка корзины
        clearBasket() {
            this.items = [];
            this.userInfo.name = '';
            this.userInfo.phone = '';
            this.userInfo.price = 0;

            // Обновляем localStorage
            this.saveBasketToStorage();
        },
    },
});
