import { spawn } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

const frontend = fileURLToPath(new URL("..", import.meta.url));
const repo = fileURLToPath(new URL("../..", import.meta.url));
const localCaddy = fileURLToPath(
  new URL(
    `../../.tools/caddy/caddy${process.platform === "win32" ? ".exe" : ""}`,
    import.meta.url,
  ),
);
const caddy =
  process.env.CADDY_BINARY ||
  (await access(localCaddy).then(
    () => localCaddy,
    () => "caddy",
  ));
const siteUrl = "http://127.0.0.1:14001";
const services = [];
let startupError;
let browser;

function start(command, args, options) {
  const service = spawn(command, args, {
    windowsHide: true,
    stdio: "ignore",
    ...options,
  });
  service.on("error", (error) => {
    startupError = error;
  });
  service.on("exit", (code) => {
    if (code) startupError = new Error(`${command} exited: ${code}`);
  });
  services.push(service);
}

async function requireFreePort(port) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => server.close(resolve));
  });
}

try {
  for (const port of [19000, 14000, 14001, 9223]) await requireFreePort(port);
  const config = new URL("../../.tools/lighthouse.Caddyfile", import.meta.url);
  await mkdir(new URL("../../.tools/", import.meta.url), { recursive: true });
  await writeFile(
    config,
    `{
  admin off
  auto_https off
}
http://127.0.0.1:14001 {
  encode zstd gzip
  reverse_proxy 127.0.0.1:14000
}
`,
  );
  start(
    process.env.PYTHON_BINARY || "python",
    ["server/e2e_server.py", "19000"],
    { cwd: repo },
  );
  start(process.execPath, [".output/server/index.mjs"], {
    cwd: frontend,
    env: {
      ...process.env,
      PORT: "14000",
      HOST: "127.0.0.1",
      NUXT_API_BASE: "http://127.0.0.1:19000",
      NUXT_PUBLIC_SITE_URL: siteUrl,
    },
  });
  start(
    caddy,
    ["run", "--config", fileURLToPath(config), "--adapter", "caddyfile"],
    { cwd: repo },
  );
  for (const port of [19000, 14000, 14001]) {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (startupError) throw startupError;
      try {
        const response = await fetch(
          `http://127.0.0.1:${port}${port === 19000 ? "/api/health/" : "/"}`,
        );
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        /* Wait for the local server to start. */
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (!ready) throw new Error("Server not ready: " + port);
  }
  const response = await fetch(siteUrl, {
    headers: { "Accept-Encoding": "gzip" },
  });
  if (response.headers.get("content-encoding") !== "gzip")
    throw new Error("Caddy compression is not active");
  browser = await chromium.launch({
    headless: true,
    args: ["--remote-debugging-port=9223"],
  });
  const result = await lighthouse(siteUrl, {
    port: 9223,
    output: ["html", "json"],
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  });
  await mkdir(new URL("../reports/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../reports/lighthouse.html", import.meta.url),
    result.report[0],
  );
  await writeFile(
    new URL("../reports/lighthouse.json", import.meta.url),
    result.report[1],
  );
  console.log(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(result.lhr.categories).map(([name, value]) => [
          name,
          Math.round(value.score * 100),
        ]),
      ),
    ),
  );
} finally {
  await browser?.close();
  for (const service of services.reverse()) service.kill();
}
