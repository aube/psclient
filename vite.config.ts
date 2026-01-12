import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// export default defineConfig({
//   plugins: [
//     vue({
//       template: {
//         transformAssetUrls: false, // полностью отключаем
//         // transformAssetUrls: { img: []}, // отключаем для изображений

//       },
//     }),
//     {
//       name: 'ignore-assets',
//       resolveId(source) {
//         // Игнорируем импорты изображений
//         if (source.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
//           return { id: source, external: true }
//         }
//       },
//     },
//   ],
//   build: {
//     rollupOptions: {
//       external: [
//         /\.(png|jpg|jpeg|gif|svg|webp)$/i,
//       ],
//     },
//   },
//   // resolve: {
//   //   alias: {
//   //     vue: 'vue/dist/vue.esm-bundler.js',
//   //   },
//   // },
// })



// eslint-disable-next-line no-undef
const isProduction = process.env.NODE_ENV === 'production'

const config = {
  plugins: [
    vue({
      template: {
        transformAssetUrls: false, // полностью отключаем
        // transformAssetUrls: { img: []}, // отключаем для изображений

      },
    }),
    {
      name: 'ignore-assets',
      resolveId(source) {
        // Игнорируем импорты изображений
        if (source.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          return { id: source, external: true }
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      external: [
        /\.(png|jpg|jpeg|gif|svg|webp)$/i,
      ],
    },
  },
} as any


if (!isProduction) {
  config.server = {
    host: '0.0.0.0',
    port: 8090,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.git/**',
        '**/.nuxt/**',
        '**/.output/**',
        '**/.cache/**',
        '**/logs/**',
        '**/tmp/**',
        '**/*.log',
        '**/.pnpm-store/**'
      ]
    },
    hmr: {
      port: 24677,
    },
  }
}

export default defineConfig(config)
