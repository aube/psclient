<script setup lang="ts">
import { SiteNew } from '../../types/Site.types.ts';
import { useRouter } from 'vue-router'
import { useSitesStore } from '../../stores/sites';
import { useNotificationStore } from '../../stores/notification'
import SiteNewForm from '../../entities/site/SiteNewForm.vue'

const sitesStore = useSitesStore(useNotificationStore())

const router = useRouter()

const onSubmit = async (formData: SiteNew) => {
  await sitesStore.createSite(formData)
  router.push('/')
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
