import { renderToWebStream } from 'vue/server-renderer'
import { createApp } from './main'
import { User } from './types/User.types'

export async function render(_url: string, user: User | null) {
  const { app, router } = createApp()
  let url = _url

  try {
    if (!user) {
      url = '/login'
    }
    await router.push(url);
    await router.isReady();

  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }

  // 404
  const matchedComponents = router.currentRoute.value.matched;
  if (!matchedComponents.length) {
    throw new Error("404");
  }

  // TODO: 403

  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const ctx = {}
  const stream = renderToWebStream(app, ctx)

  return { stream }
}
