import type { GalleryImage } from "../app/types/api";

export const GALLERY_PAGE_SIZE = 24;

export interface GalleryCategory {
  slug: string;
  title: string;
  description: string;
  albumCount: number;
  cover: GalleryImage | null;
}

export interface GalleryAlbum {
  slug: string;
  category: string;
  categoryTitle: string;
  title: string;
  date: string | null;
  description: string;
  cover: GalleryImage | null;
  photoCount: number;
  url: string;
}

export interface GalleryCatalog {
  categories: GalleryCategory[];
  albums: GalleryAlbum[];
}

export interface GalleryPhotoPage {
  items: GalleryImage[];
  total: number;
  page: number;
  pageSize: number;
}
