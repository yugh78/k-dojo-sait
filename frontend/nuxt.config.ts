import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2026-09-14",
  devtools: { enabled: false },
  modules: ["@nuxt/eslint"],
  css: ["~/assets/main.css"],
  typescript: { strict: true },
  runtimeConfig: {
    public: { siteUrl: "http://localhost:3000" },
  },
  app: {
    head: {
      htmlAttrs: { lang: "ru" },
      meta: [{ name: "theme-color", content: "#151515" }],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/brand/k-dojo.svg" }],
    },
  },
  nitro: {
    compressPublicAssets: true,
    serverAssets: [
      {
        baseName: "gallery",
        dir: fileURLToPath(new URL("./.gallery-cache/data", import.meta.url)),
      },
    ],
    publicAssets: [
      {
        baseURL: "/gallery-images",
        dir: fileURLToPath(new URL("./.gallery-cache/images", import.meta.url)),
        maxAge: 31536000,
      },
    ],
  },
});
