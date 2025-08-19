<template>
  <div class="com-form">
    <div
      v-for="field in fields"
      :key="field.name"
      class="field"
    >
      <label :for="field.name">{{ field.label }}</label>

      <!-- InputText -->
      <InputText
        v-if="field.type === 'input'"
        :id="field.name"
        v-model="formData[field.name]"
        class="w-full"
        @update:model-value="handleChange(field.name, $event)"
      />

      <!-- Textarea -->
      <Textarea
        v-else-if="field.type === 'textarea'"
        :id="field.name"
        v-model="formData[field.name]"
        :auto-resize="true"
        class="w-full"
        rows="5"
        @update:model-value="handleChange(field.name, $event)"
      />

      <!-- Select -->
      <Dropdown
        v-else-if="field.type === 'select'"
        :id="field.name"
        v-model="formData[field.name]"
        class="w-full"
        option-label="name"
        option-value="code"
        :options="field.options"
        :placeholder="'Select ' + field.label"
        @update:model-value="handleChange(field.name, $event)"
      />

      <!-- Password -->
      <Password
        v-else-if="field.type === 'password'"
        :id="field.name"
        v-model="formData[field.name]"
        :feedback="false"
        fluid
        name="password"
        toggle-mask
      />
      <!-- Добавьте другие типы полей по аналогии -->
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  fields: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(field =>
        field.type && field.name && field.label
      );
    },
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

// Инициализация formData
const formData = ref({});

// Инициализируем formData на основе props.fields
const initializeFormData = () => {
  props.fields.forEach(field => {
    if (!(field.name in formData.value)) {
      formData.value[field.name] = props.modelValue[field.name] || '';
    }
  });
};

// Если modelValue изменился извне, обновляем formData
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue };
}, { deep: true });

// Инициализация при монтировании
initializeFormData();

const handleChange = (fieldName, value) => {
  // Обновляем локальное состояние
  formData.value[fieldName] = value;

  // Эмитим событие change
  emit('change', {
    field: fieldName,
    value: value,
  });

  // Эмитим обновление v-model
  emit('update:modelValue', { ...formData.value });
};
</script>

<style scoped>
.com-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
}
</style>