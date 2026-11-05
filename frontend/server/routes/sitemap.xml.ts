import content from "../../app/data/club.json";
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
  for (const endpoint of ["coaches", "events", "programs"] as const) {
    for (const row of content[endpoint] as { slug: string }[]) {
      routes.push(
        endpoint === "programs"
          ? `/${encodeURIComponent(row.slug)}`
          : `/${endpoint}/${encodeURIComponent(row.slug)}`,
      );
    }
  }
  const gallery = await galleryCatalog();
  for (const category of gallery.categories)
    routes.push(`/gallery/${category.slug}`);
  for (const album of gallery.albums) routes.push(album.url);
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(routes)].map((path) => `<url><loc>${escapeXml(new URL(path, site).toString())}</loc></url>`).join("")}</urlset>`;
});
