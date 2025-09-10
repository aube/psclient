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
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-20 lg:px-80">
    <div class="bg-surface-0 dark:bg-surface-900 p-8 pt-4 md:p-12 md:pt-6 shadow-sm rounded-2xl w-full max-w-sm mx-auto flex flex-col gap-8">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-4">
          <img
            src="/ss-logo.svg"
            width="155px"
          >
        </div>
        <div class="flex flex-col items-center gap-2 w-full">
          <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold leading-tight text-center w-full">
            Выход есть
          </div>
        </div>
      </div>
      <Button
        class="w-full py-2 rounded-lg flex justify-center items-center gap-2"
        icon="pi pi-user"
        label="Пока-пока"
        @click="onExitClick"
      >
        <template #icon>
          <i class="pi pi-user text-base! leading-normal!" />
        </template>
      </Button>
    </div>
  </div>
</template>