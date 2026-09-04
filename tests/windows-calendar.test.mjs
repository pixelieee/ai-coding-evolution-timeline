import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calendarPage, calendarPeriodCells, calendarPeriodFocus, localCalendarToday, calendarDays } from "../src/calendarDates.js";

test("Windows calendar pages by month, year, and decade", () => {
  assert.equal(calendarPage("2026-12", "days", 1), "2027-01");
  assert.equal(calendarPage("2026-01", "days", -1), "2025-12");
  assert.equal(calendarPage("2026-09", "months", -1), "2025-09");
  assert.equal(calendarPage("2026-09", "years", -1), "2016-09");
  assert.equal(calendarPage("2026-09", "years", 1), "2036-09");
  assert.equal(calendarPage("0100-01", "years", -1), "0100-01");
  assert.equal(calendarPage("9999-12", "days", 1), "9999-12");
});

test("month and decade views match the four-column Windows grids", () => {
  const months = calendarPeriodCells("2026-09", "months");
  assert.equal(months.length, 16);
  assert.equal(months[0].key, "2026-01");
  assert.equal(months[11].key, "2026-12");
  assert.equal(months[12].key, "2027-01");
  assert.equal(months.filter((item) => item.outside).length, 4);
  const years = calendarPeriodCells("2026-09", "years");
  assert.equal(years[0].key, "2018");
  assert.equal(years[15].key, "2033");
  assert.equal(years.filter((item) => !item.outside).length, 10);
  assert.equal(calendarPeriodCells("9999-12", "years").filter((item) => item.disabled).length, 4);
});

test("period keyboard navigation uses four columns and crosses year boundaries", () => {
  assert.equal(calendarPeriodFocus("2026-01", "ArrowLeft", "months"), "2025-12");
  assert.equal(calendarPeriodFocus("2026-09", "ArrowUp", "months"), "2026-05");
  assert.equal(calendarPeriodFocus("2026", "ArrowDown", "years"), "2030");
  assert.equal(calendarPeriodFocus("2026", "Enter", "years"), null);
});

test("local today and Gregorian day grids use real dates, not fixed screenshot copy", () => {
  assert.equal(localCalendarToday(new Date(2026, 8, 4, 1)), "2026-09-04");
  assert.equal(calendarDays("9999-12").at(-1).date, "10000-01-09");
});

test("shared calendar displays and announces Gregorian dates only, with release markers", () => {
  const source = readFileSync(new URL("../src/ArchiveCalendar.jsx", import.meta.url), "utf8");
  const dates = readFileSync(new URL("../src/calendarDates.js", import.meta.url), "utf8");
  assert.doesNotMatch(source + dates, /lunar|农历|u-ca-chinese/i);
  assert.match(source, /<span>\{day\.day\}<\/span>\{counts\[day\.date\] > 0 && <i aria-hidden="true"/);
  assert.ok(source.includes('aria-label={`${calendarSelectionLabel(day.date)}，${counts[day.date] || 0} 个节点`}'));
  assert.match(source, /aria-current=\{day\.date === today \? "date" : undefined\}/);
});

test("drilling into periods does not apply a date filter; range actions remain available", () => {
  const source = readFileSync(new URL("../src/ArchiveCalendar.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /<select|calendar-scopes/);
  const choose = source.match(/const choosePeriod = \(key, keyboard\) => \{([\s\S]*?)\n  \};/)[1];
  assert.doesNotMatch(choose, /onChange\(/);
  assert.match(source, /选择整月/);
  assert.match(source, /选择全年/);
  assert.match(source, /onChange\(day.date\)/);
  assert.match(source, /passive: false/);
});
