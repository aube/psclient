

<script setup lang="ts">
import { computed } from 'vue'
import { Image } from '../../types';
import { useImagesStore } from '../../stores/images'
import { useGeneralStore } from '../../stores/general'

const generalStore = useGeneralStore()
const uplodsStore = useImagesStore()

const { images } = defineProps<{
  images: Image[];
  loading: boolean;
}>();

const emits = defineEmits([
  "uploading",
  "imageEditShow",
]);

const items = computed(() => {
  return images.map(item => {
    return {
      ...item,
      src: generalStore.apiBaseURL + '/image/' + item.url,
    }
  })
})

const uploading = () => {
  emits('uploading');
};

const uploadEdit = (event: any, data: any) => {
  emits('imageEditShow', event, data);
};


</script>


<template>
  <!-- <div class="grid grid-cols-4 gap-4"> -->
  <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
    <div
      v-for="image in items"
      :key="image.uuid"
      class="flex flex-col"
    >
      <img
        alt="Image"
        class="img img-standard"
        preview
        :src="image.src"
        width="250"

        @click="uploadEdit($event, image)"
      >
      <div class="flex flex-col">
        <div class="flex justify-between">
          <div class="truncate">
            <div class="overflow-hidden text-ellipsis">
              <span class="font-semibold text-lg text-surface-900">
                {{ image.name }}
              </span>
            </div>
            <p class="text-sm bg-600 VFnEUf leading-none">
              {{ image.content_type }} - {{ image.size }}
            </p>
          </div>

          <Button
            as="a"
            :href="image.src"
            icon="pi pi-link"
            rel="noopener"
            rounded
            severity="secondary"
            size="small"
            target="_blank"
            type="button"
          />
        </div>
      </div>
    </div>
  </div>
</template>