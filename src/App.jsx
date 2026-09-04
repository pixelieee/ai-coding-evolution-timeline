import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  ArrowSquareOut,
  Article,
  ArrowsCounterClockwise,
  Brain,
  CalendarDots,
  CaretDown,
  CaretLeft,
  CaretRight,
  CheckCircle,
  CodeBlock,
  DownloadSimple,
  Eye,
  FlowArrow,
  GithubLogo,
  ListBullets,
  MagnifyingGlass,
  MapTrifold,
  Minus,
  Moon,
  Plus,
  SidebarSimple,
  SortAscending,
  SortDescending,
  Sun,
  X,
} from "@phosphor-icons/react";
import nodes from "./nodes.json";
import { hasBrandMark } from "./brandAssets.jsx";
import { BrandMark, developmentStages, getBrandName, getDevelopmentStage, getDevelopmentStages, getEvolutionTrail, getLongSummary, getNodeSummary, getNodeTags, getSeriesKey } from "./nodeMeta.jsx";
import { getNodeResearch, getPublishedDate } from "./nodeSources.js";
import { positionHoverCard } from "./tooltipPosition.js";
import { createHoverDismissal } from "./hoverPreview.js";
import { buildTimelineYears, buildYearStops, buildLaneStops, getLaneScrollPosition, getYearScrollLeft, getLatestTimelineNode, getCalendarTimelineNode, getCurrentScrollPosition, percentToScroll, scrollToPercent, SCRUBBER_THUMB_SIZE, YEAR_LABEL_WIDTH } from "./timelineNavigation.js";
import { anchoredScroll, bindTimelineWheel, dragPosition, MAX_ZOOM, MIN_ZOOM, normalizeZoom, shouldCollapseAxis } from "./timelineInteractions.js";
import { ArchiveCalendar } from "./ArchiveCalendar.jsx";
import { calendarSelectionLabel, matchesCalendarDate } from "./calendarDates.js";
import { MILESTONE_LABEL_WIDTH, MIN_LANE_HEIGHT, milestoneTextStyle } from "./timelineTypography.js";
import { buildMonthStops } from "./monthNavigation.js";
import { TimelineScrubber } from "./TimelineScrubber.jsx";
import { themeStore } from "./theme.js";

const DEFAULT_ZOOM = 1;
const MILESTONE_SIZE = 38;
const MILESTONE_LABEL_GAP = 10;
const MILESTONE_SPACING = 24;
const BAND_LABEL_WIDTH = 168;
const LANE_LABEL_WIDTH = 172;
const COLLAPSED_AXIS_WIDTH = 48;
const LANE_COUNT = developmentStages.length;
const SECTION_GAP = 8;
const LIBRARY_PAGE_SIZE = 16;

const sections = [
  { id: "products", label: "产品演进", short: "产品", color: "var(--products-color, #3478df)", tint: "#f8fafc" },
  { id: "models", label: "模型演进", short: "模型", color: "var(--models-color, #7658d6)", tint: "#faf9fc" },
  { id: "tech", label: "关键技术", short: "技术", color: "var(--tech-color, #159a73)", tint: "#f8fbfa" },
];

const years = [2021, 2022, 2023, 2024, 2025, 2026];
const sectionMap = Object.fromEntries(sections.map((item) => [item.id, item]));

