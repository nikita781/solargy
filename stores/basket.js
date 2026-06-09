import { defineStore } from 'pinia';

export const useBasketStore = defineStore('basket', {
    state: () => ({
        items: [],
        userInfo: {
            name: '',
            phone: '',
            price: 0,
            email: '',
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
        loadBasketFromStorage() {
            if (process.client) {
                const storedItems = localStorage.getItem('basketItems');
                if (storedItems) {
                    this.items = JSON.parse(storedItems);
                }
            }
        },

        saveBasketToStorage() {
            localStorage.setItem('basketItems', JSON.stringify(this.items));
        },

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
                existingItem.quantity += item.quantity;
            } else {
                this.items.push(item);
            }

            this.saveBasketToStorage();
        },

        removeItem(itemId) {
            this.items = this.items.filter((item) => item.id !== itemId);

            this.saveBasketToStorage();
        },

        updateQuantity(itemId, quantity) {
            const item = this.items.find((i) => i.id === itemId);
            if (item) {
                item.quantity = quantity;
            }

            this.saveBasketToStorage();
        },
        updateUserInfo(name, phone, email) {
            this.userInfo.name = name;
            this.userInfo.phone = phone;
            this.userInfo.email = email;
        },
        updateUserInfoPrice(price) {
            this.userInfo.price = price;
        },
        clearBasket() {
            this.items = [];
            this.userInfo.name = '';
            this.userInfo.phone = '';
            this.userInfo.price = 0;

            this.saveBasketToStorage();
        },
    },
});
