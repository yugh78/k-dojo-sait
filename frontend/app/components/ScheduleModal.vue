<script setup lang="ts">
import type { ScheduleEntry } from "~/types/api";
import {
  currentScheduleDay,
  scheduleCount,
  scheduleDays,
} from "~/utils/schedule";

const { program, age, coach, weekday, programs, coaches, entries, reset } =
  useSchedule();
const dialog = ref<HTMLDialogElement>();
const body = ref<HTMLElement>();
const tabs = ref<HTMLElement>();
const booking = ref<HTMLElement>();
const selected = shallowRef<ScheduleEntry>();
const closing = ref(false);
const id = useId();
let animation: Animation | undefined;
let bookingTrigger: HTMLElement | undefined;
let scheduleScroll = 0;
const activeDay = computed(() => Number(weekday.value));
const filtered = computed(() => !!(program.value || age.value || coach.value));
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function show() {
  if (!dialog.value || dialog.value.open) return;
  reset();
  weekday.value = String(currentScheduleDay());
  selected.value = undefined;
  closing.value = false;
  await nextTick();
  dialog.value.showModal();
  if (body.value) body.value.scrollTop = 0;
  revealDay();
}
async function close() {
  if (!dialog.value?.open || closing.value) return;
  closing.value = true;
  if (!reducedMotion()) {
    animation = dialog.value.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(16px) scale(0.985)" },
      ],
      { duration: 240, easing: "ease-in", fill: "forwards" },
    );
    await animation.finished.catch(() => {});
  }
  dialog.value?.close();
  animation?.cancel();
  closing.value = false;
}
function backdrop(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return;
  const bounds = dialog.value.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    void close();
}
function revealDay(focus = false) {
  const tab = tabs.value?.querySelector<HTMLButtonElement>(
    '[aria-selected="true"]',
  );
  if (!tab || !tabs.value) return;
  tabs.value.scrollTo({
    left: tab.offsetLeft - (tabs.value.clientWidth - tab.offsetWidth) / 2,
    behavior: "instant",
  });
  if (focus) tab.focus({ preventScroll: true });
}
async function chooseDay(index: number) {
  weekday.value = String(index);
  await nextTick();
  revealDay(true);
}
function dayKeydown(event: KeyboardEvent) {
  const target = {
    ArrowRight: (activeDay.value + 1) % 7,
    ArrowLeft: (activeDay.value + 6) % 7,
    Home: 0,
    End: 6,
  }[event.key];
  if (target === undefined) return;
  event.preventDefault();
  void chooseDay(target);
}
async function book(entry: ScheduleEntry) {
  bookingTrigger = document.activeElement as HTMLElement;
  scheduleScroll = body.value?.scrollTop || 0;
  selected.value = entry;
  await nextTick();
  if (body.value) body.value.scrollTop = 0;
  booking.value?.focus({ preventScroll: true });
}
async function backToSchedule() {
  selected.value = undefined;
  await nextTick();
  if (body.value) body.value.scrollTop = scheduleScroll;
  bookingTrigger?.focus({ preventScroll: true });
}
function clearFilters() {
  program.value = age.value = coach.value = "";
}
function trapFocus(event: KeyboardEvent) {
  if (event.key !== "Tab" || !dialog.value) return;
  const controls = [
    ...dialog.value.querySelectorAll<HTMLElement>(
      "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]",
    ),
  ].filter(
    (element) => element.tabIndex >= 0 && element.getClientRects().length > 0,
  );
  const first = controls[0];
  const last = controls.at(-1);
  if (
    event.shiftKey &&
    (document.activeElement === first ||
      !controls.includes(document.activeElement as HTMLElement))
  ) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
onBeforeUnmount(() => {
  animation?.cancel();
  dialog.value?.close();
});
defineExpose({ show });
</script>
<template>
  <dialog
    ref="dialog"
    class="schedule-modal"
    :class="{ 'is-closing': closing }"
    :aria-labelledby="`${id}-title`"
    @cancel.prevent="close"
    @click="backdrop"
    @keydown="trapFocus"
  >
    <header class="schedule-modal-header">
      <div>
        <p class="eyebrow">ВРЕМЯ ДЛЯ СЕБЯ</p>
        <h2 :id="`${id}-title`">Расписание тренировок K-Dojo</h2>
        <p class="muted">Королёв · Московское время</p>
      </div>
      <button
        type="button"
        class="schedule-modal-close"
        autofocus
        aria-label="Закрыть расписание"
        @click="close"
      >
        <span aria-hidden="true">×</span>
      </button>
    </header>
    <div ref="body" class="schedule-modal-body">
      <div v-show="!selected">
        <div
          ref="tabs"
          class="schedule-tabs"
          role="tablist"
          aria-label="Дни недели"
          @keydown="dayKeydown"
        >
          <button
            v-for="(day, index) in scheduleDays"
            :id="`${id}-day-${index}`"
            :key="day.short"
            type="button"
            role="tab"
            :aria-label="day.name"
            :aria-selected="activeDay === index"
            :aria-controls="`${id}-panel`"
            :tabindex="activeDay === index ? 0 : -1"
            @click="chooseDay(index)"
          >
            {{ day.short }}
          </button>
        </div>
        <ScheduleFilters
          v-model:program="program"
          v-model:age="age"
          v-model:coach="coach"
          :programs="programs || []"
          :coaches="coaches || []"
        />
        <div class="schedule-modal-summary">
          <p role="status" aria-live="polite">
            {{ scheduleDays[activeDay]?.name }}
            <span>{{ scheduleCount(entries.length) }}</span>
          </p>
          <button
            v-if="filtered"
            type="button"
            class="text-link"
            @click="clearFilters"
          >
            Сбросить фильтры
          </button>
        </div>
        <section
          :id="`${id}-panel`"
          role="tabpanel"
          :aria-labelledby="`${id}-day-${activeDay}`"
          tabindex="0"
        >
          <div
            :key="[weekday, program, age, coach].join(':')"
            class="schedule-panel-content"
          >
            <div v-if="entries.length" class="schedule-modal-list">
              <ScheduleEntry
                v-for="entry in entries"
                :key="entry.id"
                :entry="entry"
                book-in-place
                @book="book"
              />
            </div>
            <EmptyState
              v-else
              :title="
                filtered
                  ? 'По этим условиям групп нет'
                  : 'В этот день занятий нет'
              "
              :text="
                filtered
                  ? 'Измените фильтры или выберите другой день.'
                  : 'Выберите другой день — найдём время для тренировки.'
              "
            />
          </div>
        </section>
        <NuxtLink
          class="text-link schedule-page-link"
          to="/schedule"
          @click="close"
          >Открыть расписание на отдельной странице ↗</NuxtLink
        >
      </div>
      <div
        v-if="selected"
        ref="booking"
        class="schedule-booking-panel"
        role="region"
        tabindex="-1"
        aria-label="Запись на выбранную тренировку"
      >
        <button
          type="button"
          class="text-link schedule-back"
          @click="backToSchedule"
        >
          ← К расписанию
        </button>
        <ApplicationForm id="schedule-application" :entry="selected" />
      </div>
    </div>
  </dialog>
</template>
