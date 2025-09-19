
<script setup lang="ts">
import { useUploadsStore } from '../../stores/uploads';
import { useGeneralStore } from '../../stores/general'
import { onMounted, onUnmounted, ref } from 'vue';
import FileUploadForm from '../../entities/uploads/FileUploadForm.vue';
import UploadsTable from '../../entities/uploads/UploadsTable.vue';
import UploadEditForm from '../../entities/uploads/UploadEditForm.vue';

import Dialog from 'primevue/dialog';

const generalStore = useGeneralStore()
const uploadsStore = useUploadsStore()

const uploads = ref()
const pagination = ref()

const fetchUploads = async () => {
  await uploadsStore.fetchUploads();
  uploads.value = uploadsStore.uploads;
  pagination.value = uploadsStore.pagination;
}


const loading = ref(false);
const visible = ref(false);

const handleUploaded = () => {
  visible.value = false;
  fetchUploads();
};

const op = ref();
const uploadData = ref();

const uploadEditShow = (event: any, data: any) => {
  uploadData.value = data
  op.value.toggle(event);
}

const uploadEditSave = async (data: any) => {
  try {
    await uploadsStore.updateUpload(data)
    op.value.toggle();
  } catch(e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

function setButtons() {
  generalStore.setActionButtons([
    {
      ariaLabel: "Add upload",
      label: "Add upload",
      icon: "pi pi-plus",
      severity: "primary",
      click: () => visible.value = true,
    },
  ])
}

onMounted(async () => {
  fetchUploads()
  setButtons()
})

onUnmounted(() => {
  generalStore.setActionButtons([])
})
</script>


<template>
  <UploadsTable
    v-if="uploads"
    :loading="loading"
    :uploads="uploads"
    @upload-edit-show="(event, data) => uploadEditShow(event, data)"
  />

  <Dialog
    v-model:visible="visible"
    dismissable-mask
    modal
    position="topright"
  >
    <template #container>
      <FileUploadForm @uploaded="handleUploaded" />
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

    <UploadEditForm
      :upload="uploadData"
      @submit="uploadEditSave"
    />
  </Popover>
</template>