<script setup lang="ts">
import type { SiteSettings, ScheduleEntry, Program } from "~/types/api";
import { scheduleBookingMessage, scheduleDays } from "~/utils/schedule";
const props = withDefaults(
  defineProps<{ programSlug?: string; entry?: ScheduleEntry; id?: string }>(),
  { id: "application" },
);
const { data } = useClubContent<SiteSettings[]>("settings");
const settings = computed(() => data.value?.[0]);
const { data: schedule } = useClubContent<ScheduleEntry[]>("schedule");
const { data: programs } = useClubContent<Program[]>("programs");
const route = useRoute();
const selected = computed(
  () =>
    props.entry ||
    schedule.value?.find((entry) => String(entry.id) === route.query.session),
);
const program = computed(
  () =>
    selected.value?.program ||
    programs.value?.find(
      (item) => item.slug === (props.programSlug || route.query.program),
    ),
);
const message = computed(() =>
  selected.value ? scheduleBookingMessage(selected.value) : "",
);
const telegram = computed(() => {
  const url = settings.value?.telegram;
  if (!url || !message.value) return url;
  const link = new URL(url);
  link.searchParams.set("text", message.value);
  return link.toString();
});
const copyStatus = ref("");
const messageField = ref<HTMLTextAreaElement>();
watch(message, () => {
  copyStatus.value = "";
});
async function copyMessage() {
  try {
    await navigator.clipboard.writeText(message.value);
    copyStatus.value = "Текст скопирован";
  } catch {
    messageField.value?.focus();
    messageField.value?.select();
    copyStatus.value = "Выделили текст — скопируйте его вручную.";
  }
}
</script>
<template>
  <section :id="id" class="application">
    <p class="eyebrow">ВАШ ПЕРВЫЙ ШАГ</p>
    <h2>Начнём с тренировки?</h2>
    <dl v-if="selected" class="application-selection">
      <div>
        <dt>Направление</dt>
        <dd>{{ selected.program.name }}</dd>
      </div>
      <div>
        <dt>День и время</dt>
        <dd>
          {{ scheduleDays[selected.weekday]?.name }},
          {{ selected.start_time.slice(0, 5) }}–{{
            selected.end_time.slice(0, 5)
          }}
          · МСК
        </dd>
      </div>
      <div>
        <dt>Возрастная группа</dt>
        <dd>{{ selected.audience }}</dd>
      </div>
      <div>
        <dt>Тренер</dt>
        <dd>
          {{
            selected.coaches.map((coach) => coach.full_name).join(", ") ||
            "Уточним в клубе"
          }}
        </dd>
      </div>
    </dl>
    <p v-else-if="program" class="application-program">
      Выбрано направление: <strong>{{ program.name }}</strong>
    </p>
    <p>
      Первая тренировка бесплатная. Позвоните или напишите в клуб — поможем
      выбрать направление и согласуем удобную группу.
    </p>
    <p v-if="settings?.phone">
      <a class="button" :href="`tel:${settings.phone.replace(/[^+\d]/g, '')}`"
        >Позвонить в клуб</a
      >
    </p>
    <p v-if="settings?.phone">{{ settings.phone }}</p>
    <p v-if="settings?.telegram">
      <a
        class="button"
        :href="telegram"
        target="_blank"
        rel="noopener noreferrer"
        >Написать в Telegram</a
      >
    </p>
    <div v-if="selected" class="application-message">
      <label class="field"
        >Сообщение для клуба<textarea
          ref="messageField"
          :value="message"
          readonly
          rows="6"
        />
      </label>
      <button type="button" class="text-link" @click="copyMessage">
        Скопировать сообщение
      </button>
      <p role="status" aria-live="polite">{{ copyStatus }}</p>
    </div>
  </section>
</template>
