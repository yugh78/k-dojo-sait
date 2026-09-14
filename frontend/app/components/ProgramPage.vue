<script setup lang="ts">
import type {
  Program,
  Coach,
  FAQ,
  ScheduleEntry,
  PricingPlan,
} from "~/types/api";
const props = defineProps<{ slug: string }>();
const { data: program, error } = await useClubApi<Program>(
  `programs/${props.slug}`,
);
if (!program.value && error.value?.statusCode === 404)
  throw createError({
    statusCode: 404,
    statusMessage: "Направление не найдено",
  });
usePageSeo(
  program.value?.name + " в Королёве",
  program.value?.short_description,
);
const { data: coaches } = await useClubApi<Coach[]>("coaches");
const { data: faq } = await useClubApi<FAQ[]>("faq");
const { data: schedule } = await useClubApi<ScheduleEntry[]>("schedule");
const { data: pricing } = await useClubApi<PricingPlan[]>("pricing");
</script>
<template>
  <div class="container">
    <div class="page-heading">
      <p class="breadcrumb">
        <NuxtLink to="/">Главная</NuxtLink> / Направления
      </p>
      <p class="eyebrow">{{ program?.audience }}</p>
      <h1>{{ program?.name }}</h1>
      <p class="lead">{{ program?.short_description }}</p>
      <NuxtLink
        class="button"
        :to="{
          path: '/contacts',
          query: { program: slug },
          hash: '#application',
        }"
        >Записаться бесплатно ↗</NuxtLink
      >
    </div>
    <ApiState :error="error"
      ><section v-if="program" class="section grid-2">
        <ResponsiveImage :src="program.image" :alt="program.name" />
        <div>
          <h2>
            {{
              slug === "mowgli"
                ? "Движение начинается с игры."
                : "Начать можно без опыта."
            }}
          </h2>
          <p class="lead">{{ program.description }}</p>
          <p v-if="slug === 'mowgli'">
            Занятие длится 45 минут. Программа для детей 3–7 лет развивает
            базовые физические качества и интерес к регулярной активности.
          </p>
          <p v-else>
            Спортивная подготовка — постепенный процесс. Тренер поможет
            освоиться и подобрать подходящую группу.
          </p>
        </div>
      </section>
      <section class="section">
        <SectionHeader title="Как проходит тренировка" />
        <div class="steps">
          <article
            v-for="(step, i) in program?.training_steps.split('\n')"
            :key="step"
            class="step"
          >
            <span>0{{ i + 1 }}</span>
            <h3>{{ step }}</h3>
          </article>
        </div>
      </section>
      <section class="section">
        <SectionHeader title="Ваши тренеры" />
        <div class="grid-3">
          <CoachCard
            v-for="coach in coaches?.filter((c) => c.programs.includes(slug))"
            :key="coach.id"
            :coach="coach"
          />
        </div>
      </section>
      <section class="section">
        <SectionHeader
          title="Время для занятий"
          :to="'/schedule?program=' + slug"
          link-text="Расписание и фильтры"
        />
        <div class="schedule-grid">
          <ScheduleEntry
            v-for="entry in schedule?.filter((s) => s.program.slug === slug)"
            :key="entry.id"
            :entry="entry"
          />
        </div>
      </section>
      <section class="section">
        <SectionHeader
          title="Стоимость"
          to="/pricing"
          link-text="Тарифы и семейные условия"
        />
        <div class="grid-3">
          <PricingPlan
            v-for="plan in pricing?.filter(
              (p) =>
                p.category === 'standard' &&
                (!p.programs.length || p.programs.includes(program?.id || 0)),
            )"
            :key="plan.id"
            :plan="plan"
          />
        </div>
        <p>Первая тренировка бесплатно. Оплата наличными.</p>
      </section>
      <section class="section grid-2">
        <div>
          <h2>Первый раз в клубе</h2>
          <p>{{ program?.first_training }}</p>
          <p>
            {{
              program?.equipment ||
              "Требования к одежде уточняйте у тренера. Полную экипировку заранее покупать не нужно."
            }}
          </p>
          <FAQAccordion
            :items="
              faq?.filter((f) => !f.program || f.program === program?.id) || []
            "
          />
        </div>
        <ApplicationForm :program-slug="slug" /></section
    ></ApiState>
  </div>
</template>
