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
  <ComNavbar />
</template>

<style scoped>
.control-error-text {
  color: var(--p-button-text-danger-color);
}
</style>