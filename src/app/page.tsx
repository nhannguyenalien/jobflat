"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconArrowRight,
  IconBolt,
  IconBriefcase2,
  IconRobot,
  IconSearch,
  IconSparkles,
  IconStarFilled,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";

type MatchType = "all" | "human" | "agent" | "hybrid";

const matches = [
  {
    slug: "inboxpilot-ai",
    type: "agent" as const,
    name: "InboxPilot AI",
    role: "Customer Support Agent",
    description:
      "Trả lời khách hàng 24/7 trên website, Facebook, Zalo và Telegram.",
    tags: ["Support", "Zalo", "Facebook"],
    rating: "4.9",
    proof: "4.8K runs",
    price: "$19/tháng",
    initials: "IP",
    tone: "violet",
  },
  {
    slug: "hoang-nguyen",
    type: "human" as const,
    name: "Hoàng Nguyễn",
    role: "AI Automation Developer",
    description:
      "Thiết kế quy trình tự động hóa với n8n, OpenAI và Cloudflare.",
    tags: ["n8n", "OpenAI", "Cloudflare"],
    rating: "4.9",
    proof: "83 jobs",
    price: "$25/giờ",
    initials: "HN",
    tone: "blue",
  },
  {
    slug: "growth-studio",
    type: "hybrid" as const,
    name: "Growth Studio",
    role: "Human + AI Ads Team",
    description:
      "AI tối ưu hàng ngày, chuyên gia kiểm duyệt chiến lược mỗi tuần.",
    tags: ["Meta Ads", "Creative", "Analytics"],
    rating: "5.0",
    proof: "126 projects",
    price: "$199/tháng",
    initials: "GS",
    tone: "orange",
  },
];

const categories = [
  ["Build", "Web, mobile, AI & automation", IconBolt],
  ["Grow", "SEO, ads, social & leads", IconArrowRight],
  ["Create", "Design, video, voice & content", IconSparkles],
  ["Operate", "Support, data & research", IconBriefcase2],
] as const;

