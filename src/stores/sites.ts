import { defineStore } from 'pinia'
import { Site } from '../types';

export const useSitesStore = defineStore('sites', {

  state: () => ({
    site: {} as Site,
  }),

  actions: {
    async setSite(site: Site) {
      this.site = site
    },

    async getSite(): Promise<Site> {
      return this.site
    },

  },
})
