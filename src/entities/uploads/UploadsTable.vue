
<template>
  <div class="card">
    <DataTable
      table-style="min-width: 50rem"
      :value="products"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Products</span>
          <Button
            icon="pi pi-cloud-upload"
            raised
            rounded
            @click="uploading"
          />
        </div>
      </template>
      <Column
        field="name"
        header="Name"
      />
      <Column header="Image">
        <template #body="slotProps">
          <img
            :alt="slotProps.data.image"
            class="w-24 rounded"
            :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`"
          >
        </template>
      </Column>
      <Column
        field="price"
        header="Price"
      >
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.price) }}
        </template>
      </Column>
      <Column
        field="category"
        header="Category"
      />
      <Column
        field="rating"
        header="Reviews"
      >
        <template #body="slotProps">
          <Rating
            :model-value="slotProps.data.rating"
            readonly
          />
        </template>
      </Column>
      <Column header="Status">
        <template #body="slotProps">
          <Tag
            :severity="getSeverity(slotProps.data)"
            :value="slotProps.data.inventoryStatus"
          />
        </template>
      </Column>
      <template #footer>
        In total there are {{ products ? products.length : 0 }} products.
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';


const emits = defineEmits(["uploading"])

const products = ref([{
  id: '1000',
  code: 'f230fh0g3',
  name: 'Bamboo Watch',
  description: 'Product Description',
  image: 'bamboo-watch.jpg',
  price: 65,
  category: 'Accessories',
  quantity: 24,
  inventoryStatus: 'INSTOCK',
  rating: 5,
}]);
const formatCurrency = (value) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
const getSeverity = (product) => {
  switch (product.inventoryStatus) {
  case 'INSTOCK':
    return 'success';

  case 'LOWSTOCK':
    return 'warn';

  case 'OUTOFSTOCK':
    return 'danger';

  default:
    return null;
  }
};
const uploading = () => {
  emits('uploading')
};

</script>
