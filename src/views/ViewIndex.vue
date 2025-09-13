<script setup>
import { ref, onMounted, compile } from 'vue';
import { useSitesStore } from '../stores/sites';
import SitesList from '../entities/site/SitesList.vue'
import { createApp, onUnmounted } from 'vue'

const sitesStore = useSitesStore()

const sites = ref([])

onMounted(async () => {
  const t = await sitesStore.listSites()
  sites.value = t.rows
})

const container = ref(null)
let app = null

const compileAndMount = async (template, props = {}) => {
  if (app) {
    app.unmount()
  }

  try {
    // Компиляция шаблона с помощью Vue compile функции
    const render = compile(template)

    const component = {
      // props: Object.keys(props),
      data() {
        return { ...props }
      },
      methods: {
        handleClick() {
          console.log('Button clicked!')
        },
      },
      render,
    }

    app = createApp(component, props)
    app.mount(container.value)
  } catch (error) {
    console.error('Compilation error:', error)
  }
}

onMounted(() => {
  const template = `
    <div class="card">
      <h2>{{ title }}</h2>
      <p>{{ content }}</p>
      <button @click="handleClick">Action</button>
    </div>
  `

  compileAndMount(template, {
    title: 'Динамический заголовок',
    content: 'Динамическое содержимое',
  })
})

onUnmounted(() => {
  if (app) {
    app.unmount()
  }
})
</script>

<template>
  <div class="grid gap-4 px-3">
    <SitesList :items="sites" />
    <pre>{{ sites }}</pre>

    <RouterLink to="/site/new">
      <Button
        aria-label="Search"
        rounded
        severity="secondary"
        :style="{ position: 'absolute', right: '1rem', bottom: '1rem' }"
        variant="outlined"
      >
        <img src="/ss-logo.svg"> добавить сайт
      </Button>
    </RouterLink>

    <div ref="container" />
  </div>
</template>
