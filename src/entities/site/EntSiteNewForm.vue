<template>
  <div class="p-3">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { regs } from '../../lib/utils'
import ComControls from '../../components/ComControls.vue';

import { SiteNew } from '../../types/Site.types';
import { useSitesStore } from '../../stores/sites';
import { useNotificationStore } from '../../stores/notification'
const { siteExists } = useSitesStore(useNotificationStore())

const isLoading = ref(false)

const emits = defineEmits(['submit'])

const formFields = ref([
  {
    type: "input",
    name: "name",
    label: "Имя сайта",
    help: "Имя сайта предназначено для отображения сайта по адресу: ИМЯ.d404.ru",
    resolver: zodResolver(
      z.string()
        .min(4, { message: 'Минимальная длина 4 символа' })
        .max(32, { message: 'Максимальная длина 32 символа' })
        .refine((value:string) => regs.domainPart.test(value), {
          message: 'Только латинские символы и числа',
        })
    ),
  },
  // {
  //   type: "input",
  //   name: "domain",
  //   label: "Домен",
  // },
]);

const formData = ref<SiteNew>();

const formErrors = ref({})

const checkNameExists = async (name: string) => {
  const a = await siteExists(name)
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