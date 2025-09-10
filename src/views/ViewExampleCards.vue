<script setup>
import { ref } from 'vue';
import ComControls from '../components/ComControls.vue';

const formData = ref({});

const handleFieldChange = ({ field, value }) => {
  // eslint-disable-next-line
  console.log(`Field ${field} changed to:`, value);
};
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
    <Card
      v-for="n in [0,102,3,4]"
      :key="n"
      style=" overflow: hidden"
    >
      <template #header>
        <img
          alt="user header"
          src="https://primefaces.org/cdn/primevue/images/usercard.png"
        >
      </template>
      <template #title>
        Advanced Card
      </template>
      <template #subtitle>
        Card subtitle
      </template>
      <template #content>
        <p class="m-0">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
          quas!
        </p>
      </template>
      <template #footer>
        <div class="flex gap-4 mt-1">
          <Button
            class="w-full"
            label="Cancel"
            severity="secondary"
            variant="outlined"
          />
          <Button
            class="w-full"
            label="Save"
          />
        </div>
      </template>
    </Card>
  </div>
</template>
