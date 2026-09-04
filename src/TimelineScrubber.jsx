import { useEffect, useRef, useState } from "react";
import { SCRUBBER_THUMB_SIZE, YEAR_LABEL_ROW_HEIGHT } from "./timelineNavigation.js";
import { monthLensPosition, monthPreviewAt, monthTickHeight } from "./monthNavigation.js";

export function TimelineScrubber({ scrubberRef, yearStops, yearLabelRows, currentYear, scrollPercent, onScrub, onYear, monthStops, onMonth }) {
  const rootRef = useRef(null);
  const keyboardRef = useRef(false);
  const dismissedRef = useRef(false);
  const [preview, setPreview] = useState(null);
  const [placement, setPlacement] = useState({ left: 0, width: 360, anchor: 180 });
  useEffect(() => setPreview(null), [monthStops]);
  const openAt = (clientX, yearHint, percentHint) => {
    const rect = scrubberRef.current?.getBoundingClientRect();
    const rootRect = rootRef.current?.getBoundingClientRect();
    if (!rect || !rootRect) return;
    const percent = percentHint ?? Math.max(0, Math.min(100, (clientX - rect.left - SCRUBBER_THUMB_SIZE / 2) / Math.max(1, rect.width - SCRUBBER_THUMB_SIZE) * 100));
    setPreview(monthPreviewAt(monthStops, yearStops, percent, yearHint));
    setPlacement(monthLensPosition(clientX, rootRect.left, window.innerWidth));
  };
  const openFromPointer = (event) => {
    if (event.pointerType !== "mouse" || event.target.closest(".month-lens")) return;
    keyboardRef.current = false;
    dismissedRef.current = false;
    const year = event.target.closest("[data-year]")?.dataset.year;
    openAt(event.clientX, year ? Number(year) : undefined);
  };
  const openFromKeyboard = (target) => {
    if (dismissedRef.current || !target.matches(":focus-visible") || target.closest(".month-lens")) return;
    keyboardRef.current = true;
    const rect = scrubberRef.current.getBoundingClientRect();
    const year = target.dataset.year ? Number(target.dataset.year) : undefined;
    const percent = year ? yearStops.find((stop) => stop.year === year)?.percent ?? scrollPercent : scrollPercent;
    openAt(rect.left + SCRUBBER_THUMB_SIZE / 2 + (rect.width - SCRUBBER_THUMB_SIZE) * percent / 100, year, percent);
  };
  const dismiss = () => {
    dismissedRef.current = true;
    setPreview(null);
    if (rootRef.current?.querySelector(".month-lens")?.contains(document.activeElement)) scrubberRef.current?.focus({ preventScroll: true });
  };
  const selectedStop = preview && monthStops.find((stop) => stop.year === preview.year && stop.month === preview.month);
  const handleScrub = (event) => {
    onScrub(event);
    if (keyboardRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const percent = Number(event.currentTarget.value);
      openAt(rect.left + SCRUBBER_THUMB_SIZE / 2 + (rect.width - SCRUBBER_THUMB_SIZE) * percent / 100, undefined, percent);
    }
  };

  return <div ref={rootRef} className={`scrubber-control ${preview ? "months-visible" : ""}`}
    onPointerEnter={openFromPointer} onPointerMove={openFromPointer}
    onPointerLeave={() => { if (!keyboardRef.current) setPreview(null); }}
    onFocus={(event) => openFromKeyboard(event.target)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { keyboardRef.current = false; dismissedRef.current = false; setPreview(null); } }}
    onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dismiss(); }
      else if (event.target === scrubberRef.current) { dismissedRef.current = false; openFromKeyboard(event.target); }
    }}>
    <nav className="year-jumps" aria-label="跳转到各年首个节点" style={{ height: yearLabelRows * YEAR_LABEL_ROW_HEIGHT + 6 }}>
      {yearStops.map((stop) => <div key={stop.year} className="year-stop" style={{ left: `${stop.percent}%` }}>
        <button data-year={stop.year} className={currentYear === stop.year ? "active" : ""} style={{ top: stop.row * YEAR_LABEL_ROW_HEIGHT, height: YEAR_LABEL_ROW_HEIGHT }} onClick={() => onYear(stop.year)} aria-label={`跳转至 ${stop.year} 年首个节点`} aria-current={currentYear === stop.year ? "date" : undefined}>{stop.year}</button><i aria-hidden="true" />
      </div>)}
    </nav>
    <input ref={scrubberRef} type="range" min="0" max="100" step="any" value={scrollPercent} onInput={handleScrub} onChange={handleScrub} aria-label="水平浏览时间线" aria-valuetext={`${currentYear} 年附近，浏览进度 ${Math.round(scrollPercent)}%`} />
    {preview && <>
      <div className="month-overview" aria-hidden="true">{monthStops.filter((stop) => stop.year === preview.year).map((stop) => <i key={stop.key} className={stop.month === preview.month ? "active" : ""} style={{ left: `${stop.percent}%`, height: monthTickHeight(stop.month, preview.month) / 2 }} />)}</div>
      <div className="month-lens" role="group" aria-label={`${preview.year} 年月份定位`} style={{ width: placement.width, left: placement.left, "--month-lens-anchor": `${placement.anchor}px` }}>
        <div className="month-lens-heading"><span><strong>{preview.year}</strong><span>年</span><strong>{String(preview.month).padStart(2, "0")}</strong><span>月</span></span><small>{selectedStop ? `${selectedStop.count} 个节点` : "无收录节点"}</small></div>
        <div className="month-lens-ticks" role="toolbar" aria-label="月份刻度">
          {Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            const stop = monthStops.find((item) => item.year === preview.year && item.month === month);
            return <button key={month} type="button" className={`${month === preview.month ? "active" : ""} ${stop ? "has-nodes" : "empty"}`} data-month={month} tabIndex={month === preview.month ? 0 : -1} aria-disabled={!stop} aria-label={`${preview.year} 年 ${month} 月${stop ? `，${stop.count} 个节点，点击定位` : "，无收录节点"}`}
              onPointerEnter={() => { keyboardRef.current = false; setPreview({ ...preview, month }); }}
              onFocus={(event) => { if (event.target.matches(":focus-visible")) keyboardRef.current = true; setPreview({ ...preview, month }); }}
              onClick={() => { if (stop) onMonth(stop); }}
              onKeyDown={(event) => {
                const next = event.key === "ArrowRight" ? Math.min(12, month + 1) : event.key === "ArrowLeft" ? Math.max(1, month - 1) : event.key === "Home" ? 1 : event.key === "End" ? 12 : null;
                if (next !== null) { event.preventDefault(); event.currentTarget.parentElement.querySelector(`[data-month="${next}"]`)?.focus(); }
              }}><i style={{ height: monthTickHeight(month, preview.month) }} /><span>{String(month).padStart(2, "0")}</span></button>;
          })}
        </div>
      </div>
    </>}
  </div>;
}
