"use client";

import { FormEvent, useState } from "react";
import { IconArrowRight, IconCircleCheck } from "@tabler/icons-react";

export default function RequestForm({ targetType, targetId, buttonLabel, defaultMessage }: {
  targetType: "profile" | "job"; targetId: string; buttonLabel: string; defaultMessage: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"" | "success" | "error">("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSubmitting(true); setStatus("");
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        targetType, targetId, name: values.get("name"), email: values.get("email"), message: values.get("message"),
      }) });
      if (!response.ok) throw new Error();
      setStatus("success"); form.reset();
    } catch { setStatus("error"); } finally { setSubmitting(false); }
  }
  return <form className="request-form" onSubmit={submit}>
    <label>Họ tên<input name="name" required minLength={2} placeholder="Tên của bạn" /></label>
    <label>Email công việc<input name="email" type="email" required placeholder="you@company.com" /></label>
    <label>Lời nhắn<textarea name="message" required minLength={10} rows={5} defaultValue={defaultMessage} /></label>
    <button className="btn btn-dark" disabled={submitting}>{submitting ? "Đang gửi..." : buttonLabel}<IconArrowRight size={17}/></button>
    {status === "success" && <p className="request-success" role="status"><IconCircleCheck size={18}/> Đã gửi thành công. Jobflat sẽ kết nối hai bên sớm nhất.</p>}
    {status === "error" && <p className="request-error" role="status">Không thể gửi lúc này. Vui lòng kiểm tra thông tin và thử lại.</p>}
  </form>;
}
