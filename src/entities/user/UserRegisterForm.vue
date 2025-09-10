<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useGeneralStore } from '../../stores/general.js'
import ComControls from '../../components/ComControls.vue';

import getRegisterFields from './register.fields.ts'


const generalStore = useGeneralStore()

defineOptions({
  name: 'FormRegister',
})

const emit = defineEmits(['submit'])

const username = generalStore.isDev ? 'qweqweqwe' : ''
const email = generalStore.isDev ? 'qwe@qwe.qwe' : ''
const password = generalStore.isDev ? 'password' : ''
const password_confirmation = generalStore.isDev ? 'password' : ''

const formData = reactive({
  username,
  email,
  password,
  password_confirmation,
})

const formFields = ref(getRegisterFields(formData));

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
    class="flex flex-col gap-4"
    :initial-value="formData"
    :validate-on-blur="true"
    :validate-on-mount="false"
    :validate-on-submit="true"
    :validate-on-value-update="true"
    @submit="onFormSubmit"
  >
    <div class="flex flex-col gap-6 w-full">
      <ComControls
        :data="formData"
        :fields="formFields"
        @change="onFormChange"
      />
    </div>
    <Button
      class="w-full py-2 rounded-lg flex justify-center items-center gap-2"
      icon="pi pi-user"
      label="Регистрация"
      type="submit"
    >
      <template #icon>
        <i class="pi pi-user text-base! leading-normal!" />
      </template>
    </Button>
  </Form>
</template>