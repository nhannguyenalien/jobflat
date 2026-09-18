"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  IconArrowLeft,
  IconBook2,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconServer,
} from "@tabler/icons-react";

const origin = "https://jobflat.pages.dev";
const examples = {
  listings: `curl "${origin}/api/listings?q=automation&type=human"\ncurl "${origin}/api/listings?slug=hoang-nguyen"`,
  listingResponse: `{\n  "data": {\n    "id": "9360...",\n    "kind": "human",\n    "slug": "hoang-nguyen",\n    "name": "Hoàng Nguyễn",\n    "headline": "AI Automation Developer",\n    "skills": ["n8n", "OpenAI", "Cloudflare"],\n    "rating": "4.9",\n    "completed_count": 83,\n    "price_amount": "25.00",\n    "price_unit": "hour",\n    "is_verified": true\n  }\n}`,
  jobs: `curl "${origin}/api/jobs"\ncurl "${origin}/api/jobs?id=JOB_UUID"`,
  createJob: `curl -X POST "${origin}/api/jobs" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "title": "Xây trợ lý AI cho sales team",\n    "description": "Cần agent phân loại lead và cập nhật CRM tự động.",\n    "category": "Automation & AI",\n    "budgetMin": 500,\n    "budgetMax": 900,\n    "budgetUnit": "project",\n    "location": "Remote"\n  }'`,
  createRequest: `curl -X POST "${origin}/api/requests" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "targetType": "profile",\n    "targetId": "PROFILE_UUID",\n    "name": "Nguyễn Minh",\n    "email": "minh@company.vn",\n    "message": "Tôi muốn trao đổi về agent CSKH cho doanh nghiệp."\n  }'`,
  requestResponse: `{\n  "data": {\n    "id": "a6bba413-...",\n    "status": "new",\n    "created_at": "2026-09-18T11:47:30.586Z"\n  }\n}`,
  error: `{\n  "error": "Invalid request data",\n  "details": {\n    "fieldErrors": {\n      "email": ["Invalid email address"]\n    }\n  }\n}`,
};

