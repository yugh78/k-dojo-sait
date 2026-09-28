export default defineNuxtConfig({
  compatibilityDate: "2026-09-14",
  devtools: { enabled: false },
  modules: ["@nuxt/eslint"],
  css: ["~/assets/main.css"],
  typescript: { strict: true },
  runtimeConfig: {
    apiBase: "http://127.0.0.1:8000",
    public: { siteUrl: "http://localhost:3000" },
  },
  app: {
    head: {
      htmlAttrs: { lang: "ru" },
      meta: [{ name: "theme-color", content: "#151515" }],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/brand/k-dojo.svg" }],
    },
  },
  nitro: { compressPublicAssets: true },
});
