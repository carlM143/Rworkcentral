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

  typescript: {
    // nuxt.config.ts runs in Node: include @types/node so `process.env` type-checks
    // (the generated .nuxt/tsconfig.node.json otherwise sets "types": []).
    nodeTsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
  },

  imports: {
    dirs: [
      'composables/**',
    ],
  },

  css: [
    '~/assets/css/main.css',
  ],

  vite: {
    build: {
      // The largest chunk is ExcelJS (~930 kB). It is already code-split with
      // `await import('exceljs')` (utils/reportExport.ts, DatabaseAttendanceReport.vue),
      // so it only downloads when an admin exports to Excel — never on page load.
      // Every other chunk is under 400 kB; keep warning for anything bigger than ExcelJS.
      chunkSizeWarningLimit: 1000,
      rolldownOptions: {
        checks: {
          // Informational only ("build spent X% inside plugin hooks"): the time is
          // Nuxt's own CSS/auto-import/Vue transforms, nothing in our code to fix.
          pluginTimings: false,
        },
      },
    },
  },

  app: {
    head: {
      title: 'RWorkCentral HRIS',
      meta: [
        { name: 'theme-color', content: '#062f6c' },
        { name: 'mobile-web-app-capable', content: 'yes' },
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
      // Set NUXT_PUBLIC_API_BASE in .env (local) or .env.production (live build).
      // Falls back to the local Laravel server.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
    },
  },
})