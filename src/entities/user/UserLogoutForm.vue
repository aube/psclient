<script setup>

defineOptions({
  name: 'FormLogout',
})

const emit = defineEmits(['submit'])

const onExitClick = async () => {
  emit('submit')
}

</script>

<template>
  <Button
    icon="pi pi-user"
    label="Покинуть сайт"
    severity="secondary"
    @click="onExitClick"
  >
    <template #icon>
      <i class="pi pi-sign-out text-base! leading-normal!" />
    </template>
  </Button>
</template>