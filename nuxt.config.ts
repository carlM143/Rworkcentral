export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  ssr: false,

  devtools: {
    enabled: false,
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  imports: {
    dirs: [
      'composables/**',
    ],
  },

  css: [
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      title: 'RWorkCentral HRIS',
      meta: [
        { name: 'theme-color', content: '#062f6c' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'RWorkCentral' },
      ],

      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/app-icon-192.png' },
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
