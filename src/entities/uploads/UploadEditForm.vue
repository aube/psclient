<script setup lang="ts">
import { ref } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { Upload } from '../../types/Upload.types';
import getUploadEditFields from './upload-edit.fields'

const emits = defineEmits(['submit'])

const { upload } = defineProps<{
  upload: Upload
}>()

const isLoading = ref(false)
const formFields = ref(getUploadEditFields());

const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  const data = {
    ...values,
    uuid: upload.uuid,
  }

  try {
    emits('submit', data as Upload)
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
      :data="upload"
      :fields="formFields"
    />

    <Button
      icon="pi pi-check"
      label="Сохранить"
      type="submit"
    />
  </Form>
</template>