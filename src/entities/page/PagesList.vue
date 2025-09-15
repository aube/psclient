<script setup lang="ts">
import { ref, shallowRef, watch, useTemplateRef } from 'vue'
import { useSortable } from "@vueuse/integrations/useSortable";
import { Page, Pagination } from '../../types'
import { useRouter } from 'vue-router'

const sortContainer = useTemplateRef<HTMLElement>('sortContainer')

const { items, pagination } = defineProps<{
  items: Page[]
  pagination: Pagination
}>()

const router = useRouter()

const pages = shallowRef();
const op = ref();
const popage = ref();
pages.value = items

const toggle = (event: any, page: any) => {
  popage.value = page
  op.value.toggle(event);
}

const navigate = (parentID: number) => {
  router.push({ name: 'pages', params: { parentID }})
}

useSortable(sortContainer, pages, {
  handle: '.pi-equals',
  animation: 200,
})

watch(() => items, () => {
  pages.value = items
})

</script>

<template>
  <div ref="sortContainer">
    <div
      v-for="page in pages"
      :key="page.id"
      class="ps-card"
    >
      <div class="flex items-center justify-between gap-4">
        <div class="flex shrink">
          <i
            class="pi pi-equals cursor-grab"
            style="color: silver;"
          />
        </div>
        <RouterLink
          class="grow truncate"
          :to="{name: 'page', params: {pageID: page.id}}"
        >
          <div class="overflow-hidden text-ellipsis">
            <span class="font-bold">
              {{ page.h1 }}
            </span>
          </div>
          <div class="overflow-hidden text-ellipsis">
            <span>
              {{ page.name }}
            </span> <small class="text-surface-500 dark:text-surface-400">{{ page.updated_at }}</small>
          </div>
        </RouterLink>
        <div>
          <!-- <Button
            icon="pi pi-code"
            rounded
            severity="secondary"
            size="small"
            type="button"
            @click="toggle($event, page)"
          /> -->

          <Button
            icon="pi pi-chevron-right"
            rounded
            severity="secondary"
            size="small"
            type="button"
            @click="navigate(page.id)"
          />
        </div>
      </div>
    </div>
  </div>

  <Popover ref="op">
    <pre>{{ popage }}</pre>
  </Popover>

  <Paginator
    v-if="pagination"
    :page="pagination.page"
    :rows="pagination.size"
    :template="{
      '640px': 'PrevPageLink CurrentPageReport NextPageLink',
      '960px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
      '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
      default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown JumpToPageInput'
    }"
    :total-records="pagination.total"
  />
</template>

<style>
#view-index {
  .p-panel-content {
    padding-bottom: 0px;
  }
}
</style>