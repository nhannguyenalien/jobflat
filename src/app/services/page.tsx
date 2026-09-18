"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  IconArrowRight,
  IconRobot,
  IconSearch,
  IconSparkles,
  IconStarFilled,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";

type Mode = "human" | "agent" | "hybrid";
type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  delivery_mode: Mode;
  provider_name: string;
  price_amount: string;
  price_unit: string;
  delivery_days: number | null;
  rating: string;
  order_count: number;
};
const modes = [
  ["", "Tất cả"],
  ["human", "Chuyên gia"],
  ["agent", "AI Agent"],
  ["hybrid", "Human + AI"],
] as const;
const labels: Record<Mode, string> = {
  human: "Chuyên gia",
  agent: "AI Agent",
  hybrid: "Human + AI",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (mode) params.set("mode", mode);
    Promise.resolve().then(() => setLoading(true));
    fetch(`/api/services?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((r) => setServices(r.data))
      .catch((e) => {
        if (e.name !== "AbortError") setServices([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query, mode]);
  function search(event: FormEvent) {
    event.preventDefault();
    setQuery(input.trim());
  }
  return (
    <main className="surface-page">
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
            <Link className="active" href="/services">
              Services
            </Link>
            <Link href="/agents">Agents</Link>
          </div>
          <Link className="btn btn-dark" href="/request">
            <IconSparkles size={16} /> Nói nhu cầu
          </Link>
        </nav>
      </header>
      <section className="surface-hero">
        <div className="container">
          <span className="kicker">SERVICE MARKETPLACE</span>
          <h1>Mua kết quả, không chỉ mua thời gian.</h1>
          <p>
            Dịch vụ đóng gói với giá và thời gian bàn giao rõ ràng—được thực
            hiện bởi chuyên gia, AI agent hoặc cả hai.
          </p>
          <form onSubmit={search} className="listing-search">
            <IconSearch size={20} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bạn cần dịch vụ gì?"
            />
            <button>Tìm dịch vụ</button>
          </form>
        </div>
      </section>
      <section className="container service-section">
        <div className="service-toolbar">
          <div>
            {modes.map(([value, label]) => (
              <button
                className={mode === value ? "active" : ""}
                onClick={() => setMode(value)}
                key={value || "all"}
              >
                {label}
              </button>
            ))}
          </div>
          <Link href="/request">
            Không biết chọn gì? <strong>Để Jobflat tìm giúp</strong>{" "}
            <IconArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div className="data-state">Đang tìm dịch vụ phù hợp...</div>
        ) : services.length === 0 ? (
          <div className="data-state">Chưa có dịch vụ phù hợp.</div>
        ) : (
          <div className="service-grid">
            {services.map((service) => {
              const Icon =
                service.delivery_mode === "agent"
                  ? IconRobot
                  : service.delivery_mode === "human"
                    ? IconUser
                    : IconUsersGroup;
              return (
                <article className="service-card" key={service.id}>
                  <div
                    className={`service-visual service-${service.delivery_mode}`}
                  >
                    <Icon size={30} />
                    <span>{service.category}</span>
                  </div>
                  <div className="service-body">
                    <span className={`type-pill type-${service.delivery_mode}`}>
                      <Icon size={13} />
                      {labels[service.delivery_mode]}
                    </span>
                    <h2>{service.title}</h2>
                    <p>{service.description}</p>
                    <small>
                      bởi <strong>{service.provider_name}</strong>
                    </small>
                    <div className="service-meta">
                      <span>
                        <IconStarFilled size={13} />
                        {service.rating} · {service.order_count} đơn
                      </span>
                      <strong>
                        ${Number(service.price_amount).toLocaleString("en-US")}
                      </strong>
                    </div>
                    <div className="service-delivery">
                      <span>
                        {service.delivery_days
                          ? `Bàn giao ${service.delivery_days} ngày`
                          : "Bắt đầu ngay"}
                      </span>
                      <Link href={`/service?slug=${service.slug}`}>
                        Xem chi tiết <IconArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
