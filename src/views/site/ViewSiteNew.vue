<script setup lang="ts">
import { SiteNew } from '../../types/Site.types.ts';
import { useRouter } from 'vue-router'
import { useSitesStore } from '../../stores/sites';
import SiteNewForm from '../../entities/site/SiteNewForm.vue'

const sitesStore = useSitesStore()

const router = useRouter()

const onSubmit = async (formData: SiteNew) => {
  const success = await sitesStore.createSite(formData)
  if (success) {
    await sitesStore.fetchSites()
    router.push('/')
  }
}

</script>

<template>
  <div
    class="grid gap-4 p-3"
  >
    <SiteNewForm
      :site="{}"
      @submit="onSubmit"
    />
  </div>
</template>
