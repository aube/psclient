<script setup>
import { ref } from 'vue';
import ComControls from '../components/ComControls.vue';

const formFields = ref([
  {
    type: "input",
    name: "username",
    label: "Имя",
  },
  {
    type: "password",
    name: "pass1",
    label: "Пароль",
  },
  {
    type: "textarea",
    name: "description",
    label: "Описание",
  },
  {
    type: "select",
    name: "city",
    label: "Город",
    options: [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ],
  },
  {
    type: "textarea",
    name: "description",
    label: "Описание",
  },
  {
    type: "autocomplete",
    name: "city",
    label: "Город",
    options: [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ],
  },
]);

const formData = ref({});

const handleFieldChange = ({ field, value }) => {
  // eslint-disable-next-line
  console.log(`Field ${field} changed to:`, value);
};
</script>

<template>
  <div>
    <Panel>
      <ComControls
        v-model="formData"
        :fields="formFields"
        @change="handleFieldChange"
      />
    </Panel>
    <pre>{{ formData }}</pre>
  </div>
</template>