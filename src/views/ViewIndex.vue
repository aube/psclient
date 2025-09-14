<script setup>
import { ref, onMounted } from 'vue';
import { useSitesStore } from '../stores/sites';
import SitesList from '../entities/site/SitesList.vue'

const sitesStore = useSitesStore()

const sites = ref([])

onMounted(async () => {
  const t = await sitesStore.listSites()
  sites.value = t.rows
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
