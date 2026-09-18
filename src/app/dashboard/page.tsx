"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  IconBell,
  IconBriefcase,
  IconCheck,
  IconChevronRight,
  IconContract,
  IconCreditCard,
  IconDashboard,
  IconLogout,
  IconMessage,
  IconPlus,
  IconSend,
  IconSettings,
  IconSparkles,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { api, clearSession, getToken, SessionUser } from "@/lib/session";

type Order = {
  id: string;
  title: string;
  brief: string;
  amount: string;
  status: string;
  client_name?: string;
  provider_name?: string;
  created_at: string;
};
type Offer = {
  id: string;
  order_id: string;
  provider_name: string;
  amount: string;
  delivery_days: number;
  note: string;
  status: string;
};
type Contract = {
  id: string;
  order_id: string;
  status: string;
  amount: string;
};
type Milestone = {
  id: string;
  contract_id: string;
  title: string;
  amount: string;
  status: string;
};
type Message = {
  id: string;
  order_id: string;
  sender_name: string;
  sender_id: string;
  body: string;
  created_at: string;
};
type Service = {
  id: string;
  title: string;
  price_amount: string;
  delivery_days: number;
  is_active: boolean;
};
type Note = { id: string; title: string; body: string; is_read: boolean };
type Workspace = {
  user: SessionUser;
  provider?: { onboarding_complete: boolean };
  services: Service[];
  orders: Order[];
  offers: Offer[];
  contracts: Contract[];
  milestones: Milestone[];
  messages: Message[];
  notifications: Note[];
  transactions: { id: string; type: string; amount: string }[];
  reviews: { order_id: string }[];
};
const statusLabel: Record<string, string> = {
  requested: "Chờ offer",
  offered: "Đã có offer",
  active: "Đang thực hiện",
  review: "Chờ nghiệm thu",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  pending: "Chờ xử lý",
  funded: "Đã nạp escrow",
  submitted: "Đã bàn giao",
  approved: "Đã duyệt",
  released: "Đã giải ngân",
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Workspace | null>(null);
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [composer, setComposer] = useState<"service" | "order" | null>(null);
  const load = useCallback(async () => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    try {
      const result = await api<{ data: Workspace }>("/api/workspace");
      setData(result.data);
      setSelected((value) => value || result.data.orders[0]?.id || "");
      if (
        result.data.user.role === "provider" &&
        !result.data.provider?.onboarding_complete
      )
        router.replace("/onboarding");
    } catch {
      clearSession();
      router.replace("/login");
    }
  }, [router]);
  useEffect(() => {
    const start = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(start);
  }, [load]);
  async function act(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      await api("/api/workspace", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể thực hiện");
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return <div className="dashboard-loading">Đang mở workspace...</div>;
  const provider = data.user.role === "provider";
  const activeOrder = data.orders.find((o) => o.id === selected);
  const unread = data.notifications.filter((n) => !n.is_read).length;
  const funded = data.transactions
    .filter((t) => t.type === "fund")
    .reduce((s, t) => s + Number(t.amount), 0);
  const released = data.transactions
    .filter((t) => t.type === "release")
    .reduce((s, t) => s + Number(t.amount), 0);
  const nav = [
    { id: "overview", label: "Tổng quan", icon: IconDashboard },
    {
      id: "orders",
      label: provider ? "Đơn & yêu cầu" : "Đơn hàng",
      icon: IconBriefcase,
    },
    { id: "contracts", label: "Hợp đồng", icon: IconContract },
    { id: "messages", label: "Tin nhắn", icon: IconMessage },
    { id: "payments", label: "Escrow", icon: IconCreditCard },
    {
      id: "notifications",
      label: `Thông báo${unread ? ` (${unread})` : ""}`,
      icon: IconBell,
    },
  ];
  if (provider)
    nav.splice(2, 0, {
      id: "services",
      label: "Dịch vụ của tôi",
      icon: IconSparkles,
    });
  return (
    <main className="workspace">
      <aside className="workspace-side">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <span />
          </span>
          jobflat
        </Link>
        <div className="workspace-user">
          <div>{data.user.full_name.slice(0, 1)}</div>
          <span>
            <strong>{data.user.full_name}</strong>
            <small>{provider ? "Provider" : "Client"}</small>
          </span>
        </div>
        <nav>
          {nav.map((item) => {
            const NavIcon = item.icon;
            return (
              <button
                className={tab === item.id ? "active" : ""}
                onClick={() => setTab(item.id)}
                key={item.id}
              >
                <NavIcon />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button
          className="logout"
          onClick={() => {
            clearSession();
            router.replace("/login");
          }}
        >
          <IconLogout /> Đăng xuất
        </button>
      </aside>
      <section className="workspace-main">
        <header>
          <div>
            <span className="kicker">
              {provider ? "PROVIDER WORKSPACE" : "CLIENT WORKSPACE"}
            </span>
            <h1>{nav.find((n) => n.id === tab)?.label}</h1>
          </div>
          <button
            className="btn btn-dark"
            onClick={() => setComposer(provider ? "service" : "order")}
          >
            <IconPlus /> {provider ? "Đăng dịch vụ" : "Tạo yêu cầu"}
          </button>
        </header>
        {error && <p className="workspace-error">{error}</p>}
        {tab === "overview" && (
          <Overview
            data={data}
            provider={provider}
            funded={funded}
            released={released}
            setTab={setTab}
          />
        )}{" "}
        {tab === "orders" && (
          <Orders
            data={data}
            provider={provider}
            busy={busy}
            act={act}
            select={(id) => {
              setSelected(id);
              setTab("messages");
            }}
          />
        )}{" "}
        {tab === "services" && <Services services={data.services} />}{" "}
        {tab === "contracts" && (
          <Contracts data={data} provider={provider} busy={busy} act={act} />
        )}{" "}
        {tab === "messages" && (
          <Messages
            data={data}
            selected={selected}
            setSelected={setSelected}
            activeOrder={activeOrder}
            act={act}
          />
        )}{" "}
        {tab === "payments" && (
          <Payments data={data} funded={funded} released={released} />
        )}{" "}
        {tab === "notifications" && (
          <Notifications notes={data.notifications} act={act} />
        )}
      </section>
      {composer && (
        <Composer
          type={composer}
          close={() => setComposer(null)}
          act={async (payload) => {
            await act(payload);
            setComposer(null);
          }}
          busy={busy}
        />
      )}
    </main>
  );
}

function Overview({
  data,
  provider,
  funded,
  released,
  setTab,
}: {
  data: Workspace;
  provider: boolean;
  funded: number;
  released: number;
  setTab: (x: string) => void;
}) {
  const active = data.orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status),
  ).length;
  return (
    <>
      <div className="metric-grid">
        <Metric
          label="Đơn đang mở"
          value={active}
          hint={`${data.orders.length} đơn tất cả`}
        />
        <Metric
          label={provider ? "Chờ giải ngân" : "Đang giữ escrow"}
          value={`$${(funded - released).toLocaleString()}`}
          hint="Bảo vệ theo milestone"
        />
        <Metric
          label="Tin nhắn"
          value={data.messages.length}
          hint="Trong các giao dịch"
        />
        <Metric
          label="Đã hoàn thành"
          value={data.orders.filter((o) => o.status === "completed").length}
          hint="Sẵn sàng đánh giá"
        />
      </div>
      <div className="workspace-panel">
        <div className="panel-head">
          <div>
            <span className="kicker">RECENT ACTIVITY</span>
            <h2>Giao dịch gần đây</h2>
          </div>
          <button onClick={() => setTab("orders")}>
            Xem tất cả <IconChevronRight />
          </button>
        </div>
        <OrderTable orders={data.orders.slice(0, 5)} />
      </div>
    </>
  );
}
function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}
function OrderTable({ orders }: { orders: Order[] }) {
  return orders.length ? (
    <div className="order-table">
      {orders.map((o) => (
        <div key={o.id}>
          <span>
            <strong>{o.title}</strong>
            <small>
              {o.provider_name || o.client_name || "Đang tìm provider"}
            </small>
          </span>
          <b>${Number(o.amount).toLocaleString()}</b>
          <em className={`status status-${o.status}`}>
            {statusLabel[o.status] || o.status}
          </em>
        </div>
      ))}
    </div>
  ) : (
    <Empty text="Chưa có giao dịch nào." />
  );
}
function Orders({
  data,
  provider,
  busy,
  act,
  select,
}: {
  data: Workspace;
  provider: boolean;
  busy: boolean;
  act: (p: Record<string, unknown>) => void;
  select: (id: string) => void;
}) {
  return (
    <div className="workspace-grid">
      {data.orders.map((order) => (
        <article className="workspace-card" key={order.id}>
          <div className="card-line">
            <span className={`status status-${order.status}`}>
              {statusLabel[order.status]}
            </span>
            <small>
              {new Date(order.created_at).toLocaleDateString("vi-VN")}
            </small>
          </div>
          <h2>{order.title}</h2>
          <p>{order.brief}</p>
          <div className="order-bottom">
            <strong>${Number(order.amount).toLocaleString()}</strong>
            <button onClick={() => select(order.id)}>
              <IconMessage /> Trao đổi
            </button>
          </div>
          {provider && ["requested", "offered"].includes(order.status) && (
            <OfferForm orderId={order.id} busy={busy} act={act} />
          )}{" "}
          {!provider &&
            data.offers
              .filter((f) => f.order_id === order.id)
              .map((offer) => (
                <div className="offer" key={offer.id}>
                  <span>
                    <strong>{offer.provider_name}</strong>
                    <small>
                      {offer.delivery_days} ngày · $
                      {Number(offer.amount).toLocaleString()}
                    </small>
                  </span>
                  <p>{offer.note}</p>
                  {offer.status === "pending" && (
                    <button
                      disabled={busy}
                      onClick={() =>
                        act({ action: "accept_offer", offerId: offer.id })
                      }
                    >
                      <IconCheck /> Chấp nhận offer
                    </button>
                  )}
                </div>
              ))}
        </article>
      ))}
    </div>
  );
}
function OfferForm({
  orderId,
  busy,
  act,
}: {
  orderId: string;
  busy: boolean;
  act: (p: Record<string, unknown>) => void;
}) {
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    act({
      action: "send_offer",
      orderId,
      amount: f.get("amount"),
      deliveryDays: f.get("days"),
      note: f.get("note"),
    });
  }
  return (
    <form className="inline-form" onSubmit={submit}>
      <b>Gửi offer</b>
      <div>
        <input
          required
          name="amount"
          type="number"
          min="1"
          placeholder="Giá USD"
        />
        <input
          required
          name="days"
          type="number"
          min="1"
          placeholder="Số ngày"
        />
      </div>
      <textarea
        required
        minLength={10}
        name="note"
        placeholder="Phạm vi công việc và điều khoản..."
      />
      <button disabled={busy}>
        Gửi offer <IconSend />
      </button>
    </form>
  );
}
function Services({ services }: { services: Service[] }) {
  return services.length ? (
    <div className="workspace-grid">
      {services.map((s) => (
        <article className="workspace-card" key={s.id}>
          <span className="status status-active">
            {s.is_active ? "Đang bán" : "Tạm ẩn"}
          </span>
          <h2>{s.title}</h2>
          <div className="order-bottom">
            <strong>${Number(s.price_amount).toLocaleString()}</strong>
            <small>{s.delivery_days} ngày</small>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <Empty text="Bạn chưa đăng dịch vụ nào." />
  );
}
function Contracts({
  data,
  provider,
  busy,
  act,
}: {
  data: Workspace;
  provider: boolean;
  busy: boolean;
  act: (p: Record<string, unknown>) => void;
}) {
  return data.contracts.length ? (
    <div className="workspace-grid">
      {data.contracts.map((c) => (
        <article className="workspace-card" key={c.id}>
          <div className="card-line">
            <span className="status status-active">
              {statusLabel[c.status] || c.status}
            </span>
            <strong>${Number(c.amount).toLocaleString()}</strong>
          </div>
          <h2>{data.orders.find((o) => o.id === c.order_id)?.title}</h2>
          {data.milestones
            .filter((m) => m.contract_id === c.id)
            .map((m) => (
              <div className="milestone" key={m.id}>
                <span>
                  <b>{m.title}</b>
                  <small>
                    ${Number(m.amount).toLocaleString()} ·{" "}
                    {statusLabel[m.status] || m.status}
                  </small>
                </span>
                <MilestoneAction
                  item={m}
                  provider={provider}
                  busy={busy}
                  act={act}
                />
              </div>
            ))}
          {!provider &&
            data.orders.find((o) => o.id === c.order_id)?.status ===
              "completed" &&
            !data.reviews.some((r) => r.order_id === c.order_id) && (
              <ReviewForm orderId={c.order_id} busy={busy} act={act} />
            )}
          {data.reviews.some((r) => r.order_id === c.order_id) && (
            <p className="review-complete">
              <IconStar /> Giao dịch đã được đánh giá
            </p>
          )}
        </article>
      ))}
    </div>
  ) : (
    <Empty text="Hợp đồng được tạo khi client chấp nhận offer." />
  );
}
function ReviewForm({
  orderId,
  busy,
  act,
}: {
  orderId: string;
  busy: boolean;
  act: (p: Record<string, unknown>) => void;
}) {
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    act({
      action: "review",
      orderId,
      rating: form.get("rating"),
      comment: form.get("comment"),
    });
  }
  return (
    <form className="inline-form review-form" onSubmit={submit}>
      <b>Đánh giá sau giao dịch</b>
      <div>
        <select name="rating" aria-label="Số sao" defaultValue="5">
          <option value="5">5 sao — Xuất sắc</option>
          <option value="4">4 sao — Tốt</option>
          <option value="3">3 sao — Ổn</option>
          <option value="2">2 sao — Cần cải thiện</option>
          <option value="1">1 sao — Không hài lòng</option>
        </select>
      </div>
      <textarea
        required
        minLength={5}
        name="comment"
        placeholder="Chia sẻ trải nghiệm làm việc..."
      />
      <button disabled={busy}>
        Gửi đánh giá <IconStar />
      </button>
    </form>
  );
}
function MilestoneAction({
  item,
  provider,
  busy,
  act,
}: {
  item: Milestone;
  provider: boolean;
  busy: boolean;
  act: (p: Record<string, unknown>) => void;
}) {
  let next = "";
  let label = "";
  if (!provider && item.status === "pending") {
    next = "funded";
    label = "Nạp escrow";
  }
  if (provider && item.status === "funded") {
    next = "submitted";
    label = "Gửi bàn giao";
  }
  if (!provider && item.status === "submitted") {
    next = "approved";
    label = "Duyệt kết quả";
  }
  if (!provider && item.status === "approved") {
    next = "released";
    label = "Giải ngân";
  }
  return next ? (
    <button
      disabled={busy}
      onClick={() =>
        act({ action: "milestone", milestoneId: item.id, status: next })
      }
    >
      {label}
      <IconChevronRight />
    </button>
  ) : null;
}
function Messages({
  data,
  selected,
  setSelected,
  activeOrder,
  act,
}: {
  data: Workspace;
  selected: string;
  setSelected: (s: string) => void;
  activeOrder?: Order;
  act: (p: Record<string, unknown>) => void;
}) {
  const messages = data.messages.filter((m) => m.order_id === selected);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    act({ action: "message", orderId: selected, body: f.get("body") });
    form.reset();
  }
  return (
    <div className="chat-shell">
      <aside>
        {data.orders.map((o) => (
          <button
            className={o.id === selected ? "active" : ""}
            onClick={() => setSelected(o.id)}
            key={o.id}
          >
            <strong>{o.title}</strong>
            <small>{statusLabel[o.status]}</small>
          </button>
        ))}
      </aside>
      <section>
        <header>
          <h2>{activeOrder?.title || "Chọn một giao dịch"}</h2>
        </header>
        <div className="chat-list">
          {messages.map((m) => (
            <div
              className={m.sender_id === data.user.id ? "mine" : ""}
              key={m.id}
            >
              <b>{m.sender_name}</b>
              <p>{m.body}</p>
              <small>{new Date(m.created_at).toLocaleString("vi-VN")}</small>
            </div>
          ))}
        </div>
        {selected && (
          <form onSubmit={submit}>
            <input name="body" required placeholder="Nhập tin nhắn..." />
            <button>
              <IconSend />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
function Payments({
  data,
  funded,
  released,
}: {
  data: Workspace;
  funded: number;
  released: number;
}) {
  return (
    <>
      <div className="metric-grid">
        <Metric
          label="Đã nạp"
          value={`$${funded.toLocaleString()}`}
          hint="Escrow ledger"
        />
        <Metric
          label="Đã giải ngân"
          value={`$${released.toLocaleString()}`}
          hint="Milestone hoàn thành"
        />
        <Metric
          label="Đang giữ"
          value={`$${(funded - released).toLocaleString()}`}
          hint="Chờ nghiệm thu"
        />
      </div>
      <div className="workspace-panel">
        <h2>Lịch sử escrow</h2>
        {data.transactions.length ? (
          data.transactions.map((t) => (
            <div className="ledger" key={t.id}>
              <IconCreditCard />
              <span>
                <strong>
                  {t.type === "fund" ? "Nạp vào escrow" : "Giải ngân provider"}
                </strong>
                <small>Giao dịch nội bộ Jobflat</small>
              </span>
              <b>
                {t.type === "fund" ? "+" : "-"}$
                {Number(t.amount).toLocaleString()}
              </b>
            </div>
          ))
        ) : (
          <Empty text="Chưa có giao dịch escrow." />
        )}
      </div>
    </>
  );
}
function Notifications({
  notes,
  act,
}: {
  notes: Note[];
  act: (p: Record<string, unknown>) => void;
}) {
  return (
    <div className="workspace-panel">
      <div className="panel-head">
        <h2>Thông báo</h2>
        <button onClick={() => act({ action: "read_notifications" })}>
          Đánh dấu đã đọc
        </button>
      </div>
      {notes.length ? (
        notes.map((n) => (
          <div
            className={`notification ${n.is_read ? "" : "unread"}`}
            key={n.id}
          >
            <IconBell />
            <span>
              <strong>{n.title}</strong>
              <p>{n.body}</p>
            </span>
          </div>
        ))
      ) : (
        <Empty text="Bạn chưa có thông báo." />
      )}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="workspace-empty">
      <IconSettings />
      <p>{text}</p>
    </div>
  );
}
function Composer({
  type,
  close,
  act,
  busy,
}: {
  type: "service" | "order";
  close: () => void;
  act: (p: Record<string, unknown>) => void;
  busy: boolean;
}) {
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    act(
      type === "service"
        ? {
            action: "create_service",
            title: f.get("title"),
            description: f.get("description"),
            category: f.get("category"),
            deliveryMode: f.get("mode"),
            price: f.get("price"),
            deliveryDays: f.get("days"),
          }
        : {
            action: "create_order",
            title: f.get("title"),
            brief: f.get("description"),
            amount: f.get("price"),
          },
    );
  }
  return (
    <div className="composer-backdrop">
      <form className="composer" onSubmit={submit}>
        <button type="button" className="composer-close" onClick={close}>
          <IconX />
        </button>
        <span className="kicker">
          {type === "service" ? "NEW SERVICE" : "NEW REQUEST"}
        </span>
        <h2>{type === "service" ? "Đăng dịch vụ" : "Tạo yêu cầu mới"}</h2>
        <label>
          Tiêu đề
          <input required minLength={5} name="title" />
        </label>
        <label>
          {type === "service" ? "Mô tả dịch vụ" : "Brief công việc"}
          <textarea required minLength={15} rows={5} name="description" />
        </label>
        {type === "service" && (
          <>
            <label>
              Danh mục
              <input
                required
                name="category"
                placeholder="Design, Automation & AI..."
              />
            </label>
            <label>
              Hình thức
              <select name="mode">
                <option value="human">Chuyên gia</option>
                <option value="agent">AI Agent</option>
                <option value="hybrid">Human + AI</option>
              </select>
            </label>
          </>
        )}
        <div className="form-row">
          <label>
            Ngân sách / Giá USD
            <input required min="0" type="number" name="price" />
          </label>
          {type === "service" && (
            <label>
              Ngày bàn giao
              <input required min="1" type="number" name="days" />
            </label>
          )}
        </div>
        <button className="btn btn-dark" disabled={busy}>
          {busy ? "Đang lưu..." : "Đăng ngay"}
        </button>
      </form>
    </div>
  );
}
