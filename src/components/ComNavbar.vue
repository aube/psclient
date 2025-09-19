<script setup>

import { computed } from "vue";
import { useRouter, useRoute } from "vue-router"
import { useGeneralStore } from '../stores/general'

const generalStore = useGeneralStore()

const route = useRoute()
const router = useRouter()

const menu = [
  {
    label: 'Pages',
    icon: 'pi pi-sitemap',
    link: "pages",
  },
  // {
  //   label: 'Users',
  //   icon: 'pi pi-user',
  //   link: "users",
  // },
  // {
  //   label: 'Clients',
  //   icon: 'pi pi-users',
  //   link: "users",
  // },
  {
    label: 'Images',
    icon: 'pi pi-image',
    link: "uploads/images",
  },
  {
    label: 'Site',
    // icon: 'pi pi-cloud-upload',
    items: [
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        link: "settings",
      },
      {
        label: 'Uploads',
        icon: 'pi pi-file',
        link: "uploads/files",
      },
      {
        label: 'Templates',
        icon: 'pi pi-code',
        link: "templates",
      },
    ],
  },
]

const items = computed(() => {
  if (!route.params.siteName) {
    return []
  }
  const linkPrefixe = "/site/" + route.params.siteName

  function getMenuItem(item) {
    let link
    let active = null
    let command = null

    if (item.link != undefined) {
      link = item.link ? "/" + item.link : ""
      active = route.fullPath === linkPrefixe + link
      command = () => router.push(linkPrefixe + link)
    }

    return {
      ...item,
      items: item.items ? item.items.map(getMenuItem) : null,
      active,
      command,
    }
  }

  return menu.map(getMenuItem)
})


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
          <!-- <InputText
            class="w-32 sm:w-auto"
            placeholder="Search"
            type="text"
          /> -->
          <Button
            v-for="btn, idx in generalStore.actionButtons"
            :key="idx"
            :aria-label="btn.ariaLabel"
            :disabled="btn.disabled"
            :icon="btn.icon"
            :label="btn.label"
            rounded
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