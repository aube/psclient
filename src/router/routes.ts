
export const routes = [
  {
    path: '/',
    name: 'home',
    component: (): Promise<typeof import('*.vue')> => import('../views/ViewIndex.vue') as Promise<typeof import('*.vue')>,
    meta: {

    },
  },
  {
    path: '/pages',
    name: 'pages',
    component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPages.vue'),
  },
  {
    path: '/page/:id',
    name: 'page',
    component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: (): Promise<typeof import('*.vue')> => import('../views/ViewLogin.vue'),
  },
  // {
  //   path: '/logout',
  //   name: 'logout',
  //   component: (): Promise<typeof import('*.vue')> => import('../views/PageLogout.vue'),
  // },
  {
    path: '/register',
    name: 'register',
    component: (): Promise<typeof import('*.vue')> => import('../views/ViewRegister.vue'),
  },
  {
    path: '/403',
    name: 'error403',
    component: (): Promise<typeof import('*.vue')> => import('../views/errors/View403.vue'),
  },
  {
    path: '/404',
    name: 'error404',
    component: (): Promise<typeof import('*.vue')> => import('../views/errors/View404.vue'),
  },
  // {
  //   path: '/upload',
  //   name: 'upload',
  //   component: (): Promise<typeof import('*.vue')> => import('../views/PageUpload.vue'),
  // },
  // {
  //   path: '/reminder',
  //   name: 'reminder',
  //   component: (): Promise<typeof import('*.vue')> => import('../views/PageReminder.vue'),
  // },
]
