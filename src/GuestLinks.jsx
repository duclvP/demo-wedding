import React, { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

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

function linkFor(base, name) {
  return `${base}/?khach=${encodeURIComponent(name)}`;
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

  const lines = names.map((n) => (withName ? `${n}: ${linkFor(base, n)}` : linkFor(base, n)));
  const title = document.title;

  return (
    <div className="min-h-screen bg-[#f8f6f2] px-4 py-8 font-sans text-[#1f1f1f]">
      <main className="mx-auto max-w-[640px]">
        <h1 className="text-2xl font-bold">Tạo link mời khách</h1>
        <p className="mt-1 text-sm text-black/60">
          Thiệp: <b>{title}</b>
        </p>

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
                const url = linkFor(base, n);
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
