
<template>
  <div
    id="com-navbar"
    class="card"
  >
    <Menubar :model="items">
      <template #start>
        <RouterLink to="/">
          <svg
            class="mr-3 logo"
            fill="none"
            height="32"
            viewBox="0 0 33 32"
            width="33"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.882 24.213q-1.673 0-2.574-.772-.869-.772-.869-1.737 0-.836.612-1.448.61-.61 1.801-.61.418 0 .965.096l.869.096q-.032-.836-.386-1.576-.322-.74-.837-1.415-.514-.708-.965-1.223-.997 1.898-1.994 3.153-.965 1.254-2.123 2.38-.58.58-1.223.58-.514 0-.836-.355Q0 20.996 0 20.45q0-.643.45-1.19l.419-.515q1.769-2.187 2.67-3.602.547-.933 1.287-2.477.74-1.577 1.447-3.25Q6.884 8 8.814 8q.901 0 1.255.161.354.16.354.515 0 .193-.129.61-.128.42-.354.837-.579 1.158-.579 1.963 0 .482.322 1.061.354.58 1.062 1.448 1.029 1.35 1.544 2.316.546.933.546 2.059 0 .321-.064.9 1.576-.61 3.7-3.249.386-.45.868-.45.418 0 .643.386.258.386.258 1.062 0 1.222-.611 1.994-1.609 1.994-3.089 2.734-1.447.708-3.602.772-1.287 1.094-3.056 1.094z"
              fill="#0b74ce"
              style="stroke-width:.446786"
            />
            <path
              d="M21.641 24.213q-1.673 0-2.573-.772-.869-.772-.869-1.737 0-.836.611-1.448.612-.61 1.802-.61.418 0 .965.096l.868.096q-.032-.836-.386-1.576-.321-.74-.836-1.415-.515-.708-.965-1.223-.997 1.898-1.994 3.153-.966 1.254-2.124 2.38-.579.58-1.222.58-.515 0-.836-.355-.322-.386-.322-.933 0-.643.45-1.19l.418-.515q1.77-2.187 2.67-3.602.547-.933 1.287-2.477.74-1.577 1.448-3.25Q20.644 8 22.574 8q.9 0 1.255.161.354.16.354.515 0 .193-.13.61-.128.42-.353.837-.579 1.158-.579 1.963 0 .482.322 1.061.354.58 1.061 1.448 1.03 1.35 1.544 2.316.547.933.547 2.059 0 .321-.064.9 1.576-.61 3.7-3.249.385-.45.868-.45.418 0 .643.386.258.386.258 1.062 0 1.222-.612 1.994-1.608 1.995-3.088 2.734-1.447.708-3.603.772-1.287 1.094-3.056 1.094z"
              fill="#0093e9"
              style="stroke-width:.446786"
            />
          </svg>
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

<style>
/* #com-navbar .logo path{
  fill: var(--p-primary-active-color)!important;
}
#com-navbar .logo path+path{
  fill: var(--p-primary-color)!important;
} */

#com-navbar {
  .p-menubar-item-link.active {
    color: var(--p-button-link-color)
  }
}
</style>