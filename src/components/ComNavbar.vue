
<template>
  <div class="card">
    <Menubar :model="items">
      <template #start>
        <svg
          class="h-8 w-8"
          fill="none"
          height="32"
          viewBox="0 0 33 32"
          width="33"
          xmlns="http://www.w3.org/2000/svg"
        ><path
          d="M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z"
          fill="var(--p-primary-color)"
        /></svg>

        <svg
          class="h-8"
          fill="none"
          height="40"
          viewBox="0 0 35 40"
          width="35"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
            fill="var(--p-primary-color)"
          />
          <path
            d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
            fill="var(--p-text-color)"
          />
        </svg>
      </template>
      <template #item="{ item, props, hasSubmenu, root }">
        <a
          class="flex items-center"
          v-bind="props.action"
        >
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
            aria-label="Light mode"
            icon="pi pi-moon"
            rounded
            severity="secondary"
            @click="darkToggle"
          />
          <Button
            aria-label="Palette togle"
            icon="pi pi-palette"
            rounded
            severity="secondary"
            @click="paletteToggle"
          />
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script setup>

import { ref } from "vue";
import { useRouter } from "vue-router"

import {
  updatePrimaryPalette,
  palette,
} from '@primeuix/themes';


const router = useRouter()

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => router.push("/"),
  },
  {
    label: 'Login',
    icon: 'pi pi-user',
    command: () => router.push("/login"),
  },
  {
    label: 'Register',
    icon: 'pi pi-user',
    command: () => router.push("/register"),
  },
  {
    label: 'Page',
    icon: 'pi pi-user',
    command: () => router.push("/page"),
  },
  {
    label: 'Pages',
    icon: 'pi pi-user',
    command: () => router.push("/pages"),
  },
  {
    label: 'Projects',
    icon: 'pi pi-search',
    badge: 3,
    items: [
      {
        label: 'Core',
        icon: 'pi pi-bolt',
        shortcut: '⌘+S',
      },
      {
        label: 'Blocks',
        icon: 'pi pi-server',
        shortcut: '⌘+B',
      },
      {
        separator: true,
      },
      {
        label: 'UI Kit',
        icon: 'pi pi-pencil',
        shortcut: '⌘+U',
      },
    ],
  },
]);


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
</script>
