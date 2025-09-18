
export const routes = [
  {
    path: '/',
    name: 'home',
    component: (): Promise<typeof import('*.vue')> => import('../views/ViewIndex.vue') as Promise<typeof import('*.vue')>,
  },
  {
    path: '/site/new',
    name: 'siteNew',
    component: (): Promise<typeof import('*.vue')> => import('../views/site/ViewSiteNew.vue'),
  },
  {
    path: '/site/:siteName',
    children: [
      {
        path: 'pages/:parentID?',
        name: 'pages',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPages.vue'),
      },
      {
        path: 'page/:pageID',
        name: 'page',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPage.vue'),
      },
      {
        path: 'page/new/:parentID?',
        name: 'pageNew',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPageNew.vue'),
      },
      {
        path: 'templates',
        name: 'templates',
        component: (): Promise<typeof import('*.vue')> => import('../views/template/ViewTemplates.vue'),
      },
      {
        path: 'template/:templateID',
        name: 'template',
        component: (): Promise<typeof import('*.vue')> => import('../views/template/ViewTemplate.vue'),
      },
      {
        path: 'template/new',
        name: 'templateNew',
        component: (): Promise<typeof import('*.vue')> => import('../views/template/ViewTemplateNew.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: (): Promise<typeof import('*.vue')> => import('../views/site/ViewSiteSettings.vue'),
      },
      {
        path: 'uploads',
        children: [
          {
            path: 'files',
            name: 'files',
            component: (): Promise<typeof import('*.vue')> => import('../views/uploads/ViewUploadFile.vue'),
          },
          {
            path: 'images',
            name: 'images',
            component: (): Promise<typeof import('*.vue')> => import('../views/uploads/ViewUploadImage.vue'),
          },
        ],
      },
      {
        path: 'users',
        name: 'users',
        component: (): Promise<typeof import('*.vue')> => import('../views/page/ViewPage.vue'),
      },
    ],
  },
  {
    path: '/profile',
    name: 'profile',
    component: (): Promise<typeof import('*.vue')> => import('../views/user/ViewProfile.vue'),
    meta: {
      guestAccess: false,
    },
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
