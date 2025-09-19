
<script setup lang="ts">
import { useImagesStore } from '../../stores/images';
import { onMounted, ref } from 'vue';
import ImageUploadForm from '../../entities/image/ImageUploadForm.vue';
import ImagesList from '../../entities/image/ImagesList.vue';
import ImageEditForm from '../../entities/image/ImageEditForm.vue';

import Dialog from 'primevue/dialog';

const imagesStore = useImagesStore()

const images = ref()
const pagination = ref()

const fetchImages = async () => {
  await imagesStore.fetchImages();
  images.value = imagesStore.images;
  pagination.value = imagesStore.pagination;
}


const loading = ref(false);
const visible = ref(false);

const handleImageed = () => {
  visible.value = false;
  fetchImages();
};

const op = ref();
const imageData = ref();

const imageEditShow = (event: any, data: any) => {
  imageData.value = data
  op.value.toggle(event);
}

const imageEditSave = async (data: any) => {
  try {
    await imagesStore.updateImage(data)
    op.value.toggle();
  } catch(e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
}

onMounted(async () => {
  fetchImages()
})
</script>


<template>
  <ImagesList
    v-if="images"
    class="p-3"
    :images="images"
    :loading="loading"
    @image-edit-show="(event, data) => imageEditShow(event, data)"
    @uploading="visible = true"
  />

  <Dialog
    v-model:visible="visible"
    dismissable-mask
    modal
    position="topright"
  >
    <template #container>
      <ImageUploadForm @imageed="handleImageed" />
    </template>
  </Dialog>

  <Popover ref="op">
    <div class="pb-3">
      <table class="doc-table">
        <tbody>
          <tr><td><i>name</i></td><td>{{ imageData.name }}</td></tr>
          <tr><td><i>uuid</i></td><td>{{ imageData.uuid }}</td></tr>
          <tr><td><i>size</i></td><td>{{ imageData.size }}</td></tr>
          <tr><td><i>content_type</i></td><td>{{ imageData.content_type }}</td></tr>
        </tbody>
      </table>
    </div>

    <ImageEditForm
      :image="imageData"
      @submit="imageEditSave"
    />
  </Popover>
</template>