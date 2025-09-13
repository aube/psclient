<script setup lang="ts">
import { Page } from '../../types/Page.types.ts';
import { usePagesStore } from '../../stores/pages';
import { useRouter, useRoute } from 'vue-router'
import PageForm from '../../entities/page/PageForm.vue';

const pagesStore = usePagesStore()

const router = useRouter()
const route = useRoute()

const page = await pagesStore.getPage(route.params.pageID as string)

const onSubmit = async (formData: Page) => {
  const result = await pagesStore.updatePage(formData)
  router.push({
    name: "page",
    params: {
      pageID: result?.id,
    }}
  )
}
</script>

<template>
  <div
    class="grid gap-4 p-3"
  >
    <PageForm
      :page="page"
      @submit="onSubmit"
    />
  </div>
</template>