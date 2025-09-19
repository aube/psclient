<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSitesStore } from '../stores/sites';
import { useGeneralStore } from '../stores/general'
import { darkToggle, paletteToggle } from '../lib'

import SitesList from '../entities/site/SitesList.vue'

const generalStore = useGeneralStore()
const sitesStore = useSitesStore()

const router = useRouter()

const sites = ref([])

function setButtons() {
  generalStore.setActionButtons([
    {
      ariaLabel: "Light mode",
      icon: "pi pi-moon",
      rounded: true,
      severity: "secondary",
      click: darkToggle,
    },
    {
      ariaLabel: "Palette togle",
      icon: "pi pi-palette",
      rounded: true,
      severity: "secondary",
      click: paletteToggle,
    },
    {
      ariaLabel: "Profile",
      icon: "pi pi-user",
      rounded: true,
      severity: "secondary",
      click: () => router.push({ name:'profile' }),
    },
  ])
}

onMounted(async () => {
  const t = await sitesStore.listSites()
  sites.value = t.rows
  setButtons()
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
