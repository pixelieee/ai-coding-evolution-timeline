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
          <span className="eyebrow">EDITORIAL VERDICT · {verdicts.length} MILESTONES</span>
          <h1>从夯到拉</h1>
          <p>看它改变了什么、扩散到哪里、今天还剩下什么。</p>
        </div>
        <aside className="verdict-method" aria-label="锐评标准">
          <Scales size={25} weight="duotone" />
          <div><strong>官方负责举证，社区负责拆台</strong><span>硬数据 · 真实口碑 · 后续影响</span></div>
          <small>综合 HN、Reddit、X、知乎与可检索的小红书公开讨论；热帖不等于民调。</small>
        </aside>
      </section>

      <nav className="verdict-filters" aria-label="锐评分组">
        {filters.map((filter) => <button key={filter.id} className={section === filter.id ? "active" : ""} onClick={() => setSection(filter.id)} aria-pressed={section === filter.id}>{filter.label}<span>{filter.id === "all" ? verdicts.length : verdicts.filter((entry) => nodeById.get(entry.nodeId)?.section === filter.id).length}</span></button>)}
      </nav>

      <div className="verdict-board">
        {verdictTiers.map((tier) => {
          const tierEntries = entries
            .filter((entry) => entry.tier === tier.id)
            .sort((a, b) => getPublishedDate(b.node).localeCompare(getPublishedDate(a.node)));
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
              </div>
            </section>
          );
        })}
      </div>
      <footer className="verdict-note">核查时间：2026-11-03。社区反馈是定性样本，不是投票；出现独立复现、规模采用或明确退场后会直接改档。</footer>
    </main>
  );
}
