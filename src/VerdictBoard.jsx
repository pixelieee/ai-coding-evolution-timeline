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
          <span className="eyebrow">EDITORIAL VERDICT · MILESTONES ONLY</span>
          <h1>从夯到拉</h1>
          <p>按范式增量、行业外溢和落地兑现度排。能力强不等于历史地位高，发布声量也不等于留下了遗产。</p>
        </div>
        <aside className="verdict-method" aria-label="锐评标准">
          <Scales size={25} weight="duotone" />
          <div><strong>怎么排</strong><span>新增机制 × 生态扩散 × 真实采用 × 持续性</span></div>
          <small>夯、顶级必须有跨生态采用或可复现实验；拉完了必须有明确退场记录。</small>
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
      <footer className="verdict-note">评级依据核查于 2026-11-03。榜单只收代表节点，不等于对全部 {nodes.length} 个节点逐项打分；新增独立复现、真实采用或明确退场证据后会调整档位。</footer>
    </main>
  );
}
