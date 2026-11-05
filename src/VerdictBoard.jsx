import { useMemo, useState } from "react";
import { ArrowRight, ArrowSquareOut, Brain, CaretDown, CaretUp, CheckCircle, MagnifyingGlass, X } from "@phosphor-icons/react";
import { hasBrandMark } from "./brandAssets.jsx";
import { BrandMark, getDevelopmentStage } from "./nodeMeta.jsx";
import { getPublishedDate } from "./nodeSources.js";
import { verdicts, verdictTiers } from "./verdicts.js";

const filters = [
  { id: "all", label: "全部" },
  { id: "products", label: "产品" },
  { id: "models", label: "模型" },
  { id: "tech", label: "技术" },
];

function VerdictMark({ node }) {
  return hasBrandMark(node)
    ? <BrandMark node={node} />
    : <span className="verdict-research-mark" aria-hidden="true"><Brain size={23} weight="duotone" /></span>;
}

export function VerdictBoard({ nodes, selected, onSelect }) {
  const [section, setSection] = useState("all");
  const [query, setQuery] = useState("");
  const [collapsedTiers, setCollapsedTiers] = useState(() => new Set());
  const [mobileHeaderCollapsed, setMobileHeaderCollapsed] = useState(false);
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const entries = useMemo(() => verdicts
    .map((entry) => ({ ...entry, node: nodeById.get(entry.nodeId) }))
    .filter((entry) => entry.node && (section === "all" || entry.node.section === section))
    .filter((entry) => !normalizedQuery || `${entry.node.title} ${entry.node.family} ${entry.review} ${entry.community}`.toLocaleLowerCase().includes(normalizedQuery)), [nodeById, normalizedQuery, section]);

  const toggleTier = (tierId) => setCollapsedTiers((current) => {
    const next = new Set(current);
    if (next.has(tierId)) next.delete(tierId);
    else next.add(tierId);
    return next;
  });

  return (
    <main className="verdict-page">
      <section className={`verdict-top-panel ${mobileHeaderCollapsed ? "collapsed" : ""}`} aria-label="锐评介绍与分类">
        <section className="verdict-hero">
          <div>
            <span className="eyebrow">EDITORIAL VERDICT · {verdicts.length} MILESTONES</span>
            <h1>从夯到拉</h1>
          </div>
          <label className="verdict-search">
            <MagnifyingGlass size={19} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索产品、模型或技术" aria-label="搜索全部锐评" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="清空锐评搜索"><X size={17} /></button>}
          </label>
        </section>

        <nav className="verdict-filters" aria-label="锐评分组">
          {filters.map((filter) => <button key={filter.id} className={section === filter.id ? "active" : ""} onClick={() => setSection(filter.id)} aria-pressed={section === filter.id}>{filter.label}<span>{filter.id === "all" ? verdicts.length : verdicts.filter((entry) => nodeById.get(entry.nodeId)?.section === filter.id).length}</span></button>)}
        </nav>
        <button type="button" className="mobile-top-panel-toggle" onClick={() => setMobileHeaderCollapsed((value) => !value)} aria-expanded={!mobileHeaderCollapsed} aria-label={mobileHeaderCollapsed ? "展开介绍与分类" : "收起介绍与分类"}>
          {mobileHeaderCollapsed ? <><span>展开介绍与分类</span><CaretDown size={15} /></> : <><span>收起</span><CaretUp size={15} /></>}
        </button>
      </section>

      <div className="verdict-board">
        {verdictTiers.map((tier) => {
          const tierEntries = entries
            .filter((entry) => entry.tier === tier.id)
            .sort((a, b) => getPublishedDate(b.node).localeCompare(getPublishedDate(a.node)));
          if (!tierEntries.length) return null;
          const isCollapsed = collapsedTiers.has(tier.id);
          return (
            <section key={tier.id} className={`verdict-tier tier-${tier.id} ${isCollapsed ? "collapsed" : ""}`}>
              <header className="verdict-tier-label">
                <button type="button" onClick={() => toggleTier(tier.id)} aria-expanded={!isCollapsed} aria-label={`${isCollapsed ? "展开" : "收起"}${tier.label}档，共 ${tierEntries.length} 个节点`}>
                  <span>
                    <em className="verdict-grade">{tier.grade}</em>
                    <strong>{tier.label}</strong>
                    <small>{tierEntries.length}</small>
                  </span>
                  {isCollapsed ? <CaretDown size={15} /> : <CaretUp size={15} />}
                </button>
              </header>
              {!isCollapsed && <div className="verdict-tier-content">
                <p>{tier.description}</p>
                <div className="verdict-cards">
                  {tierEntries.map(({ node, review, evidence, community, communitySources, source }) => (
                    <article key={node.id} className={`verdict-card ${selected?.id === node.id ? "selected" : ""}`}>
                      <button className="verdict-card-main" onClick={() => onSelect(node)} aria-pressed={selected?.id === node.id} aria-label={`${tier.label}：${node.title}。${review} 点击查看节点详情`}>
                        <span className="verdict-card-head">
                          <VerdictMark node={node} />
                          <span><strong>{node.title}</strong><small>{getPublishedDate(node)} · {getDevelopmentStage(node).short}</small></span>
                          {selected?.id === node.id ? <CheckCircle size={18} weight="fill" /> : <ArrowRight size={18} />}
                        </span>
                        <span className="verdict-copy">{review}</span>
                        <span className="verdict-evidence"><strong>社区风向</strong>{community}</span>
                      </button>
                      <div className="verdict-links">
                        <a className="verdict-source" href={source.url} target="_blank" rel="noopener noreferrer" title={`硬证据：${evidence}`}><span>{source.label}</span><ArrowSquareOut size={15} /></a>
                        {communitySources.length > 0 && <span className="verdict-community-links" aria-label="社区样本">
                          {communitySources.map((item) => <a key={`${node.id}-${item.label}`} href={item.url} target="_blank" rel="noopener noreferrer" title={`社区样本：${item.label}`}>{item.label}</a>)}
                        </span>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>}
            </section>
          );
        })}
        {!entries.length && <p className="verdict-empty">没有匹配的节点。</p>}
      </div>
      <footer className="verdict-note">核查时间：2026-11-06。全部时间线节点均已入榜；出现独立复现、规模采用或明确退场后会直接改档。</footer>
    </main>
  );
}
