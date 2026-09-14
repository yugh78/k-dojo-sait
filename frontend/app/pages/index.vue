<script setup lang="ts">
import type {
  Program,
  Coach,
  ClubEvent,
  Result,
  ScheduleEntry,
  PricingPlan,
  FAQ,
  SiteSettings,
} from "~/types/api";
usePageSeo("Спортивный клуб в Королёве");
const { data: programs, error } = await useClubApi<Program[]>("programs");
const { data: coaches } = await useClubApi<Coach[]>("coaches");
const { data: events } = await useClubApi<ClubEvent[]>("events");
const { data: results } = await useClubApi<Result[]>("results");
const { data: schedule } = await useClubApi<ScheduleEntry[]>("schedule");
const { data: pricing } = await useClubApi<PricingPlan[]>("pricing");
const { data: faq } = await useClubApi<FAQ[]>("faq");
const settings = inject<ComputedRef<SiteSettings | undefined>>("siteSettings");
const config = useRuntimeConfig();
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "K-Dojo",
        url: config.public.siteUrl,
        telephone: "+79250173216",
        sameAs: ["https://t.me/kdojokorolev"],
      }).replace(/</g, "\\u003c"),
    },
  ],
});
const upcoming = computed(
  () =>
    events.value
      ?.filter(
        (e) =>
          (e.end_date || e.start_date) >= new Date().toISOString().slice(0, 10),
      )
      .slice(0, 3) || [],
);
</script>
<template>
  <div>
    <HomeHero />
    <section id="programs" class="container section">
      <SectionHeader
        number="01"
        eyebrow="НАПРАВЛЕНИЯ"
        title="Найдите своё движение."
      /><ApiState :error="error"
        ><div class="program-grid">
          <ProgramCard
            v-for="(program, index) in programs"
            :key="program.id"
            :program="program"
            :index="index"
          /></div
      ></ApiState>
    </section>
    <section class="container section">
      <div class="about-grid">
        <div>
          <p class="eyebrow">02 / О КЛУБЕ</p>
          <h2>Место, где начинается ваш спорт.</h2>
        </div>
        <div>
          <p class="big-copy">
            {{
              settings?.about_text ||
              "K-Dojo — спортивный клуб в Королёве. Здесь можно начать заниматься, развиваться и при желании постепенно перейти к серьёзному спорту."
            }}
          </p>
          <NuxtLink class="text-link" to="/about"
            >Познакомиться с K-Dojo ↗</NuxtLink
          >
        </div>
      </div>
    </section>
    <HomeTraining :programs="programs || []" />
    <section class="container section">
      <SectionHeader
        number="04"
        eyebrow="ТРЕНЕРЫ"
        title="Люди, которые рядом."
        to="/coaches"
        link-text="Все тренеры"
      />
      <div class="grid-3">
        <CoachCard v-for="coach in coaches" :key="coach.id" :coach="coach" />
      </div>
    </section>
    <section class="container section team-section">
      <p class="eyebrow">05 / КИОКУСИНКАЙ</p>
      <h2>K-DOJO TEAM</h2>
      <div class="grid-2">
        <p class="lead">От первой тренировки — к новым спортивным задачам.</p>
        <div>
          <p>
            Спарринги, сборы, физическая подготовка и соревнования. Для тех, кто
            хочет идти дальше. Участие в турнирах — выбор спортсмена и тренера.
          </p>
          <NuxtLink class="text-link" to="/results"
            >Результаты команды ↗</NuxtLink
          >
        </div>
      </div>
    </section>
    <section class="container section">
      <SectionHeader
        number="06"
        eyebrow="РЕЗУЛЬТАТЫ"
        title="За каждым стартом — работа."
        to="/results"
        link-text="Все результаты"
      />
      <div v-if="results?.length" class="grid-3">
        <article
          v-for="result in results.slice(0, 3)"
          :key="result.id"
          class="result-card"
        >
          <p class="eyebrow">{{ result.competition.title }}</p>
          <h3>{{ result.athlete.full_name }}</h3>
          <p>
            {{ result.place ? result.place + " место" : result.result_text }} ·
            {{ result.category }}
          </p>
        </article>
      </div>
      <EmptyState
        v-else
        title="Истории наших стартов"
        text="Готовим подтверждённые результаты соревнований и фотографии команды."
      />
    </section>
    <section class="container section">
      <SectionHeader
        number="07"
        eyebrow="ЖИЗНЬ КЛУБА"
        title="Больше, чем тренировки."
        to="/gallery"
        link-text="Галерея клуба"
      />
      <p class="lead">
        Сборы, экзамены, турниры и клубные встречи — часть спортивной жизни
        K-Dojo.
      </p>
      <SectionHeader
        title="Ближайшие события"
        to="/events"
        link-text="Календарь и архив"
      />
      <div v-if="upcoming.length" class="grid-3">
        <EventCard v-for="event in upcoming" :key="event.id" :event="event" />
      </div>
      <EmptyState
        v-else
        title="Следующие встречи готовятся"
        text="После подтверждения дат события появятся здесь. Новости клуба также доступны в Telegram."
      />
    </section>
    <section class="container section">
      <SectionHeader
        number="08"
        eyebrow="РАСПИСАНИЕ"
        title="Спорт в вашем ритме."
        to="/schedule"
        link-text="Полное расписание"
      />
      <div class="schedule-grid">
        <ScheduleDay
          v-for="(day, i) in ['Понедельник', 'Вторник', 'Среда']"
          :key="day"
          :day="day"
          :entries="(schedule || []).filter((e) => e.weekday === i)"
        />
      </div>
    </section>
    <section class="container section">
      <SectionHeader
        number="09"
        eyebrow="СТОИМОСТЬ"
        title="Понятные условия."
        to="/pricing"
        link-text="Все тарифы и льготы"
      />
      <div class="grid-3">
        <PricingPlan
          v-for="plan in pricing?.filter((p) => p.category === 'standard')"
          :key="plan.id"
          :plan="plan"
        />
      </div>
      <p class="muted">
        Оплата наличными. Семейные и специальные условия — на странице
        стоимости.
      </p>
    </section>
    <TrialBand />
    <section class="container section">
      <SectionHeader
        number="10"
        eyebrow="ПЕРЕД ПЕРВОЙ ТРЕНИРОВКОЙ"
        title="Хорошие вопросы."
      /><FAQAccordion :items="faq?.filter((f) => !f.program) || []" />
    </section>
    <section class="container section grid-2">
      <div>
        <p class="eyebrow">11 / ДО ВСТРЕЧИ В КЛУБЕ</p>
        <h2>Начните<br />с знакомства.</h2>
        <p class="lead">Королёв, Московская область</p>
        <p><a href="tel:+79250173216">+7 (925) 017-32-16</a></p>
        <NuxtLink class="text-link" to="/contacts">Залы и контакты ↗</NuxtLink>
      </div>
      <ApplicationForm />
    </section>
  </div>
</template>
