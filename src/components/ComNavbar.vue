<script setup>

import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router"

import {
  updatePrimaryPalette,
  palette,
} from '@primeuix/themes';

const route = useRoute()
const router = useRouter()

const menu = [
  {
    label: 'Pages',
    icon: 'pi pi-sitemap',
    link: "",
  },
  {
    label: 'Users',
    icon: 'pi pi-user',
    link: "users",
  },
  {
    label: 'Images',
    icon: 'pi pi-image',
    link: "images",
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    link: "settings",
  },
]


const items = computed(() => {
  if (!route.params.siteName) {
    return []
  }
  const linkPrefixe = "/site/" + route.params.siteName
  return menu.map(item => {
    const link = item.link ? "/" + item.link : ""
    return {
      ...item,
      active: route.fullPath === linkPrefixe + link,
      command: () => router.push(linkPrefixe + link),
    }
  })
})


function darkToggle(e) {
  const html = document.body.parentNode
  const isDark = html.className === "p-dark"

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

const rightButtons = ref([
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

</script>

<template>
  <div
    id="com-navbar"
    class="card"
  >
    <Menubar :model="items">
      <template #start>
        <RouterLink to="/">
          <ComLogo />
        </RouterLink>
      </template>
      <template
        #item="{
          item,
          props,
          hasSubmenu,
          root
        }"
      >
        <a
          class="flex items-center"
          v-bind="props.action"
          :class="item.active ? 'active': ''"
        >
          <span
            v-if="item.icon"
            :class="item.icon"
          />
          <span>{{ item.label }}</span>
          <Badge
            v-if="item.badge"
            :class="{ 'ml-auto': !root, 'ml-2': root }"
            :value="item.badge"
          />
          <span
            v-if="item.shortcut"
            class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"
          >{{ item.shortcut }}</span>
          <i
            v-if="hasSubmenu"
            :class="['pi pi-angle-down ml-auto', { 'pi-angle-down': root, 'pi-angle-right': !root }]"
          />
        </a>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <InputText
            class="w-32 sm:w-auto"
            placeholder="Search"
            type="text"
          />
          <Button
            v-for="btn, idx in rightButtons"
            :key="idx"
            :aria-label="btn.ariaLabel"
            :icon="btn.icon"
            :rounded="btn.rounded"
            :severity="btn.severity"
            @click="btn.click"
          />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<style>
#com-navbar {
  .p-menubar-item-link.active {
    color: var(--p-button-link-color);
    font-weight: 500;
  }
}
</style>