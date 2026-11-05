import type { Program, Coach, ScheduleEntry } from "~/types/api";

export function useSchedule(initialProgram = "") {
  const program = ref(initialProgram);
  const age = ref("");
  const coach = ref("");
  const weekday = ref("");
  const { data: programs } = useClubContent<Program[]>("programs");
  const { data: coaches } = useClubContent<Coach[]>("coaches");
  const query = computed(() => ({
    program: program.value,
    age: age.value,
    coach: coach.value,
    weekday: weekday.value,
  }));
  const { data, error, status } = useClubContent<ScheduleEntry[]>(
    "schedule",
    query,
  );
  const entries = computed(() => data.value || []);
  function reset() {
    program.value = age.value = coach.value = weekday.value = "";
  }
  return {
    program,
    age,
    coach,
    weekday,
    programs,
    coaches,
    entries,
    error,
    status,
    reset,
  };
}
