export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  ssr: false,

  devtools: {
    enabled: true,
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  css: [
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      title: 'RWorkCentral HRIS',

      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
        },

        // RWorkCentral favicon
        {
          rel: 'icon',
          type: 'image/png',
          href: '/icon.png',
        },
        {
          rel: 'shortcut icon',
          type: 'image/png',
          href: '/icon.png',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000/api',
    },
  },
})
