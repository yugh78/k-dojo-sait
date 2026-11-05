import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  mkdir,
  mkdtemp,
  readFile,
  writeFile,
  copyFile,
  rm,
} from "node:fs/promises";
import { resolve, relative, sep, isAbsolute } from "node:path";
import sharp from "sharp";
import { prepareGallery } from "../../scripts/prepare-gallery.mjs";
import { galleryThumbnailIndices } from "../../app/utils/gallery";

describe("gallery publishing", () => {
  const base = resolve(".gallery-cache");
  let root: string;
  const catalog = {
    categories: [{ slug: "club", title: "Club", description: "Club photos" }],
    albums: [
      {
        slug: "large-album",
        category: "club",
        title: "Large album",
        date: "2026-10-02",
        description: "Training",
        cover: 1001,
      },
    ],
    featured: [
      { album: "large-album", photo: 1001 },
      { album: "large-album", photo: 1 },
    ],
  };
  beforeAll(async () => {
    await mkdir(base, { recursive: true });
    root = await mkdtemp(resolve(base, "test-"));
    await mkdir(resolve(root, "public"), { recursive: true });
    await mkdir(resolve(root, "content/gallery/albums"), { recursive: true });
    await sharp({
      create: { width: 120, height: 80, channels: 3, background: "#c42c30" },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toFile(resolve(root, "public/photo.jpg"));
    await writeFile(
      resolve(root, "content/gallery/catalog.json"),
      JSON.stringify(catalog),
    );
  });
  afterAll(async () => {
    if (!root) return;
    const path = relative(base, root);
    if (
      !path ||
      path === ".." ||
      path.startsWith(`..${sep}`) ||
      isAbsolute(path)
    )
      throw new Error("Unsafe test cleanup");
    await rm(root, { recursive: true, force: true });
  });
  it("publishes a thousand-photo album as bounded pages and preserves orientation and featured order", async () => {
    const photos = Array.from({ length: 1001 }, (_, index) => ({
      id: index + 1,
      src: "/photo.jpg",
      caption: `Photo ${index + 1}`,
    }));
    await writeFile(
      resolve(root, "content/gallery/albums/large-album.json"),
      JSON.stringify(photos),
    );
    const result = await prepareGallery({ projectRoot: root });
    expect(result).toEqual({ albums: 1, photos: 1001, generatedImages: 1 });
    const read = async (name: string) =>
      JSON.parse(
        await readFile(resolve(root, ".gallery-cache/data", name), "utf8"),
      );
    const first = await read("albums/large-album/0.json");
    const last = await read("albums/large-album/41.json");
    expect(first.items).toHaveLength(24);
    expect(last.items).toHaveLength(17);
    expect(last.items[0].index).toBe(984);
    expect(last.items.at(-1).id).toBe(1001);
    expect(first.items[0]).toMatchObject({
      width: 80,
      height: 120,
      albumTotal: 1001,
    });
    expect(
      (await read("featured.json")).map((photo: { id: number }) => photo.id),
    ).toEqual([1001, 1]);
    expect((await read("catalog.json")).albums[0].images).toBeUndefined();
    expect((await prepareGallery({ projectRoot: root })).generatedImages).toBe(
      0,
    );
    // Moving an original should reuse its optimized images, but update its URL.
    await mkdir(resolve(root, "public/gallery/children"), { recursive: true });
    await copyFile(
      resolve(root, "public/photo.jpg"),
      resolve(root, "public/gallery/children/photo.jpg"),
    );
    await writeFile(
      resolve(root, "content/gallery/albums/large-album.json"),
      JSON.stringify(
        photos.map((photo) => ({
          ...photo,
          src: "/gallery/children/photo.jpg",
        })),
      ),
    );
    expect((await prepareGallery({ projectRoot: root })).generatedImages).toBe(
      0,
    );
    expect((await read("featured.json"))[0].original).toBe(
      "/gallery/children/photo.jpg",
    );
    expect((await read("catalog.json")).albums[0].cover.original).toBe(
      "/gallery/children/photo.jpg",
    );
    expect((await read("albums/large-album/0.json")).items[0].image).toBe(
      first.items[0].image,
    );
  });
  it("rejects duplicate photo IDs instead of silently linking to the wrong photo", async () => {
    await writeFile(
      resolve(root, "content/gallery/albums/large-album.json"),
      JSON.stringify([
        { id: 1, src: "/photo.jpg", caption: "One" },
        { id: 1, src: "/photo.jpg", caption: "Two" },
      ]),
    );
    await expect(prepareGallery({ projectRoot: root })).rejects.toThrow(
      "duplicate photo id",
    );
  });
  it("bounds thumbnail windows for large and short albums", () => {
    expect(galleryThumbnailIndices(0, 10000)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
    expect(galleryThumbnailIndices(9999, 10000)).toEqual([
      9991, 9992, 9993, 9994, 9995, 9996, 9997, 9998, 9999,
    ]);
    expect(galleryThumbnailIndices(1, 2)).toEqual([0, 1]);
    expect(galleryThumbnailIndices(0, 0)).toEqual([]);
  });
});
