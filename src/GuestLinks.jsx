import React, { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { content } from "./content.js";
import { INVITE_PARAM, overrideSuffix } from "./eventOverrides.js";

/**
 * Trang /tao-link — nhập tên khách (mỗi dòng một người) → link thiệp riêng cho từng người.
 * Link dạng ?khach=Tên (useGuestName giữ nguyên chữ, kể cả dấu và xưng hô), không cần đoán dấu như link /co-lan.
 */
const STORAGE_KEY = "guest-links:names";

export const GUEST_LINKS_PATH = "/tao-link";

export function isGuestLinksPage() {
  try {
    return window.location.pathname.replace(/\/+$/, "") === GUEST_LINKS_PATH;
  } catch {
    return false;
  }
}

function linkFor(base, name, extra = "") {
  return `${base}/?khach=${encodeURIComponent(name)}${extra}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /** Trình duyệt chặn clipboard (http, webview Zalo) → chép qua textarea ẩn */
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

function CopyButton({ text, label = "Sao chép", className = "" }) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        copied ? "bg-green-600 text-white" : "bg-[#9e3745] text-white hover:bg-[#7e2b37]"
      } ${className}`}
    >
      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      {copied ? "Đã chép" : label}
    </button>
  );
}

export default function GuestLinksPage() {
  const base = useMemo(() => window.location.origin, []);
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [withName, setWithName] = useState(true);
  /** Mỗi sự kiện editable một cặp giờ / ngày riêng → tham số gio, ngay (thứ hai: gio2, ngay2…) */
  const editableItems = content.events.items.filter((i) => i.editable);
  const [times, setTimes] = useState(() => editableItems.map(() => ({ gio: "", ngay: "" })));
  const setTime = (k, field) => (e) => setTimes((list) => list.map((t, i) => (i === k ? { ...t, [field]: e.target.value } : t)));
  /** Thiệp nhiều ngày: chọn khách được mời ngày nào → ?moi=N (sự kiện thứ N); "" = mọi ngày */
  const allItems = content.events.items;
  const [invite, setInvite] = useState("");
  const extra =
    (invite ? `&${INVITE_PARAM}=${invite}` : "") +
    times
      .map((t, k) => (t.gio ? `&gio${overrideSuffix(k)}=${t.gio}` : "") + (t.ngay ? `&ngay${overrideSuffix(k)}=${t.ngay}` : ""))
      .join("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch {
      /* bỏ qua: chế độ ẩn danh */
    }
  }, [text]);

  const names = useMemo(() => {
    const seen = new Set();
    return text
      .split("\n")
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
  }, [text]);

  const lines = names.map((n) => (withName ? `${n}: ${linkFor(base, n, extra)}` : linkFor(base, n, extra)));
  const title = document.title;

  return (
    <div className="min-h-screen bg-[#f8f6f2] px-4 py-8 font-sans text-[#1f1f1f]">
      <main className="mx-auto max-w-[640px]">
        <h1 className="text-2xl font-bold">Tạo link mời khách</h1>
        <p className="mt-1 text-sm text-black/60">
          Thiệp: <b>{title}</b>
        </p>

        {allItems.length > 1 && (
          <section className="mt-6 rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold">Mời dự</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {[["", "Tất cả các ngày"], ...allItems.map((item, i) => [String(i + 1), `${item.title} — ${item.date.replace(/\s/g, "")}`])].map(
                ([value, label]) => (
                  <label key={value} className="flex items-center gap-1.5 text-sm">
                    <input type="radio" name="invite" checked={invite === value} onChange={() => setInvite(value)} />
                    {label}
                  </label>
                ),
              )}
            </div>
            <p className="mt-2 text-xs text-black/50">Áp cho mọi link bên dưới — mời ngày khác thì tạo một lượt link riêng.</p>
          </section>
        )}

        {editableItems.map((item, k) => (
          <section key={item.id} className="mt-6 rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold">Thời gian "{item.title} — {item.date.replace(/\s/g, "")}" (để trống = giữ như trong thiệp)</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <label className="text-sm">
                Giờ
                <input
                  type="time"
                  value={times[k].gio}
                  onChange={setTime(k, "gio")}
                  className="ml-2 rounded-lg border border-black/20 px-2 py-1"
                />
              </label>
              <label className="text-sm">
                Ngày
                <input
                  type="date"
                  value={times[k].ngay}
                  onChange={setTime(k, "ngay")}
                  className="ml-2 rounded-lg border border-black/20 px-2 py-1"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-black/50">Giờ / ngày được gắn vào mọi link bên dưới; thứ trong tuần tự tính.</p>
          </section>
        ))}

        <label className="mt-6 block text-sm font-semibold" htmlFor="guest-names">
          Tên khách mời — mỗi dòng một người, ghi cả xưng hô (vd: Cô Lan, Gia đình bác Hùng, Anh Tuấn)
        </label>
        <textarea
          id="guest-names"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={"Cô Lan\nGia đình bác Hùng\nAnh Tuấn & chị Mai"}
          className="mt-2 w-full rounded-xl border border-black/20 bg-white p-3 text-base outline-none focus:border-[#9e3745]"
        />
        <p className="mt-1 text-xs text-black/50">Danh sách được lưu trên trình duyệt này, mở lại trang vẫn còn.</p>

        {names.length > 0 && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{names.length} link</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={withName} onChange={(e) => setWithName(e.target.checked)} />
                  Kèm tên khi chép tất cả
                </label>
                <CopyButton text={lines.join("\n")} label="Chép tất cả" />
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {names.map((n) => {
                const url = linkFor(base, n, extra);
                return (
                  <li key={n} className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 font-semibold">{n}</p>
                      <div className="flex shrink-0 gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                          Xem
                        </a>
                        <CopyButton text={url} />
                      </div>
                    </div>
                    <p className="mt-1 break-all text-xs text-black/50">{url}</p>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
