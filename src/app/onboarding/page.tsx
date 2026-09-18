"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { IconArrowRight, IconCheck, IconPlus } from "@tabler/icons-react";
import { api, getToken } from "@/lib/session";
export default function OnboardingPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [skill, setSkill] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await api("/api/workspace", {
        method: "POST",
        body: JSON.stringify({
          action: "onboard_provider",
          displayName: f.get("displayName"),
          headline: f.get("headline"),
          bio: f.get("bio"),
          skills,
        }),
      });
      router.push("/dashboard");
    } catch (x) {
      setError(x instanceof Error ? x.message : "Không thể lưu");
    }
  }
  return (
    <main className="onboarding-page">
      <header className="sub-nav">
        <div className="container sub-nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <span />
            </span>
            jobflat
          </Link>
          <span>Bước 1 / 1</span>
        </div>
      </header>
      <div className="container onboarding-layout">
        <aside>
          <span className="kicker">PROVIDER ONBOARDING</span>
          <h1>Biến chuyên môn thành dịch vụ.</h1>
          <p>
            Hồ sơ rõ ràng giúp khách hàng hiểu bạn làm gì và tin tưởng gửi yêu
            cầu.
          </p>
          <div>
            <span>
              <IconCheck /> Đăng dịch vụ đóng gói
            </span>
            <span>
              <IconCheck /> Nhận brief và gửi offer
            </span>
            <span>
              <IconCheck /> Được bảo vệ theo milestone
            </span>
          </div>
        </aside>
        <form className="onboarding-card" onSubmit={submit}>
          <h2>Hồ sơ provider</h2>
          <label>
            Tên hiển thị
            <input required name="displayName" placeholder="Minh Anh Studio" />
          </label>
          <label>
            Headline
            <input
              required
              minLength={5}
              name="headline"
              placeholder="Product Designer cho SaaS B2B"
            />
          </label>
          <label>
            Giới thiệu
            <textarea
              required
              minLength={20}
              name="bio"
              rows={5}
              placeholder="Kinh nghiệm, thế mạnh và cách bạn làm việc..."
            />
          </label>
          <label>
            Kỹ năng
            <div className="skill-input">
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Figma, Automation..."
              />
              <button
                type="button"
                onClick={() => {
                  if (skill.trim() && !skills.includes(skill.trim()))
                    setSkills([...skills, skill.trim()]);
                  setSkill("");
                }}
              >
                <IconPlus />
              </button>
            </div>
          </label>
          <div className="skill-grid">
            {skills.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setSkills(skills.filter((x) => x !== item))}
              >
                {item} ×
              </button>
            ))}
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-dark">
            Hoàn tất & vào dashboard <IconArrowRight />
          </button>
        </form>
      </div>
    </main>
  );
}
