import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),

    // PrimeVue autoimport and tree shaking
    Components({
      resolvers: [
        PrimeVueResolver(),
      ],
    }),

    AutoImport({
      imports: [
        'vue',
        'pinia',
        {
          from: 'vue',
          imports: [
            'ref',
            'computed',
            'reactive',
            'onMounted',
            'onUnmounted',
            'watch',
            'watchEffect',
            'nextTick',
            'defineProps',
            'defineEmits',
            'defineExpose',
            'withDefaults',
          ],
          type: true,
        },
      ],
      dts: true, // генерация файла типов
      eslintrc: {
        enabled: true, // генерация конфига для eslint
      },
    }),

  ],

  // resolve: {
  //   alias: {
  //     vue: 'vue/dist/vue.esm-bundler.js',
  //   },
  // },
})
