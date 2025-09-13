<script setup lang="ts">
import { reactive, ref } from 'vue'
import ComControls from '../../components/ComControls.vue';
import getProfileFields from './profile.fields.ts'
import { User } from '../../types'

defineOptions({
  name: 'FormUserSettings',
})

const emit = defineEmits(['submit'])
const { user } = defineProps<{
  user: User
}>()

const formData = reactive({
  ...user,
})

const formFields = ref(getProfileFields(formData));

const isLoading = ref(false)

const onFormChange = async ({ field, value }: {field: string, value: string}) => {
  if (field === 'password') {
    formData.password = value
  }
  if (field === 'password_confirmation') {
    formData.password_confirmation = value
  }
}

const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  isLoading.value = true
  try {
    emit('submit', {
      username: values.username,
      email: values.email,
      password: values.password,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Form
    v-if="formData"
    class="flex flex-col gap-6"
    :initial-value="formData"
    :validate-on-blur="true"
    :validate-on-mount="false"
    :validate-on-submit="true"
    :validate-on-value-update="true"
    @submit="onFormSubmit"
  >
    <ComControls
      :data="formData"
      :fields="formFields"
      @change="onFormChange"
    />

    <Button
      icon="pi pi-check"
      label="Сохранить"
      type="submit"
    >
      <template #icon>
        <i class="pi pi-user text-base! leading-normal!" />
      </template>
    </Button>
  </Form>
</template>