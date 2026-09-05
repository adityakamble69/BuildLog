import test from "node:test";
import assert from "node:assert/strict";
import { calculateStreaks, toCalendarDay } from "../lib/utils/streaks";

test("calculateStreaks", async (t) => {
  const ref = new Date("2026-09-05T12:00:00Z");

  await t.test("empty timestamps returns zero streaks", () => {
    const res = calculateStreaks([], ref);
    assert.equal(res.currentStreak, 0);
    assert.equal(res.longestStreak, 0);
    assert.equal(res.totalActiveDays, 0);
    assert.equal(res.lastActiveDate, null);
    assert.equal(res.isActiveToday, false);
  });

  await t.test("single activity today gives 1 current and 1 longest streak", () => {
    const res = calculateStreaks(["2026-09-05T08:00:00Z"], ref);
    assert.equal(res.currentStreak, 1);
    assert.equal(res.longestStreak, 1);
    assert.equal(res.totalActiveDays, 1);
    assert.equal(res.isActiveToday, true);
    assert.equal(res.lastActiveDate, "2026-09-05");
  });

  await t.test("single activity yesterday still keeps 1 current streak active", () => {
    const res = calculateStreaks(["2026-09-04T15:00:00Z"], ref);
    assert.equal(res.currentStreak, 1);
    assert.equal(res.longestStreak, 1);
    assert.equal(res.isActiveToday, false);
  });

  await t.test("activity older than yesterday breaks the current streak", () => {
    const res = calculateStreaks(["2026-09-03T10:00:00Z"], ref);
    assert.equal(res.currentStreak, 0);
    assert.equal(res.longestStreak, 1);
    assert.equal(res.totalActiveDays, 1);
  });

  await t.test("consecutive 4 days through today gives currentStreak 4", () => {
    const timestamps = [
      "2026-09-05T09:00:00Z",
      "2026-09-04T10:00:00Z",
      "2026-09-03T11:00:00Z",
      "2026-09-02T12:00:00Z",
    ];
    const res = calculateStreaks(timestamps, ref);
    assert.equal(res.currentStreak, 4);
    assert.equal(res.longestStreak, 4);
    assert.equal(res.totalActiveDays, 4);
  });

  await t.test("gap resets current streak but retains longest streak", () => {
    const timestamps = [
      "2026-09-05T09:00:00Z", // streak 1
      // gap on 09-04
      "2026-09-03T11:00:00Z", // run of 3
      "2026-09-02T12:00:00Z",
      "2026-09-01T14:00:00Z",
    ];
    const res = calculateStreaks(timestamps, ref);
    assert.equal(res.currentStreak, 1);
    assert.equal(res.longestStreak, 3);
    assert.equal(res.totalActiveDays, 4);
  });

  await t.test("multiple timestamps on the same day deduplicate correctly", () => {
    const timestamps = [
      "2026-09-05T01:00:00Z",
      "2026-09-05T05:00:00Z",
      "2026-09-05T20:00:00Z",
      "2026-09-04T08:00:00Z",
    ];
    const res = calculateStreaks(timestamps, ref);
    assert.equal(res.currentStreak, 2);
    assert.equal(res.totalActiveDays, 2);
  });
});
