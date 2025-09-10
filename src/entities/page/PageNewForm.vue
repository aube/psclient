<script setup lang="ts">
import { ref } from 'vue';
import ComControls from '../../components/ComControls.vue';

import { PageNew } from '../../types/Page.types';
import { usePagesStore } from '../../stores/pages.ts';
import { useNotificationStore } from '../../stores/notification'

import getPageNewFields from './page-new.fields'

const { pageExists } = usePagesStore(useNotificationStore())

const isLoading = ref(false)

const emits = defineEmits(['submit'])

const formFields = ref(getPageNewFields());

const formData = ref<PageNew>();

const formErrors = ref({})

const checkNameExists = async (name: string) => {
  const a = await pageExists(name)
  return Boolean(a)
}

const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  const name = values?.name
  if (!name) return

  const nameIsBusy = await checkNameExists(name)

  if (nameIsBusy) {
    formErrors.value = {
      ...formErrors.value,
      name:['Такое имя уже используется'],
    }
    return
  }

  try {
    emits('submit', values as PageNew)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Form
    class="flex flex-col gap-4 w-full sm:w-156"
    :validate-on-blur="true"
    :validate-on-value-update="true"
    @submit="onFormSubmit"
  >
    <ComControls
      v-model="formData"
      :errors="formErrors"
      :fields="formFields"
    />

    <Button
      icon="pi pi-plus"
      label="Создать страницу"
      type="submit"
    />
  </Form>
</template>