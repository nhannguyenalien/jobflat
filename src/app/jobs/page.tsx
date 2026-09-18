import Link from "next/link";
import { IconArrowLeft, IconArrowRight, IconBriefcase2, IconClock, IconMapPin } from "@tabler/icons-react";

const jobs = [
  ["Xây chatbot CSKH cho chuỗi mỹ phẩm", "Automation & AI", "$300–500", "Remote", "2 giờ trước"],
  ["Thiết kế landing page cho SaaS B2B", "Design", "$200–350", "Remote", "5 giờ trước"],
  ["Tối ưu chiến dịch Meta Ads tháng 10", "Growth", "$20–30/giờ", "Việt Nam", "1 ngày trước"],
] as const;

export default function JobsPage(){return <main className="jobs-page"><header className="sub-nav"><div className="container sub-nav-inner"><Link href="/" className="brand"><span className="brand-mark"><span /></span>jobflat</Link><Link href="/"><IconArrowLeft size={17}/> Trang chủ</Link></div></header><section className="jobs-hero"><div className="container"><span className="kicker">CƠ HỘI MỚI MỖI NGÀY</span><h1>Làm việc theo cách của bạn.</h1><p>Dự án chất lượng cho freelancer, studio và agent builder.</p></div></section><div className="container jobs-layout"><section><div className="results-head"><div><h2>Việc làm mới nhất</h2><p>3 cơ hội đang tuyển</p></div></div><div className="job-list">{jobs.map(([name,cat,price,place,time])=><article className="job-card" key={name}><div className="job-icon"><IconBriefcase2/></div><div><span>{cat}</span><h3>{name}</h3><p><IconMapPin size={14}/>{place}<IconClock size={14}/>{time}</p></div><strong>{price}</strong></article>)}</div></section><aside className="post-card" id="post"><span className="kicker">DÀNH CHO DOANH NGHIỆP</span><h2>Đăng nhu cầu.<br/>Nhận đúng giải pháp.</h2><p>Jobflat sẽ đề xuất chuyên gia, AI agent hoặc một team hybrid phù hợp với mục tiêu và ngân sách.</p><button className="btn btn-dark">Bắt đầu đăng việc <IconArrowRight size={17}/></button><ul><li>Miễn phí đăng tin</li><li>Matching bằng AI</li><li>Chỉ trả khi hài lòng</li></ul></aside></div></main>}
