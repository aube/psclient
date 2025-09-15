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
        field="id"
        header="ID"
      />
      <Column
        field="name"
        header="Name"
      />
      <Column
        field="category"
        header="Category"
      />
      <Column
        field="size"
        header="Size"
      />
      <Column
        field="content_type"
        header="Content Type"
      />
      <Column
        field="created_at"
        header="Created At"
      >
        <template #body="slotProps">
          {{ formatDate(slotProps.data.created_at) }}
        </template>
      </Column>
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
