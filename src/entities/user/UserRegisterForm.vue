<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-20 lg:px-80">
    <div class="bg-surface-0 dark:bg-surface-900 p-8 md:p-12 shadow-sm rounded-2xl w-full max-w-sm mx-auto flex flex-col gap-8">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-4">
          <svg
            class="h-14 w-14"
            fill="none"
            height="32"
            viewBox="0 0 33 32"
            width="33"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              class="fill-surface-700 dark:fill-surface-200"
              clip-rule="evenodd"
              d="M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z"
              fill-rule="evenodd"
            />
          </svg>
        </div>
        <div class="flex flex-col items-center gap-2 w-full">
          <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold leading-tight text-center w-full">
            Регистрация в PSCMS
          </div>
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
      <div class="flex flex-col gap-6 w-full">
        <ComControls
          v-model="formData"
          :fields="formFields"
        />
      </div>
      <Button
        class="w-full py-2 rounded-lg flex justify-center items-center gap-2"
        icon="pi pi-user"
        label="Регистрация"
        @click="handleSubmit"
      >
        <template #icon>
          <i class="pi pi-user text-base! leading-normal!" />
        </template>
      </Button>
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
    label: "Повторите Пароль",
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

const handleSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  try {
    emit('submit', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })
  } finally {
    isLoading.value = false
  }
}
</script>