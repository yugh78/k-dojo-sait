import type { ScheduleEntry } from "~/types/api";
import { ageOutsideRange } from "./format";

export const scheduleDays = [
  { name: "Понедельник", short: "Пн" },
  { name: "Вторник", short: "Вт" },
  { name: "Среда", short: "Ср" },
  { name: "Четверг", short: "Чт" },
  { name: "Пятница", short: "Пт" },
  { name: "Суббота", short: "Сб" },
  { name: "Воскресенье", short: "Вс" },
] as const;

export function currentScheduleDay(now = new Date()) {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Europe/Moscow",
  }).format(now);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(day);
}

export function filterSchedule(
  entries: ScheduleEntry[],
  filters: Record<string, string> = {},
) {
  const age = Number(filters.age);
  const mowgliOnly = !!filters.age && age >= 3 && age <= 7;
  return entries.filter(
    (entry) =>
      (!filters.program || entry.program.slug === filters.program) &&
      (!filters.coach ||
        entry.coaches.some((coach) => String(coach.id) === filters.coach)) &&
      (!filters.weekday || String(entry.weekday) === filters.weekday) &&
      (!filters.age ||
        ((!mowgliOnly || entry.program.slug === "mowgli") &&
          !ageOutsideRange(age, entry.minimum_age, entry.maximum_age))),
  );
}

export function scheduleCount(count: number) {
  const form = new Intl.PluralRules("ru").select(count);
  return `${count} ${form === "one" ? "занятие" : form === "few" ? "занятия" : "занятий"}`;
}

export function scheduleBookingLink(entry: ScheduleEntry) {
  return {
    path: "/contacts",
    query: {
      program: entry.program.slug,
      group: entry.training_group.id,
      session: entry.id,
    },
    hash: "#application",
  };
}

export function scheduleBookingMessage(entry: ScheduleEntry) {
  return [
    "Здравствуйте! Хочу записаться на тренировку K-Dojo.",
    `Направление: ${entry.program.name}.`,
    `День: ${scheduleDays[entry.weekday]?.name}. Время: ${entry.start_time.slice(0, 5)}–${entry.end_time.slice(0, 5)} (МСК).`,
    `Возрастная группа: ${entry.audience}.`,
    `Группа: ${entry.training_group.name}.`,
    `Тренер: ${entry.coaches.map((coach) => coach.full_name).join(", ") || "уточнить в клубе"}.`,
    "Подскажите, пожалуйста, можно ли присоединиться?",
  ].join("\n");
}

export function groupSchedule(entries: ScheduleEntry[]) {
  const groups = new Map<string, { entry: ScheduleEntry; days: number[] }>();
  for (const entry of entries) {
    const key = JSON.stringify([
      entry.training_group.id,
      entry.start_time,
      entry.end_time,
      entry.coaches.map((coach) => coach.id).sort((a, b) => a - b),
      entry.audience,
      entry.minimum_age,
      entry.maximum_age,
    ]);
    const group = groups.get(key);
    if (group) {
      if (!group.days.includes(entry.weekday)) group.days.push(entry.weekday);
    } else {
      groups.set(key, { entry, days: [entry.weekday] });
    }
  }
  return [...groups.values()]
    .map((group) => ({ ...group, days: group.days.sort((a, b) => a - b) }))
    .sort(
      (a, b) =>
        (a.entry.minimum_age ?? (a.entry.maximum_age === null ? Infinity : 0)) -
          (b.entry.minimum_age ??
            (b.entry.maximum_age === null ? Infinity : 0)) ||
        a.entry.start_time.localeCompare(b.entry.start_time) ||
        a.entry.training_group.id - b.entry.training_group.id ||
        a.days[0]! - b.days[0]!,
    );
}
