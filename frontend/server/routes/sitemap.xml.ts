const escapeXml = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c] || c,
  );
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const site = new URL(config.public.siteUrl);
  const routes = [
    "/",
    "/about",
    "/kyokushin",
    "/bjj",
    "/mowgli",
    "/coaches",
    "/schedule",
    "/pricing",
    "/events",
    "/results",
    "/gallery",
    "/contacts",
    "/privacy",
    "/personal-data",
  ];
  const results = await Promise.allSettled(
    ["coaches", "events", "programs"].map(async (endpoint) => {
      const rows = await $fetch<{ slug: string }[]>(
        `${config.apiBase}/api/${endpoint}/`,
        {
          timeout: 3000,
          headers: {
            host: site.host,
            "x-forwarded-proto": site.protocol.slice(0, -1),
          },
        },
      );
      return rows.map((row) =>
        endpoint === "programs"
          ? `/${encodeURIComponent(row.slug)}`
          : `/${endpoint}/${encodeURIComponent(row.slug)}`,
      );
    }),
  );
  for (const result of results) {
    if (result.status === "fulfilled") routes.push(...result.value);
    else setHeader(event, "Cache-Control", "no-store");
  }
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(routes)].map((path) => `<url><loc>${escapeXml(new URL(path, site).toString())}</loc></url>`).join("")}</urlset>`;
});
