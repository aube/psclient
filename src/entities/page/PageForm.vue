<script setup lang="ts">
import { ref, watch } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { Page } from '../../types/Page.types';
import getPageFields from './page.fields'

const emits = defineEmits(['submit'])

const { page } = defineProps<{
  page: Page
}>()

const isLoading = ref(false)
const formFields = ref(getPageFields());
const formData = ref<Page>();


const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  const name = values?.name
  if (!name) return

  try {
    emits('submit', values as Page)
  } finally {
    isLoading.value = false
  }
}

watch(() => page, () => {
  formData.value = page
}, { deep: true });

</script>

<template>
  {{ page }}
  <Form
    class="flex flex-col gap-4 w-full sm:w-156"
    :validate-on-blur="true"
    :validate-on-value-update="true"
    @submit="onFormSubmit"
  >
    <ComControls
      v-model="formData"
      :fields="formFields"
    />

    <Button
      icon="pi pi-plus"
      label="Создать страницу"
      type="submit"
    />
  </Form>
</template>