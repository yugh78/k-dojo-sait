import type { ScheduleEntry } from "~/types/api";

export function groupSchedule(entries: ScheduleEntry[]) {
  const groups = new Map<string, { entry: ScheduleEntry; days: number[] }>();
  for (const entry of entries) {
    const key = JSON.stringify([
      entry.training_group.id,
      entry.start_time,
      entry.end_time,
      entry.location?.id ?? null,
      entry.coaches.map((coach) => coach.id).sort((a, b) => a - b),
      entry.audience,
      entry.minimum_age,
      entry.maximum_age,
      entry.notes,
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
