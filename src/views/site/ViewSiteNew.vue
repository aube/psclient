<script setup lang="ts">
// import { ref, onMounted } from 'vue';

import EntSiteNewForm from '../../entities/site/EntSiteNewForm.vue'

import { SiteNew } from '../../types/Site.types.ts';
import { useRouter } from 'vue-router'

import { useSitesStore } from '../../stores/sites';
import { useNotificationStore } from '../../stores/notification'
const { createSite } = useSitesStore(useNotificationStore())

const router = useRouter()

const onSubmit = async (formData: SiteNew) => {
  await createSite(formData)
  router.push('/')
}

// const onLogout = async () => {
//   logoutSite()
// }


// import { useSitesStore } from '../../stores/sites';
// import { useNotificationStore } from '../../stores/notification'
// const { listSites } = useSitesStore(useNotificationStore())

// const site = ref({})

// onMounted(async () => {
//   const t = await listSites()
//   site.value = t.rows
// })

</script>

<template>
  <div
    id="view-index"
    class="grid gap-4 p-3"
  >
    <EntSiteNewForm
      :site="{}"
      @submit="onSubmit"
    />
  </div>
</template>

<style>
#view-index {
  .p-panel-content {
    padding-bottom: 0px;
  }
}
</style>