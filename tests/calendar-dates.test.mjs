import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calendarDateCounts, calendarDays, calendarFocusDate, calendarSelectionLabel, matchesCalendarDate, shiftCalendarMonth } from "../src/calendarDates.js";
import { getPublishedDate } from "../src/nodeSources.js";

test("calendar is a fixed six-week Monday-first grid", () => {
  const days = calendarDays("2023-01");
  assert.equal(days.length, 42);
  assert.equal(days[0].date, "2022-12-26");
  assert.equal(days[6].date, "2023-01-01");
  assert.equal(days.at(-1).date, "2023-02-05");
  assert.equal(days.filter((day) => day.inMonth).length, 31);
  assert.equal(days[0].inMonth, false);
});

test("leap years and month/year boundaries do not shift across time zones", () => {
  assert.equal(calendarDays("2024-02").filter((day) => day.inMonth).length, 29);
  assert.equal(calendarDays("2025-02").filter((day) => day.inMonth).length, 28);
  for (let year = 2021; year <= 2026; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const cursor = `${year}-${String(month).padStart(2, "0")}`;
      const days = calendarDays(cursor);
      assert.equal(new Date(`${days[0].date}T00:00:00Z`).getUTCDay(), 1);
      assert.equal(new Set(days.map((day) => day.date)).size, 42);
      for (const day of days.filter((item) => item.inMonth)) assert.ok(day.date.startsWith(cursor));
    }
  }
});

test("month navigation rolls over years and stops at the archive limits", () => {
  assert.equal(shiftCalendarMonth("2025-12", 1, 2021, 2026), "2026-01");
  assert.equal(shiftCalendarMonth("2025-01", -1, 2021, 2026), "2024-12");
  assert.equal(shiftCalendarMonth("2021-01", -1, 2021, 2026), "2021-01");
  assert.equal(shiftCalendarMonth("2026-12", 1, 2021, 2026), "2026-12");
});

test("year, month, day, and clear selections filter at the intended precision", () => {
  const dates = ["2024-02-29", "2025-02-01", "2025-02-28", "2025-03-01"];
  const filter = (selection) => dates.filter((date) => matchesCalendarDate(date, selection));
  assert.deepEqual(filter(""), dates);
  assert.deepEqual(filter("2025"), dates.slice(1));
  assert.deepEqual(filter("2025-02"), dates.slice(1, 3));
  assert.deepEqual(filter("2025-02-28"), ["2025-02-28"]);
  assert.deepEqual(filter("2025-02-02"), []);
  assert.deepEqual(filter("2025-2"), []);
});

test("calendar selection labels distinguish full years, months, and exact days", () => {
  assert.equal(calendarSelectionLabel(""), "全部日期");
  assert.equal(calendarSelectionLabel("2026"), "2026 年");
  assert.equal(calendarSelectionLabel("2026-08"), "2026 年 8 月");
  assert.equal(calendarSelectionLabel("2026-08-02"), "2026 年 8 月 2 日");
});

test("release dots and period counts match all 192 actual source dates", () => {
  const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
  const dates = nodes.map(getPublishedDate);
  const counts = calendarDateCounts(dates);
  assert.equal(dates.length, 192);
  for (const [selection, count] of Object.entries(counts)) {
    assert.equal(dates.filter((date) => matchesCalendarDate(date, selection)).length, count);
  }
  assert.equal(Object.entries(counts).filter(([key]) => key.length === 4).reduce((total, [, count]) => total + count, 0), 192);
  assert.deepEqual(calendarDateCounts([]), {});
  const subset = nodes.filter((node) => node.section === "tech").map(getPublishedDate);
  assert.equal(Object.entries(calendarDateCounts(subset)).filter(([key]) => key.length === 4).reduce((total, [, count]) => total + count, 0), 37);
});

test("keyboard day navigation crosses leap days, weeks, and year boundaries", () => {
  assert.equal(calendarFocusDate("2024-02-28", "ArrowRight"), "2024-02-29");
  assert.equal(calendarFocusDate("2025-12-31", "ArrowRight"), "2026-01-01");
  assert.equal(calendarFocusDate("2026-01-01", "ArrowLeft"), "2025-12-31");
  assert.equal(calendarFocusDate("2026-08-12", "ArrowUp"), "2026-08-05");
  assert.equal(calendarFocusDate("2026-08-12", "ArrowDown"), "2026-08-19");
  assert.equal(calendarFocusDate("2026-08-12", "Home"), "2026-08-10");
  assert.equal(calendarFocusDate("2026-08-12", "End"), "2026-08-16");
  assert.equal(calendarFocusDate("2026-08-12", "Enter"), null);
});
