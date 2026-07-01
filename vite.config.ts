import path from "path"
import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import legacy from "@vitejs/plugin-legacy"
import { dynamicBase } from "vite-plugin-dynamic-base"
import { viteStaticCopy } from "vite-plugin-static-copy"
import type { Plugin } from "vite"

// vite-plugin-dynamic-base converts data-src → src in its generateBundle hook,
// but @vitejs/plugin-legacy expects data-src on vite-legacy-polyfill so the
// legacy detection script can read it.  This plugin runs its generateBundle
// after dynamicBase (enforce:post, registered last) and restores data-src.
function fixLegacyPolyfillDataSrc(): Plugin {
  return {
    name: "fix-legacy-polyfill-data-src",
    enforce: "post",
    apply: "build",
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (
          chunk.type === "asset" &&
          chunk.fileName.endsWith(".html") &&
          typeof chunk.source === "string"
        ) {
          chunk.source = chunk.source.replace(
            /("id"\s*:\s*"vite-legacy-polyfill"[^}]*?)"src"\s*:/,
            (match) => match.replace(/"src"\s*:/, '"data-src":'),
          )
          // 构建期断言:HTML 若含 legacy polyfill,处理后必须带 data-src;否则说明
          // plugin-legacy / dynamic-base 升级改了输出格式,老浏览器 fallback 会静默失效。
          if (chunk.source.includes('"vite-legacy-polyfill"')) {
            const attrs = chunk.source.match(
              /\{[^{}]*"vite-legacy-polyfill"[^{}]*\}/,
            )
            if (!attrs || !/"data-src"\s*:/.test(attrs[0])) {
              throw new Error(
                `[fix-legacy-polyfill-data-src] ${chunk.fileName}: ` +
                  `vite-legacy-polyfill 未带 data-src,legacy 检测脚本将拿不到 polyfill URL。` +
                  `@vitejs/plugin-legacy 或 vite-plugin-dynamic-base 可能已升级,请更新此正则。`,
              )
            }
          }
        }
      }
    },
  }
}

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      // "@solidjs/router": path.resolve(__dirname, "solid-router/src"),
      "solid-icons": path.resolve(__dirname, "node_modules/solid-icons"),
    },
  },
  plugins: [
    solidPlugin(),
    legacy({
      targets: ["defaults"],
    }),
    dynamicBase({
      // dynamic public path var string, default window.__dynamic_base__
      publicPath: "window.__dynamic_base__",
      // dynamic load resources on index.html, default false. maybe change default true
      transformIndexHtml: true,
      transformIndexHtmlConfig: {
        insertBodyAfter: true,
      },
    }),
    process.env.VITE_LITE !== "true"
      ? viteStaticCopy({
          targets: [
            {
              src: "node_modules/monaco-editor/min/*",
              dest: "static/monaco-editor",
            },
            {
              src: "node_modules/katex/dist/katex.min.css",
              dest: "static/katex",
            },
            {
              src: "node_modules/katex/dist/fonts/*",
              dest: "static/katex/fonts",
            },
            {
              src: "node_modules/mermaid/dist/mermaid.min.js",
              dest: "static/mermaid",
            },
            {
              src: "node_modules/libheif-js/libheif-wasm/libheif.{js,wasm}",
              dest: "static/libheif",
            },
            {
              src: "node_modules/@jellyfin/libass-wasm/dist/js/subtitles-octopus-worker.{js,wasm}",
              dest: "static/libass-wasm",
            },
            {
              src: "src/components/artplayer-plugin-ass/fonts/*",
              dest: "static/fonts",
            },
          ],
        })
      : null,
    fixLegacyPolyfillDataSrc(),
  ],
  base: process.env.NODE_ENV === "production" ? "/__dynamic_base__/" : "/",
  // base: "/",
  build: {
    // target: "es2015", //next
    // polyfillDynamicImport: false,
  },
  // experimental: {
  //   renderBuiltUrl: (filename, { type, hostId, hostType }) => {
  //     if (type === "asset") {
  //       return { runtime: `window.OPENLIST_CONFIG.cdn/${filename}` };
  //     }
  //     return { relative: true };
  //   },
  // },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5244",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
