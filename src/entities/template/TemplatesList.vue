<script setup lang="ts">
import { ref, shallowRef, watch, useTemplateRef } from 'vue'
import { useSortable } from "@vueuse/integrations/useSortable";
import { Template, Pagination } from '../../types'

const sortContainer = useTemplateRef<HTMLElement>('sortContainer')

const { items, pagination } = defineProps<{
  items: Template[]
  pagination: Pagination
}>()

const templates = shallowRef();
const op = ref();
const potemplate = ref();
templates.value = items

const toggle = (event: any, template: any) => {
  potemplate.value = template
  op.value.toggle(event);
}

useSortable(sortContainer, templates, {
  handle: '.pi-equals',
  animation: 200,
})

watch(() => items, () => {
  templates.value = items
})

</script>

<template>
  <div ref="sortContainer">
    <div
      v-for="template in templates"
      :key="template.id"
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
          :to="{name: 'template', params: {templateID: template.id}}"
        >
          <div class="overflow-hidden text-ellipsis">
            <span class="font-bold">
              {{ template.h1 }}
            </span>
          </div>
          <div class="overflow-hidden text-ellipsis">
            <span>
              {{ template.name }}
            </span> <small class="text-surface-500 dark:text-surface-400">{{ template.updated_at }}</small>
          </div>
        </RouterLink>
        <div>
          <Button
            icon="pi pi-code"
            rounded
            severity="secondary"
            size="small"
            type="button"
            @click="toggle($event, template)"
          />
        </div>
      </div>
    </div>
  </div>

  <Popover ref="op">
    <pre>{{ potemplate }}</pre>
  </Popover>

  <Paginator
    v-if="pagination?.total"
    :page="pagination.page"
    :rows="pagination.size"
    :template="{
      '640px': 'PrevTemplateLink CurrentTemplateReport NextTemplateLink',
      '960px': 'FirstTemplateLink PrevTemplateLink CurrentTemplateReport NextTemplateLink LastTemplateLink',
      '1300px': 'FirstTemplateLink PrevTemplateLink TemplateLinks NextTemplateLink LastTemplateLink',
      default: 'FirstTemplateLink PrevTemplateLink TemplateLinks NextTemplateLink LastTemplateLink JumpToTemplateDropdown JumpToTemplateInput'
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