export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") || "";
  return {
    album: await galleryAlbum(slug),
    photos: await galleryPhotos(slug, 0),
  };
});
