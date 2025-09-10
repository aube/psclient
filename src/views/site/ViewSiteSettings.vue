<script setup lang="ts">
import { ref, onMounted } from 'vue';

import SiteSettingsForm from '../../entities/site/SiteSettingsForm.vue'

import { Site } from '../../types/Site.types.ts';
import { useRoute } from 'vue-router'

import { useSitesStore } from '../../stores/sites';
import { useNotificationStore } from '../../stores/notification'
const { getSite, updateSite } = useSitesStore(useNotificationStore())

const route = useRoute()
// const router = useRouter()

const onSubmit = async (formData: Site) => {
  await updateSite(formData)
  // router.go(0)
}

// const onLogout = async () => {
//   logoutSite()
// }


// import { useSitesStore } from '../../stores/sites';
// import { useNotificationStore } from '../../stores/notification'
// const { listSites } = useSitesStore(useNotificationStore())

const site = ref<Site | null>(null)

onMounted(async () => {
  const name = route.params.siteName
  site.value = await getSite(name as string)
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
