<script setup lang="ts">
import { ref, shallowRef, onMounted,useTemplateRef } from 'vue'
import { useSortable } from "@vueuse/integrations/useSortable";
import { Page, Pagination } from '../../types'

const sortContainer = useTemplateRef<HTMLElement>('sortContainer')

const { items, pagination } = defineProps<{
  items: Page[]
  pagination: Pagination
}>()

const pages = shallowRef();
const op = ref();
const popage = ref();
const toggle = (event: any, page: any) => {
  popage.value = page
  op.value.toggle(event);
}
pages.value = items
useSortable(sortContainer, pages)

onMounted(() => {
})

</script>

<template>
  <div ref="sortContainer">
    <div
      v-for="page in pages"
      :key="page.id"
      class="ps-card"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex shrink">
          <i
            class="pi pi-equals"
            style="color: silver;"
          />
        </div>
        <div class="flex items-center gap-2 grow">
          <RouterLink :to="{name: 'page', params: {pageID: page.id}}">
            <div class="flex items-center gap-2">
              <span class="font-bold">{{ page.h1 }}</span>
            </div>
            <span>{{ page.name }}</span>
          </RouterLink>
        </div>
        <div>
          <Button
            class="mr-2"
            icon="pi pi-equals"
            severity="secondary"
            size="small"
            type="button"
            @click="toggle($event, page)"
          />
          <Button
            class="mr-2"
            icon="pi pi-code"
            severity="secondary"
            size="small"
            type="button"
            @click="toggle($event, page)"
          />

          <span class="text-surface-500 dark:text-surface-400">{{ page.updated_at }}</span>
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