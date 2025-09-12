<script setup lang="ts">
import { ref } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { SiteNew } from '../../types/Site.types';
import { useSitesStore } from '../../stores/sites';
import getSiteNewFields from './site-new.fields'

const emits = defineEmits(['submit'])

const sitesStore = useSitesStore()

const isLoading = ref(false)
const formFields = ref(getSiteNewFields());
const formData = ref<SiteNew>();
const formErrors = ref({})

const checkNameExists = async (name: string) => {
  const a = await sitesStore.siteExists(name)
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
      name:['Такое имя уже занято'],
    }
    return
  }

  try {
    emits('submit', values as SiteNew)
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
      label="Создать сайт"
      type="submit"
    />
  </Form>
</template>