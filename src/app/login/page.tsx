"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBriefcase,
  IconCheck,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react";
import { saveSession, SessionUser } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [role, setRole] = useState<"client" | "provider">("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          email: data.get("email"),
          password: data.get("password"),
          fullName: data.get("fullName"),
          role,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      saveSession(result.data.token, result.data.user as SessionUser);
      router.push(
        result.data.user.role === "provider" ? "/onboarding" : "/dashboard",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tiếp tục");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="auth-page">
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
      <div className="container auth-layout">
        <section className="auth-copy">
          <span className="kicker">JOBFLAT WORKSPACE</span>
          <h1>Mọi giao dịch, trong một nơi.</h1>
          <p>
            Quản lý yêu cầu, offer, hợp đồng, milestone và trao đổi giữa client
            với provider.
          </p>
          <div>
            <span>
              <IconCheck /> Escrow theo milestone
            </span>
            <span>
              <IconCheck /> Chat gắn với từng đơn
            </span>
            <span>
              <IconCheck /> Lịch sử giao dịch minh bạch
            </span>
          </div>
        </section>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-switch">
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Tạo tài khoản
            </button>
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Đăng nhập
            </button>
          </div>
          <h2>
            {mode === "signup" ? "Bắt đầu với Jobflat" : "Chào mừng trở lại"}
          </h2>
          {mode === "signup" && (
            <>
              <div className="role-picker">
                <button
                  type="button"
                  className={role === "client" ? "active" : ""}
                  onClick={() => setRole("client")}
                >
                  <IconUser /> Tôi cần thuê
                </button>
                <button
                  type="button"
                  className={role === "provider" ? "active" : ""}
                  onClick={() => setRole("provider")}
                >
                  <IconBriefcase /> Tôi cung cấp dịch vụ
                </button>
              </div>
              <label>
                Họ tên
                <input
                  name="fullName"
                  required
                  minLength={2}
                  placeholder="Nguyễn Minh Anh"
                />
              </label>
            </>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="you@company.com"
            />
          </label>
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Tối thiểu 8 ký tự"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-dark" disabled={loading}>
            {loading ? (
              "Đang xử lý..."
            ) : (
              <>
                {mode === "signup" ? "Tạo tài khoản" : "Đăng nhập"}
                <IconArrowRight size={17} />
              </>
            )}
          </button>
          <small>
            <IconSparkles size={13} /> Dữ liệu tài khoản được bảo vệ và không
            công khai.
          </small>
        </form>
      </div>
    </main>
  );
}
