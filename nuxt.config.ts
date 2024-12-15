// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['nuxt-swiper', "@qirolab/nuxt-sanctum-authentication", '@pinia/nuxt'],
  laravelSanctum: {
    apiUrl: "http://127.0.0.1:8000/",
  },
  app: {
    head: {
      title: 'SOLARGY SHOP',
      meta: [
        { name: 'description', content: 'Описание вашего сайта для поисковых систем.' },
        { name: 'keywords', content: 'ключевые слова, SEO, nuxt, сайт' },
        { name: 'author', content: 'Ваше имя или название компании' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      htmlAttrs: {
        lang: 'ru', // Измените на нужный язык
      },
    },
  },
})