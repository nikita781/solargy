<script setup lang="ts">
const cookieKey = "cookie_consent"

const consent = useCookie<boolean>(cookieKey, {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
  path: "/",
  decode: (v) => v === "1" || v === "true",
  encode: (v) => (v ? "1" : "0"),
})

const isVisible = computed(() => !consent.value)

function accept() {
  consent.value = true
}
</script>

<template>
  <Transition name="cookie-slide">
    <section v-if="isVisible" class="cookie" aria-live="polite">
      <div class="cookie__inner">
        <p class="cookie__text">
          Наш сайт использует cookie-файлы и обрабатывает персональные данные с использованием Яндекс Метрики.
          Это улучшает работу сайта и взаимодействие с ним.
          Подтвердите ваше согласие, нажав кнопку ОК.
          <a
              href="/Политика_в_отношении_обработки_персональных_данных.docx"
              target="_blank"
              rel="noopener"
              class="cookie__link"
          >
            Условия политики
          </a>.
        </p>

        <button class="cookie__btn" type="button" @click="accept">ОК</button>
      </div>
    </section>
  </Transition>
</template>

<style scoped lang="scss">
.cookie {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;

  z-index: 9999;
  background: #f2f2f2;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.12);

  padding-bottom: env(safe-area-inset-bottom);
}

.cookie__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 16px;

  display: flex;
  align-items: center;
  gap: 12px;
}

.cookie__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.35;
  color: #333;
  flex: 1;
}

.cookie__link {
  color: #111;
  text-decoration: underline;
}

.cookie__btn {
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  cursor: pointer;

  background: #EF7F1A;
  color: #fff;
  font-weight: 600;
}

.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.cookie-slide-enter-from,
.cookie-slide-leave-to {
  transform: translateY(16px);
  opacity: 0;
}

@media (max-width: 520px) {
  .cookie__inner {
    flex-direction: column;
    align-items: stretch;
  }
  .cookie__btn {
    width: 100%;
  }
}
</style>
