import { useMemo, useState } from "react";
import { ArrowRight, ArrowSquareOut, Brain, CheckCircle, Scales } from "@phosphor-icons/react";
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
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const entries = useMemo(() => verdicts
    .map((entry) => ({ ...entry, node: nodeById.get(entry.nodeId) }))
    .filter((entry) => entry.node && (section === "all" || entry.node.section === section)), [nodeById, section]);

  return (
    <main className="verdict-page">
      <section className="verdict-hero">
        <div>
          <span className="eyebrow">EDITORIAL VERDICT · 31 MILESTONES</span>
          <h1>从夯到拉</h1>
          <p>看它改变了什么、扩散到哪里、今天还剩下什么。</p>
        </div>
        <aside className="verdict-method" aria-label="锐评标准">
          <Scales size={25} weight="duotone" />
          <div><strong>看三件事</strong><span>机制变化 · 真实采用 · 后续影响</span></div>
          <small>每张卡片都附判定依据和原始来源。</small>
        </aside>
      </section>

      <nav className="verdict-filters" aria-label="锐评分组">
        {filters.map((filter) => <button key={filter.id} className={section === filter.id ? "active" : ""} onClick={() => setSection(filter.id)} aria-pressed={section === filter.id}>{filter.label}<span>{filter.id === "all" ? verdicts.length : verdicts.filter((entry) => nodeById.get(entry.nodeId)?.section === filter.id).length}</span></button>)}
      </nav>

      <div className="verdict-board">
        {verdictTiers.map((tier) => {
          const tierEntries = entries.filter((entry) => entry.tier === tier.id);
          if (!tierEntries.length) return null;
          return (
            <section key={tier.id} className={`verdict-tier tier-${tier.id}`}>
              <header className="verdict-tier-label">
                <span>{tier.grade}</span>
                <strong>{tier.label}</strong>
                <small>{tier.subtitle}</small>
              </header>
              <div className="verdict-tier-content">
                <p>{tier.description}</p>
                <div className="verdict-cards">
                  {tierEntries.map(({ node, review, evidence, source }) => (
                    <article key={node.id} className={`verdict-card ${selected?.id === node.id ? "selected" : ""}`}>
                      <button className="verdict-card-main" onClick={() => onSelect(node)} aria-pressed={selected?.id === node.id} aria-label={`${tier.label}：${node.title}。${review} 点击查看节点详情`}>
                        <span className="verdict-card-head">
                          <VerdictMark node={node} />
                          <span><strong>{node.title}</strong><small>{getPublishedDate(node)} · {getDevelopmentStage(node).short}</small></span>
                          {selected?.id === node.id ? <CheckCircle size={18} weight="fill" /> : <ArrowRight size={18} />}
                        </span>
                        <span className="verdict-copy">{review}</span>
                        <span className="verdict-evidence"><strong>判定依据</strong>{evidence}</span>
                      </button>
                      <a className="verdict-source" href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.label}</span><ArrowSquareOut size={15} /></a>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <footer className="verdict-note">核查时间：2026-11-03。新增独立复现、真实采用或退场记录后会直接改档。</footer>
    </main>
  );
}
