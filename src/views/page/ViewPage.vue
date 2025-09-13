<script setup lang="ts">
import { Page } from '../../types/Page.types.ts';
import { usePagesStore } from '../../stores/pages';
import { useRouter, useRoute } from 'vue-router'
import PageForm from '../../entities/page/PageForm.vue';
import { ref, onMounted } from 'vue'

const pagesStore = usePagesStore()

const router = useRouter()
const route = useRoute()

const page = ref<Page | null>(null)

const onSubmit = async (formData: Page) => {
  const result = await pagesStore.updatePage(formData)
  router.push({
    name: "page",
    params: {
      pageID: result?.id,
    }}
  )
}

onMounted(async () => {
  page.value = await pagesStore.getPage(route.params.pageID as string)
})
</script>

<template>
  <div
    class="grid gap-4 p-3"
  >
    <PageForm
      v-if="page"
      :page="page"
      @submit="onSubmit"
    />
  </div>
</template>