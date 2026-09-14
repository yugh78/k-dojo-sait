import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: [
    {
      command: "python ../server/manage.py runserver 127.0.0.1:8000 --noreload",
      url: "http://127.0.0.1:8000/api/health/",
      reuseExistingServer: !process.env.CI,
      env: { DJANGO_DEBUG: "true", USE_SQLITE: "true" },
    },
    {
      command: "node .output/server/index.mjs",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: "3000",
        HOST: "127.0.0.1",
        NUXT_API_BASE: "http://127.0.0.1:8000",
      },
    },
  ],
});
