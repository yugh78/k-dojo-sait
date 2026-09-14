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
      meta: [{ name: "theme-color", content: "#f3f1ec" }],
    },
  },
  nitro: { compressPublicAssets: true },
});
