import { defineStore } from 'pinia'
import { name, version } from '../../package.json'
import { ActionButton } from '../types'

const MODE = import.meta.env.MODE;
const PROD = import.meta.env.PROD;
const DEV = import.meta.env.DEV;
const SSR = import.meta.env.SSR;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const APP_NAVBAR_NAME = import.meta.env.VITE_APP_NAVBAR_NAME;
const APP_TITLE_NAME = import.meta.env.VITE_APP_TITLE_NAME;
const APP_LANG = import.meta.env.VITE_APP_LANG;


export const useGeneralStore = defineStore('general', {
  state: () => ({
    name,
    version,
    mode: MODE,
    isProd: PROD,
    isDev: DEV,
    isSSR: SSR,
    isBrowser: typeof window !== 'undefined' && typeof document !== 'undefined',
    apiBaseURL: API_BASE_URL,
    navbarName: APP_NAVBAR_NAME || name,
    titleName: APP_TITLE_NAME || name,
    lang: APP_LANG || 'ru',
    actionButtons: [] as ActionButton[],
  }),

  getters: {
    gActionButtons: (state) => {
      return state.actionButtons
    },
  },

  actions: {
    setActionButtons(btns: ActionButton[] = []) {
      this.actionButtons = btns
    },
  },
}
)
