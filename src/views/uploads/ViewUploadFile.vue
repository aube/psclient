<template>
  <UploadsTable
    :loading="loading"
    :uploads="uploads"
    @uploading="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    dismissable-mask
    modal
    position="topright"
  >
    <template #container>
      <UploadForm @uploaded="handleUploaded" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUploadsAPI } from '../../api/rest/uploads.api.js';
import UploadForm from '../../entities/uploads/UploadForm.vue';
import UploadsTable from '../../entities/uploads/UploadsTable.vue';
import Dialog from 'primevue/dialog';

const uploads = ref([]);
const loading = ref(false);
const visible = ref(false);

const { list } = useUploadsAPI();

const loadUploads = async () => {
  try {
    loading.value = true;
    const response = await list();
    uploads.value = response.rows;
  } catch (error) {
    console.error('Error loading uploads:', error);
  } finally {
    loading.value = false;
  }
};

const handleUploaded = () => {
  visible.value = false;
  loadUploads();
};

onMounted(() => {
  loadUploads();
});
</script>