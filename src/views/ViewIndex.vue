<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSitesStore } from '../stores/sites';
import { useGeneralStore } from '../stores/general'
import {
  updatePrimaryPalette,
  palette,
} from '@primeuix/themes';

import SitesList from '../entities/site/SitesList.vue'

const generalStore = useGeneralStore()
const sitesStore = useSitesStore()

const sites = ref([])

function darkToggle(e: any) {
  const html = document.body.parentNode as any
  const isDark = html?.className === "p-dark"

  e.target.className = e.target.className.replace(
    isDark ? "pi-sun" : "pi-moon",
    isDark ? "pi-moon" : "pi-sun",
  )

  html.className = isDark ? "" : "p-dark"
}

const getNextColorPalette = (() => {

  // https://primevue.org/theming/styled/#Palette

  const colors = ['{red}', '#696969', '{yellow}', '{indigo}', '#10b981', '{gray}']
  let c = 'red'
  return function() {
    const idx = colors.findIndex(i => i === c)
    c = colors[idx + 1] || colors[0]
    return palette(c);
  }
})()

// change current theme to next
const paletteToggle = () => {
  const values = getNextColorPalette();
  updatePrimaryPalette(values);
}

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
    click: () => router.push('/profile'),
  },
])

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
