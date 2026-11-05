export default defineEventHandler((event) => {
  const page = getQuery(event).page ?? "0";
  if (typeof page !== "string" || !/^\d+$/.test(page))
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid gallery page",
    });
  return galleryPhotos(getRouterParam(event, "slug") || "", Number(page));
});
