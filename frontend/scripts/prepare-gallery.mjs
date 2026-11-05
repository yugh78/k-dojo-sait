import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access, realpath } from "node:fs/promises";
import { dirname, resolve, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { GALLERY_PAGE_SIZE } from "../shared/gallery.ts";

const widths = [240, 480, 960, 1600, 2400];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const exists = async (path) =>
  access(path).then(
    () => true,
    () => false,
  );
async function saveJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(value));
}
function requireValue(condition, message) {
  if (!condition) throw new Error(`Gallery: ${message}`);
}
function uniqueSlugs(items, label) {
  const used = new Set();
  for (const item of items) {
    requireValue(
      slugPattern.test(item.slug),
      `invalid ${label} slug: ${item.slug}`,
    );
    requireValue(!used.has(item.slug), `duplicate ${label}: ${item.slug}`);
    requireValue(
      typeof item.title === "string" && item.title.trim(),
      `missing ${label} title`,
    );
    used.add(item.slug);
  }
}
async function publicFile(publicDir, src) {
  requireValue(
    typeof src === "string" && /^\/(?!\/)/.test(src),
    `local public path required: ${src}`,
  );
  const base = await realpath(publicDir);
  const path = await realpath(resolve(base, src.slice(1)));
  const rel = relative(base, path);
  requireValue(
    rel && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel),
    `path outside public: ${src}`,
  );
  return path;
}

