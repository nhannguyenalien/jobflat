"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconAdjustmentsHorizontal, IconArrowLeft, IconRobot, IconSearch, IconStarFilled, IconUser, IconUsersGroup } from "@tabler/icons-react";

const results = [
  ["agent", "InboxPilot AI", "Customer Support Agent", "Tự động trả lời khách hàng trên website, Facebook, Zalo và Telegram.", "$19/tháng", "4.9", "4.8K runs"],
  ["human", "Hoàng Nguyễn", "AI Automation Developer", "Xây hệ thống tự động hóa bằng n8n, OpenAI, Cloudflare và PostgreSQL.", "$25/giờ", "4.9", "83 jobs"],
  ["hybrid", "Growth Studio", "Human + AI Ads Team", "AI tối ưu chiến dịch liên tục, chuyên gia review chiến lược hàng tuần.", "$199/tháng", "5.0", "126 projects"],
  ["agent", "LeadMiner", "Sales Research Agent", "Tìm, làm giàu dữ liệu và chấm điểm khách hàng tiềm năng theo ICP.", "$0.10/run", "4.8", "12K runs"],
  ["human", "Mai Anh", "Brand & Product Designer", "Thiết kế nhận diện và sản phẩm số có hệ thống, rõ ràng và dễ dùng.", "$30/giờ", "5.0", "61 jobs"],
  ["agent", "ContentFlow", "Content Marketing Agent", "Nghiên cứu, lập lịch và viết nội dung đa kênh theo giọng thương hiệu.", "$29/tháng", "4.8", "7.2K runs"],
] as const;

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      setType(params.get("type") ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const filtered = type ? results.filter((item) => item[0] === type) : results;
  return (
    <main className="listing-page">
      <header className="sub-nav"><div className="container sub-nav-inner"><Link href="/" className="brand"><span className="brand-mark"><span /></span>jobflat</Link><Link href="/"><IconArrowLeft size={17}/> Trang chủ</Link></div></header>
      <section className="listing-hero"><div className="container"><span className="kicker">EXPLORE MARKETPLACE</span><h1>Tìm đúng cách để hoàn thành công việc.</h1><form className="listing-search"><IconSearch size={20}/><input name="q" defaultValue={query} placeholder="Tìm chuyên gia, AI agent hoặc dịch vụ..."/><button>Tìm kiếm</button></form></div></section>
      <div className="container listing-layout">
        <aside className="filters"><h3><IconAdjustmentsHorizontal size={17}/> Bộ lọc</h3><label>Người thực hiện</label>{["Phù hợp nhất", "Chuyên gia", "AI Agent", "Human + AI"].map((x,i)=><button className={i===0?"selected":""} key={x}>{x}<span>{[128,74,39,15][i]}</span></button>)}<label>Ngân sách</label><button>Mỗi giờ</button><button>Giá cố định</button><button>Subscription</button></aside>
        <section className="results"><div className="results-head"><div><h2>{query ? `Kết quả cho “${query}”` : "Đề xuất nổi bật"}</h2><p>{filtered.length} kết quả phù hợp</p></div><select aria-label="Sắp xếp"><option>Phù hợp nhất</option><option>Đánh giá cao</option><option>Giá thấp nhất</option></select></div>
          <div className="result-list">{filtered.map(([type,name,role,description,price,rating,proof])=><article className="result-card" key={name}><div className={`result-avatar avatar-${type}`}>{type==="agent"?<IconRobot/>:type==="human"?<IconUser/>:<IconUsersGroup/>}</div><div className="result-main"><div className="result-title"><div><span className={`result-type type-${type}`}>{type==="agent"?"AI Agent":type==="human"?"Chuyên gia":"Hybrid team"}</span><h3>{name}</h3><h4>{role}</h4></div><strong>{price}</strong></div><p>{description}</p><div className="result-bottom"><span><IconStarFilled size={14}/> {rating} · {proof}</span><button>Xem chi tiết</button></div></div></article>)}</div>
        </section>
      </div>
    </main>
  );
}
