// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: true,

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  css: ['~/assets/css/tokens.css', '~/assets/css/global.css'],

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      appName: 'Test Platform',
    },
  },

  nitro: {
    preset: 'vercel',
  },
})
