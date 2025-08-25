
export const routes = [
  {
    path: '/',
    name: 'home',
    component: (): Promise<typeof import('*.vue')> => import('../views/ViewIndex.vue') as Promise<typeof import('*.vue')>,
  },
  {
    path: '/site/:siteName',
    children: [
      {
        path: '',
        name: 'pages',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPages.vue'),
      },
      {
        path: 'page/:id?',
        name: 'page',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPage.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPage.vue'),
      },
      {
        path: 'images',
        name: 'images',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPage.vue'),
      },
      {
        path: 'users',
        name: 'users',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: (): Promise<typeof import('*.vue')> => import('../views/ViewLogin.vue'),
    meta: {
      guestAccess: true,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: (): Promise<typeof import('*.vue')> => import('../views/ViewRegister.vue'),
    meta: {
      guestAccess: true,
    },
  },
  {
    path: '/403',
    name: 'error403',
    component: (): Promise<typeof import('*.vue')> => import('../views/errors/View403.vue'),
    meta: {
      guestAccess: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'error404',
    component: (): Promise<typeof import('*.vue')> => import('../views/errors/View404.vue'),
    meta: {
      guestAccess: true,
    },
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
