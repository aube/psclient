<template>
  <div
    id="view-index"
    class="grid gap-4"
  >
    <EntSiteSettingsForm
      :site="site"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

import EntSiteSettingsForm from '../../entities/site/EntSiteSettingsForm.vue'

import { Site } from '../../types/Site.types.ts';
import { useRouter, useRoute } from 'vue-router'

import { useSitesStore } from '../../stores/sites';
import { useNotificationStore } from '../../stores/notification'
const { getSite, updateSite } = useSitesStore(useNotificationStore())

const route = useRoute()
const router = useRouter()

const onSubmit = async (formData: Site) => {
  await updateSite(formData)
  router.push('/')
}

// const onLogout = async () => {
//   logoutSite()
// }


// import { useSitesStore } from '../../stores/sites';
// import { useNotificationStore } from '../../stores/notification'
// const { listSites } = useSitesStore(useNotificationStore())

const site = ref()

onMounted(async () => {
  const name = route.params.siteName
  site.value = await getSite(name as string)
})

</script>


<style>
#view-index {
  .p-panel-content {
    padding-bottom: 0px;
  }
}
</style>