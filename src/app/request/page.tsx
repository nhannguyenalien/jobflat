"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheck,
  IconRobot,
  IconSparkles,
  IconStarFilled,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";

type Solution = {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: "human" | "agent" | "hybrid";
  provider_name: string;
  price_amount: string;
  price_unit: string;
  rating: string;
  delivery_days: number | null;
  source: "service" | "profile";
};
const labels = { human: "Chuyên gia", agent: "AI Agent", hybrid: "Human + AI" };

export default function RequestPage() {
  const [need, setNeed] = useState("");
  const [budget, setBudget] = useState("");
  const [email, setEmail] = useState("");
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("service");
    if (!slug) return;
    const controller = new AbortController();
    fetch(`/api/services?slug=${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(({ data }) => {
        setNeed(
          `Tôi muốn đặt dịch vụ "${data.title}" của ${data.provider_name}. ${data.description}`,
        );
        setBudget(String(Number(data.price_amount)));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSolutions([]);
    try {
      const response = await fetch("/api/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          need,
          budgetAmount: budget ? Number(budget) : undefined,
          budgetCurrency: "USD",
          email: email || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error();
      setSolutions(result.data.solutions);
    } catch {
      setError(
        "Chưa thể tìm phương án lúc này. Vui lòng kiểm tra thông tin và thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="request-page">
      <header className="sub-nav">
        <div className="container sub-nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <span />
            </span>
            jobflat
          </Link>
          <Link href="/">
            <IconArrowLeft size={17} /> Trang chủ
          </Link>
        </div>
      </header>
      <section className="request-hero">
        <div className="container request-intro">
          <span className="eyebrow">
            <IconSparkles size={14} /> SMART MATCH BETA
          </span>
          <h1>Bạn cần hoàn thành việc gì?</h1>
          <p>
            Không cần biết nên thuê người, dùng AI hay mua dịch vụ. Hãy mô tả
            kết quả—Jobflat sẽ tìm nhiều phương án để bạn so sánh.
          </p>
        </div>
      </section>
      <div className="container request-layout">
        <form className="intent-form" onSubmit={submit}>
          <label>
            Mô tả nhu cầu{" "}
            <textarea
              required
              minLength={15}
              rows={6}
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              placeholder="Ví dụ: Tôi cần xây website bất động sản có chatbot, ngân sách khoảng $1,200 và muốn hoàn thành trong 2 tuần."
            />
          </label>
          <div className="intent-row">
            <label>
              Ngân sách dự kiến (USD)
              <input
                min="0"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="1200"
              />
            </label>
            <label>
              Email nhận phương án
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </label>
          </div>
          <button className="btn btn-dark" disabled={loading}>
            {loading ? (
              <>
                <span className="button-loader" />
                Đang phân tích...
              </>
            ) : (
              <>
                <IconSparkles size={17} />
                Tìm phương án phù hợp
              </>
            )}
          </button>
          <div className="intent-trust">
            <span>
              <IconCircleCheck size={15} /> Human
            </span>
            <span>
              <IconCircleCheck size={15} /> AI Agent
            </span>
            <span>
              <IconCircleCheck size={15} /> Hybrid
            </span>
          </div>
          {error && <p className="request-error">{error}</p>}
        </form>
        <aside className="router-explainer">
          <span>JOBFLAT ROUTER</span>
          <h2>
            Một nhu cầu.
            <br />
            Nhiều cách giải quyết.
          </h2>
          <div>
            <p>
              <IconUser /> Chuyên gia phù hợp
            </p>
            <p>
              <IconRobot /> AI agent sẵn sàng
            </p>
            <p>
              <IconUsersGroup /> Đội ngũ Human + AI
            </p>
          </div>
          <small>
            Smart Match hiện dùng tín hiệu danh mục, mô tả, rating và lịch sử
            hoàn thành. Matching bằng AI sẽ được nâng cấp trong bản tiếp theo.
          </small>
        </aside>
      </div>
      {solutions.length > 0 && (
        <section className="container solution-section">
          <div className="section-head">
            <div>
              <span className="kicker">
                {solutions.length} PHƯƠNG ÁN ĐƯỢC TÌM THẤY
              </span>
              <h2>Chọn cách phù hợp với bạn.</h2>
            </div>
          </div>
          <div className="solution-grid">
            {solutions.map((item) => {
              const Icon =
                item.kind === "agent"
                  ? IconRobot
                  : item.kind === "human"
                    ? IconUser
                    : IconUsersGroup;
              return (
                <article
                  className="solution-card"
                  key={`${item.source}-${item.id}`}
                >
                  <div className="solution-top">
                    <span className={`type-pill type-${item.kind}`}>
                      <Icon size={13} />
                      {labels[item.kind]}
                    </span>
                    <span>
                      <IconStarFilled size={13} />
                      {item.rating}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="solution-offer">
                    <div>
                      <small>
                        {item.source === "service"
                          ? "Giá trọn gói"
                          : "Bắt đầu từ"}
                      </small>
                      <strong>
                        ${Number(item.price_amount).toLocaleString("en-US")}/
                        {item.price_unit}
                      </strong>
                    </div>
                    {item.delivery_days && (
                      <span>{item.delivery_days} ngày</span>
                    )}
                  </div>
                  <Link
                    href={
                      item.source === "profile"
                        ? `/profile?id=${item.id}`
                        : `/service?slug=${item.slug}`
                    }
                  >
                    Xem phương án <IconArrowRight size={15} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
