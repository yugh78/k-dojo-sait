import type { GalleryCatalog, GalleryPhotoPage } from "../../shared/gallery";
import type { GalleryImage } from "../../app/types/api";

export async function galleryCatalog() {
  const data =
    await useStorage("assets:gallery").getItem<GalleryCatalog>("catalog.json");
  if (!data)
    throw createError({
      statusCode: 503,
      statusMessage: "Gallery unavailable",
    });
  return data;
}

export async function galleryAlbum(slug: string) {
  const album = (await galleryCatalog()).albums.find(
    (item) => item.slug === slug,
  );
  if (!album)
    throw createError({ statusCode: 404, statusMessage: "Album not found" });
  return album;
}

export async function galleryPhotos(slug: string, page: number) {
  const album = await galleryAlbum(slug);
  const { GALLERY_PAGE_SIZE } = await import("../../shared/gallery");
  if (
    !Number.isSafeInteger(page) ||
    page < 0 ||
    page > Math.max(0, Math.ceil(album.photoCount / GALLERY_PAGE_SIZE) - 1)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid gallery page",
    });
  }
  const data = await useStorage("assets:gallery").getItem<GalleryPhotoPage>(
    `albums/${album.slug}/${page}.json`,
  );
  if (!data)
    throw createError({
      statusCode: 503,
      statusMessage: "Gallery unavailable",
    });
  return data;
}

export async function galleryFeatured() {
  return (
    (await useStorage("assets:gallery").getItem<GalleryImage[]>(
      "featured.json",
    )) || []
  );
}
