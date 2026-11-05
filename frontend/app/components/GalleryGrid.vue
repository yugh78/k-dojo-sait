<script setup lang="ts">
import type { GalleryImage } from "~/types/api";

const props = defineProps<{ images: GalleryImage[] }>();
const grid = ref<HTMLElement>();
const dialog = ref<HTMLDialogElement>();
const thumbnailStrip = ref<HTMLElement>();
const {
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
} = useGalleryLightbox(() => props.images);
const captionId = useId();
let observer: IntersectionObserver | undefined;
let source: HTMLElement | undefined;
let animation: Animation | undefined;
const closing = ref(false);
let pointer: { x: number; y: number; id: number } | undefined;
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function show(index: number, event: MouseEvent) {
  const photo = props.images[index];
  if (!photo || dialog.value?.open) return;
  source = event.currentTarget as HTMLElement;
  open(photo, index);
  await nextTick();
  dialog.value?.showModal();
  animateDialog(false);
}

function animateDialog(reverse: boolean) {
  if (!dialog.value || reducedMotion()) return;
  animation?.cancel();
  const target = dialog.value.getBoundingClientRect();
  const origin = source?.isConnected ? source.getBoundingClientRect() : target;
  const dx = origin.x + origin.width / 2 - target.x - target.width / 2;
  const dy = origin.y + origin.height / 2 - target.y - target.height / 2;
  const scale = Math.min(
    0.85,
    origin.width / target.width,
    origin.height / target.height,
  );
  const from = {
    transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
    opacity: 0,
  };
  const to = { transform: "translate(0, 0) scale(1)", opacity: 1 };
  animation = dialog.value.animate(reverse ? [to, from] : [from, to], {
    duration: 350,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fill: "forwards",
  });
  return animation.finished.catch(() => {});
}

async function close() {
  if (closing.value || !dialog.value?.open) return;
  closing.value = true;
  dialog.value.querySelector("video")?.pause();
  await animateDialog(true);
  dialog.value?.close();
  animation?.cancel();
  closing.value = false;
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType !== "touch" || current.value?.video || !event.isPrimary)
    return;
  pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}
function onPointerUp(event: PointerEvent) {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  pointer = undefined;
  if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.4)
    void change(dx < 0 ? 1 : -1);
}

function onKeydown(event: KeyboardEvent) {
  // Keep native keyboard controls available inside the video player.
  if (event.target instanceof HTMLVideoElement) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    change(event.key === "ArrowRight" ? 1 : -1);
  }
}

function onBackdropClick(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return;
  const { left, right, top, bottom } = dialog.value.getBoundingClientRect();
  if (
    event.clientX < left ||
    event.clientX > right ||
    event.clientY < top ||
    event.clientY > bottom
  ) {
    void close();
  }
}

