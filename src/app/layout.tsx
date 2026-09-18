import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobflat — People and AI, working together",
  description: "Thuê chuyên gia, AI agent và hybrid team để hoàn thành mọi công việc.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