export async function prepareGallery({ projectRoot = root } = {}) {
  const contentDir = resolve(projectRoot, "content/gallery");
  const publicDir = resolve(projectRoot, "public");
  const outputDir = resolve(projectRoot, ".gallery-cache");
  const catalog = await readJson(resolve(contentDir, "catalog.json"));
  uniqueSlugs(catalog.categories, "category");
  uniqueSlugs(catalog.albums, "album");
  requireValue(
    Array.isArray(catalog.featured) && catalog.featured.length <= 4,
    "featured must contain at most four photos",
  );
  await mkdir(resolve(outputDir, "images"), { recursive: true });
  const mediaCache = new Map();
  let generatedImages = 0;

  async function imageVariants(src) {
    if (mediaCache.has(src)) return mediaCache.get(src);
    const result = (async () => {
      const input = await readFile(await publicFile(publicDir, src));
      const hash = createHash("sha256")
        .update("kdojo-webp-v1")
        .update(input)
        .digest("hex")
        .slice(0, 20);
      const manifestPath = resolve(outputDir, `media/${hash}.json`);
      if (await exists(manifestPath)) {
        const cached = await readJson(manifestPath);
        if (
          (
            await Promise.all(
              cached.files.map((file) =>
                exists(resolve(outputDir, "images", file)),
              ),
            )
          ).every(Boolean)
        )
          return { ...cached.photo, original: src };
      }
      const metadata = await sharp(input, {
        limitInputPixels: 60000000,
      }).metadata();
      const rotated = (metadata.orientation || 1) >= 5;
      const width = rotated ? metadata.height : metadata.width;
      const height = rotated ? metadata.width : metadata.height;
      requireValue(width && height, `image dimensions missing: ${src}`);
      const sizes = [...new Set(widths.map((size) => Math.min(size, width)))];
      const variants = [];
      for (const size of sizes) {
        const file = `${hash}-${size}.webp`;
        await sharp(input, { limitInputPixels: 60000000 })
          .autoOrient()
          .resize({ width: size, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(resolve(outputDir, "images", file));
        variants.push({ file, url: `/gallery-images/${file}`, width: size });
      }
      const photo = {
        image: variants.at(-1).url,
        image_webp: "",
        image_avif: "",
        thumbnail: variants[0].url,
        srcset: variants
          .map((variant) => `${variant.url} ${variant.width}w`)
          .join(", "),
        original: src,
        width,
        height,
      };
      await saveJson(manifestPath, {
        files: variants.map((variant) => variant.file),
        photo,
      });
      generatedImages++;
      return photo;
    })();
    mediaCache.set(src, result);
    return result;
  }

  const albums = [];
  const featuredByKey = new Map();
  for (const album of catalog.albums) {
    const category = catalog.categories.find(
      (item) => item.slug === album.category,
    );
    requireValue(category, `unknown category for ${album.slug}`);
    requireValue(
      typeof album.description === "string",
      `missing description for ${album.slug}`,
    );
    requireValue(
      album.date === null ||
        (/^\d{4}-\d{2}-\d{2}$/.test(album.date) &&
          !Number.isNaN(Date.parse(album.date)) &&
          new Date(album.date).toISOString().slice(0, 10) === album.date),
      `invalid date for ${album.slug}`,
    );
    const source = await readJson(
      resolve(contentDir, `albums/${album.slug}.json`),
    );
    requireValue(
      Array.isArray(source),
      `photos must be an array: ${album.slug}`,
    );
    const ids = new Set();
    for (const photo of source) {
      requireValue(
        Number.isSafeInteger(photo.id) && photo.id > 0 && !ids.has(photo.id),
        `invalid/duplicate photo id in ${album.slug}`,
      );
      requireValue(
        typeof photo.caption === "string" && photo.caption.trim(),
        `missing caption in ${album.slug}`,
      );
      if (photo.video) await publicFile(publicDir, photo.video);
      ids.add(photo.id);
    }
    requireValue(
      !source.length || ids.has(album.cover),
      `cover does not belong to ${album.slug}`,
    );
    const url = `/gallery/${category.slug}/${album.slug}`;
    const summary = {
      ...album,
      categoryTitle: category.title,
      photoCount: source.length,
      url,
      cover: null,
    };
    // Process two photographs at a time; page-sized metadata never grows with the album.
    for (let offset = 0; offset < source.length; offset += GALLERY_PAGE_SIZE) {
      const items = [];
      const batch = source.slice(offset, offset + GALLERY_PAGE_SIZE);
      for (let start = 0; start < batch.length; start += 2) {
        const pair = await Promise.all(
          batch.slice(start, start + 2).map(async (photo, i) => ({
            ...(await imageVariants(photo.src)),
            id: photo.id,
            caption: photo.caption,
            position: photo.position || "center",
            ...(photo.video ? { video: photo.video } : {}),
            categoryTitle: category.title,
            albumSlug: album.slug,
            albumTitle: album.title,
            albumUrl: url,
            albumTotal: source.length,
            index: offset + start + i,
          })),
        );
        for (const photo of pair) {
          if (photo.id === album.cover)
            summary.cover = {
              ...photo,
              position: album.coverPosition || photo.position,
            };
          if (
            catalog.featured.some(
              (item) => item.album === album.slug && item.photo === photo.id,
            )
          )
            featuredByKey.set(`${album.slug}:${photo.id}`, photo);
          items.push(photo);
        }
      }
      await saveJson(
        resolve(
          outputDir,
          `data/albums/${album.slug}/${offset / GALLERY_PAGE_SIZE}.json`,
        ),
        {
          items,
          total: source.length,
          page: offset / GALLERY_PAGE_SIZE,
          pageSize: GALLERY_PAGE_SIZE,
        },
      );
    }
    if (!source.length)
      await saveJson(resolve(outputDir, `data/albums/${album.slug}/0.json`), {
        items: [],
        total: 0,
        page: 0,
        pageSize: GALLERY_PAGE_SIZE,
      });
    albums.push(summary);
  }
  const featuredKeys = catalog.featured.map(
    (item) => `${item.album}:${item.photo}`,
  );
  requireValue(
    new Set(featuredKeys).size === featuredKeys.length,
    "duplicate featured photo",
  );
  const featured = featuredKeys.map((key) => {
    requireValue(featuredByKey.has(key), `featured photo not found: ${key}`);
    return featuredByKey.get(key);
  });
  const categories = catalog.categories.map((category) => {
    const matching = albums.filter((album) => album.category === category.slug);
    return {
      ...category,
      albumCount: matching.length,
      cover: matching.find((album) => album.cover)?.cover || null,
    };
  });
  await saveJson(resolve(outputDir, "data/catalog.json"), {
    categories,
    albums,
  });
  await saveJson(resolve(outputDir, "data/featured.json"), featured);
  return {
    albums: albums.length,
    photos: albums.reduce((sum, album) => sum + album.photoCount, 0),
    generatedImages,
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = await prepareGallery();
  console.log(
    `Gallery: ${result.albums} albums, ${result.photos} photos; optimized ${result.generatedImages} new images.`,
  );
}
