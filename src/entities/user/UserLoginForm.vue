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
            Вход в систему
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-6 w-full">
        <ComControls
          v-model="formData"
          :fields="formFields"
        />
      </div>
      <Button
        class="w-full py-2 rounded-lg flex justify-center items-center gap-2"
        icon="pi pi-user"
        label="Вход"
        @click="handleSubmit"
      >
        <template #icon>
          <i class="pi pi-user text-base! leading-normal!" />
        </template>
      </Button>
      <div class="text-center w-full">
        <span class="text-surface-700 dark:text-surface-200 leading-normal">Вы ещё не зарегистрированы?</span>
        <RouterLink
          class="text-primary font-medium ml-1 cursor-pointer hover:text-primary-emphasis"
          to="/register"
        >
          Регистрация
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
  name: 'FormLogin',
})

const emit = defineEmits(['submit'])

const username = generalStore.isDev ? 'qweqweqwe' : ''
const password = generalStore.isDev ? 'password' : ''
const email = generalStore.isDev ? 'qwe@qwe.qwe' : ''

const formData = reactive({
  username,
  password,
  email,
})

const errors = reactive({
  username: '',
  password: '',
  email: '',
})

const isLoading = ref(false)

const validate = () => {
  let isValid = true

  Object.keys(errors).forEach(key => errors[key] = '')

  if (!formData.username.trim()) {
    errors.username = 'username обязателен'
    isValid = false
  // } else if (!/^\S+@\S+\.\S+$/.test(form.username)) {
  //   errors.username = 'Введите корректный username'
  //   isValid = false
  }

  if (!formData.password) {
    errors.password = 'Пароль обязателен'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  try {
    emit('submit', formData)
  } finally {
    isLoading.value = false
  }
}

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
]);
</script>