export default function Home() {
  const [type, setType] = useState<MatchType>("all");
  const [query, setQuery] = useState("");
  const visibleMatches = useMemo(
    () => matches.filter((item) => type === "all" || item.type === type),
    [type],
  );

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const target = query.trim()
      ? `/explore?q=${encodeURIComponent(query.trim())}`
      : "/explore";
    window.location.href = target;
  }

  return (
    <main>
      <header className="nav-shell">
        <nav className="container nav" aria-label="Điều hướng chính">
          <Link className="brand" href="/" aria-label="Jobflat trang chủ">
            <span className="brand-mark">
              <span />
            </span>
            jobflat
          </Link>
          <div className="nav-links">
            <Link href="/explore">Explore</Link>
            <Link href="/jobs">Jobs</Link>
            <Link href="/explore?type=human">People</Link>
            <Link href="/explore?type=agent">AI Agents</Link>
            <Link href="/developers">API Docs</Link>
          </div>
          <div className="nav-actions">
            <Link className="nav-business" href="/jobs">
              For business
            </Link>
            <button className="btn btn-ghost" type="button">
              Đăng nhập
            </button>
            <Link className="btn btn-dark" href="/jobs#post">
              Đăng việc
            </Link>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="container hero-inner">
          <div className="eyebrow">
            <IconSparkles size={15} /> Marketplace thế hệ mới
          </div>
          <h1>
            Work, done <span>differently.</span>
          </h1>
          <p className="hero-copy">
            Thuê chuyên gia và AI agent phù hợp nhất để biến ý tưởng thành kết
            quả — nhanh hơn, minh bạch hơn.
          </p>

          <form className="search-box" onSubmit={submitSearch}>
            <IconSearch size={23} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Mô tả công việc bạn cần"
              placeholder="Bạn muốn hoàn thành việc gì?"
            />
            <button type="submit" aria-label="Tìm kiếm">
              <IconArrowRight size={20} />
            </button>
          </form>

          <div className="suggestions" aria-label="Gợi ý tìm kiếm">
            <span>Phổ biến:</span>
            {[
              "Làm website",
              "Tự động hóa bán hàng",
              "Thiết kế thương hiệu",
              "Chạy quảng cáo",
            ].map((label) => (
              <button key={label} onClick={() => setQuery(label)} type="button">
                {label}
              </button>
            ))}
          </div>

          <div className="hero-proof">
            <div className="avatar-stack">
              <span>HN</span>
              <span>MA</span>
              <span>AI</span>
            </div>
            <div>
              <strong>12,000+</strong>
              <small>experts & agents sẵn sàng</small>
            </div>
            <i />
            <div className="stars">
              <IconStarFilled size={14} />
              <strong>4.9</strong>
              <small>từ 3,200 đánh giá</small>
            </div>
          </div>
        </div>
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="kicker">ĐƯỢC CHỌN CHO BẠN</span>
            <h2>Một nhu cầu. Nhiều cách giải quyết.</h2>
          </div>
          <Link href="/explore">
            Xem tất cả <IconArrowRight size={17} />
          </Link>
        </div>

        <div
          className="match-filter"
          role="group"
          aria-label="Chọn người thực hiện"
        >
          <span>Ai nên làm việc này?</span>
          {(
            [
              ["all", "Phù hợp nhất", IconSparkles],
              ["human", "Chuyên gia", IconUser],
              ["agent", "AI Agent", IconRobot],
              ["hybrid", "Human + AI", IconUsersGroup],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              className={type === value ? "active" : ""}
              onClick={() => setType(value)}
              key={value}
              type="button"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="cards-grid">
          {visibleMatches.map((item) => (
            <article className="talent-card" key={item.name}>
              <div className="card-top">
                <div className={`avatar avatar-${item.tone}`}>
                  {item.initials}
                </div>
                <span className={`type-pill type-${item.type}`}>
                  {item.type === "agent" ? (
                    <IconRobot size={13} />
                  ) : item.type === "human" ? (
                    <IconUser size={13} />
                  ) : (
                    <IconUsersGroup size={13} />
                  )}
                  {item.type === "agent"
                    ? "AI Agent"
                    : item.type === "human"
                      ? "Chuyên gia"
                      : "Hybrid team"}
                </span>
              </div>
              <h3>{item.name}</h3>
              <h4>{item.role}</h4>
              <p>{item.description}</p>
              <div className="tags">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="card-meta">
                <span>
                  <IconStarFilled size={14} /> {item.rating} · {item.proof}
                </span>
                <strong>{item.price}</strong>
              </div>
              <Link className="card-action" href={`/profile?slug=${item.slug}`}>
                {item.type === "agent"
                  ? "Dùng thử Agent"
                  : item.type === "human"
                    ? "Xem hồ sơ"
                    : "Khám phá team"}
                <IconArrowRight size={17} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="category-wrap">
        <div className="container section">
          <div className="section-head">
            <div>
              <span className="kicker">KHÁM PHÁ THEO MỤC TIÊU</span>
              <h2>Bắt đầu từ kết quả bạn muốn.</h2>
            </div>
          </div>
          <div className="category-grid">
            {categories.map(([name, copy, Icon], index) => (
              <Link
                href={`/explore?category=${name.toLowerCase()}`}
                className="category-card"
                key={name}
              >
                <div className={`category-icon cat-${index}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3>{name}</h3>
                  <p>{copy}</p>
                </div>
                <IconArrowRight className="category-arrow" size={18} />
              </Link>
            ))}
          </div>
          <div className="how-panel">
            <div>
              <span className="kicker kicker-light">JOBFLAT MATCH</span>
              <h2>
                Chỉ cần mô tả.
                <br />
                Chúng tôi lo phần còn lại.
              </h2>
            </div>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>Nói điều bạn cần</strong>
                  <p>
                    Viết bằng ngôn ngữ tự nhiên, không cần chọn danh mục phức
                    tạp.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Nhận phương án phù hợp</strong>
                  <p>
                    So sánh chuyên gia, AI agent và hybrid team trên cùng một
                    màn hình.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Bắt đầu với sự tự tin</strong>
                  <p>Giá rõ ràng, đánh giá thật và bảo vệ thanh toán.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="cta container">
        <div>
          <span className="kicker">DÀNH CHO CHUYÊN GIA & BUILDER</span>
          <h2>
            Kỹ năng của bạn.
            <br />
            Thị trường của bạn.
          </h2>
          <p>
            Tạo hồ sơ chuyên nghiệp hoặc đưa AI agent của bạn tới hàng nghìn
            khách hàng.
          </p>
        </div>
        <div className="cta-actions">
          <button className="btn btn-dark" type="button">
            Trở thành freelancer <IconArrowRight size={17} />
          </button>
          <button className="btn btn-outline" type="button">
            Đăng AI Agent <IconArrowRight size={17} />
          </button>
        </div>
      </section>

      <footer>
        <div className="container footer-inner">
          <Link className="brand brand-light" href="/">
            <span className="brand-mark">
              <span />
            </span>
            jobflat
          </Link>
          <p>People and AI, working better together.</p>
          <div>
            <Link href="/explore">Explore</Link>
            <Link href="/jobs">Jobs</Link>
            <Link href="/developers">API Docs</Link>
            <Link href="/">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