function CodeBlock({
  code,
  language = "json",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="code-block">
      <div className="code-head">
        <span>{language}</span>
        <button type="button" onClick={copy}>
          {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}{" "}
          {copied ? "Đã sao chép" : "Sao chép"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
function Method({ post = false }: { post?: boolean }) {
  return (
    <span className={`api-method method-${post ? "post" : "get"}`}>
      {post ? "POST" : "GET"}
    </span>
  );
}
function Params({ rows }: { rows: [string, string, ReactNode][] }) {
  return (
    <div className="param-table">
      <div className="param-head">
        <span>Tham số</span>
        <span>Kiểu</span>
        <span>Mô tả</span>
      </div>
      {rows.map(([name, type, copy]) => (
        <div key={name}>
          <code>{name}</code>
          <span>{type}</span>
          <p>{copy}</p>
        </div>
      ))}
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <main className="docs-page">
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
      <section className="docs-hero">
        <div className="container">
          <span className="kicker">JOBFLAT API · PUBLIC BETA</span>
          <h1>
            Tích hợp marketplace
            <br />
            Human + AI vào sản phẩm của bạn.
          </h1>
          <p>
            REST API để đọc hồ sơ, đăng và truy vấn công việc, hoặc gửi yêu cầu
            hợp tác.
          </p>
          <div className="docs-hero-actions">
            <a className="btn btn-dark" href="#quickstart">
              <IconBook2 size={17} /> Bắt đầu nhanh
            </a>
            <a className="btn btn-outline" href="/openapi.json" target="_blank">
              OpenAPI JSON <IconExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>
      <div className="container docs-layout">
        <aside className="docs-nav">
          <strong>Nội dung</strong>
          <a href="#overview">Tổng quan</a>
          <a href="#quickstart">Bắt đầu nhanh</a>
          <a href="#listings">Listings</a>
          <a href="#jobs">Jobs</a>
          <a href="#requests">Requests</a>
          <a href="#errors">Lỗi & giới hạn</a>
          <a href="#models">Data models</a>
        </aside>
        <article className="docs-content">
          <section id="overview">
            <span className="docs-overline">TỔNG QUAN</span>
            <h2>API endpoint</h2>
            <p>
              API sử dụng JSON qua HTTPS. Public beta hiện chưa yêu cầu API key
              và chỉ cung cấp các thao tác marketplace công khai.
            </p>
            <div className="base-url">
              <IconServer size={18} />
              <div>
                <span>Base URL</span>
                <code>{origin}/api</code>
              </div>
            </div>
            <div className="docs-note">
              <strong>Lưu ý beta</strong>
              <p>
                Không gửi dữ liệu nhạy cảm trong công việc hoặc lời nhắn. Xác
                thực và rate limit theo API key sẽ được bổ sung trước bản
                stable.
              </p>
            </div>
          </section>
          <section id="quickstart">
            <span className="docs-overline">BẮT ĐẦU NHANH</span>
            <h2>Lấy danh sách AI Agent</h2>
            <p>
              Mọi response thành công đều bọc dữ liệu trong thuộc tính{" "}
              <code>data</code>.
            </p>
            <CodeBlock
              language="bash"
              code={`curl "${origin}/api/listings?type=agent"`}
            />
          </section>
          <section id="listings">
            <span className="docs-overline">LISTINGS</span>
            <h2>
              <Method /> /api/listings
            </h2>
            <p>
              Trả về tối đa 30 hồ sơ, sắp xếp theo rating và số lượt hoàn thành.
            </p>
            <Params
              rows={[
                ["q", "string", "Tìm trong tên và headline."],
                ["type", "enum", <>human, agent hoặc hybrid.</>],
                ["id", "uuid", "Lấy chính xác một hồ sơ theo ID."],
                ["slug", "string", "Lấy chính xác một hồ sơ theo slug."],
              ]}
            />
            <CodeBlock language="bash" code={examples.listings} />
            <h3>Response chi tiết</h3>
            <CodeBlock code={examples.listingResponse} />
          </section>
          <section id="jobs">
            <span className="docs-overline">JOBS</span>
            <h2>
              <Method /> /api/jobs
            </h2>
            <p>
              Không truyền tham số để lấy tối đa 50 công việc đang mở. Truyền{" "}
              <code>id</code> để lấy một công việc.
            </p>
            <CodeBlock language="bash" code={examples.jobs} />
            <div className="endpoint-divider" />
            <h2>
              <Method post /> /api/jobs
            </h2>
            <p>Đăng nhu cầu mới. Body phải là JSON.</p>
            <Params
              rows={[
                ["title", "string", "Bắt buộc, 8–160 ký tự."],
                ["description", "string", "Bắt buộc, 20–5.000 ký tự."],
                ["category", "string", "Bắt buộc, 2–80 ký tự."],
                ["budgetMin", "number", "Tùy chọn, không âm."],
                ["budgetMax", "number", "Tùy chọn, không âm."],
                ["budgetUnit", "enum", "project, hour hoặc month."],
                ["location", "string", "Mặc định Remote."],
              ]}
            />
            <CodeBlock language="bash" code={examples.createJob} />
            <p className="status-line">
              <span>201</span> Trả về công việc vừa tạo trong <code>data</code>.
            </p>
          </section>
          <section id="requests">
            <span className="docs-overline">REQUESTS</span>
            <h2>
              <Method post /> /api/requests
            </h2>
            <p>Gửi yêu cầu thuê profile hoặc ứng tuyển job.</p>
            <Params
              rows={[
                ["targetType", "enum", "profile hoặc job."],
                ["targetId", "uuid", "ID profile hoặc job."],
                ["name", "string", "Bắt buộc, 2–100 ký tự."],
                ["email", "email", "Email liên hệ hợp lệ."],
                ["message", "string", "Bắt buộc, 10–3.000 ký tự."],
              ]}
            />
            <CodeBlock language="bash" code={examples.createRequest} />
            <h3>Response</h3>
            <CodeBlock code={examples.requestResponse} />
          </section>
          <section id="errors">
            <span className="docs-overline">LỖI & GIỚI HẠN</span>
            <h2>HTTP status codes</h2>
            <div className="status-table">
              {[
                ["200", "Đọc dữ liệu thành công."],
                ["201", "Tạo resource thành công."],
                ["400", "Body hoặc tham số không hợp lệ."],
                ["404", "Không tìm thấy profile hoặc job."],
                ["503", "Kết nối dữ liệu chưa cấu hình."],
              ].map(([code, copy]) => (
                <div key={code}>
                  <code>{code}</code>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
            <CodeBlock code={examples.error} />
            <div className="docs-note">
              <strong>Rate limits</strong>
              <p>
                Public beta chưa công bố quota cố định. Nên cache dữ liệu đọc và
                retry lỗi mạng bằng exponential backoff.
              </p>
            </div>
          </section>
          <section id="models">
            <span className="docs-overline">DATA MODELS</span>
            <h2>Quy ước dữ liệu</h2>
            <ul className="model-list">
              <li>
                <strong>ID</strong>
                <span>UUID v4 dạng chuỗi.</span>
              </li>
              <li>
                <strong>Tiền tệ</strong>
                <span>
                  Giá là chuỗi thập phân; đơn vị tiền hiện tại là USD.
                </span>
              </li>
              <li>
                <strong>Thời gian</strong>
                <span>ISO 8601, UTC.</span>
              </li>
              <li>
                <strong>Nullable</strong>
                <span>Ngân sách và avatar có thể là null.</span>
              </li>
              <li>
                <strong>Enums</strong>
                <span>Chữ thường và phân biệt hoa thường.</span>
              </li>
            </ul>
            <p className="docs-ending">
              Cần hỗ trợ tích hợp?{" "}
              <a href="mailto:api@jobflat.dev">api@jobflat.dev</a>
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
