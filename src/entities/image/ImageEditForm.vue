<script setup lang="ts">
import { ref } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { Image } from '../../types/Image.types';
import getImageEditFields from './image-edit.fields'

const emits = defineEmits(['submit'])

const { image } = defineProps<{
  image: Image
}>()

const isLoading = ref(false)
const formFields = ref(getImageEditFields());

const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  const data = {
    ...values,
    uuid: image.uuid,
  }

  try {
    emits('submit', data as Image)
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
      :data="image"
      :fields="formFields"
    />

    <Button
      icon="pi pi-check"
      label="Сохранить"
      type="submit"
    />
  </Form>
</template>