import type { GalleryImage } from "~/types/api";
import { GALLERY_PAGE_SIZE, type GalleryPhotoPage } from "~~/shared/gallery";
import { galleryThumbnailIndices } from "~/utils/gallery";

export function useGalleryLightbox(images: () => GalleryImage[]) {
  const current = shallowRef<GalleryImage>();
  const frameKey = ref(0);
  const activeIndex = ref<number | null>(null);
  const total = ref(0);
  const loading = ref(false);
  const error = ref("");
  const photoCache = shallowRef(new Map<number, GalleryImage>());
  const pages = new Map<number, GalleryPhotoPage>();
  const requests = new Map<number, Promise<void>>();
  const preloaded = new Map<string, HTMLImageElement>();
  let controller: AbortController | undefined;
  let albumSlug = "";
  let session = 0;
  let navigation = 0;
  let requestedIndex = 0;

  const thumbnailIndices = computed(() =>
    activeIndex.value === null
      ? []
      : galleryThumbnailIndices(activeIndex.value, total.value),
  );
  const thumbnails = computed(() =>
    thumbnailIndices.value.map((index) => ({
      index,
      photo: photoCache.value.get(index),
    })),
  );
  const wrap = (index: number) => (index + total.value) % total.value;

  async function ensure(indices: number[]) {
    if (!albumSlug) return;
    const activeSession = session;
    await Promise.all(
      [
        ...new Set(
          indices.map((index) => Math.floor(index / GALLERY_PAGE_SIZE)),
        ),
      ].map(async (page) => {
        const cached = pages.get(page);
        if (cached) {
          pages.delete(page);
          pages.set(page, cached);
          return;
        }
        if (requests.has(page)) return requests.get(page);
        const request = (async () => {
          const result = await $fetch<GalleryPhotoPage>(
            `/api/gallery/albums/${encodeURIComponent(albumSlug)}/photos`,
            { query: { page }, signal: controller?.signal },
          );
          if (session !== activeSession) return;
          pages.set(page, result);
          // Keep at most 120 photo records even when navigating a very large album.
          const protectedPages = new Set([
            Math.floor((activeIndex.value ?? 0) / GALLERY_PAGE_SIZE),
            Math.floor(requestedIndex / GALLERY_PAGE_SIZE),
          ]);
          for (const candidate of pages.keys()) {
            if (pages.size <= 5) break;
            if (!protectedPages.has(candidate)) pages.delete(candidate);
          }
          const next = new Map<number, GalleryImage>();
          for (const value of pages.values())
            for (const photo of value.items) next.set(photo.index!, photo);
          photoCache.value = next;
        })().finally(() => {
          if (session === activeSession) requests.delete(page);
        });
        requests.set(page, request);
        return request;
      }),
    );
  }

  function preload(photo: GalleryImage) {
    if (preloaded.has(photo.image)) return preloaded.get(photo.image)!;
    const image = new Image();
    image.addEventListener(
      "error",
      () => {
        if (preloaded.get(photo.image) === image) preloaded.delete(photo.image);
      },
      { once: true },
    );
    image.decoding = "async";
    image.sizes = "(max-width: 600px) 90vw, (max-width: 1200px) 92vw, 1060px";
    if (photo.srcset) image.srcset = photo.srcset;
    image.src = photo.image;
    preloaded.set(photo.image, image);
    while (preloaded.size > 5) preloaded.delete(preloaded.keys().next().value!);
    return image;
  }

  async function prepareNeighbours() {
    if (activeIndex.value === null || !total.value) return;
    const activeSession = session;
    const index = activeIndex.value;
    try {
      const neighbours = [wrap(index - 1), wrap(index + 1)];
      await ensure([...thumbnailIndices.value, ...neighbours]);
      if (activeSession !== session || index !== activeIndex.value) return;
      for (const next of neighbours) {
        const photo = photoCache.value.get(next);
        if (photo && !photo.video) preload(photo);
      }
    } catch {
      if (activeSession === session && index === activeIndex.value)
        error.value =
          "Не удалось загрузить соседние кадры. Попробуйте ещё раз.";
    }
  }

  function open(photo: GalleryImage, index: number) {
    dispose();
    controller = new AbortController();
    albumSlug = photo.albumSlug || "";
    total.value = photo.albumTotal ?? images().length;
    activeIndex.value = photo.index ?? index;
    requestedIndex = activeIndex.value;
    current.value = photo;
    frameKey.value++;
    const initial = albumSlug
      ? images()
          .filter((item) => item.albumSlug === albumSlug)
          .slice(0, GALLERY_PAGE_SIZE)
      : images();
    photoCache.value = new Map(
      initial.map((item, localIndex) => [item.index ?? localIndex, item]),
    );
    void prepareNeighbours();
  }

  async function select(index: number) {
    if (activeIndex.value === null || !total.value) return;
    const target = wrap(index);
    requestedIndex = target;
    const activeSession = session;
    const requestNumber = ++navigation;
    loading.value = true;
    error.value = "";
    try {
      await ensure([target]);
      if (session !== activeSession || requestNumber !== navigation) return;
      const photo = photoCache.value.get(target);
      if (!photo) throw new Error("Photo missing");
      if (!photo.video) await preload(photo).decode();
      if (session !== activeSession || requestNumber !== navigation) return;
      current.value = photo;
      // A retry of the same URL must replace a previously broken <img> too.
      frameKey.value++;
      activeIndex.value = target;
      void prepareNeighbours();
    } catch {
      if (session === activeSession && requestNumber === navigation)
        error.value = "Фотография не загрузилась. Попробуйте ещё раз.";
    } finally {
      if (session === activeSession && requestNumber === navigation)
        loading.value = false;
    }
  }

  function change(step: number) {
    return select(requestedIndex + step);
  }
  function retry() {
    return select(requestedIndex);
  }
  function dispose() {
    session++;
    navigation++;
    controller?.abort();
    pages.clear();
    requests.clear();
    preloaded.clear();
    photoCache.value = new Map();
    activeIndex.value = null;
    current.value = undefined;
    loading.value = false;
    error.value = "";
  }
  onBeforeUnmount(dispose);
  return {
    current,
    frameKey,
    activeIndex,
    total,
    thumbnails,
    loading,
    error,
    open,
    select,
    change,
    retry,
    dispose,
  };
}
