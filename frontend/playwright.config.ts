import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: "http://127.0.0.1:13000", trace: "retain-on-failure" },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: [
    {
      command: "python ../server/e2e_server.py",
      url: "http://127.0.0.1:18000/api/health/",
      reuseExistingServer: false,
    },
    {
      command: "node .output/server/index.mjs",
      url: "http://127.0.0.1:13000",
      reuseExistingServer: false,
      env: {
        PORT: "13000",
        HOST: "127.0.0.1",
        NUXT_API_BASE: "http://127.0.0.1:18000",
        NUXT_PUBLIC_SITE_URL: "http://127.0.0.1:13000",
      },
    },
  ],
});
