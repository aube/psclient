<script setup lang="ts">
import { PageNew } from '../../types/Page.types.ts';
import { usePagesStore } from '../../stores/pages';
import { useRouter } from 'vue-router'
import PageNewForm from '../../entities/page/PageNewForm.vue';

const pagesStore = usePagesStore()

const router = useRouter()

const onSubmit = async (formData: PageNew) => {
  const result = await pagesStore.createPage(formData)
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
    <PageNewForm
      :page="{}"
      @submit="onSubmit"
    />
  </div>
</template>