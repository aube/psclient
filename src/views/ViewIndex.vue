<script setup>
import { ref, onMounted, compile } from 'vue';
import { createApp, onUnmounted } from 'vue'
import { usePagesStore } from '../stores/pages'


const pagesStore = usePagesStore()
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
  // const template = `
  //   <div class="card">
  //     <h2>{{ title }}</h2>
  //     <p>{{ content }}</p>
  //     <button @click="handleClick">Action</button>
  //   </div>
  //   <img src="/upload" alt="upload"/>
  // `

  // compileAndMount(template, {
  //   title: 'Динамический заголовок',
  //   content: 'Динамическое содержимое',
  // })
})

onUnmounted(() => {
  if (app) {
    app.unmount()
  }
})
</script>

<template>
  <div class="grid gap-4 px-3">
    <!-- <div ref="container" /> -->

    <br>
    <br>
    <RouterLink to="/">
      index
    </RouterLink>
    <br>
    <br>
    <RouterLink to="/qweq">
      qweq
    </RouterLink>
    <br>
    <br>
    <RouterLink to="/qweq2">
      qweq2
    </RouterLink>

    <div
      v-if="pagesStore.current.html"
      v-html="pagesStore.current.html"
    />
  </div>
</template>
