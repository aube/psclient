<script setup lang="ts">
import { usePagesStore } from '../../stores/pages';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useGeneralStore } from '../../stores/general'

import PagesList from '../../entities/page/PagesList.vue';

const generalStore = useGeneralStore()
const pagesStore = usePagesStore()

const route = useRoute()
const router = useRouter()

const pages = ref()
const pagination = ref()

const fetchPages = async () => {
  await pagesStore.fetchPages(Number(route.params.parentID));
  pages.value = pagesStore.pages;
  pagination.value = pagesStore.pagination;
}

function setButtons() {
  generalStore.setActionButtons([
    {
      ariaLabel: "Add page",
      label: "Add page",
      icon: "pi pi-plus",
      severity: "primary",
      click: () => router.push(
        { name:'pageNew', params: { parentID: route.params.parentID }}
      ),
    },
  ])
}

onMounted(async () => {
  fetchPages()
  setButtons()
})

onUnmounted(() => {
  generalStore.setActionButtons([])
})

watch(() => route.params.parentID, () => {
  fetchPages()
})


</script>

<template>
  <div
    class="p-3"
  >
    <PagesList
      v-if="pages"
      :items="pages"
      :pagination="pagination"
    />
  </div>
  <RouterLink :to="{name:'pageNew', params: {parentID: route.params.parentID}}">
    <Button
      aria-label="Search"
      rounded
      severity="secondary"
      :style="{ position: 'absolute', right: '1rem', bottom: '1rem' }"
      variant="outlined"
    >
      <img src="/ss-logo.svg"> добавить страницу
    </Button>
  </RouterLink>
</template>

