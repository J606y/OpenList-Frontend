/* @refresh reload */
import { Router } from "@solidjs/router"
import { render } from "solid-js/web"

import { Index } from "./app"

declare global {
  interface Window {
    [key: string]: any
  }
}

declare module "solid-js" {
  namespace JSX {
    interface CustomEvents extends HTMLElementEventMap {}
    interface CustomCaptureEvents extends HTMLElementEventMap {}
  }
}

const RELOAD_KEY = "__chunk_reload_ts__"
function reloadOnceOnChunkError() {
  const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
  if (Date.now() - last < 10000) return // 10s 内不重复刷,防死循环
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  location.reload()
}
function isChunkLoadError(msg?: string) {
  return (
    !!msg &&
    /dynamically imported module|Failed to fetch dynamically|error loading dynamically imported module|Importing a module script failed/i.test(
      msg,
    )
  )
}
window.addEventListener("vite:preloadError" as any, (e: any) => {
  e.preventDefault()
  reloadOnceOnChunkError()
})
window.addEventListener("error", (e) => {
  if (isChunkLoadError((e as ErrorEvent).message)) reloadOnceOnChunkError()
})
window.addEventListener("unhandledrejection", (e) => {
  const r: any = (e as PromiseRejectionEvent).reason
  if (isChunkLoadError(typeof r === "string" ? r : r?.message))
    reloadOnceOnChunkError()
})

render(
  () => (
    <Router>
      <Index />
    </Router>
  ),
  document.getElementById("root") as HTMLElement,
)
