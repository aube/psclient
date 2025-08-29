<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-20 lg:px-80">
    <div class="bg-surface-0 dark:bg-surface-900 p-8 pt-4 md:p-12 md:pt-6 shadow-sm rounded-2xl w-full max-w-sm mx-auto flex flex-col gap-8">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-4">
          <img
            src="/ss-logo.svg"
            width="155px"
          >
        </div>
        <div class="flex flex-col items-center gap-2 w-full">
          <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold leading-tight text-center w-full">
            Регистрация
          </div>
        </div>
      </div>

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

      <div class="text-center w-full">
        <span class="text-surface-700 dark:text-surface-200 leading-normal">Уже есть аккаунт?</span>
        <RouterLink
          class="text-primary font-medium ml-1 cursor-pointer hover:text-primary-emphasis"
          to="/login"
        >
          Вход в систему
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useGeneralStore } from '../../stores/general.js'
import ComControls from '../../components/ComControls.vue';

const generalStore = useGeneralStore()

defineOptions({
  name: 'FormRegister',
})

const emit = defineEmits(['submit'])


const username = generalStore.isDev ? 'qweqweqwe' : ''
const email = generalStore.isDev ? 'qwe@qwe.qwe' : ''
const password = generalStore.isDev ? 'password' : ''
const password_confirmation = generalStore.isDev ? 'password' : ''

const formFields = ref([
  {
    type: "input",
    name: "username",
    label: "Имя",
  },
  {
    type: "password",
    name: "password",
    label: "Пароль",
  },
  {
    type: "password",
    name: "password_confirmation",
    label: "Повторите пароль",
  },
]);

const formData = reactive({
  username,
  email,
  password,
  password_confirmation,
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const isLoading = ref(false)

const validate = () => {
  let isValid = true

  // Сброс ошибок
  Object.keys(errors).forEach(key => errors[key] = '')

  // Валидация
  if (!formData.username.trim()) {
    errors.username = 'Имя обязательно'
    isValid = false
  }

  if (!formData.email.trim()) {
    errors.email = 'Email обязателен'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    errors.email = 'Введите корректный email'
    isValid = false
  }

  if (!formData.password) {
    errors.password = 'Пароль обязателен'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Пароль должен быть не менее 6 символов'
    isValid = false
  }

  if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = 'Пароли не совпадают'
    isValid = false
  }

  return isValid
}

const onFormSubmit = async ({ values }) => {
  if (!validate()) return

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