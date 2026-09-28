import { describe, expect, it } from "vitest";
import { groupSchedule } from "../../app/utils/schedule";
import type { ScheduleEntry } from "../../app/types/api";

const entry: ScheduleEntry = {
  id: 1,
  program: { id: 1, slug: "bjj", name: "BJJ", accent: "red" },
  training_group: { id: 1, name: "Children" },
  location: null,
  coaches: [{ id: 1, full_name: "Coach", slug: "coach" }],
  weekday: 0,
  start_time: "18:00:00",
  end_time: "19:30:00",
  minimum_age: 7,
  maximum_age: 17,
  audience: "Children 7+",
  notes: "",
};

describe("program schedule", () => {
  it("merges identical sessions into ordered unique weekdays", () => {
    const rows = groupSchedule([
      { ...entry, id: 2, weekday: 4 },
      { ...entry, id: 3, weekday: 2 },
      entry,
      { ...entry, id: 4, weekday: 2 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.days).toEqual([0, 2, 4]);
    expect(rows[0]?.entry.training_group.id).toBe(1);
  });

  it("keeps different times, groups, coaches and notes separate", () => {
    const changes: Partial<ScheduleEntry>[] = [
      { start_time: "11:00:00" },
      { end_time: "20:00:00" },
      { training_group: { id: 2, name: "Other" } },
      { coaches: [] },
      { notes: "Special session" },
      { minimum_age: 9 },
    ];
    for (const change of changes) {
      expect(
        groupSchedule([entry, { ...entry, ...change, id: 2, weekday: 5 }]),
      ).toHaveLength(2);
    }
  });

  it("does not depend on the order of coaches", () => {
    const coaches = [
      ...entry.coaches,
      { id: 2, full_name: "Second", slug: "second" },
    ];
    expect(
      groupSchedule([
        { ...entry, coaches },
        { ...entry, id: 2, weekday: 2, coaches: [...coaches].reverse() },
      ]),
    ).toHaveLength(1);
  });
});
