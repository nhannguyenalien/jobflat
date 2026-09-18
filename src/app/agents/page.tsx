"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconRobot,
  IconSearch,
  IconSparkles,
  IconStarFilled,
} from "@tabler/icons-react";

type Agent = {
  id: string;
  slug: string;
  name: string;
  headline: string;
  description: string;
  skills: string[];
  rating: string;
  review_count: number;
  completed_count: number;
  price_amount: string;
  price_unit: string;
  is_verified: boolean;
};
const unitLabel: Record<string, string> = {
  month: "tháng",
  run: "lượt chạy",
  project: "dự án",
  hour: "giờ",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ type: "agent" });
    if (query) params.set("q", query);
    Promise.resolve().then(() => setLoading(true));
    fetch(`/api/listings?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ data: Agent[] }>;
      })
      .then((r) => setAgents(r.data))
      .catch((e) => {
        if (e.name !== "AbortError") setAgents([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);
  function search(event: FormEvent) {
    event.preventDefault();
    setQuery(input.trim());
  }
  return (
    <main className="surface-page agents-page">
      <header className="nav-shell">
        <nav className="container nav">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <span />
            </span>
            jobflat
          </Link>
          <div className="surface-tabs">
            <Link href="/jobs">Work</Link>
            <Link href="/services">Services</Link>
            <Link className="active" href="/agents">
              Agents
            </Link>
          </div>
          <Link className="btn btn-dark" href="/request">
            <IconSparkles size={16} /> Nói nhu cầu
          </Link>
        </nav>
      </header>
      <section className="surface-hero agent-hero">
        <div className="container">
          <span className="kicker">AI AGENT MARKETPLACE</span>
          <h1>Digital workers, sẵn sàng 24/7.</h1>
          <p>
            Khám phá các AI agent chuyên biệt để nghiên cứu, bán hàng, hỗ trợ
            khách hàng và tự động hóa công việc.
          </p>
          <form onSubmit={search} className="listing-search">
            <IconSearch size={20} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tìm agent theo khả năng..."
            />
            <button>Tìm Agent</button>
          </form>
        </div>
      </section>
      <section className="container agents-section">
        <div className="agent-benefits">
          <span>
            <IconBolt /> Chạy tức thì
          </span>
          <span>
            <IconCheck /> Chi phí minh bạch
          </span>
          <span>
            <IconRobot /> Hoạt động 24/7
          </span>
        </div>
        <div className="section-head">
          <div>
            <span className="kicker">VERIFIED AGENTS</span>
            <h2>{query ? `Kết quả cho “${query}”` : "Agent được tin dùng"}</h2>
          </div>
          <Link href="/request">
            Để Jobflat chọn giúp <IconArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="data-state">Đang tải AI Agents...</div>
        ) : agents.length === 0 ? (
          <div className="data-state">Chưa có agent phù hợp.</div>
        ) : (
          <div className="agent-grid">
            {agents.map((agent) => (
              <article className="agent-card" key={agent.id}>
                <div className="agent-card-head">
                  <div className="agent-icon">
                    <IconRobot />
                  </div>
                  {agent.is_verified && (
                    <span>
                      <IconCheck size={12} /> Verified
                    </span>
                  )}
                </div>
                <p className="agent-kind">AI AGENT</p>
                <h2>{agent.name}</h2>
                <h3>{agent.headline}</h3>
                <p>{agent.description}</p>
                <div className="agent-capabilities">
                  {agent.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <div className="agent-proof">
                  <span>
                    <IconStarFilled size={13} />
                    {agent.rating} ·{" "}
                    {agent.completed_count.toLocaleString("vi-VN")} runs
                  </span>
                  <strong>
                    ${Number(agent.price_amount).toLocaleString("en-US")}/
                    {unitLabel[agent.price_unit] ?? agent.price_unit}
                  </strong>
                </div>
                <Link href={`/profile?slug=${agent.slug}`}>
                  Xem & chạy Agent <IconArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
