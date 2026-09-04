import { useEffect, useMemo, useRef, useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { CALENDAR_MIN_YEAR, CALENDAR_MAX_YEAR, calendarDateCounts, calendarDays, calendarFocusDate, calendarPage, calendarPeriodCells, calendarPeriodFocus, calendarSelectionLabel, localCalendarToday } from "./calendarDates.js";

export function ArchiveCalendar({ value, onChange, dates }) {
  const today = localCalendarToday();
  const initialMonth = value.length >= 7 ? value.slice(0, 7) : value ? `${value}-01` : today.slice(0, 7);
  const [cursor, setCursor] = useState(initialMonth);
  const [view, setView] = useState("days");
  const [focused, setFocused] = useState(value.length === 10 ? value : today.startsWith(initialMonth) ? today : `${initialMonth}-01`);
  const gridRef = useRef(null);
  const focusPending = useRef(false);
  const wheelState = useRef({ amount: 0, last: 0 });
  const [year, month] = cursor.split("-");
  const decade = Math.floor(Number(year) / 10) * 10;
  const counts = useMemo(() => calendarDateCounts(dates), [dates]);
  const days = useMemo(() => calendarDays(cursor), [cursor]);
  const periods = useMemo(() => calendarPeriodCells(cursor, view), [cursor, view]);
  const title = view === "days" ? `${Number(year)}年${Number(month)}月` : view === "months" ? `${Number(year)}年` : `${decade} – ${decade + 9}`;
  const viewLabel = view === "days" ? "日期" : view === "months" ? "月份" : "年份";
  const validDate = (date) => date.split("-")[0].length === 4 && Number(date.slice(0, 4)) >= CALENDAR_MIN_YEAR && Number(date.slice(0, 4)) <= CALENDAR_MAX_YEAR;
  const dayForMonth = (next) => value.length === 10 && value.startsWith(next) ? value : today.startsWith(next) ? today : `${next}-01`;

  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    gridRef.current?.querySelector(`[data-calendar-key="${focused}"]`)?.focus({ preventScroll: true });
  }, [focused, cursor, view]);

  const page = (direction, keyboard = false) => {
    const next = calendarPage(cursor, view, direction);
    focusPending.current = keyboard;
    setCursor(next);
    setFocused(view === "days" ? dayForMonth(next) : view === "months" ? next : next.slice(0, 4));
  };

  useEffect(() => {
    const grid = gridRef.current;
    const wheel = (event) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      const state = wheelState.current;
      if (now - state.last < 180) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 300 : 1);
      state.amount = Math.sign(state.amount) === Math.sign(delta) ? state.amount + delta : delta;
      if (Math.abs(state.amount) < 40) return;
      page(Math.sign(state.amount));
      state.last = now;
      state.amount = 0;
    };
    grid?.addEventListener("wheel", wheel, { passive: false });
    return () => grid?.removeEventListener("wheel", wheel);
  }, [cursor, view, value, today]);

  const levelUp = () => {
    if (view === "years") return;
    setView(view === "days" ? "months" : "years");
    setFocused(view === "days" ? cursor : year);
  };

  const choosePeriod = (key, keyboard) => {
    focusPending.current = keyboard;
    const next = view === "years" ? `${key}-${month}` : key;
    setCursor(next);
    setView(view === "years" ? "months" : "days");
    setFocused(view === "years" ? next : dayForMonth(next));
  };

  const keyNavigate = (event, key) => {
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      page(event.key === "PageUp" ? -1 : 1, true);
      return;
    }
    const next = view === "days" ? calendarFocusDate(key, event.key) : calendarPeriodFocus(key, event.key, view);
    if (!next) return;
    event.preventDefault();
    if (!validDate(next)) return;
    focusPending.current = true;
    setFocused(next);
    if (view === "days") setCursor(next.slice(0, 7));
    else if (!periods.some((item) => item.key === next)) setCursor(view === "months" ? next : `${next}-${month}`);
  };

  const goToday = () => {
    setCursor(today.slice(0, 7));
    setView("days");
    setFocused(today);
  };

  return (
    <section className="archive-calendar" aria-label="发布日期日历">
      <div className="calendar-navigation">
        <button type="button" className="calendar-heading" onClick={levelUp} disabled={view === "years"} aria-label={view === "days" ? `${title}，选择月份` : view === "months" ? `${title}，选择年份` : title}><span aria-live="polite">{title}</span></button>
        <button type="button" className="calendar-page" onClick={() => page(-1)} disabled={calendarPage(cursor, view, -1) === cursor} aria-label={view === "days" ? "上一个月" : view === "months" ? "上一年" : "上十年"} title={view === "days" ? "上一个月" : view === "months" ? "上一年" : "上十年"}><CaretUp size={14} weight="fill" /></button>
        <button type="button" className="calendar-page" onClick={() => page(1)} disabled={calendarPage(cursor, view, 1) === cursor} aria-label={view === "days" ? "下一个月" : view === "months" ? "下一年" : "下十年"} title={view === "days" ? "下一个月" : view === "months" ? "下一年" : "下十年"}><CaretDown size={14} weight="fill" /></button>
      </div>
      <div ref={gridRef} className={`calendar-body view-${view}`}>
        <div key={`${view}-${cursor}`} className="calendar-view">
          {view === "days" ? <>
            <div className="calendar-weekdays" aria-hidden="true">{["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="calendar-days" role="group" aria-label={`${title}，方向键选择日期`}>
              {days.map((day) => <button type="button" key={day.date} data-calendar-key={day.date} disabled={!validDate(day.date)} className={`calendar-cell ${day.inMonth ? "" : "outside"} ${day.date === today ? "today" : ""} ${value === day.date ? "selected" : ""}`} tabIndex={focused === day.date ? 0 : -1} aria-current={day.date === today ? "date" : undefined} aria-pressed={value === day.date} aria-label={`${calendarSelectionLabel(day.date)}，${counts[day.date] || 0} 个节点`} title={`${calendarSelectionLabel(day.date)} · ${counts[day.date] || 0} 个节点`} onFocus={() => setFocused(day.date)} onKeyDown={(event) => keyNavigate(event, day.date)} onClick={() => { setCursor(day.date.slice(0, 7)); setFocused(day.date); onChange(day.date); }}><span className="calendar-cell-face"><span>{day.day}</span>{counts[day.date] > 0 && <i aria-hidden="true" />}</span></button>)}
            </div>
          </> : <div className="calendar-periods" role="group" aria-label={`${title}，选择${viewLabel}`}>
            {periods.map((item) => <button type="button" key={item.key} data-calendar-key={item.key} className={`calendar-cell ${item.outside ? "outside" : ""} ${today.startsWith(item.key) ? "today" : ""} ${value.startsWith(item.key) ? "selected" : ""}`} disabled={item.disabled} tabIndex={focused === item.key ? 0 : -1} aria-label={`${calendarSelectionLabel(item.key)}，查看${view === "years" ? "月份" : "日期"}`} onFocus={() => setFocused(item.key)} onKeyDown={(event) => keyNavigate(event, item.key)} onClick={(event) => choosePeriod(item.key, event.detail === 0)}><span className="calendar-cell-face">{item.label}{counts[item.key] > 0 && <i aria-hidden="true" />}</span></button>)}
          </div>}
        </div>
      </div>
      <div className="calendar-actions">
        {view !== "years" && <button type="button" className="calendar-scope" aria-pressed={value === (view === "days" ? cursor : year)} onClick={() => onChange(view === "days" ? cursor : year)}>{view === "days" ? "选择整月" : "选择全年"}</button>}
        <button type="button" onClick={goToday}>今天</button>
        <button type="button" onClick={() => onChange("")} disabled={!value}>全部日期</button>
      </div>
      <div className="calendar-selection"><span aria-live="polite">{calendarSelectionLabel(value)}</span><small><i />有发布节点</small></div>
    </section>
  );
}
