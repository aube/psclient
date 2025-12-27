export const routes = [
  {
    path: '/:page*',
    name: 'page',
    component: (): Promise<typeof import('*.vue')> => import('../views/ViewIndex.vue'),
  },
  // {
  //   path: '/403',
  //   name: 'error403',
  //   component: (): Promise<typeof import('*.vue')> => import('../views/errors/View403.vue'),
  //   meta: {
  //     guestAccess: true,
  //   },
  // },
  // {
  //   path: '/404',
  //   name: 'error404',
  //   component: (): Promise<typeof import('*.vue')> => import('../views/errors/View404.vue'),
  //   meta: {
  //     guestAccess: true,
  //   },
  // },
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'uniRoute',
  //   component: (): Promise<typeof import('*.vue')> => import('../views/ViewIndex.vue'),
  //   meta: {
  //     uniRoute: true,
  //   },
  // },
]