function observeTiles() {
  if (!grid.value || !("IntersectionObserver" in window) || reducedMotion())
    return;

  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("gallery-tile-entered");
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0.12 },
  );
  grid.value
    .querySelectorAll(".gallery-tile:not(.gallery-tile-entered)")
    .forEach((tile) => {
      observer?.observe(tile);
    });
}
onMounted(observeTiles);
watch(
  () => props.images.length,
  async () => {
    await nextTick();
    observeTiles();
  },
);
watch(activeIndex, async () => {
  await nextTick();
  const strip = thumbnailStrip.value;
  const active = strip?.querySelector<HTMLElement>('[aria-current="true"]');
  if (strip && active)
    strip.scrollTo({
      left: active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2,
      behavior: reducedMotion() ? "instant" : "smooth",
    });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  animation?.cancel();
});
</script>
<template>
  <div ref="grid" class="gallery-grid" :data-count="Math.min(images.length, 4)">
    <button
      v-for="(image, index) in images"
      :key="`${image.albumSlug || ''}:${image.id}`"
      type="button"
      class="gallery-tile"
      :style="{
        '--gallery-position': image.position || 'center',
        '--gallery-delay': `${(index % 4) * 80}ms`,
      }"
      :aria-label="'Открыть: ' + image.caption"
      aria-haspopup="dialog"
      @click="show(index, $event)"
    >
      <figure>
        <ResponsiveImage
          :src="image.image"
          :webp="image.image_webp"
          :avif="image.image_avif"
          :alt="image.caption"
          :srcset="image.srcset"
          :width="image.width"
          :height="image.height"
          sizes="(max-width: 600px) 90vw, (max-width: 900px) 85vw, (max-width: 1440px) 42vw, 540px"
        />
        <span v-if="image.video" class="gallery-play" aria-hidden="true"
          >▶</span
        >
        <figcaption>
          <span>
            <small>{{
              image.categoryTitle || (image.video ? "Видео" : "Жизнь клуба")
            }}</small>
            {{ image.caption }}
          </span>
          <span class="gallery-expand" aria-hidden="true">↗</span>
        </figcaption>
      </figure>
    </button>
  </div>
  <dialog
    ref="dialog"
    class="gallery-lightbox"
    aria-label="Галерея клуба"
    :aria-describedby="captionId"
    :class="{ 'gallery-lightbox-closing': closing }"
    @close="dispose"
    @cancel.prevent="close"
    @click="onBackdropClick"
    @keydown="onKeydown"
  >
    <div class="gallery-lightbox-toolbar">
      <NuxtLink v-if="current?.albumUrl" :to="current.albumUrl" @click="close"
        >{{ current.albumTitle }} ↗</NuxtLink
      >
      <span v-else>В КАДРЕ / K–DOJO</span>
      <button
        type="button"
        autofocus
        aria-label="Закрыть просмотр"
        @click="close"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <div
      class="gallery-lightbox-media"
      :aria-busy="loading"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="pointer = undefined"
    >
      <Transition name="gallery-frame" mode="out-in">
        <div v-if="current" :key="frameKey" class="gallery-lightbox-stage">
          <img
            class="gallery-blurred-background"
            :src="current.thumbnail || current.image"
            alt=""
            aria-hidden="true"
          />
          <video
            v-if="current.video"
            :key="current.video"
            :src="current.video"
            :poster="current.image"
            :aria-label="current.caption"
            controls
            playsinline
            preload="metadata"
            class="gallery-lightbox-photo"
          />
          <img
            v-else
            :key="current.image"
            :src="current.image"
            :alt="current.caption"
            :srcset="current.srcset"
            sizes="(max-width: 600px) 90vw, (max-width: 1200px) 92vw, 1060px"
            :width="current.width"
            :height="current.height"
            decoding="async"
            class="gallery-lightbox-photo"
            @error="error = 'Фотография не загрузилась. Попробуйте ещё раз.'"
          />
        </div>
      </Transition>
      <span v-if="loading" class="gallery-loading" role="status"
        >Загружаем…</span
      >
    </div>
    <p v-if="error" class="gallery-viewer-error" role="alert">
      {{ error }} <button type="button" @click="retry">Повторить</button>
    </p>
    <div class="gallery-lightbox-footer">
      <p :id="captionId" aria-live="polite" aria-atomic="true">
        <small>{{
          activeIndex === null ? "" : `${activeIndex + 1} / ${total}`
        }}</small>
        {{ current?.caption }}
      </p>
      <div v-if="total > 1" class="gallery-controls">
        <button type="button" aria-label="Предыдущий кадр" @click="change(-1)">
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" aria-label="Следующий кадр" @click="change(1)">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
    <div
      v-if="activeIndex !== null && total > 1"
      ref="thumbnailStrip"
      class="gallery-thumbnails"
      role="group"
      aria-label="Фотографии альбома"
    >
      <button
        v-for="item in thumbnails"
        :key="item.index"
        type="button"
        :aria-label="`Кадр ${item.index + 1}${item.photo ? ': ' + item.photo.caption : ''}`"
        :aria-current="activeIndex === item.index ? 'true' : undefined"
        @click="select(item.index)"
      >
        <img
          v-if="item.photo"
          :src="item.photo.thumbnail || item.photo.image"
          alt=""
          width="80"
          height="60"
          loading="lazy"
          decoding="async"
        />
        <span v-else>{{ item.index + 1 }}</span>
      </button>
    </div>
  </dialog>
</template>
