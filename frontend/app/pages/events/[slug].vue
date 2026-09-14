<script setup lang="ts">
import type { ClubEvent } from "~/types/api";
const route = useRoute();
const { data: event, error } = await useClubApi<ClubEvent>(
  `events/${String(route.params.slug)}`,
);
if (!event.value)
  throw createError({
    statusCode: error.value?.statusCode === 404 ? 404 : 503,
    statusMessage: "Событие не найдено",
  });
usePageSeo(event.value.title, event.value.description);
const config = useRuntimeConfig();
if (event.value.location)
  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.value.title,
          startDate: event.value.start_date,
          endDate: event.value.end_date || event.value.start_date,
          description: event.value.description,
          location: {
            "@type": "Place",
            name: event.value.location,
            address: event.value.location,
          },
          organizer: {
            "@type": "Organization",
            name: "K-Dojo",
            url: config.public.siteUrl,
          },
          ...(event.value.cover_image
            ? { image: [event.value.cover_image] }
            : {}),
        }).replace(/</g, "\\u003c"),
      },
    ],
  });
</script>
<template>
  <div class="container">
    <div class="page-heading">
      <p class="breadcrumb">
        <NuxtLink to="/events">События</NuxtLink> / K-Dojo
      </p>
      <p class="eyebrow">
        {{ event?.start_date
        }}<span v-if="event?.end_date"> — {{ event.end_date }}</span>
      </p>
      <h1>{{ event?.title }}</h1>
      <p class="lead">{{ event?.description }}</p>
    </div>
    <section class="section grid-2">
      <div>
        <ResponsiveImage
          v-if="event?.cover_image"
          :src="event.cover_image"
          :alt="event.title"
        />
        <p class="prose">{{ event?.content }}</p>
      </div>
      <aside class="detail-aside">
        <h2>О событии</h2>
        <p v-if="event?.location">{{ event.location }}</p>
        <p v-if="event?.age_text">{{ event.age_text }}</p>
        <p v-if="event?.price !== null">
          Стоимость: {{ event?.price }} ₽ · наличными
        </p>
        <NuxtLink
          v-if="event?.registration_available"
          class="button"
          :to="{
            path: '/contacts',
            query: { program: event.program || undefined },
            hash: '#application',
          }"
          >Уточнить участие ↗</NuxtLink
        >
      </aside>
    </section>
    <section v-if="event?.gallery?.images.length" class="section">
      <GalleryGrid :images="event.gallery.images" />
    </section>
  </div>
</template>
