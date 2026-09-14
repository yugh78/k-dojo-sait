<script setup lang="ts">
import type { Coach } from "~/types/api";
const route = useRoute();
const { data: coach, error } = await useClubApi<Coach>(
  `coaches/${String(route.params.slug)}`,
);
if (!coach.value)
  throw createError({
    statusCode: error.value?.statusCode === 404 ? 404 : 503,
    statusMessage: "Тренер не найден",
  });
usePageSeo(coach.value.full_name);
</script>
<template>
  <div>
    <div class="container">
      <div class="page-heading">
        <p class="breadcrumb">
          <NuxtLink to="/coaches">Тренеры</NuxtLink> / K-Dojo
        </p>
        <h1>{{ coach?.full_name }}</h1>
      </div>
      <section class="section grid-2">
        <ResponsiveImage
          :src="coach?.photo"
          :alt="coach?.full_name || 'Тренер'"
        />
        <div>
          <p class="lead">{{ coach?.short_description }}</p>
          <p class="prose">{{ coach?.biography }}</p>
          <template v-if="coach?.qualifications"
            ><h2>Квалификация</h2>
            <p class="prose">{{ coach.qualifications }}</p></template
          ><template v-if="coach?.achievements"
            ><h2>Достижения</h2>
            <p class="prose">{{ coach.achievements }}</p></template
          >
          <p v-if="coach?.experience">{{ coach.experience }}</p>
          <div class="actions">
            <NuxtLink
              v-for="program in coach?.programs"
              :key="program"
              class="text-link"
              :to="'/' + program"
              >{{
                program === "mowgli"
                  ? "Маугли"
                  : program === "bjj"
                    ? "BJJ"
                    : "Киокусинкай"
              }}
              ↗</NuxtLink
            >
          </div>
          <div v-for="certificate in coach?.certificates" :key="certificate.id">
            <h3>{{ certificate.title }}</h3>
            <ResponsiveImage
              :src="certificate.image"
              :alt="certificate.title"
            />
          </div>
          <p
            v-if="coach?.slug === 'ryazhsky' && !coach.certificates.length"
            class="muted"
          >
            Фотография сертификата «Маугли» готовится к публикации.
          </p>
        </div>
      </section>
    </div>
    <TrialBand />
  </div>
</template>
