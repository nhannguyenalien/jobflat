"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconRobot,
  IconShieldCheck,
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
const labels: Record<Mode, string> = {
  human: "Chuyên gia",
  agent: "AI Agent",
  hybrid: "Human + AI",
};
export default function ServicePage() {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const slug = new URLSearchParams(window.location.search).get("slug");
      if (!slug) {
        setError("Dịch vụ không hợp lệ.");
        setLoading(false);
        return;
      }
      try {
        const r = await fetch(`/api/services?slug=${encodeURIComponent(slug)}`);
        if (!r.ok) throw new Error();
        setService((await r.json()).data);
      } catch {
        setError("Không tìm thấy dịch vụ này.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  if (loading) return <State text="Đang tải dịch vụ..." />;
  if (error || !service)
    return <State text={error || "Không tìm thấy dịch vụ."} />;
  const Icon =
    service.delivery_mode === "agent"
      ? IconRobot
      : service.delivery_mode === "human"
        ? IconUser
        : IconUsersGroup;
  return (
    <main className="detail-page service-detail-page">
      <header className="sub-nav">
        <div className="container sub-nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <span />
            </span>
            jobflat
          </Link>
          <Link href="/services">
            <IconArrowLeft size={17} /> Tất cả dịch vụ
          </Link>
        </div>
      </header>
      <section
        className={`service-detail-hero service-${service.delivery_mode}`}
      >
        <div className="container">
          <span className="kicker">{service.category}</span>
          <div className="service-detail-title">
            <div className="detail-avatar">
              <Icon size={34} />
            </div>
            <div>
              <span className={`type-pill type-${service.delivery_mode}`}>
                {labels[service.delivery_mode]}
              </span>
              <h1>{service.title}</h1>
              <p>bởi {service.provider_name}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="container detail-layout">
        <section className="detail-content">
          <div className="detail-block">
            <h2>Kết quả bạn nhận được</h2>
            <p>{service.description}</p>
            <div className="deliverable-list">
              <p>
                <IconCheck /> Phạm vi và đầu ra được xác nhận trước khi bắt đầu
              </p>
              <p>
                <IconCheck /> Theo dõi tiến độ và trao đổi trực tiếp với
                provider
              </p>
              <p>
                <IconCheck /> Nghiệm thu kết quả trước khi hoàn tất
              </p>
            </div>
          </div>
          <div className="detail-block">
            <h2>Quy trình thực hiện</h2>
            <div className="service-steps">
              <div>
                <b>01</b>
                <span>
                  <strong>Gửi brief</strong>
                  <small>Mô tả mục tiêu và yêu cầu của bạn.</small>
                </span>
              </div>
              <div>
                <b>02</b>
                <span>
                  <strong>Xác nhận phạm vi</strong>
                  <small>Provider phản hồi trước khi thực hiện.</small>
                </span>
              </div>
              <div>
                <b>03</b>
                <span>
                  <strong>Nhận kết quả</strong>
                  <small>Kiểm tra, phản hồi và nghiệm thu.</small>
                </span>
              </div>
            </div>
          </div>
        </section>
        <aside className="detail-side service-order-card">
          <span className="order-label">GIÁ TRỌN GÓI</span>
          <div className="detail-price">
            <strong>
              ${Number(service.price_amount).toLocaleString("en-US")}
            </strong>
            <span>/{service.price_unit}</span>
          </div>
          <div className="order-facts">
            <p>
              <IconCalendar />{" "}
              {service.delivery_days
                ? `Bàn giao trong ${service.delivery_days} ngày`
                : "Bắt đầu ngay"}
            </p>
            <p>
              <IconStarFilled /> {service.rating} · {service.order_count} đơn đã
              đặt
            </p>
            <p>
              <IconShieldCheck /> Chưa thanh toán ở bước gửi yêu cầu
            </p>
          </div>
          <Link
            className="btn btn-dark"
            href={`/request?service=${service.slug}`}
          >
            Đặt dịch vụ <IconArrowRight size={17} />
          </Link>
          <small>Provider sẽ xác nhận phạm vi trước khi bắt đầu.</small>
        </aside>
      </div>
    </main>
  );
}
function State({ text }: { text: string }) {
  return (
    <main>
      <header className="sub-nav">
        <div className="container sub-nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <span />
            </span>
            jobflat
          </Link>
          <Link href="/services">
            <IconArrowLeft size={17} /> Tất cả dịch vụ
          </Link>
        </div>
      </header>
      <div className="container standalone-state">
        {text}
        <Link href="/services">Khám phá dịch vụ</Link>
      </div>
    </main>
  );
}
