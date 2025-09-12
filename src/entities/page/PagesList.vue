<script setup lang="ts">
import { Page , Pagination } from '../../types'

const { items = [], pagination = {}} = defineProps<{
  items?: Page[]
  pagination?: Pagination
}>()

</script>

<template>
  <Panel
    v-for="page in items"
    :key="page.id"
    toggleable
  >
    <template #header>
      <RouterLink :to="'/page/' + page.name">
        <div class="flex items-center gap-2">
          <Avatar
            :image="page.icon"
            shape="circle"
          />
          <span class="font-bold">{{ page.name }}</span>
        </div>
      </RouterLink>
    </template>
    <template #footer>
      <!-- <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2" />
          <span class="text-surface-500 dark:text-surface-400">{{ page.updated_at }}</span>
        </div> -->
    </template>
    <template #icons>
      <RouterLink :to="'/page/' + page.name">
        <Button
          icon="pi pi-pagemap"
          rounded
          severity="secondary"
          text
        />
      </RouterLink>
      <RouterLink :to="'/page/' + page.name + '/users'">
        <Button
          icon="pi pi-user"
          rounded
          severity="secondary"
          text
        />
      </RouterLink>
      <RouterLink :to="'/page/' + page.name + '/images'">
        <Button
          icon="pi pi-image"
          rounded
          severity="secondary"
          text
        />
      </RouterLink>

      <RouterLink :to="'/page/' + page.name + '/settings'">
        <Button
          icon="pi pi-cog"
          rounded
          severity="secondary"
          text
        />
      </RouterLink>
    </template>
    <RouterLink :to="'/page/' + page.name">
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
    <pre>{{ pagination }}</pre>
  </Panel>
</template>

<style>
#view-index {
  .p-panel-content {
    padding-bottom: 0px;
  }
}
</style>