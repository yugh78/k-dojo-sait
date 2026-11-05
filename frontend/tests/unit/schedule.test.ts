import { describe, expect, it } from "vitest";
import {
  groupSchedule,
  filterSchedule,
  currentScheduleDay,
  scheduleBookingMessage,
} from "../../app/utils/schedule";
import type { ScheduleEntry } from "../../app/types/api";

const entry: ScheduleEntry = {
  id: 1,
  program: { id: 1, slug: "bjj", name: "BJJ", accent: "red" },
  training_group: { id: 1, name: "Children" },
  coaches: [{ id: 1, full_name: "Coach", slug: "coach" }],
  weekday: 0,
  start_time: "18:00:00",
  end_time: "19:30:00",
  minimum_age: 7,
  maximum_age: 17,
  audience: "Children 7+",
};

describe("shared schedule filtering and booking", () => {
  const mowgli: ScheduleEntry = {
    ...entry,
    id: 2,
    program: { ...entry.program, slug: "mowgli" },
    minimum_age: 3,
    maximum_age: 7,
  };
  it("limits ages 3–7 to Mowgli while intersecting the other filters", () => {
    for (const age of ["3", "4", "5", "6", "7"]) {
      expect(filterSchedule([entry, mowgli], { age })).toEqual([mowgli]);
      expect(filterSchedule([entry, mowgli], { age, program: "bjj" })).toEqual(
        [],
      );
    }
    expect(
      filterSchedule([entry, mowgli], {
        age: "8",
        coach: "1",
        weekday: "0",
        program: "bjj",
      }),
    ).toEqual([entry]);
    expect(filterSchedule([entry, mowgli], { coach: "2" })).toEqual([]);
    expect(filterSchedule([entry, mowgli], { weekday: "1" })).toEqual([]);
  });
  it("preserves parallel sessions and matches any coach in a joint session", () => {
    const second = {
      ...entry,
      id: 3,
      coaches: [{ id: 2, full_name: "Second coach", slug: "second" }],
    };
    const joint = {
      ...entry,
      id: 4,
      coaches: [...entry.coaches, ...second.coaches],
    };
    const rows = [entry, second, joint];
    expect(filterSchedule(rows, { weekday: "0" })).toEqual(rows);
    expect(filterSchedule(rows, { weekday: "0", coach: "2" })).toEqual([
      second,
      joint,
    ]);
    expect(scheduleBookingMessage(second)).toContain("Second coach");
    expect(scheduleBookingMessage(second)).not.toContain("Тренер: Coach.");
    expect(scheduleBookingMessage(joint)).toContain("Coach, Second coach");
    expect(scheduleBookingMessage(joint)).toContain(
      "Понедельник. Время: 18:00–19:30",
    );
    expect(scheduleBookingMessage(joint)).toContain(
      "Возрастная группа: Children 7+",
    );
  });
  it("selects the club day at the Moscow midnight boundary", () => {
    expect(currentScheduleDay(new Date("2026-11-08T20:59:59Z"))).toBe(6);
    expect(currentScheduleDay(new Date("2026-11-08T21:00:00Z"))).toBe(0);
  });
});

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

  it("keeps different times, groups, coaches and ages separate", () => {
    const changes: Partial<ScheduleEntry>[] = [
      { start_time: "11:00:00" },
      { end_time: "20:00:00" },
      { training_group: { id: 2, name: "Other" } },
      { coaches: [] },
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
