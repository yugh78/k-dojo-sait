export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const path = getRouterParam(event, "path") || "";
  const target = new URL(
    "/api/" + path + (path.endsWith("/") ? "" : "/"),
    config.apiBase,
  );
  target.search = getRequestURL(event).search;
  return proxyRequest(event, target.toString(), {
    headers: { "x-real-ip": getRequestIP(event) || "unknown" },
  });
});
