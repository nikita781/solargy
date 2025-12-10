<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  label: {
    type: String,
    default: 'Скидка, %'
  },
  required: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Array,
    default: () => [5, 10, 15, 20, 25, 30]
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const value = computed({
  get() {
    return props.modelValue ?? '';
  },
  set(v) {
    // Можно оставить как строку, если хочешь — тут я мягко привожу к числу
    const num = v === '' ? '' : Number(v);
    emit('update:modelValue', isNaN(num) ? v : num);
  }
});

const onFocus = () => {
  isOpen.value = true;
};

const onBlur = () => {
  // Даём время mousedown по кнопкам, чтобы клик не потерялся
  setTimeout(() => {
    isOpen.value = false;
  }, 150);
};

const selectDiscount = (val) => {
  value.value = val;
  isOpen.value = false;
};
</script>

<template>
  <div class="form_input-cont discount">
    <p class="form_input-title">
      {{ label }}
      <span v-if="required">*</span>
    </p>

    <div class="discount__wrapper">
      <input
          type="number"
          min="0"
          max="100"
          step="1"
          class="form_input"
          :class="{ error: !!error }"
          v-model="value"
          @focus="onFocus"
          @blur="onBlur"
          placeholder="Введите скидку"
      />
      <span class="discount__suffix">%</span>

      <transition name="fade-down">
        <div
            v-if="isOpen"
            class="discount__dropdown"
        >
          <button
              v-for="item in popular"
              :key="item"
              type="button"
              class="discount__item"
              @mousedown.prevent="selectDiscount(item)"
          >
            {{ item }} %
          </button>
        </div>
      </transition>
    </div>

    <p v-if="error" class="discount__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
/* базовый инпут — по сути твой &_input */

.form_input {
  height: 40px;
  padding: 0 40px 0 16px; // добавил место под значок %
  outline: none;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #9b9b9b;
  border: 1px solid #f5f5f5;
  width: calc(100% - 56px);
  font-size: 14px;

  &:focus {
    border: 1px solid #ef7f1a;
    color: #171717;
  }

  &.error {
    border: 1px solid red;
    background-color: #feefec;

    &::placeholder {
      color: red;
      opacity: 1;
    }
  }
}

.form_input-cont {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form_input-title {
  font-size: 18px;
  line-height: 18px;
  color: #171717;
  letter-spacing: 1px;

  span {
    color: red;
  }
}

/* обёртка скидочного инпута */

.discount {
  position: relative;

  &__wrapper {
    position: relative;
  }

  &__suffix {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #9b9b9b;
    pointer-events: none;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    padding: 8px;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    z-index: 10;

    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__item {
    flex: 0 0 calc(25% - 6px); // 4 в ряд
    padding: 6px 10px;
    border-radius: 999px;
    border: none;
    background: #f5f5f5;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    color: #171717;
    transition: 0.15s ease;

    &:hover {
      background: #ef7f1a;
      color: #ffffff;
    }
  }

  &__error {
    font-size: 12px;
    color: red;
  }
}

/* простая анимация раскрытия */

.fade-down-enter-active,
.fade-down-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
