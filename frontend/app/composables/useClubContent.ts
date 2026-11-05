import content from "~/data/club.json";
import type { ScheduleEntry, ClubEvent } from "~/types/api";
import { filterSchedule } from "~/utils/schedule";

export function useClubContent<T>(
  path: string,
  query?: Ref<Record<string, string>>,
) {
  const data = computed(() => {
    const [collection, slug] = path.split("/");
    const rows = content[collection as keyof typeof content];
    if (!rows) return null;
    if (slug)
      return (rows as { slug?: string }[]).find((row) => row.slug === slug) as
        T | undefined;
    const filters = query?.value;
    if (collection === "schedule" && filters)
      return filterSchedule(rows as unknown as ScheduleEntry[], filters) as T;
    if (collection === "events" && filters?.period) {
      const today = new Date().toISOString().slice(0, 10);
      return (rows as unknown as ClubEvent[]).filter((event) =>
        filters.period === "past"
          ? (event.end_date || event.start_date) < today
          : (event.end_date || event.start_date) >= today,
      ) as T;
    }
    return rows as T;
  });
  return {
    data,
    error: computed(() =>
      data.value == null
        ? createError({ statusCode: 404, statusMessage: "Content not found" })
        : undefined,
    ),
    status: ref("success"),
  };
}
