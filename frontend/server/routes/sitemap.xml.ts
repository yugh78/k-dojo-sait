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
  for (const endpoint of ["coaches", "events"]) {
    try {
      const rows = await $fetch<{ slug: string }[]>(
        `${config.apiBase}/api/${endpoint}/`,
        { timeout: 3000 },
      );
      routes.push(
        ...rows.map((row) => `/${endpoint}/${encodeURIComponent(row.slug)}`),
      );
    } catch {
      setHeader(event, "Cache-Control", "no-store");
    }
  }
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((path) => `<url><loc>${escapeXml(new URL(path, config.public.siteUrl).toString())}</loc></url>`).join("")}</urlset>`;
});