function buildEvolutionPath(chain, milestoneSize, nodeTop) {
  if (!chain?.nodes.length) return "";
  const points = chain.nodes.map((node) => ({ x: node.left + milestoneSize / 2, y: nodeTop(node.lane) + milestoneSize / 2 }));
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} C${midpoint},${previous.y} ${midpoint},${point.y} ${point.x},${point.y}`;
  }, `M${points[0].x},${points[0].y}`);
}

function ResearchMark({ node }) {
  const Icon = node.family.includes("代码建模") ? CodeBlock : node.family.includes("Agent Loop") ? FlowArrow : node.family.includes("RL") ? Article : Brain;
  return <span className="research-mark" role="img" aria-label={`${node.family}研究节点`}><Icon size="58%" weight="duotone" /></span>;
}

function AuthorCredit() {
  return <a className="author-credit" href="https://github.com/pixelieee" target="_blank" rel="noopener noreferrer" aria-label="pixelieee 的 GitHub 主页（在新标签页打开）"><GithubLogo size={17} aria-hidden="true" /><span>pixelieee</span></a>;
}

function RefinementMenu({ open, onToggle, stage, onStage, onClear, calendar, section }) {
  const activeCount = Number(Boolean(calendar.value)) + Number(stage !== "all");
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [panelPlacement, setPanelPlacement] = useState({ above: false, maxHeight: 600 });
  useEffect(() => {
    if (!open) return undefined;
    const dismissOutside = (event) => { if (!menuRef.current?.contains(event.target)) onToggle(); };
    const dismissEscape = (event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onToggle();
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", dismissOutside);
    menuRef.current?.addEventListener("keydown", dismissEscape);
    const menu = menuRef.current;
    return () => { document.removeEventListener("pointerdown", dismissOutside); menu?.removeEventListener("keydown", dismissEscape); };
  }, [open, onToggle]);
  useLayoutEffect(() => {
    if (!open) return undefined;
    const measure = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const mobile = window.innerWidth <= 760;
      const opensAbove = !mobile && below < 520 && above > below;
      setPanelPlacement({ above: opensAbove, maxHeight: Math.max(120, Math.min(600, mobile ? window.innerHeight - 136 : opensAbove ? above : below)) });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure);
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure); };
  }, [open]);
  const panelTitle = "日期与发展阶段";
  return (
    <div ref={menuRef} className={`refinement-menu ${open ? "open" : ""}`}>
      <button ref={triggerRef} className="refinement-trigger" onClick={onToggle} aria-expanded={open} aria-haspopup="dialog" aria-label={`日期与阶段筛选，${calendarSelectionLabel(calendar.value)}`}>
        <CalendarDots size={15} /> 日期与阶段{activeCount > 0 && <span>{activeCount}</span>}<CaretDown size={12} />
      </button>
      {open && (
        <section className={`refinement-panel calendar-panel ${panelPlacement.above ? "opens-up" : ""}`} style={{ maxHeight: panelPlacement.maxHeight }} role="dialog" aria-label={`${panelTitle}筛选`}>
          <header><div><small>DATE & STAGE</small><strong>{panelTitle}</strong></div><button onClick={() => { onToggle(); triggerRef.current?.focus(); }} aria-label="关闭日期与阶段筛选"><X size={16} /></button></header>
          <ArchiveCalendar {...calendar} />
          <div className="refinement-group"><div><FlowArrow size={15} /><span>发展阶段</span></div><div className="stage-grid"><button className={stage === "all" ? "active" : ""} onClick={() => onStage("all")}>全部阶段</button>{getDevelopmentStages(section).map((item) => <button key={item.id} className={stage === item.id ? "active" : ""} onClick={() => onStage(item.id)} title={item.description}><b>{item.number}</b>{item.label}</button>)}</div></div>
          <footer><span>{activeCount ? `已启用 ${activeCount} 项条件` : "当前显示全部日期与阶段"}</span>{activeCount > 0 && <button onClick={onClear}>清除日期与阶段</button>}</footer>
        </section>
      )}
    </div>
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function buildEvolutionLayout(items, step, axisWidth, zoom) {
  const buckets = Object.fromEntries(sections.map((item) => [item.id, new Map(years.map((year) => [year, []]))]));

  items.forEach((node) => buckets[node.section].get(node.year)?.push(node));

  const { yearMarkers, stageWidth } = buildTimelineYears(items, years, sections.map((item) => item.id), step, axisWidth, zoom);
  const yearStarts = new Map(yearMarkers.map((marker) => [marker.year, marker.firstNodeLeft]));

  const layouts = sections.map((item) => {
    const positioned = years.flatMap((year) => [...buckets[item.id].get(year)]
      .sort((a, b) => getPublishedDate(a).localeCompare(getPublishedDate(b)) || (a.y ?? 0) - (b.y ?? 0) || a.title.localeCompare(b.title, "zh-CN"))
      .map((node, index) => {
        const series = getSeriesKey(node);
        const development = getDevelopmentStage(node);
        return { ...node, left: yearStarts.get(year) + index * step, lane: developmentStages.findIndex((stage) => stage.id === development.id), series, development };
      }));
    const positionedById = new Map(positioned.map((node) => [node.id, node]));
    const chains = [...new Set(positioned.map((node) => node.series))]
      .map((series) => ({ series, nodes: getEvolutionTrail(positioned.find((node) => node.series === series)).map((node) => positionedById.get(node.id)).filter(Boolean) }))
      .filter((chain) => chain.nodes.length > 1);
    return { ...item, nodes: positioned, chains };
  });

  return { layouts, yearMarkers, stageWidth };
}

function matchesSearch(node, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const research = getNodeResearch(node);
  return `${node.title} ${getPublishedDate(node)} ${node.family} ${getDevelopmentStage(node).label} ${node.stage} ${research.label}`.toLowerCase().includes(needle);
}

export function App() {
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot, () => "light");
  const viewportRef = useRef(null);
  const scrubberRef = useRef(null);
  const hoverTooltipRef = useRef(null);
  const hoverTriggerRef = useRef(null);
  const detailDrawerRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const pendingZoomRef = useRef(null);
  const zoomTargetRef = useRef(DEFAULT_ZOOM);
  const panoramaOpenedRef = useRef(false);
  const [viewMode, setViewMode] = useState("index");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [libraryDate, setLibraryDate] = useState("");
  const [panoramaDate, setPanoramaDate] = useState("");
  const [developmentStage, setDevelopmentStage] = useState("all");
  const [family, setFamily] = useState("all");
  const [refinementsOpen, setRefinementsOpen] = useState(false);
  const [newestFirst, setNewestFirst] = useState(true);
  const [selected, setSelected] = useState(null);
  const [hoverCard, setHoverCard] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [currentJump, setCurrentJump] = useState(null);
  const [laneJump, setLaneJump] = useState(null);
  const [calendarJump, setCalendarJump] = useState(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [scrubberTrackWidth, setScrubberTrackWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(720);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  const [axisCollapsed, setAxisCollapsed] = useState(false);
  const [libraryPage, setLibraryPage] = useState(1);

  const hoverDismissal = useMemo(() => createHoverDismissal(() => setHoverCard(null), {
    shouldKeepOpen: () => Boolean(hoverTriggerRef.current?.contains(document.activeElement) || hoverTooltipRef.current?.contains(document.activeElement)),
  }), []);
  useEffect(() => () => hoverDismissal.cancel(), [hoverDismissal]);
  useEffect(() => {
    hoverDismissal.dismiss();
  }, [viewMode, query, section, panoramaDate, developmentStage, hoverDismissal]);

  const expandedAxisWidth = viewportWidth <= 760 ? 260 : BAND_LABEL_WIDTH + LANE_LABEL_WIDTH;
  const axisWidth = axisCollapsed ? COLLAPSED_AXIS_WIDTH : expandedAxisWidth;
  const milestoneSize = MILESTONE_SIZE * zoom * (section === "all" ? 1 : 1.16);
  // Scale cards and their spacing together, while the rail stays readable.
  const milestoneStep = milestoneSize + (MILESTONE_LABEL_GAP + MILESTONE_LABEL_WIDTH + MILESTONE_SPACING) * zoom;
  const archiveLayout = useMemo(() => buildEvolutionLayout(nodes, milestoneStep, axisWidth, zoom), [milestoneStep, axisWidth, zoom]);
  const stageWidth = archiveLayout.stageWidth;
  const yearStops = useMemo(
    () => buildYearStops(archiveLayout.yearMarkers, axisWidth, maxScroll, scrubberTrackWidth),
    [archiveLayout.yearMarkers, axisWidth, maxScroll, scrubberTrackWidth],
  );
  const yearLabelRows = Math.max(1, ...yearStops.map((stop) => stop.row + 1));
  const currentPanoramaYear = yearStops.reduce((current, stop) => stop.scrollLeft <= percentToScroll(scrollPercent, maxScroll) + 1 ? stop.year : current, years[0]);
  const sectionCounts = useMemo(() => countBy(nodes, "section"), []);

  const availableFamilies = useMemo(() => {
    const source = section === "all" ? nodes : nodes.filter((node) => node.section === section);
    return [...new Set(source.map((node) => node.family))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  }, [section]);

  const filteredNodes = useMemo(() => {
    const result = nodes.filter((node) => {
      const matchesSection = section === "all" || node.section === section;
      const matchesDate = matchesCalendarDate(getPublishedDate(node), libraryDate);
      const matchesDevelopment = developmentStage === "all" || getDevelopmentStage(node).id === developmentStage;
      const matchesFamily = family === "all" || node.family === family;
      return matchesSearch(node, query) && matchesSection && matchesDate && matchesDevelopment && matchesFamily;
    });

    return result.sort((a, b) => {
      const byDate = getPublishedDate(a).localeCompare(getPublishedDate(b));
      if (byDate !== 0) return newestFirst ? -byDate : byDate;
      return a.title.localeCompare(b.title, "zh-CN");
    });
  }, [query, section, libraryDate, developmentStage, family, newestFirst]);

  const panoramaCandidates = useMemo(() => nodes.filter((node) =>
    matchesSearch(node, query) && (section === "all" || node.section === section)
    && (developmentStage === "all" || getDevelopmentStage(node).id === developmentStage)
  ), [query, section, developmentStage]);
  const panoramaCalendarDates = useMemo(() => panoramaCandidates.map(getPublishedDate), [panoramaCandidates]);
  const calendarDates = useMemo(() => panoramaCandidates.filter((node) =>
    family === "all" || node.family === family
  ).map(getPublishedDate), [panoramaCandidates, family]);

  const libraryPageCount = Math.max(1, Math.ceil(filteredNodes.length / LIBRARY_PAGE_SIZE));
  const pagedNodes = useMemo(
    () => filteredNodes.slice((libraryPage - 1) * LIBRARY_PAGE_SIZE, libraryPage * LIBRARY_PAGE_SIZE),
    [filteredNodes, libraryPage],
  );

  useEffect(() => setLibraryPage(1), [query, section, libraryDate, developmentStage, family, newestFirst]);

  const displayedSections = useMemo(
    () => (section === "all" ? sections : sections.filter((item) => item.id === section)),
    [section],
  );

  const panoramaLayouts = useMemo(
    () => displayedSections.map((item) => archiveLayout.layouts.find((layout) => layout.id === item.id)),
    [archiveLayout.layouts, displayedSections],
  );

  const singleSectionProfile = useMemo(() => {
    if (section === "all") return null;
    const sectionNodes = nodes.filter((node) => node.section === section);
    return {
      section: sections.find((item) => item.id === section),
      seriesCount: new Set(sectionNodes.map((node) => getSeriesKey(node))).size,
      stages: getDevelopmentStages(section).map((stage) => ({
        ...stage,
        count: sectionNodes.filter((node) => getDevelopmentStage(node).id === stage.id).length,
      })),
    };
  }, [section]);

  const positionedNodes = useMemo(
    () => new Map(archiveLayout.layouts.flatMap((layout) => layout.nodes).map((node) => [node.id, node])),
    [archiveLayout.layouts],
  );

  const panoramaMatches = useMemo(
    () => new Set(panoramaCandidates.filter((node) => matchesCalendarDate(getPublishedDate(node), panoramaDate)).map((node) => node.id)),
    [panoramaCandidates, panoramaDate],
  );

  const latestPanoramaNode = useMemo(
    () => getLatestTimelineNode(panoramaLayouts, panoramaMatches, getPublishedDate),
    [panoramaLayouts, panoramaMatches],
  );
  const laneStops = useMemo(
    () => buildLaneStops(panoramaLayouts, panoramaMatches, getPublishedDate),
    [panoramaLayouts, panoramaMatches],
  );
  const isAtLane = Boolean(laneJump && !selected
    && laneStops.get(laneJump.destination.key) === laneJump.destination
    && Math.abs(percentToScroll(scrollPercent, maxScroll) - laneJump.left) < 2
    && Math.abs(scrollTop - laneJump.top) < 2);
  const isAtCalendar = Boolean(calendarJump && !selected
    && panoramaDate === calendarJump.selection && panoramaMatches.has(calendarJump.destination.node.id)
    && positionedNodes.get(calendarJump.destination.node.id) === calendarJump.destination.node
    && calendarJump.zoom === zoom && calendarJump.axisWidth === axisWidth
    && Math.abs(percentToScroll(scrollPercent, maxScroll) - calendarJump.left) < 2
    && Math.abs(scrollTop - calendarJump.top) < 2);
  const monthStops = useMemo(
    () => buildMonthStops(panoramaLayouts, panoramaMatches, getPublishedDate, axisWidth, maxScroll),
    [panoramaLayouts, panoramaMatches, axisWidth, maxScroll],
  );
  const isAtCurrent = Boolean(currentJump && latestPanoramaNode
    && currentJump.destination === latestPanoramaNode && currentJump.zoom === zoom && currentJump.axisWidth === axisWidth
    && Math.abs(percentToScroll(scrollPercent, maxScroll) - currentJump.left) < 2
    && Math.abs(scrollTop - currentJump.top) < 2);

  const evolutionStats = useMemo(() => {
    const result = new Map();
    nodes.forEach((node) => {
      const trail = getEvolutionTrail(node);
      result.set(node.id, { index: trail.findIndex((item) => item.id === node.id), total: trail.length, series: getSeriesKey(node) });
    });
    return result;
  }, []);
  const selectedSeries = selected ? getSeriesKey(selected) : null;
  const activeSeries = selectedSeries || hoverCard?.node.series || null;
  const selectedTrail = selected ? getEvolutionTrail(selected) : [];
  const selectedResearch = selected ? getNodeResearch(selected) : null;
  const hoverResearch = hoverCard ? getNodeResearch(hoverCard.node) : null;

  const baseSectionGaps = SECTION_GAP * Math.max(0, displayedSections.length - 1);
  const totalSectionGaps = baseSectionGaps * zoom;
  const baseSingleInset = displayedSections.length === 1 ? (viewportWidth <= 760 ? 8 : 14) : 0;
  const singleSectionInset = baseSingleInset * zoom;
  const baseBandHeight = displayedSections.length === 1
    ? Math.min(560, Math.max(420, viewportHeight - 36 - baseSingleInset))
    : Math.max(LANE_COUNT * MIN_LANE_HEIGHT, (viewportHeight - 36 - baseSectionGaps) / displayedSections.length);
  const bandHeight = baseBandHeight * zoom;
  const stageHeight = Math.max(viewportHeight, 36 + singleSectionInset + bandHeight * displayedSections.length + totalSectionGaps);
  const laneHeight = bandHeight / LANE_COUNT;
  const nodeTop = (lane) => lane * laneHeight + Math.max(1, (laneHeight - milestoneSize) / 2);
  const showSingleProfile = Boolean(singleSectionProfile && zoom >= 1 && viewportHeight - bandHeight > 150);

  const zoomTo = useCallback((value) => {
    const next = normalizeZoom(value);
    const viewport = viewportRef.current;
    zoomTargetRef.current = next;
    if (next === zoom) return;
    if (viewport) {
      pendingZoomRef.current = {
        fromZoom: zoom, toZoom: next, axisWidth,
        scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop,
        x: axisWidth + (viewport.clientWidth - axisWidth) / 2,
        y: viewport.clientHeight / 2,
      };
    }
    hoverDismissal.dismiss();
    setZoom(next);
  }, [axisWidth, zoom, hoverDismissal]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const pending = pendingZoomRef.current;
    zoomTargetRef.current = zoom;
    if (!viewport || !pending || pending.toZoom !== zoom) return;
    pendingZoomRef.current = null;
    viewport.scrollTo({ ...anchoredScroll({ ...pending, maxLeft: viewport.scrollWidth - viewport.clientWidth, maxTop: viewport.scrollHeight - viewport.clientHeight }), behavior: "instant" });
  }, [zoom]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    return bindTimelineWheel(viewport);
  }, [viewMode]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const scrubber = scrubberRef.current;
    if (!viewport || !scrubber) return undefined;
    const measure = () => {
      setViewportHeight(viewport.clientHeight);
      setViewportWidth(window.innerWidth);
      const distance = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      setMaxScroll(distance);
      setScrubberTrackWidth(Math.max(0, scrubber.clientWidth - SCRUBBER_THUMB_SIZE));
      setScrollPercent(scrollToPercent(viewport.scrollLeft, distance));
      setScrollTop(viewport.scrollTop);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(scrubber);
    measure();
    return () => observer.disconnect();
  }, [viewMode, stageWidth]);

  useEffect(() => {
    if (viewMode !== "panorama" || selected || panoramaOpenedRef.current) return;
    const viewport = viewportRef.current;
    const marker = archiveLayout.yearMarkers.find((item) => item.year === 2024);
    if (!viewport || !marker) return;
    panoramaOpenedRef.current = true;
    requestAnimationFrame(() => {
      viewport.scrollLeft = getYearScrollLeft(marker, axisWidth, viewport.scrollWidth - viewport.clientWidth);
      syncScrollPercent();
    });
  }, [archiveLayout.yearMarkers, axisWidth, selected, viewMode]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelected(null);
        hoverDismissal.dismiss();
        setRefinementsOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    const dismissHover = () => hoverDismissal.dismiss();
    window.addEventListener("resize", dismissHover);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", dismissHover);
    };
  }, [hoverDismissal]);

  const hoverAnchor = hoverCard?.anchor;
  useLayoutEffect(() => {
    const tooltip = hoverTooltipRef.current;
    if (!hoverAnchor || !tooltip || !tooltip.offsetHeight) return;
    const position = positionHoverCard(
      hoverAnchor,
      { width: tooltip.offsetWidth, height: tooltip.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    );
    setHoverCard((current) => current?.anchor === hoverAnchor ? { ...current, ...position } : current);
  }, [hoverAnchor]);

  const syncScrollPercent = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    hoverDismissal.dismiss();
    const distance = viewport.scrollWidth - viewport.clientWidth;
    setMaxScroll(Math.max(0, distance));
    setScrollPercent(scrollToPercent(viewport.scrollLeft, distance));
    setScrollTop(viewport.scrollTop);
  };

  const centerNode = (node, smooth = true) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const positioned = positionedNodes.get(node.id);
    const left = positioned?.left ?? (node.x ?? 0) * stageWidth;
    viewport.scrollTo({ left: left - viewport.clientWidth / 2 + milestoneSize / 2, top: viewport.scrollTop, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (viewMode === "panorama" && selected) requestAnimationFrame(() => centerNode(selected));
  }, [viewMode, selected, section]);

  const toggleSection = (id) => {
    setSection((current) => (current === id ? "all" : id));
    setFamily("all");
    hoverDismissal.dismiss();
  };

  const changeAxis = (nextCollapsed) => {
    if (nextCollapsed === axisCollapsed) return;
    const viewport = viewportRef.current;
    const widthDelta = expandedAxisWidth - COLLAPSED_AXIS_WIDTH;
    hoverDismissal.dismiss();
    setAxisCollapsed(nextCollapsed);
    if (viewport) requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, viewport.scrollLeft + (nextCollapsed ? -widthDelta : widthDelta));
      syncScrollPercent();
    });
  };

  const handleCanvasClick = (event) => {
    // Runs after node selection; the capture guard consumes drag-generated clicks.
    if (shouldCollapseAxis(event, axisCollapsed)) changeAxis(true);
  };

  const showHoverCard = (event, node, evolution) => {
    if (dragRef.current?.moved) return;
    hoverDismissal.cancel();
    hoverTriggerRef.current = event.currentTarget;
    const rect = event.currentTarget.getBoundingClientRect();
    const caption = event.currentTarget.querySelector(".milestone-card")?.getBoundingClientRect();
    const anchor = {
      left: Math.min(rect.left, caption?.left ?? rect.left),
      top: Math.min(rect.top, caption?.top ?? rect.top),
      bottom: Math.max(rect.bottom, caption?.bottom ?? rect.bottom),
      centerX: rect.left + rect.width / 2,
    };
    setHoverCard({ node, evolution, anchor, left: anchor.left, top: anchor.bottom + 18, placement: "below", hidden: true });
  };

  const leaveHoverCard = (event) => {
    const next = event.relatedTarget;
    if (next instanceof Node && (hoverTriggerRef.current?.contains(next) || hoverTooltipRef.current?.contains(next))) {
      hoverDismissal.cancel();
      return;
    }
    hoverDismissal.schedule();
  };

  const enterHoverCardWithKeyboard = (event, node) => {
    if (event.key !== "Tab" || event.shiftKey || hoverCard?.node.id !== node.id || hoverCard.hidden) return;
    const action = hoverTooltipRef.current?.querySelector(".tooltip-actions button");
    if (!action) return;
    event.preventDefault();
    action.focus({ preventScroll: true });
  };

  const handleHoverCardKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      hoverTriggerRef.current?.focus({ preventScroll: true });
      hoverDismissal.dismiss();
    } else if (event.key === "Tab" && event.shiftKey && event.target === hoverTooltipRef.current?.querySelector(".tooltip-actions button")) {
      event.preventDefault();
      hoverTriggerRef.current?.focus({ preventScroll: true });
    }
  };

  const openHoverDetails = () => {
    if (!hoverCard) return;
    setSelected(hoverCard.node);
    hoverDismissal.dismiss();
    requestAnimationFrame(() => detailDrawerRef.current?.querySelector(".drawer-header button")?.focus({ preventScroll: true }));
  };

  const locateNode = (node) => {
    setSelected(node);
    setSection(node.section);
    setFamily("all");
    setLibraryDate("");
    setPanoramaDate("");
    setDevelopmentStage("all");
    setViewMode("panorama");
  };

  const jumpToYear = (targetYear) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const marker = archiveLayout.yearMarkers.find((item) => item.year === targetYear);
    if (!marker) return;
    setCurrentJump(null);
    viewport.scrollTo({ left: getYearScrollLeft(marker, axisWidth, viewport.scrollWidth - viewport.clientWidth), top: 0, behavior: "smooth" });
  };

  const jumpToCurrent = () => {
    const viewport = viewportRef.current;
    if (!viewport || !latestPanoramaNode) return;
    const { node, sectionIndex } = latestPanoramaNode;
    const target = getCurrentScrollPosition({
      left: node.left - 6 * zoom,
      centerY: 36 + singleSectionInset + sectionIndex * (bandHeight + SECTION_GAP * zoom) + nodeTop(node.lane) + milestoneSize / 2,
      cardWidth: milestoneSize + (MILESTONE_LABEL_GAP + MILESTONE_LABEL_WIDTH + 12) * zoom,
      axisWidth, viewportWidth: viewport.clientWidth, viewportHeight: viewport.clientHeight,
      maxLeft: viewport.scrollWidth - viewport.clientWidth, maxTop: viewport.scrollHeight - viewport.clientHeight,
    });
    setSelected(null);
    hoverDismissal.dismiss();
    setCurrentJump({ ...target, destination: latestPanoramaNode, zoom, axisWidth });
    viewport.scrollTo({ ...target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const scrub = (event) => {
    const viewport = viewportRef.current;
    const next = Number(event.currentTarget.value);
    setScrollPercent(next);
    if (viewport) viewport.scrollLeft = percentToScroll(next, viewport.scrollWidth - viewport.clientWidth);
  };

  const jumpToMonth = (stop) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const centerY = 36 + singleSectionInset + stop.sectionIndex * (bandHeight + SECTION_GAP * zoom) + nodeTop(stop.node.lane) + milestoneSize / 2;
    setCurrentJump(null);
    setSelected(null);
    hoverDismissal.dismiss();
    viewport.scrollTo({
      left: stop.scrollLeft,
      top: clamp(centerY - viewport.clientHeight / 2, 0, Math.max(0, viewport.scrollHeight - viewport.clientHeight)),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  const jumpToLane = (stop) => {
    const viewport = viewportRef.current;
    if (!viewport || !stop) return;
    const target = getLaneScrollPosition({
      left: stop.node.left,
      centerY: 36 + singleSectionInset + stop.sectionIndex * (bandHeight + SECTION_GAP * zoom) + nodeTop(stop.node.lane) + milestoneSize / 2,
      axisWidth, viewportHeight: viewport.clientHeight,
      maxLeft: viewport.scrollWidth - viewport.clientWidth,
      maxTop: viewport.scrollHeight - viewport.clientHeight,
    });
    setCurrentJump(null);
    setSelected(null);
    hoverDismissal.dismiss();
    setLaneJump({ ...target, destination: stop });
    viewport.scrollTo({ ...target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const selectPanoramaDate = (value) => {
    setPanoramaDate(value);
    setCalendarJump(null);
    const viewport = viewportRef.current;
    // Use the same pre-date scope as the dots, not the previous date's matches.
    const stop = getCalendarTimelineNode(panoramaLayouts, new Set(panoramaCandidates.map((node) => node.id)), value, getPublishedDate);
    if (!viewport || !stop) return;
    const target = getCurrentScrollPosition({
      left: stop.node.left - 6 * zoom,
      centerY: 36 + singleSectionInset + stop.sectionIndex * (bandHeight + SECTION_GAP * zoom) + nodeTop(stop.node.lane) + milestoneSize / 2,
      cardWidth: milestoneSize + (MILESTONE_LABEL_GAP + MILESTONE_LABEL_WIDTH + 12) * zoom,
      axisWidth, viewportWidth: viewport.clientWidth, viewportHeight: viewport.clientHeight,
      maxLeft: viewport.scrollWidth - viewport.clientWidth, maxTop: viewport.scrollHeight - viewport.clientHeight,
    });
    setSelected(null);
    setCurrentJump(null);
    setLaneJump(null);
    hoverDismissal.dismiss();
    setRefinementsOpen(false);
    setCalendarJump({ ...target, destination: stop, selection: value, zoom, axisWidth });
    viewport.focus({ preventScroll: true });
    viewport.scrollTo({ ...target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const changeZoom = (direction) => {
    zoomTo(Math.round((zoomTargetRef.current + direction * 0.1) * 100) / 100);
  };

  const resetPanorama = () => {
    setCurrentJump(null);
    pendingZoomRef.current = null;
    zoomTargetRef.current = DEFAULT_ZOOM;
    setZoom(DEFAULT_ZOOM);
    setSection("all");
    setQuery("");
    setPanoramaDate("");
    setDevelopmentStage("all");
    hoverDismissal.dismiss();
    requestAnimationFrame(() => viewportRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" }));
  };

  const beginDrag = (event) => {
    suppressClickRef.current = false;
    if (event.pointerType === "touch" || ![0, 1].includes(event.button) || event.target.closest("input, a, select, button:not(.milestone-node)")) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    if (event.clientX - rect.left >= viewport.clientWidth || event.clientY - rect.top >= viewport.clientHeight) return;
    if (event.button === 1) event.preventDefault();
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
  };

  const dragCanvas = (event) => {
    const viewport = viewportRef.current;
    const origin = dragRef.current;
    if (!viewport || !origin || event.pointerId !== origin.pointerId) return;
    const position = dragPosition(origin, { x: event.clientX, y: event.clientY });
    if (!origin.moved && !position.moved) return;
    event.preventDefault();
    if (!origin.moved) {
      origin.moved = true;
      viewport.setPointerCapture(event.pointerId);
      suppressClickRef.current = true;
      setDragging(true);
      hoverDismissal.dismiss();
    }
    viewport.scrollLeft = position.left;
    viewport.scrollTop = position.top;
  };

  const endDrag = () => {
    const viewport = viewportRef.current;
    const pointerId = dragRef.current?.pointerId;
    dragRef.current = null;
    if (pointerId != null && viewport?.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
    setDragging(false);
    // Suppress only the click dispatched immediately after pointerup.
    window.setTimeout(() => { suppressClickRef.current = false; }, 0);
  };

  const preventDragClick = (event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const resetFilters = () => {
    setQuery("");
    setSection("all");
    setLibraryDate("");
    setPanoramaDate("");
    setDevelopmentStage("all");
    setFamily("all");
  };

  const clearRefinements = () => {
    if (viewMode === "index") setLibraryDate(""); else setPanoramaDate("");
    setDevelopmentStage("all");
  };

  const goToLibraryPage = (nextPage) => {
    setLibraryPage(clamp(nextPage, 1, libraryPageCount));
    requestAnimationFrame(() => document.querySelector(".library-results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const hasFilters = query || section !== "all" || libraryDate || developmentStage !== "all" || family !== "all";

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-brand">
          <span className="brand-icon" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}site-mark.svg`} width="38" height="38" alt="" /></span>
          <div><strong>AI Coding Evolution</strong></div>
        </div>
        <nav className="view-tabs" aria-label="视图切换">
          <button className={viewMode === "index" ? "active" : ""} onClick={() => setViewMode("index")}><ListBullets size={17} /> 节点库</button>
          <button className={viewMode === "panorama" ? "active" : ""} onClick={() => setViewMode("panorama")}><MapTrifold size={17} /> 全景图</button>
        </nav>
        <div className="header-actions">
          <button type="button" className="theme-toggle" role="switch" aria-checked={theme === "dark"} aria-label="深色主题" title={theme === "dark" ? "切换为浅色主题" : "切换为深色主题"} onClick={themeStore.toggle}>
            {theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>
          <div className="pdf-actions" role="group" aria-label="原始 PDF">
            <span>原始 PDF</span>
            <a className="download-link" href="./AI-Coding-Evolution-Timeline.pdf" target="_blank" rel="noopener noreferrer" aria-label="查看原始 PDF（新标签页）" title="在新标签页查看原始 PDF"><Eye size={17} /> 查看</a>
            <a className="download-link" href="./AI-Coding-Evolution-Timeline.pdf" download="AI-Coding-Evolution-Timeline.pdf" aria-label="下载原始 PDF" title="下载原始 PDF"><DownloadSimple size={17} /> 下载</a>
          </div>
        </div>
      </header>

      {viewMode === "index" ? (
        <main className="library-page">
          <section className="library-heading">
            <div><span className="eyebrow">RESEARCH INDEX · 2021–2026</span><h1>AI 编程工具、模型与关键技术</h1></div>
            <button onClick={() => setViewMode("panorama")}><MapTrifold size={17} /> 打开全景时间线</button>
          </section>

          <section className="library-toolbar">
            <div className="library-search">
              <MagnifyingGlass size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、轨道或阶段" aria-label="搜索全部节点" />
              {query && <button onClick={() => setQuery("")} aria-label="清除搜索"><X size={15} /></button>}
            </div>
            <div className="category-tabs" aria-label="按方向筛选">
              <button className={section === "all" ? "active" : ""} onClick={() => { setSection("all"); setFamily("all"); }}>全部 <span>{nodes.length}</span></button>
              {sections.map((item) => (
                <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => toggleSection(item.id)}><i style={{ background: item.color }} />{item.label}<span>{sectionCounts[item.id]}</span></button>
              ))}
            </div>
            <label className="compact-select family-filter">
              <select value={family} onChange={(event) => setFamily(event.target.value)} aria-label="细分轨道"><option value="all">全部细分轨道</option>{availableFamilies.map((item) => <option key={item} value={item}>{item}</option>)}</select><CaretDown size={13} />
            </label>
            <RefinementMenu open={refinementsOpen} onToggle={() => setRefinementsOpen((value) => !value)} calendar={{ value: libraryDate, onChange: setLibraryDate, dates: calendarDates }} section={section} stage={developmentStage} onStage={setDevelopmentStage} onClear={clearRefinements} />
            <button className="icon-button" onClick={() => setNewestFirst((value) => !value)} aria-label={newestFirst ? "切换为最早优先" : "切换为最新优先"}>{newestFirst ? <SortDescending size={17} /> : <SortAscending size={17} />}</button>
            {hasFilters && <button className="reset-button" onClick={resetFilters}><ArrowsCounterClockwise size={15} /> 重置</button>}
          </section>

          <section className="library-results">
            <header className="library-results-head">
              <div><span>ARCHIVE RESULTS</span><strong>{filteredNodes.length} 个节点</strong></div>
              <p>{calendarSelectionLabel(libraryDate)} · {section === "all" ? "全部方向" : sectionMap[section].label}{developmentStage === "all" ? "" : ` · ${getDevelopmentStages(section).find((item) => item.id === developmentStage)?.label}`}{family === "all" ? "" : ` · ${family}`}</p>
              <small>第 {libraryPage} / {libraryPageCount} 页</small>
            </header>
            {filteredNodes.length > 0 ? (
              <>
                <div className="library-grid">
                  {pagedNodes.map((node) => {
                    const publishedDate = getPublishedDate(node);
                    const research = getNodeResearch(node);
                    return (
                      <button key={node.id} className={`library-node-card ${selected?.id === node.id ? "selected" : ""}`} onClick={() => setSelected(node)} aria-pressed={selected?.id === node.id} aria-label={`${publishedDate} ${node.title}，点击查看详情与来源`}>
                        <span className="library-card-top">{hasBrandMark(node) ? <BrandMark node={node} /> : <ResearchMark node={node} />}<span className="library-card-meta"><strong>{node.title}</strong><small>{node.section === "tech" ? "Research milestone" : getBrandName(node)}</small></span><ArrowRight size={18} aria-hidden="true" /></span>
                        <span className="library-card-classification"><span className={`track-badge ${node.section}`}><i />{sectionMap[node.section].label}</span><time dateTime={publishedDate}>{publishedDate}</time></span>
                        <span className="library-card-body"><small>{getNodeSummary(node)}</small></span>
                        <span className="library-card-foot"><span>{node.family}</span><small>{research.kind} · {getDevelopmentStage(node).short}</small></span>
                      </button>
                    );
                  })}
                </div>
                <nav className="library-pagination" aria-label="节点库分页">
                  <button onClick={() => goToLibraryPage(libraryPage - 1)} disabled={libraryPage === 1} aria-label="上一页"><CaretLeft size={16} /> 上一页</button>
                  <span><strong>{libraryPage}</strong><i />{libraryPageCount}</span>
                  <button onClick={() => goToLibraryPage(libraryPage + 1)} disabled={libraryPage === libraryPageCount} aria-label="下一页">下一页 <CaretRight size={16} /></button>
                </nav>
              </>
            ) : <div className="empty-results"><MagnifyingGlass size={25} /><strong>没有匹配节点</strong><button onClick={resetFilters}>清除筛选</button></div>}
          </section>
          <footer className="library-footer"><AuthorCredit /></footer>
        </main>
      ) : (
        <main className="panorama-page">
          <div className="panorama-toolbar">
            <div><span className="eyebrow">INTERACTIVE TIMELINE</span><h1>全景时间线</h1></div>
          </div>
          <div className="timeline-navigator" style={{ "--scrubber-thumb-size": `${SCRUBBER_THUMB_SIZE}px`, "--year-label-width": `${YEAR_LABEL_WIDTH}px` }}>
            <div className="scrubber-row">
              <span>起点</span>
              <TimelineScrubber scrubberRef={scrubberRef} yearStops={yearStops} yearLabelRows={yearLabelRows} currentYear={currentPanoramaYear} scrollPercent={scrollPercent} onScrub={scrub} onYear={jumpToYear} monthStops={monthStops} onMonth={jumpToMonth} />
              <button type="button" className={`current-jump ${isAtCurrent ? "active" : ""}`} onClick={jumpToCurrent} aria-pressed={isAtCurrent} disabled={!latestPanoramaNode} title={latestPanoramaNode ? `定位到当前筛选下的最新节点：${latestPanoramaNode.date} ${latestPanoramaNode.node.title}` : "当前筛选没有匹配节点"} aria-label={latestPanoramaNode ? `当前，定位至 ${latestPanoramaNode.date} 的 ${latestPanoramaNode.node.title}` : "当前，没有匹配节点"}>当前</button>
            </div>
          </div>
          <div className="panorama-filterbar">
            <div className="compact-search"><MagnifyingGlass size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索 ${nodes.length} 个节点`} aria-label="搜索全景图节点" />{query && <button onClick={() => setQuery("")} aria-label="清除搜索"><X size={14} /></button>}</div>
            <div className="track-chips" aria-label="全景图分类">
              <button className={section === "all" ? "active all" : ""} onClick={() => { setSection("all"); setFamily("all"); }}>全部方向</button>
              {sections.map((item) => (
                <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => toggleSection(item.id)} aria-pressed={section === item.id} style={section === item.id ? { "--chip-color": item.color, "--chip-tint": item.tint } : undefined}>
                  <i style={{ background: item.color }} />{item.label}<span>{sectionCounts[item.id]}</span>{section === item.id && <CheckCircle size={14} weight="fill" />}
                </button>
              ))}
            </div>
            <RefinementMenu open={refinementsOpen} onToggle={() => setRefinementsOpen((value) => !value)} calendar={{ value: panoramaDate, onChange: selectPanoramaDate, dates: panoramaCalendarDates }} section={section} stage={developmentStage} onStage={setDevelopmentStage} onClear={clearRefinements} />
            <span className="sr-only" role="status">{isAtCalendar ? `已定位到 ${calendarJump.destination.date} 的 ${calendarJump.destination.node.title}` : ""}</span>
            <span className="hotspot-count" aria-live="polite">{panoramaMatches.size} / {section === "all" ? nodes.length : sectionCounts[section]} 节点 · {panoramaMatches.size ? "再次点击分类返回全部" : "当前条件下无匹配节点"}</span>
          </div>
          <div className="panorama-workspace">
          <div ref={viewportRef} className={`panorama-viewport ${dragging ? "dragging" : ""}`} tabIndex={0} aria-label="时间线画布：点击泳道收起侧栏，拖拽平移，滚轮上下滚动，Shift 加滚轮横移，使用底部按钮缩放" onScroll={syncScrollPercent} onPointerDown={beginDrag} onPointerMove={dragCanvas} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onClickCapture={preventDragClick} onClick={handleCanvasClick} onDragStart={(event) => event.preventDefault()} onKeyDown={(event) => {
            if (event.target.closest("button, input, a, select")) return;
            if (["+", "=", "-", "0"].includes(event.key)) {
              event.preventDefault();
              if (event.key === "0") zoomTo(1); else changeZoom(event.key === "-" ? -1 : 1);
            }
          }}>
            <div className={`timeline-stage ${axisCollapsed ? "axis-collapsed" : "axis-expanded"}`} style={{ width: stageWidth, height: stageHeight, "--axis-width": `${axisWidth}px`, "--milestone-size": `${milestoneSize}px`, "--milestone-label-width": `${MILESTONE_LABEL_WIDTH * zoom}px`, "--milestone-label-gap": `${MILESTONE_LABEL_GAP * zoom}px`, ...milestoneTextStyle(zoom), "--milestone-padding": `${6 * zoom}px`, "--milestone-caption-gap": `${2 * zoom}px` }}>
              <div className="year-ruler"><strong className="axis-title" style={{ width: axisWidth }}><button type="button" className="axis-collapse-toggle" onClick={() => changeAxis(!axisCollapsed)} aria-expanded={!axisCollapsed} aria-controls={panoramaLayouts.map((layout) => `panorama-${layout.id}-axis`).join(" ")} aria-label={axisCollapsed ? "展开侧栏" : "收起侧栏"} title={axisCollapsed ? "展开侧栏" : "收起侧栏"}><SidebarSimple size={20} weight={axisCollapsed ? "regular" : "duotone"} aria-hidden="true" /></button><em>TIME / DEVELOPMENT</em></strong>{archiveLayout.yearMarkers.map((marker) => <span key={marker.year} style={{ left: marker.firstNodeLeft + milestoneSize / 2 }}>{marker.year}</span>)}</div>
              <div className="year-grid" aria-hidden="true">{archiveLayout.yearMarkers.map((marker) => <i key={marker.year} style={{ left: marker.firstNodeLeft + milestoneSize / 2 }} />)}<i style={{ left: stageWidth - 1 }} /></div>
              <div className={`timeline-sections ${displayedSections.length === 1 ? "single" : "all"}`} style={{ gap: SECTION_GAP * zoom, paddingTop: singleSectionInset }}>
                {panoramaLayouts.map((layout) => (
                  <section key={layout.id} className={`timeline-band ${layout.id}`} style={{ height: bandHeight, "--section-color": layout.color, "--section-tint": layout.tint }}>
                    <div id={`panorama-${layout.id}-axis`} className="band-axis" style={{ width: axisWidth }}>
                      <header className="band-label" aria-label={layout.label} title={layout.label}>{!axisCollapsed && <span className="track-index">0{sections.findIndex((item) => item.id === layout.id) + 1}</span>}<strong>{axisCollapsed ? layout.short : layout.label}</strong><small>{sectionCounts[layout.id]} / {sectionCounts[layout.id]} 节点</small><p>{layout.id === "products" ? "产品、IDE 与 Agent 平台" : layout.id === "models" ? "模型家族与能力跃迁" : "论文、协议与评测方法"}</p></header>
                      <div className="stage-labels" role="group" aria-label={`${layout.label}泳道导航`}>{getDevelopmentStages(layout.id).map((stage, lane) => {
                        const stop = laneStops.get(`${layout.id}:${lane}`);
                        const label = stage.label;
                        const current = isAtLane && laneJump.destination === stop;
                        return <button type="button" key={stage.id} style={{ height: laneHeight }} onClick={() => jumpToLane(stop)} disabled={!stop} aria-current={current ? "location" : undefined} aria-label={stop ? `${label}，${stage.description} 定位到第一个节点：${stop.node.title}，${stop.date}` : `${label}，当前筛选下无节点`} title={`${stage.description} ${stop ? `定位到 ${stop.node.title} · ${stop.date}` : "当前筛选下无节点"}`}><b>{stage.number}</b><span>{label}</span></button>;
                      })}</div>
                    </div>
                    <div className="lane-fields" style={{ left: axisWidth }} aria-hidden="true">{developmentStages.map((stage, lane) => <i key={stage.id} style={{ top: lane * laneHeight, height: laneHeight }} />)}</div>
                    <svg className="evolution-links" width={stageWidth} height={bandHeight} aria-hidden="true">
                      {layout.chains.filter((chain) => chain.series === activeSeries).map((chain) => {
                        const path = buildEvolutionPath(chain, milestoneSize, nodeTop);
                        return <g key={chain.series}><path className="route-halo" d={path} /><path className="route-main" d={path} /></g>;
                      })}
                    </svg>
                    {layout.nodes.map((node) => {
                      const isSelected = selected?.id === node.id;
                      const isLocated = (isAtLane && laneJump.destination.node.id === node.id) || (isAtCalendar && calendarJump.destination.node.id === node.id);
                      const isMatch = panoramaMatches.has(node.id);
                      const evolution = evolutionStats.get(node.id);
                      const isRelated = activeSeries && activeSeries === node.series;
                      return (
                        <button key={node.id} data-node-id={node.id} data-stage={node.development.id} data-series={node.series} className={`milestone-node ${isSelected ? "selected" : ""} ${isLocated ? "located" : ""} ${isRelated ? "related" : ""} ${isMatch ? "match" : "muted"}`} style={{ left: node.left, top: nodeTop(node.lane), width: milestoneSize, height: milestoneSize }} onPointerEnter={(event) => showHoverCard(event, node, evolution)} onPointerLeave={leaveHoverCard} onFocus={(event) => showHoverCard(event, node, evolution)} onBlur={leaveHoverCard} onKeyDown={(event) => enterHoverCardWithKeyboard(event, node)} onClick={() => { hoverDismissal.dismiss(); setSelected(node); }} aria-pressed={isSelected} aria-haspopup="dialog" aria-expanded={hoverCard?.node.id === node.id && !hoverCard.hidden} aria-controls={hoverCard?.node.id === node.id ? "milestone-preview" : undefined} aria-label={`${getPublishedDate(node)} ${node.title}，${node.series}第 ${evolution.index + 1} 个节点，点击查看详情与来源`}>
                          <span className="milestone-card">
                            <span className="milestone-logo">{hasBrandMark(node) ? <BrandMark node={node} compact orb /> : <ResearchMark node={node} />}</span>
                            <span className="milestone-caption"><span className="milestone-title">{node.title}</span><time className="milestone-date" dateTime={getPublishedDate(node)}>{getPublishedDate(node)}</time></span>
                          </span>
                        </button>
                      );
                    })}
                  </section>
                ))}
                {showSingleProfile && (
                  <aside className="single-track-profile" style={{ "--section-color": singleSectionProfile.section.color }} aria-label={`${singleSectionProfile.section.label}发展阶段概览`}>
                    <header>
                      <span>DEVELOPMENT PROFILE</span>
                      <strong>{singleSectionProfile.section.label} · 发展阶段</strong>
                      <small>{singleSectionProfile.seriesCount} 条发展线，按能力成熟度重新组织</small>
                    </header>
                    {singleSectionProfile.stages.map((stage) => (
                      <div key={stage.id} className="profile-stage">
                        <span>{stage.number}</span>
                        <strong>{stage.count}</strong>
                        <small>{stage.label}</small>
                      </div>
                    ))}
                  </aside>
                )}
              </div>
            </div>
          </div>
          <div className="canvas-tools">
            <div className="canvas-footer-meta"><AuthorCredit /><span className="canvas-gesture-hint">拖拽平移 <i /> 滚轮上下滚动 <i /> Shift + 滚轮横移</span></div>
            <div className="scale-controls" role="group" aria-label="画布缩放，40% 至 250%">
              <span className="scale-label"><MapTrifold size={15} />画布</span>
              <button onClick={() => changeZoom(-1)} disabled={zoom <= MIN_ZOOM} aria-label="缩小画布" title="缩小画布（−）"><Minus size={16} /></button>
              <input className="zoom-slider" type="range" min={MIN_ZOOM * 100} max={MAX_ZOOM * 100} step="1" value={Math.round(zoom * 100)} onChange={(event) => zoomTo(Number(event.currentTarget.value) / 100)} aria-label="拖动缩放画布" aria-valuetext={`${Math.round(zoom * 100)}%`} />
              <button onClick={() => changeZoom(1)} disabled={zoom >= MAX_ZOOM} aria-label="放大画布" title="放大画布（+）"><Plus size={16} /></button>
              <button className="zoom-value" onClick={() => zoomTo(1)} title="恢复 100%（0）" aria-label={`当前画布缩放 ${Math.round(zoom * 100)}%，点击恢复 100%`}>{Math.round(zoom * 100)}%</button>
              <button className="reset-scale" onClick={resetPanorama} title="重置缩放、筛选和画布位置"><ArrowsCounterClockwise size={16} /><span>重置视图</span></button>
            </div>
          </div>
          </div>
        </main>
      )}

      {selected && (
        <aside ref={detailDrawerRef} className={`detail-drawer ${viewMode === "panorama" ? "over-panorama" : ""}`} aria-label="节点详情">
          <div className="drawer-header"><div><span>{getPublishedDate(selected)}{selected.dateNote ? " · 待核" : ""}</span><small>{selected.id.replace("node-", selected.origin === "supplement" ? "补充 #" : "SOURCE #")}</small></div><button onClick={() => setSelected(null)} aria-label="关闭详情"><X size={19} /></button></div>
          <div className="drawer-body">
            <div className="drawer-identity">{hasBrandMark(selected) ? <BrandMark node={selected} /> : <ResearchMark node={selected} />}<div><span className={`track-badge ${selected.section}`}><i />{sectionMap[selected.section].label}</span><small>{selected.section === "tech" ? selected.family : getBrandName(selected)}</small></div></div>
            <h2>{selected.title}</h2>
            <p className="drawer-lede">{getNodeSummary(selected)}</p>
            <section className="drawer-summary"><h3>摘要</h3><p>{getLongSummary(selected)}</p></section>
            <a className="source-card" href={selectedResearch.url} target={selectedResearch.url.startsWith("/") ? undefined : "_blank"} rel={selectedResearch.url.startsWith("/") ? undefined : "noreferrer"}>
              <span><small>SOURCE · {selectedResearch.kind}</small><strong>{selectedResearch.label}</strong></span><ArrowSquareOut size={18} />
            </a>
            {selectedResearch.references?.map((reference) => <a key={reference.url} className="source-card" href={reference.url} target="_blank" rel="noopener noreferrer"><span><small>补充来源</small><strong>{reference.label}</strong></span><ArrowSquareOut size={18} /></a>)}
            <section className="drawer-evolution">
              <div><h3>发展线</h3><small>{selectedSeries} · {selectedTrail.length} 个里程碑</small></div>
              <div className="evolution-rail">
                {selectedTrail.map((item, index) => (
                  <button key={item.id} className={item.id === selected.id ? "active" : ""} onClick={() => setSelected(item)} aria-label={`查看 ${getPublishedDate(item)} ${item.title}`}>
                    <i /><time>{getPublishedDate(item)}</time><span>{item.title}</span><em>{String(index + 1).padStart(2, "0")}</em>
                  </button>
                ))}
              </div>
            </section>
            <div className="drawer-tags">{getNodeTags(selected).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <dl><div><dt>发布日期</dt><dd>{getPublishedDate(selected)}</dd></div><div><dt>细分轨道</dt><dd>{selected.family}</dd></div><div><dt>发展阶段</dt><dd>{getDevelopmentStage(selected).number} · {getDevelopmentStage(selected).label}</dd></div><div><dt>来源类型</dt><dd>{selectedResearch.kind}</dd></div></dl>
          </div>
          <div className="drawer-actions"><button className="primary-action" onClick={() => locateNode(selected)}><MapTrifold size={18} /> 在全景图中聚焦</button><a href={selectedResearch.url} target={selectedResearch.url.startsWith("/") ? undefined : "_blank"} rel={selectedResearch.url.startsWith("/") ? undefined : "noreferrer"}><ArrowSquareOut size={17} /> 打开来源</a><button onClick={() => { setSelected(null); setViewMode("index"); }}>节点库</button></div>
        </aside>
      )}
      {viewMode === "panorama" && hoverCard && (
        <aside ref={hoverTooltipRef} id="milestone-preview" className={`global-milestone-tooltip ${hoverCard.placement}`} style={{ left: hoverCard.left, top: hoverCard.top, "--tooltip-arrow-left": `${hoverCard.arrowLeft ?? 32}px`, visibility: hoverCard.hidden ? "hidden" : "visible" }} role="dialog" aria-modal="false" aria-labelledby="milestone-preview-title" onPointerEnter={hoverDismissal.cancel} onPointerLeave={leaveHoverCard} onFocusCapture={hoverDismissal.cancel} onBlurCapture={leaveHoverCard} onKeyDown={handleHoverCardKeyDown}>
          <span className="tooltip-meta"><time>{getPublishedDate(hoverCard.node)}</time><em>{hoverCard.node.series} · {hoverCard.evolution.index + 1}/{hoverCard.evolution.total}</em></span>
          <div className="tooltip-heading">{hasBrandMark(hoverCard.node) ? <BrandMark node={hoverCard.node} compact /> : <ResearchMark node={hoverCard.node} />}<span className="tooltip-heading-text"><strong id="milestone-preview-title">{hoverCard.node.title}</strong><small>{getDevelopmentStage(hoverCard.node).number} · {getDevelopmentStage(hoverCard.node).label}</small></span></div>
          <p>{getNodeSummary(hoverCard.node)}</p>
          <div className="tooltip-actions">
            <button type="button" onClick={openHoverDetails}>查看详情 <ArrowRight size={15} /></button>
            <a href={hoverResearch.url} target="_blank" rel="noopener noreferrer" title={`${hoverResearch.kind} · ${hoverResearch.label}`}>打开来源 <ArrowSquareOut size={15} /></a>
          </div>
        </aside>
      )}
    </div>
  );
}
