
<script setup lang="ts">
import { useUploadsStore } from '../../stores/uploads';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router'

// import { useUploadAPI } from '../../api/rest/upload.api.js';
import UploadForm from '../../entities/uploads/UploadForm.vue';
import UploadsTable from '../../entities/uploads/UploadsTable.vue';
import Dialog from 'primevue/dialog';

const uploadsStore = useUploadsStore()
const route = useRoute()

const uploads = ref()
const pagination = ref()

const fetchUploads = async () => {
  await uploadsStore.fetchUploads();
  uploads.value = uploadsStore.uploads;
  pagination.value = uploadsStore.pagination;
}

onMounted(async () => {
  fetchUploads()
})


// const uploads = ref();
const loading = ref(false);
const visible = ref(false);

// const { list } = useUploadAPI();

// const loadUploads = async () => {
//   try {
//     loading.value = true;
//     const response = await list();
//     uploads.value = response.rows;
//   } catch (error) {
//     console.error('Error loading uploads:', error);
//   } finally {
//     loading.value = false;
//   }
// };

const handleUploaded = () => {
  visible.value = false;
  fetchUploads();
};

// onMounted(() => {
//   loadUploads();
// });
</script>


<template>
  <UploadsTable
    v-if="uploads"
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