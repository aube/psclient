import { renderToWebStream } from 'vue/server-renderer'
import { createApp } from './main'

export async function render(_url: string) {
  const { app, router } = createApp()

  try {
    await router.push(_url);
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

  return { stream, statusCode }
}