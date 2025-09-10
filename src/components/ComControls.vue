<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import ComControlErrors from './ComControlsErrors.vue'

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
  data: {
    type: Object,
    default: () => ({}),
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['change']);

// Инициализация formData
const formData = reactive({});
const initialValues = reactive({});
const autoCompleteOptions = ref([]);
const autoCompleteOptionsCopy = [];

// Инициализируем formData на основе props.fields
const initializeFormData = () => {
  props.fields.forEach(field => {
    if (!(field.name in formData)) {
      formData[field.name] = props.data[field.name] || '';
      initialValues[field.name] = props.data[field.name] || '';

      if (field.type === "autocomplete") {
        autoCompleteOptionsCopy[field.name] = field.options.map(i => ({ ...i, normalizedName: i.name.toLowerCase() }));
        autoCompleteOptions.value[field.name] = [...field.options];
      }
    }
  });
};

const autoCompleteFilter = (name) => {
  const data = formData[name] || ""
  autoCompleteOptions.value[name] = autoCompleteOptionsCopy[name].filter(i => i.normalizedName.includes(data.toLowerCase()))
};

// Если data изменился извне, обновляем formData
watch(() => props.data, () => {
  initializeFormData()
}, { deep: true });

// Инициализация при монтировании
initializeFormData();

const handleChange = async (name, value) => {
  await nextTick()
  // Обновляем локальное состояние
  formData[name] = value;

  // Эмитим событие change
  emit('change', {
    field: name,
    value,
  });
};
</script>

<template>
  <div class="com-form">
    <div
      v-for="field in fields"
      :key="field.name"
      class="field"
    >
      <FormField
        v-slot="$field"
        class="flex flex-col gap-1"
        :initial-value="initialValues[field.name]"
        :name="field.name"
        :resolver="field.resolver"
      >
        <label :for="field.name">{{ field.label }}: {{ initialValues[field.name] }}</label>
        <!-- Textarea -->
        <Textarea
          v-if="field.type === 'textarea'"
          :id="field.name"
          v-model="formData[field.name]"
          :aria-describedby="field.name + '-help'"
          :auto-resize="true"
          class="w-full"
          :invalid="Boolean(errors[field.name])"
          rows="5"
          @update:model-value="handleChange(field.name, $event)"
        />

        <!-- Select -->
        <Dropdown
          v-else-if="field.type === 'select'"
          :id="field.name"
          v-model="formData[field.name]"
          class="w-full"
          :invalid="Boolean(errors[field.name])"
          option-label="name"
          option-value="code"
          :options="field.options"
          :placeholder="'Select ' + field.label"
          @update:model-value="handleChange(field.name, $event)"
        />

        <!-- Autocomplete -->
        <AutoComplete
          v-else-if="field.type === 'autocomplete'"
          :id="field.name"
          v-model="formData[field.name]"
          class="w-full"
          dropdown
          :invalid="Boolean(errors[field.name])"
          option-label="name"
          option-value="code"
          :placeholder="'AutoComplete ' + field.label"
          :suggestions="autoCompleteOptions[field.name]"
          @complete="autoCompleteFilter(field.name)"
          @update:model-value="handleChange(field.name, $event)"
        />

        <!-- Password -->
        <Password
          v-else-if="field.type === 'password'"
          :id="field.name"
          v-model="formData[field.name]"
          :feedback="false"
          fluid
          :invalid="Boolean(errors[field.name])"
          name="password"
          toggle-mask
          @update:model-value="handleChange(field.name, $event)"
        />

        <!-- InputText -->
        <IconField v-else>
          <InputText
            :id="field.name"
            v-model="formData[field.name]"
            class="w-full"
            :invalid="Boolean(errors[field.name])"
            @update:model-value="handleChange(field.name, $event)"
          />
          <InputIcon
            v-if="field.loading"
            class="pi pi-spin pi-spinner"
          />
        </IconField>

        <!-- local validation errors -->
        <span
          v-if="$field.errors?.length"
          :id="field.name + '-help'"
          class="flex flex-col"
        >
          <ComControlErrors :errors-zod="$field.errors" />
        </span>

        <!-- async errors -->
        <span
          v-else-if="errors[field.name]"
          :id="field.name + '-help'"
          class="flex flex-col"
        >
          <ComControlErrors :errors="errors[field.name]" />
        </span>

        <small
          v-else-if="field.help"
          :id="field.name + '-help'"
        >{{ field.help }}</small>
      </FormField>
    </div>
  </div>
</template>

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

.control-error-text {
  color: var(--p-button-text-danger-color);
}
</style>