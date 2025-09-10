<script setup>
const props = defineProps({
  errorsZod: {
    type: Object,
    default: () => ({}),
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <small
    v-for="error in props.errorsZod"
    :key="error.code"
    class="control-error-text"
  > {{ error.message }}</small>
  <small
    v-for="error, idx in props.errors"
    :key="idx"
    class="control-error-text"
  > {{ error }}</small>
</template>

<style scoped>
.control-error-text {
  color: var(--p-button-text-danger-color);
}
</style>