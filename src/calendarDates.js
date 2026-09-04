const pad = (value) => String(value).padStart(2, "0");
const yearText = (value) => String(value).padStart(4, "0");
export const CALENDAR_MIN_YEAR = 100;
export const CALENDAR_MAX_YEAR = 9999;

export function calendarDays(month) {
  const [year, number] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(Date.UTC(year, number - 1, index - offset + 1));
    return { date: `${yearText(date.getUTCFullYear())}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`, day: date.getUTCDate(), inMonth: date.getUTCMonth() === number - 1 };
  });
}

export function shiftCalendarMonth(month, direction, minYear, maxYear) {
  const [year, number] = month.split("-").map(Number);
  const index = Math.max(minYear * 12, Math.min(maxYear * 12 + 11, year * 12 + number - 1 + direction));
  return `${yearText(Math.floor(index / 12))}-${pad(index % 12 + 1)}`;
}

export function matchesCalendarDate(date, selection) {
  return !selection || date === selection || date.startsWith(`${selection}-`);
}

export function calendarSelectionLabel(selection) {
  if (!selection) return "全部日期";
  const [year, month, day] = selection.split("-");
  return `${year} 年${month ? ` ${Number(month)} 月` : ""}${day ? ` ${Number(day)} 日` : ""}`;
}

export function calendarDateCounts(dates) {
  return dates.reduce((counts, date) => {
    for (const prefix of [date.slice(0, 4), date.slice(0, 7), date]) counts[prefix] = (counts[prefix] || 0) + 1;
    return counts;
  }, {});
}

export function calendarFocusDate(date, key) {
  const value = new Date(`${date}T00:00:00Z`);
  const weekday = (value.getUTCDay() + 6) % 7;
  const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekday, End: 6 - weekday };
  if (!(key in offsets)) return null;
  value.setUTCDate(value.getUTCDate() + offsets[key]);
  return value.toISOString().slice(0, 10);
}

export function localCalendarToday(date = new Date()) {
  return `${yearText(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function calendarPage(cursor, view, direction) {
  return shiftCalendarMonth(cursor, direction * (view === "days" ? 1 : view === "months" ? 12 : 120), CALENDAR_MIN_YEAR, CALENDAR_MAX_YEAR);
}

export function calendarPeriodCells(cursor, view) {
  const year = Number(cursor.slice(0, 4));
  const decade = Math.floor(year / 10) * 10;
  return Array.from({ length: 16 }, (_, index) => {
    if (view === "months") {
      const itemYear = year + Math.floor(index / 12);
      const month = index % 12 + 1;
      return { key: `${yearText(itemYear)}-${pad(month)}`, label: `${month}月`, outside: itemYear !== year, disabled: itemYear > CALENDAR_MAX_YEAR };
    }
    const itemYear = decade - 2 + index;
    return { key: yearText(itemYear), label: String(itemYear), outside: itemYear < decade || itemYear > decade + 9, disabled: itemYear < CALENDAR_MIN_YEAR || itemYear > CALENDAR_MAX_YEAR };
  });
}

export function calendarPeriodFocus(key, pressed, view) {
  const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 };
  if (!(pressed in offsets)) return null;
  if (view === "months") return shiftCalendarMonth(key, offsets[pressed], CALENDAR_MIN_YEAR, CALENDAR_MAX_YEAR);
  return yearText(Math.max(CALENDAR_MIN_YEAR, Math.min(CALENDAR_MAX_YEAR, Number(key) + offsets[pressed])));
}
