export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const path = getRouterParam(event, "path") || "";
  const target = new URL(
    "/api/" + path + (path.endsWith("/") ? "" : "/"),
    config.apiBase,
  );
  const site = new URL(config.public.siteUrl);
  target.search = getRequestURL(event).search;
  return proxyRequest(event, target.toString(), {
    headers: {
      "x-real-ip": getRequestIP(event) || "unknown",
      host: site.host,
      "x-forwarded-proto": site.protocol.slice(0, -1),
    },
  });
});
