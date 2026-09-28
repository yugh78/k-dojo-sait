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
const [
  { data: programs, error },
  { data: coaches },
  { data: events },
  { data: results },
  { data: schedule },
  { data: pricing },
  { data: faq },
] = await Promise.all([
  useClubApi<Program[]>("programs"),
  useClubApi<Coach[]>("coaches"),
  useClubApi<ClubEvent[]>("events"),
  useClubApi<Result[]>("results"),
  useClubApi<ScheduleEntry[]>("schedule"),
  useClubApi<PricingPlan[]>("pricing"),
  useClubApi<FAQ[]>("faq"),
]);
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
    <section id="programs" class="container section programs-section">
      <SectionHeader
        number="01"
        eyebrow="ВАШЕ НАПРАВЛЕНИЕ"
        title="Один клуб. Свой путь."
      />
      <ApiState :error="error">
        <div class="program-grid">
          <ProgramCard
            v-for="(program, index) in programs"
            :key="program.id"
            :program="program"
            :index="index"
          />
        </div>
      </ApiState>
    </section>
    <section class="club-intro">
      <div class="container about-grid">
        <div>
          <p class="eyebrow">02 / ФИЛОСОФИЯ КЛУБА</p>
          <h2>Сильнее.<br />Шаг за шагом.</h2>
        </div>
        <div>
          <p class="big-copy">
            {{
              settings?.about_text ||
              "K-Dojo — спортивный клуб в Королёве. Здесь можно начать заниматься, развиваться и постепенно перейти к серьёзному спорту."
            }}
          </p>
          <p class="muted">
            Начните в своём темпе. Соревнования — для тех, кто готов и хочет
            идти дальше. Уважение к партнёру и работа над собой — для каждого.
          </p>
          <NuxtLink class="text-link" to="/about"
            >Познакомиться с клубом ↗</NuxtLink
          >
        </div>
      </div>
    </section>
    <section class="container section">
      <SectionHeader
        number="03"
        eyebrow="ТРЕНЕРСКИЙ СОСТАВ"
        title="Есть на кого опереться."
        to="/coaches"
        link-text="Все тренеры"
      />
      <div class="grid-3">
        <CoachCard v-for="coach in coaches" :key="coach.id" :coach="coach" />
      </div>
    </section>
    <HomeTraining :programs="programs || []" />
    <section class="container section">
      <SectionHeader
        number="05"
        eyebrow="РАСПИСАНИЕ"
        title="Время для себя."
        to="/schedule"
        link-text="Все дни и группы"
      />
      <div class="schedule-grid">
        <ScheduleDay
          v-for="(day, i) in ['Понедельник', 'Вторник', 'Среда']"
          :key="day"
          :day="day"
          :entries="(schedule || []).filter((e) => e.weekday === i).slice(0, 2)"
        />
      </div>
      <p class="section-note">
        Несколько групп из расписания. Все занятия, возраст и тренеры —
        <NuxtLink to="/schedule">в полном расписании ↗</NuxtLink>
      </p>
    </section>
    <section class="pricing-section">
      <div class="container section">
        <SectionHeader
          number="06"
          eyebrow="АБОНЕМЕНТЫ"
          title="Выберите свой ритм."
          to="/pricing"
          link-text="Тарифы и льготы"
        />
        <div class="grid-3">
          <PricingPlan
            v-for="plan in pricing?.filter((p) => p.category === 'standard')"
            :key="plan.id"
            :plan="plan"
          />
        </div>
        <p class="section-note">
          Оплата наличными. Семейные и специальные условия — на странице
          стоимости.
        </p>
      </div>
    </section>
    <section
      v-if="results?.length || upcoming.length"
      class="container section"
    >
      <SectionHeader
        eyebrow="K–DOJO TEAM"
        title="За пределами тренировки."
        to="/events"
        link-text="Жизнь клуба"
      />
      <div v-if="upcoming.length" class="grid-3">
        <EventCard v-for="event in upcoming" :key="event.id" :event="event" />
      </div>
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
    </section>
    <TrialBand />
    <section class="container section home-faq">
      <div>
        <p class="eyebrow">ПЕРЕД ПЕРВЫМ ЗАНЯТИЕМ</p>
        <h2>Начать проще,<br />чем кажется.</h2>
        <p class="muted">
          Ответы на вопросы, которые часто задают перед знакомством с клубом.
        </p>
      </div>
      <FAQAccordion :items="faq?.filter((f) => !f.program) || []" />
    </section>
    <section class="contact-section">
      <div class="container section grid-2">
        <div class="contact-copy">
          <p class="eyebrow">ВАШ ПЕРВЫЙ ШАГ</p>
          <h2>Увидимся<br />на тренировке.</h2>
          <p class="lead">
            Подберём направление и группу.<br />Первое занятие — бесплатно.
          </p>
          <a
            class="contact-phone"
            :href="'tel:' + (settings?.phone || '+79250173216')"
            >{{ settings?.phone || "+7 (925) 017-32-16" }}</a
          >
          <p class="muted">Королёв, Московская область</p>
          <NuxtLink class="text-link" to="/contacts"
            >Залы и контакты ↗</NuxtLink
          >
        </div>
        <ApplicationForm />
      </div>
    </section>
  </div>
</template>
