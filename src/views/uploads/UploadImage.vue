<template>
  <UploadsTable @uploading="visible = true" />

  <Dialog
    v-model:visible="visible"
    dismissable-mask
    modal
    position="topright"
  >
    <template #container>
      <UploadForm />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import UploadForm from '../../entities/uploads/UploadForm.vue'
import UploadsTable from '../../entities/uploads/UploadsTable.vue'
import { ref } from "vue";

const visible = ref(false);
</script>