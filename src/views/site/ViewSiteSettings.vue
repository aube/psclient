<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Site } from '../../types/Site.types.ts';
import { useRoute } from 'vue-router'
import { useSitesStore } from '../../stores/sites';
import SiteSettingsForm from '../../entities/site/SiteSettingsForm.vue'

const sitesStore = useSitesStore()

const route = useRoute()

const site = ref<Site | null>(null)

const onSubmit = async (formData: Site) => {
  await sitesStore.updateSite(formData)
}

onMounted(async () => {
  const name = route.params.siteName
  site.value = await sitesStore.getSite(name as string)
})
</script>

<template>
  <div
    class="grid gap-4 p-3"
  >
    <SiteSettingsForm
      :site="site"
      @submit="onSubmit"
    />
  </div>
</template>
