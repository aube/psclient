<template>
  <div class="card">
    <DataTable
      :loading="loading"
      table-style="min-width: 50rem"
      :value="uploads"
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
            {{ slotProps.data.url }}
          </div>
          <div>
            {{ slotProps.data.uuid }}
          </div>
        </template>
      </Column>
      <Column
        field="params"
        h1eader="File"
      >
        <template #body="slotProps">
          <div>
            {{ slotProps.data.size }}
          </div>
          <div>
            {{ slotProps.data.category }}
          </div>
          <div>
            {{ slotProps.data.content_type }}
          </div>
        </template>
      </Column>
      <Column
        field="description"
        header="Description"
      >
        <template #body="slotProps">
          <div>
            {{ slotProps.data.description }}
          </div>
        </template>
      </Column>
      <!-- <Column
        field="created_at"
        header="Created At"
      >
        <template #body="slotProps">
          {{ formatDate(slotProps.data.created_at) }}
        </template>
      </Column> -->
      <template #footer>
        In total there are {{ uploads ? uploads.length : 0 }} uploads.
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { Upload } from '../../types';

// Define props
const props = defineProps<{
  uploads: Upload[];
  loading: boolean;
}>();

// Define emits
const emits = defineEmits(["uploading"]);

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

const uploading = () => {
  emits('uploading');
};
</script>
