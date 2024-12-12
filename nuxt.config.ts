// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['nuxt-swiper', "@qirolab/nuxt-sanctum-authentication", '@pinia/nuxt'],
  laravelSanctum: {
    apiUrl: "http://127.0.0.1:8000/",
  },
})