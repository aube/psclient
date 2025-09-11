<script setup lang="ts">
import { ref, watch } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { Site } from '../../types/Site.types';
import { useSitesStore } from '../../stores/sites';
import { useNotificationStore } from '../../stores/notification'
import getSiteSettingsFields from './site-settings.fields'

const emits = defineEmits(['submit'])
const props = defineProps<{
  site: Site | null
}>()

const sitesStore = useSitesStore(useNotificationStore())

const isLoading = ref(false)
const formData = ref<Site|null>(null);
const formErrors = ref({})
const formFields = ref(getSiteSettingsFields());

const checkNameExists = async (name: string, id: number = 0) => {
  const a = await sitesStore.siteExists(name, id)
  return Boolean(a)
}

const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }
  const name = values.name
  if (!name) return

  const nameIsBusy = await checkNameExists(name, props.site?.id)

  if (nameIsBusy) {
    formErrors.value = {
      ...formErrors.value,
      name:['Такое имя уже занято'],
    }
    return
  }

  try {
    emits('submit', {
      ...values,
      id: props.site?.id,
    } as Site)
  } finally {
    isLoading.value = false
  }
}

// Если props.site изменился извне, обновляем formData
watch(() => props.site, (newValue) => {
  formData.value = newValue ? { ...newValue } : null;
}, { deep: true });
</script>

<template>
  <Form
    v-if="formData"
    class="flex flex-col gap-4 w-full sm:w-156"
    :validate-on-blur="true"
    :validate-on-mount="false"
    :validate-on-submit="true"
    :validate-on-value-update="true"
    @submit="onFormSubmit"
  >
    <ComControls
      :data="formData"
      :errors="formErrors"
      :fields="formFields"
    />
    <Button
      icon="pi pi-check"
      label="Сохранить сайт"
      type="submit"
    />
  </Form>
</template>