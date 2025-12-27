import { renderToWebStream } from 'vue/server-renderer'
import { createApp } from './main'
import { useUserStore } from './stores/user'
import { useSitesStore } from './stores/sites'
import { useRestApi } from './lib/restapi'
import { User, Site } from './types'
import * as devalue from 'devalue';



export async function render(_url: string, user: User | null, site: Site, token: string) {
  const { app, router, pinia } = createApp()
  const { setHeader } = useRestApi()

  // console.log("user", user)

  const userStore = useUserStore()
  const sitesStore = useSitesStore()

  setHeader("Authorization", `Bearer ${token}`)

  userStore.setUser(user)
  sitesStore.setSite(site)

  try {
    await router.push('/' + _url);
    await router.isReady();

  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }

  const route = router.currentRoute.value
  let statusCode = 200

  // 404
  if (route.name === "error404") {
    statusCode = 404

  // 403
  } else if (route.name === "error403") {
    statusCode = 403
  }

  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const ctx = {}
  const stream = renderToWebStream(app, ctx)
  const serializedState = devalue.uneval(pinia.state.value);

  return { stream, statusCode, serializedState }
}