export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['nuxt-swiper', "@qirolab/nuxt-sanctum-authentication", '@pinia/nuxt', 'nuxt-easy-lightbox', '@nuxt/image'],
  laravelSanctum: {
    apiUrl: "https://api.solargy.shop/",
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'image', content: '/main_logo.png' },
        { charset: 'utf-8' },
        { name: 'robots', content: 'index, follow' },
        { name: 'yandex-verification', content: '1d8d495fcc235e22' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/main_logo.png' },
        { rel: 'preconnect', href: 'https://api.solargy.shop' },
        { rel: 'preconnect', href: 'https://api.solargy.shop', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://api.solargy.shop' },
        { rel: 'dns-prefetch', href: 'https://mc.yandex.ru' },
      ],
      htmlAttrs: {
        lang: 'ru',
      },
    },
  },
})