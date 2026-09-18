# Jobflat

Marketplace kết nối doanh nghiệp với chuyên gia, AI agent và hybrid team. Frontend được xây bằng Next.js, API chạy trên Cloudflare Pages Functions và dữ liệu lưu tại Neon Postgres.

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

Cloudflare Pages build output là `out`. Biến môi trường bắt buộc: `DATABASE_URL`.

```bash
npm run deploy
```

## Public API

Tài liệu tương tác: [jobflat.pages.dev/developers](https://jobflat.pages.dev/developers/)

| Method | Endpoint        | Mô tả                              |
| ------ | --------------- | ---------------------------------- |
| GET    | `/api/listings` | Tìm kiếm hoặc lấy chi tiết profile |
| GET    | `/api/jobs`     | Danh sách hoặc chi tiết công việc  |
| POST   | `/api/jobs`     | Đăng công việc mới                 |
| POST   | `/api/requests` | Gửi yêu cầu thuê hoặc ứng tuyển    |
| GET    | `/api/services` | Tìm kiếm dịch vụ đóng gói          |
| POST   | `/api/intents`  | Smart Match nhu cầu với giải pháp  |

Máy khách có thể đọc đặc tả OpenAPI tại `/openapi.json`.
