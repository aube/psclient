<script setup lang="ts">
import { ref } from 'vue';
import ComControls from '../../components/ComControls.vue';
import { Template } from '../../types/Template.types';
import { useTemplatesStore } from '../../stores/templates.ts';
import getTemplateFields from './template.fields'

const emits = defineEmits(['submit'])

const templatesStore = useTemplatesStore()
const { template } = defineProps<{
  template: Template
}>()

const isLoading = ref(false)
const formFields = ref(getTemplateFields());
const formErrors = ref({})

const checkNameExists = async (name: string) => {
  const a = await templatesStore.templateExists(name)
  if (!a) return false
  return a.id !== template.id
}


const onFormSubmit = async ({ valid, values }: {valid:boolean, values: Record<string, any>}) => {
  if (!valid) {
    return
  }

  const nameIsBusy = await checkNameExists(values.name)

  if (nameIsBusy) {
    formErrors.value = {
      ...formErrors.value,
      name:['Такое имя уже используется'],
    }
    return
  }

  const data = {
    ...values,
    id: template.id,
  }

  try {
    emits('submit', data as Template)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Form
    :validate-on-blur="true"
    :validate-on-value-update="true"
    @submit="onFormSubmit"
  >
    <Tabs value="0">
      <TabList>
        <Tab value="0">
          Шаблон
        </Tab>
        <Tab value="1">
          HTML
        </Tab>
        <Tab value="2">
          JSON
        </Tab>
        <Tab value="3">
          CSS
        </Tab>
        <Tab value="4">
          JS
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <ComControls
            :data="template"
            :errors="formErrors"
            :fields="formFields[0]"
          />
        </TabPanel>
        <TabPanel value="1">
          <ComControls
            :data="template"
            :errors="formErrors"
            :fields="formFields[1]"
          />
        </TabPanel>
        <TabPanel value="2">
          <ComControls
            :data="template"
            :errors="formErrors"
            :fields="formFields[2]"
          />
        </TabPanel>
        <TabPanel value="3">
          <ComControls
            :data="template"
            :errors="formErrors"
            :fields="formFields[3]"
          />
        </TabPanel>
        <TabPanel value="4">
          <ComControls
            :data="template"
            :errors="formErrors"
            :fields="formFields[4]"
          />
        </TabPanel>
      </TabPanels>
    </Tabs>

    <Button
      icon="pi pi-check"
      label="Сохранить шаблон"
      type="submit"
    />
  </Form>
</template>