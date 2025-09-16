
<script setup lang="ts">
import { useUploadsStore } from '../../stores/uploads';
import { onMounted, ref } from 'vue';
import UploadForm from '../../entities/uploads/UploadForm.vue';
import UploadsTable from '../../entities/uploads/UploadsTable.vue';
import UploadEditForm from '../../entities/uploads/UploadEditForm.vue';

import Dialog from 'primevue/dialog';

const uploadsStore = useUploadsStore()

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

const loading = ref(false);
const visible = ref(false);

const handleUploaded = () => {
  visible.value = false;
  fetchUploads();
};

const op = ref();
const uploadData = ref();

const uploadEdit = (event: any, data: any) => {
  uploadData.value = data
  op.value.toggle(event);
}
</script>


<template>
  <UploadsTable
    v-if="uploads"
    :loading="loading"
    :uploads="uploads"
    @upload-edit="(event, data) => uploadEdit(event, data)"
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

  <Popover ref="op">
    <div class="pb-3">
      <table class="doc-table">
        <tbody>
          <tr><td><i>name</i></td><td>{{ uploadData.name }}</td></tr>
          <tr><td><i>uuid</i></td><td>{{ uploadData.uuid }}</td></tr>
          <tr><td><i>size</i></td><td>{{ uploadData.size }}</td></tr>
          <tr><td><i>content_type</i></td><td>{{ uploadData.content_type }}</td></tr>
        </tbody>
      </table>
    </div>

    <UploadEditForm :upload="uploadData" />
  </Popover>
</template>