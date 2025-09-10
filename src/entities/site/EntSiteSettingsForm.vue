<script setup lang="ts">
import { ref, watch } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { regs } from '../../lib/utils'
import ComControls from '../../components/ComControls.vue';

import { Site } from '../../types/Site.types';
import { useSitesStore } from '../../stores/sites';
import { useNotificationStore } from '../../stores/notification'
const { siteExists } = useSitesStore(useNotificationStore())

const isLoading = ref(false)

const props = defineProps<{
  site: Site | null
}>()

const emits = defineEmits(['submit'])

const formData = ref<Site|null>(null);

const formErrors = ref({})

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
        .refine(value => regs.domainPart.test(value), {
          message: 'Только латинские символы и числа',
        })
    ),
  },
  {
    type: "input",
    name: "domain",
    label: "Домен",
    help: "Регистрация домена описана в инструкции: /help/domains",
    resolver: zodResolver(
      z.string()
        .optional()
        .refine(value => !value || regs.domain.test(value), {
          message: 'Имя домена не корректно',
        })
    ),
  },
  {
    type: "input",
    name: "title",
    label: "Заголовок сайта",
    help: "",
    resolver: zodResolver(
      z.string()
        .min(3, { message: 'Минимальная длина 3 символа' })
    ),
  },
  {
    type: "textarea",
    name: "meta",
    label: "Метатэги",
    help: "Нужно использовать JSON-формат",
  },
  {
    type: "textarea",
    name: "settings",
    label: "Настройки",
    help: "Нужно использовать JSON-формат. Список настроек /help/site-settings",
  },
  {
    type: "input",
    name: "category",
    label: "Категория сайта",
    help: "Для чего нужны категории: /help/site-category",
  },
  {
    type: "textarea",
    name: "template",
    label: "Шаблон сайта",
    help: "Редактирование шаблона сайта: /help/site-template",
  },
]);


const checkNameExists = async (name: string, id: number = 0) => {
  const a = await siteExists(name, id)
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
  <div class="p-3">
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
  </div>
</template>