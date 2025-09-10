<script setup>
import { ref, onMounted } from 'vue';

import EntSitesList from '../entities/site/EntSitesList.vue'

import { useSitesStore } from '../stores/sites';
import { useNotificationStore } from '../stores/notification'
const { listSites } = useSitesStore(useNotificationStore())

const sites = ref([])

onMounted(async () => {
  const t = await listSites()
  sites.value = t.rows
})

</script>


<template>
  <div
    id="view-index"
    class="grid gap-4"
  >
    <EntSitesList :items="sites" />

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
  </div>
</template>

<style>
#view-index {
  .p-panel-content {
    padding-bottom: 0px;
  }
}
</style>