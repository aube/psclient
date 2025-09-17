

<script setup lang="ts">
import { computed } from 'vue'
import { Upload } from '../../types';
import { useUploadsStore } from '../../stores/uploads'
import { useGeneralStore } from '../../stores/general'

const generalStore = useGeneralStore()
const uplodsStore = useUploadsStore()

const { uploads } = defineProps<{
  uploads: Upload[];
  loading: boolean;
}>();

const emits = defineEmits([
  "uploading",
  "uploadEditShow",
]);

const items = computed(() => {
  return uploads.map(item => {
    const queryString = new URLSearchParams({
      uuid: item.uuid,
    }).toString();

    return {
      ...item,
      downloadLink: generalStore.apiBaseURL + '/api/v1/upload?' + queryString,
    }
  })
})

const uploading = () => {
  emits('uploading');
};

const uploadEdit = (event: any, data: any) => {
  emits('uploadEditShow', event, data);
};

const download = ({ uuid, name }: { uuid: string, name: string }) => {
  uplodsStore.download(uuid, name)
}

</script>


<template>
  <div class="card">
    <DataTable
      :loading="loading"
      table-style="min-width: 50rem"
      :value="items"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Uploads</span>
          <Button
            icon="pi pi-cloud-upload"
            raised
            rounded
            @click="uploading"
          />
        </div>
      </template>
      <Column
        field="file"
        header="File"
      >
        <template #body="slotProps">
          <div>
            {{ slotProps.data.name }}
          </div>
          <div>
            {{ slotProps.data.downloadLink }}
          </div>
        </template>
      </Column>
      <Column class="!text-end">
        <template #body="slotProps">
          <Button
            v-if="slotProps.data.url"
            as="a"
            :href="slotProps.data.url"
            icon="pi pi-link"
            rel="noopener"
            rounded
            severity="secondary"
            size="small"
            target="_blank"
            type="button"
          />
          <Button
            icon="pi pi-download"
            rounded
            severity="secondary"
            size="small"
            type="button"
            @click="download(slotProps.data)"
          />
          <Button
            icon="pi pi-pencil"
            rounded
            severity="secondary"
            size="small"
            type="button"
            @click="uploadEdit($event, slotProps.data)"
          />
        </template>
      </Column>
      <template #footer>
        In total there are {{ uploads ? uploads.length : 0 }} uploads.
      </template>
    </DataTable>
  </div>
</template>