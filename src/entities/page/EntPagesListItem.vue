
<template>
  <div class="card">
    <Panel toggleable>
      <template #header>
        <div class="flex items-center gap-2">
          <Avatar
            image="/images/avatar/amyelsner.png"
            shape="circle"
          />
          <span class="font-bold">Amy Elsner</span>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <Button
              icon="pi pi-user"
              rounded
              text
            />
            <Button
              icon="pi pi-bookmark"
              rounded
              severity="secondary"
              text
            />
          </div>
          <span class="text-surface-500 dark:text-surface-400">Updated 2 hours ago</span>
        </div>
      </template>
      <template #icons>
        <Button
          icon="pi pi-cog"
          rounded
          severity="secondary"
          text
          @click="toggle"
        />
        <Menu
          id="config_menu"
          ref="menu"
          :model="items"
          popup
        />
      </template>
      <p class="m-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </Panel>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import Panel from 'primevue/panel';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';

const menu = ref(null);
const isToastLoaded = ref(false)

onMounted(() => {
  isToastLoaded.value = true
})

const items = ref([
  {
    label: 'Refresh',
    icon: 'pi pi-refresh',
  },
  {
    label: 'Search',
    icon: 'pi pi-search',
  },
  {
    separator: true,
  },
  {
    label: 'Delete',
    icon: 'pi pi-times',
  },
]);

const toggle = (event) => {
  menu.value.toggle(event);
};

</script>
