# Jobflat

Marketplace kết nối doanh nghiệp với chuyên gia, AI agent và hybrid team. Frontend được xây bằng Next.js, API chạy trên Cloudflare Pages Functions và dữ liệu lưu tại Neon Postgres.

Các bề mặt chính gồm marketplace công việc (`/jobs`), dịch vụ đóng gói (`/services`), AI Agents (`/agents`), hồ sơ nhà cung cấp (`/profile`) và Smart Match (`/request`). Tài khoản client/provider bắt đầu tại `/login`; provider hoàn thiện `/onboarding`, sau đó hai vai trò quản lý offer, hợp đồng, milestone, chat, escrow và đánh giá tại `/dashboard`.

## Local development

```bash
npm install
npm run dev
```

Để chạy cả Pages Functions, tạo `.dev.vars` từ `.env.example`, sau đó chạy:

```bash
npm run pages:dev
```

## Database

Chạy lần lượt các migration trong thư mục `db/` trên Neon SQL Editor. Không commit chuỗi kết nối thật vào repository.

## Deploy

Cloudflare Pages build output là `out`. Biến môi trường bắt buộc: `DATABASE_URL` và `AUTH_SECRET`.

```bash
npm run deploy
```

## Public API

Tài liệu tương tác: [jobflat.pages.dev/developers](https://jobflat.pages.dev/developers/)

| Method   | Endpoint         | Mô tả                                                      |
| -------- | ---------------- | ---------------------------------------------------------- |
| GET      | `/api/listings`  | Tìm kiếm hoặc lấy chi tiết profile                         |
| GET      | `/api/jobs`      | Danh sách hoặc chi tiết công việc                          |
| POST     | `/api/jobs`      | Đăng công việc mới                                         |
| POST     | `/api/requests`  | Gửi yêu cầu thuê hoặc ứng tuyển                            |
| GET      | `/api/services`  | Tìm kiếm dịch vụ đóng gói                                  |
| POST     | `/api/intents`   | Smart Match nhu cầu với giải pháp                          |
| GET/POST | `/api/auth`      | Đăng ký, đăng nhập, đọc phiên đăng nhập                    |
| GET/POST | `/api/workspace` | Dữ liệu dashboard và các thao tác giao dịch (Bearer token) |

Máy khách có thể đọc đặc tả OpenAPI tại `/openapi.json`.

Escrow hiện là sổ cái và state machine nội bộ để kiểm thử toàn bộ quy trình. Trước khi xử lý tiền thật cần tích hợp payment provider, webhook ký số và quy trình hoàn tiền/tranh chấp.
