<template>
  <div
    id="view-index"
    class="grid gap-4"
  >
    <Panel
      v-for="site in sites"
      :key="site.id"
      toggleable
    >
      <template #header>
        <RouterLink :to="'/site/' + site.name">
          <div class="flex items-center gap-2">
            <Avatar
              :image="site.icon"
              shape="circle"
            />
            <span class="font-bold">{{ site.name }}</span>
          </div>
        </RouterLink>
      </template>
      <template #footer>
        <!-- <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2" />
          <span class="text-surface-500 dark:text-surface-400">{{ site.updated_at }}</span>
        </div> -->
      </template>
      <template #icons>
        <RouterLink :to="'/site/' + site.name">
          <Button
            icon="pi pi-sitemap"
            rounded
            severity="secondary"
            text
          />
        </RouterLink>
        <RouterLink :to="'/site/' + site.name + '/users'">
          <Button
            icon="pi pi-user"
            rounded
            severity="secondary"
            text
          />
        </RouterLink>
        <RouterLink :to="'/site/' + site.name + '/images'">
          <Button
            icon="pi pi-image"
            rounded
            severity="secondary"
            text
          />
        </RouterLink>

        <RouterLink :to="'/site/' + site.name + '/settings'">
          <Button
            icon="pi pi-cog"
            rounded
            severity="secondary"
            text
          />
        </RouterLink>
      </template>
      <RouterLink :to="'/site/' + site.name">
        <div class="grid sm:grid-cols-2 md:grid-cols-3">
          <div class="grid grid-cols-2">
            <span>Страниц</span>
            <span>3</span>
            <span>Пользователей</span>
            <span>3</span>
            <span>Изображений</span>
            <span>3</span>
          </div>
          <div />
          <div />
        </div>
      </RouterLink>
    </Panel>
    <Button
      aria-label="Search"
      rounded
      severity="secondary"
      :style="{ position: 'absolute', right: '1rem', bottom: '1rem' }"
      variant="outlined"
    >
      <img src="/ss-logo.svg"> добавить сайт
    </Button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ComControls from '../components/ComControls.vue';

const sites = [
  {
    id: 1,
    name: "d404.ru",
    updated_at: "123",
    icon: "/ss-logo.svg",
  },
  {
    id: 2,
    name: "d2404.ru",
    updated_at: "123",
    icon: "/ss-logo.svg",
  },
]


const formData = ref({});

const handleFieldChange = ({ field, value }) => {
  // eslint-disable-next-line
  console.log(`Field ${field} changed to:`, value);
};
</script>


<style>
#view-index {
  .p-panel-content {
    padding-bottom: 0px;
  }
}
</style>