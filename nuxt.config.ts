// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    'nuxt-swiper',
    "@qirolab/nuxt-sanctum-authentication",
    '@pinia/nuxt',
    'nuxt-easy-lightbox',
  ],
  laravelSanctum: {
    apiUrl: "https://api.solargy.shop/",
  },
  app: {
    head: {
      title: 'SOLARGY SHOP - Световые панели для вашего дома и бизнеса',
      meta: [
        { name: 'description', content: 'SOLARGY SHOP предлагает световые панели высокого качества по доступным ценам. Энергосберегающие технологии, широкий ассортимент и доставка по всей России.' },
        { name: 'keywords', content: 'световые панели, солнечные панели, энергосбережение, купить световые панели, панели для дома, панели для бизнеса, Solargy Shop, солнечные батареи, возобновляемая энергия' },
        { name: 'author', content: 'Solargy' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/main_logo.png' },
      ],
      htmlAttrs: {
        lang: 'ru',
      },
    },
  },
})