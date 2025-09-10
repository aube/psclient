<script setup lang="ts">
import { Site } from '../../types/Site.types'

const props = defineProps<{
  items: Site[]
}>()

</script>

<template>
  <Panel
    v-for="site in props.items"
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
</template>

<style>
#view-index {
  .p-panel-content {
    padding-bottom: 0px;
  }
}
</style>