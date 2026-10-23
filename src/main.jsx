import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, Copy, Download, Gift, MapPin, Volume2, VolumeX, X } from "lucide-react";
import { content } from "./content.js";
import { images } from "./image.js";
import "./index.css";

function publicAssetUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = import.meta.env.BASE_URL || "/";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${String(base).replace(/\/$/, "")}${p}`;
}

const BackgroundMusic = memo(function BackgroundMusic({ src, volume }) {
  const resolvedSrc = publicAssetUrl(src);
  const audioRef = useRef(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  /** true = user đã bấm Tạm dừng — không resume khi đổi tab. */
  const userPausedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = Math.min(1, Math.max(0, volume ?? 0.5));
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setPlaying(true);
    /** Tab ẩn: không đổi state (còn resume). Tab mở: đồng bộ UI. Không gọi play() lại ở đây — tránh giật. */
    const onPause = () => {
      if (document.visibilityState === "hidden") return;
      setPlaying(false);
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState !== "visible") return;
      const el = audioRef.current;
      if (!el || userPausedRef.current) return;
      if (el.paused) {
        void el.play().catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const tryPlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    userPausedRef.current = false;
    setLoadError(null);
    el.muted = false;
    const p = el.play();
    if (p !== undefined) {
      p.catch((err) => {
        console.warn("Phát nhạc thất bại:", err);
        setLoadError("Không phát được nhạc. Chạm màn hình hoặc bấm Bật nhạc.");
      });
    }
  }, []);

  /**
   * Autoplay chỉ chạy một lần khi mount — tránh effect [resolvedSrc, volume] cleanup
   * làm cancelled / gọi play() lại trong lúc đang phát (dễ bị tắt sau vài giây).
   */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    let cancelled = false;

    async function autoplayChain() {
      const vol = Math.min(1, Math.max(0, volumeRef.current ?? 0.5));
      el.volume = vol;

      try {
        el.muted = false;
        await el.play();
        return;
      } catch {
        /* Autoplay có tiếng bị chặn — bình thường */
      }

      try {
        el.muted = true;
        await el.play();
      } catch (err) {
        console.warn(err);
        setLoadError(
          "Trình duyệt không cho phát nhạc tự động. Chạm màn hình hoặc bấm Bật nhạc.",
        );
        return;
      }

      if (cancelled) return;

      try {
        el.muted = false;
        await el.play();
      } catch {
        /* Vẫn câm — lần chạm đầu sẽ bỏ câm */
      }
    }

    function whenReady() {
      if (cancelled) return;
      void autoplayChain();
    }

    if (el.readyState >= 2) whenReady();
    else el.addEventListener("canplay", whenReady, { once: true });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Chạm / cuộn: mở khóa phát nhạc (user gesture).
   * Trước đây chỉ xử lý khi `muted` — nếu autoplay fail hoàn toàn thì `paused` nhưng không muted → chạm không tác dụng.
   */
  useEffect(() => {
    const gesturePlayLockRef = { current: false };
    let lockTimer = 0;

    function onGesture(e) {
      if (e && "isTrusted" in e && !e.isTrusted) return;
      if (
        e?.type === "pointerdown" &&
        e.target?.closest?.("[data-music-control]")
      ) {
        return;
      }
      const el = audioRef.current;
      if (!el || userPausedRef.current) return;
      /** Đã phát có tiếng rồi thì không gọi play() lặp (tránh giật). */
      if (!el.paused && !el.muted) return;
      /** Đang gọi play() từ gesture khác — tránh chồng. */
      if (gesturePlayLockRef.current) return;
      gesturePlayLockRef.current = true;
      userPausedRef.current = false;
      tryPlay();
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(() => {
        gesturePlayLockRef.current = false;
      }, 400);
    }

    const opts = { capture: true, passive: true };
    document.addEventListener("pointerdown", onGesture, opts);
    document.addEventListener("wheel", onGesture, opts);
    window.addEventListener("scroll", onGesture, opts);

    return () => {
      window.clearTimeout(lockTimer);
      document.removeEventListener("pointerdown", onGesture, opts);
      document.removeEventListener("wheel", onGesture, opts);
      window.removeEventListener("scroll", onGesture, opts);
    };
  }, [tryPlay]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.muted = false;
      tryPlay();
    } else {
      userPausedRef.current = true;
      el.pause();
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={resolvedSrc}
        loop
        playsInline
        preload="auto"
        onError={() =>
          setLoadError(
            `Không tải được file nhạc (${resolvedSrc}). Đặt music.mp3 trong public/music/ rồi build lại.`,
          )
        }
        onLoadedData={() => setLoadError(null)}
      />

      <div
        data-music-control
        className="fixed bottom-5 left-5 z-[150] flex max-w-[min(100vw-2rem,18rem)] flex-col items-start gap-2"
      >
        {loadError && (
          <p className="rounded-xl border border-red-200 bg-white/95 px-3 py-2 text-xs text-red-700 shadow-md">
            {loadError}
          </p>
        )}
        <button
          type="button"
          onClick={toggle}
          title={playing ? "Tạm dừng nhạc" : "Bật nhạc nền"}
          aria-label={playing ? "Tạm dừng nhạc nền" : "Phát nhạc nền"}
          className="music-btn relative flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/45 active:animate-press"
        >
          {playing && (
            <>
              <span className="music-ripple" aria-hidden />
              <span className="music-ripple [animation-delay:1s]" aria-hidden />
            </>
          )}
          {playing ? (
            <Volume2 className="relative h-6 w-6 shrink-0" aria-hidden />
          ) : (
            <VolumeX className="relative h-6 w-6 shrink-0" aria-hidden />
          )}
        </button>
      </div>
    </>
  );
});

/** Hiện dần khi cuộn tới — variant: up | down | left | right | zoom | bounce */
const CurtainContext = React.createContext(true);

function Reveal({ as: Tag = "div", variant = "up", delay = 0, duration = 4, className = "", children }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  /** Không chạy hiệu ứng khi rèm còn che — tránh phần đầu thiệp "diễn" trước khi khách thấy */
  const curtainOpen = React.useContext(CurtainContext);
  const visible = seen && curtainOpen;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /**
   * Quan sát lớp ngoài (không transform) — nếu quan sát chính phần tử đang bị
   * đẩy ra ngoài khung (translateX(-100%)), nó không bao giờ "giao" với màn hình.
   */
  return (
    <div ref={ref}>
      <Tag
        style={{ "--d": `${duration}s`, transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` }}
        className={`reveal reveal-${variant} ${visible ? "is-visible" : ""} ${className}`}
      >
        {children}
      </Tag>
    </div>
  );
}

/** Tuyết ❆ và tim ❤ rơi khắp màn hình, giống mẫu lovecard */
const FALLING = [
  { kind: "snowflake", chars: ["❆", "❅"], every: 2500, burst: 8, size: [0.8, 0.6], duration: [15, 5] },
  { kind: "heart", chars: ["❤"], every: 4000, burst: 6, size: [1.2, 1], duration: [10, 5] },
];

/** Bắt đầu khi `active` = true (rèm đã mở): rơi một đợt ngay, sau đó rơi đều */
function FallingEffects({ active }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let seq = 0;
    const timeouts = new Set();

    function spawn(cfg, delay = 0) {
      const id = seq++;
      const duration = cfg.duration[0] + Math.random() * cfg.duration[1];
      const item = {
        id,
        kind: cfg.kind,
        char: cfg.chars[Math.floor(Math.random() * cfg.chars.length)],
        style: {
          left: `${Math.random() * 100}%`,
          fontSize: `${cfg.size[0] + Math.random() * cfg.size[1]}em`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          "--rand-x": Math.random(),
        },
      };
      setItems((list) => [...list, item]);
      const t = setTimeout(() => {
        timeouts.delete(t);
        setItems((list) => list.filter((x) => x.id !== id));
      }, (duration + delay) * 1000);
      timeouts.add(t);
    }

    FALLING.forEach((cfg) => {
      for (let i = 0; i < cfg.burst; i++) spawn(cfg, Math.random() * 3);
    });
    const timers = FALLING.map((cfg) =>
      setInterval(() => {
        if (document.visibilityState !== "hidden") spawn(cfg);
      }, cfg.every),
    );
    return () => {
      timers.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [active]);

  return (
    <div aria-hidden>
      {items.map((x) => (
        <span key={x.id} className={`falling falling-${x.kind}`} style={x.style}>
          {x.char}
        </span>
      ))}
    </div>
  );
}

/** Rèm đỏ che thiệp, chỉ kéo sang hai bên khi khách chạm — cú chạm này cũng mở khóa nhạc nền */
/* ---------- Họa tiết trang trí (SVG vẽ tay, không cần file ảnh) ---------- */

function DoubleHappiness({ className = "" }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full border-2 border-primary/80 text-primary font-display font-bold ${className}`}
      aria-hidden
    >
      囍
    </div>
  );
}

/* ---------- Các khối nội dung ---------- */

function mapUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Từ xưng hô gõ không dấu ở đầu link → có dấu: /co-lan → "Cô Lan"; không có thì thêm "Bạn" */
const GUEST_TITLES = {
  "gia dinh": "Gia Đình",
  ban: "Bạn",
  anh: "Anh",
  chi: "Chị",
  em: "Em",
  co: "Cô",
  chu: "Chú",
  bac: "Bác",
  thim: "Thím",
  di: "Dì",
  duong: "Dượng",
  cau: "Cậu",
  mo: "Mợ",
  ong: "Ông",
  ba: "Bà",
  thay: "Thầy",
  "vo chong": "Vợ Chồng",
};

/**
 * Tên khách lấy từ link ?khach=Tên%20Khách (giữ nguyên) hoặc đường dẫn /hoa (→ "Bạn Hoa"),
 * không có thì dùng mặc định
 */
function useGuestName(fallback) {
  return useState(() => {
    try {
      const fromQuery = new URLSearchParams(window.location.search).get("khach")?.trim();
      if (fromQuery) return fromQuery;
      const base = String(import.meta.env.BASE_URL || "/");
      const path = window.location.pathname.startsWith(base)
        ? window.location.pathname.slice(base.length)
        : window.location.pathname;
      const slug = decodeURIComponent(path.split("/").filter(Boolean).pop() || "");
      if (!slug || /\.html?$/i.test(slug)) return fallback;
      let rest = slug.replace(/[-_+]+/g, " ").trim();
      const titles = [];
      for (;;) {
        const t = Object.keys(GUEST_TITLES).find((k) => rest.toLowerCase().startsWith(`${k} `));
        if (!t) break;
        titles.push(GUEST_TITLES[t]);
        rest = rest.slice(t.length + 1);
      }
      /** Không có xưng hô → mặc định "Bạn" */
      if (!titles.length) titles.push(GUEST_TITLES.ban);
      return [...titles, rest]
        .join(" ")
        .replace(/(^|\s)(\p{L})/gu, (_, sp, ch) => sp + ch.toUpperCase());
    } catch {
      return fallback;
    }
  })[0];
}

/* ---------- Mẫu 10: nền đỏ 囍 + tranh cô dâu chú rể, thẻ kem bấm lỗ như vé (ảnh PNG của mẫu gốc, xem image.js → deco) ---------- */

const RED = "#830b0b";

/** Hàng ngăn giữa các phần của thẻ: hai lỗ tròn đỏ ở mép + nét đứt (như vé) */
function TicketNotch() {
  return (
    <div className="relative h-[52px]" aria-hidden>
      <span className="absolute -left-[21px] top-0 h-[52px] w-[54px] rounded-full bg-[#830101]" />
      <span className="absolute -right-[21px] top-0 h-[52px] w-[54px] rounded-full bg-[#830101]" />
      <span className="absolute inset-x-[32px] top-1/2 border-t border-dashed border-black" />
    </div>
  );
}

function FamilySide({ side }) {
  return (
    <div className="text-center">
      <h3 className="font-date font-bold text-[16px] leading-[25.6px]">{side.label}</h3>
      {side.lines.map((line) => (
        <p key={line} className="font-oswald font-bold uppercase text-[12px] leading-[19.2px]">
          {line}
        </p>
      ))}
      {side.address && <p className="font-sans text-[12px] leading-[19.2px] mt-0.5">{side.address}</p>}
    </div>
  );
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Lịch tháng trong khung trắng bo 30px; ngày cưới có tim vân tay đỏ, số trắng */
function MonthCalendar({ dateIso }) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="mx-auto w-[335px] max-w-full rounded-[30px] border border-black bg-white px-3 pt-1 pb-5">
      <p className="font-script text-[38px] leading-[60.8px] text-[#940101] text-center">
        Tháng {m} - {y}
      </p>
      <div className="grid grid-cols-7 text-center font-sans text-[17px] leading-[27px]">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-[16px] mt-3 text-center font-display text-[17px] leading-[27px]">
        {cells.map((day, i) =>
          day === d ? (
            <span key={i} className="relative flex items-center justify-center">
              <img
                src={images.deco.timVanTay}
                alt=""
                className="anim-fade-in-right absolute left-1/2 top-1/2 h-[42px] w-[42px] max-w-none -translate-x-1/2 -translate-y-1/2"
              />
              <span className="relative text-white">{day}</span>
            </span>
          ) : (
            <span key={i}>{day ?? ""}</span>
          ),
        )}
      </div>
    </div>
  );
}

/** Bản đồ nhúng Google Maps theo từ khóa (không cần API key) */
function MapEmbed({ query }) {
  return (
    <iframe
      title="Bản đồ"
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`}
      className="mx-auto block h-[200px] w-[360px] max-w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

function RsvpForm({ c }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", message: "", attend: "", guestCount: "" });

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!c.endpoint) {
      console.warn("Chưa cấu hình rsvp.endpoint trong content.js — lời chúc không được lưu.", form);
      setSent(true);
      return;
    }
    setSending(true);
    setError(null);
    try {
      /**
       * Google Apps Script không trả header CORS → gửi no-cors (không đọc được phản hồi).
       * Lỗi mạng vẫn bị bắt ở catch.
       */
      await fetch(c.endpoint, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          name: form.name.trim(),
          message: form.message.trim(),
          attend: !c.askAttend ? "" : form.attend === "yes" ? c.attendYes : c.attendNo,
          guestCount: !c.askAttend ? "" : form.attend === "yes" ? form.guestCount || "1" : "0",
        }),
      });
      setSent(true);
    } catch {
      setError(c.error);
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    "w-full bg-white px-3 py-2.5 font-lora text-[15px] text-foreground placeholder:text-foreground/50 outline-none focus:ring-2 focus:ring-white/60";

  return (
    <div className="rounded-[28px] bg-primary px-4 py-8 shadow-lg shadow-primary/25">
      <h2 className="font-script text-[clamp(24px,8vw,36px)] leading-tight whitespace-nowrap text-white text-center mb-6">{c.title}</h2>
      {sent ? (
        <p className="text-center text-white font-lora text-lg py-6">{c.thanks}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={inputCls} />
          <input value={form.message} onChange={update("message")} placeholder={c.placeholders.message} className={inputCls} />
          {c.askAttend && (
            <select
              required
              value={form.attend}
              onChange={update("attend")}
              className={`${inputCls} ${form.attend ? "" : "text-foreground/50"}`}
            >
              <option value="" disabled>
                {c.placeholders.attend}
              </option>
              <option value="yes">{c.attendYes}</option>
              <option value="no">{c.attendNo}</option>
            </select>
          )}
          {c.askAttend && form.attend !== "no" && (
            <input
              type="number"
              min={1}
              max={20}
              value={form.guestCount}
              onChange={update("guestCount")}
              placeholder={c.placeholders.guestCount}
              className={inputCls}
            />
          )}
          <div className="text-center pt-3">
            {error && <p className="text-sm text-white/90 mb-3">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-white px-12 py-2 font-bold uppercase text-sm text-primary shadow transition hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 animate-pulse-soft"
            >
              {sending ? c.sending : c.submit}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function GiftAccount({ account, c }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(account.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Số tài khoản:", account.number);
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      {account.qr && (
        <img
          src={account.qr}
          alt={`Mã QR chuyển khoản ${account.bank} ${account.number}`}
          className="w-36 h-36 rounded-xl border-2 border-foreground/80 bg-white p-1.5 shadow-md"
        />
      )}
      <dl className="mt-3 space-y-1 font-lora font-bold text-[13px] uppercase text-primary">
        <div><dt className="inline">CTK: </dt><dd className="inline">{account.holder}</dd></div>
        <div><dt className="inline">STK: </dt><dd className="inline tracking-wide">{account.number}</dd></div>
        <div><dt className="inline">NH: </dt><dd className="inline">{account.bank}</dd></div>
      </dl>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/45 px-4 py-1.5 font-lora text-sm text-white shadow transition hover:bg-foreground/60 animate-pulse-soft"
        >
          {copied ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
          {copied ? c.copiedLabel : c.copyLabel}
        </button>
        {account.qr && (
          /** Khách mở thiệp trên chính điện thoại thì không quét được — lưu ảnh rồi chọn trong app ngân hàng */
          <a
            href={account.qr}
            download={`QR-${account.bank}-${account.number}.png`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 px-4 py-1.5 font-lora text-sm text-primary transition hover:bg-primary hover:text-white"
          >
            <Download className="w-3.5 h-3.5" aria-hidden />
            {c.saveQrLabel}
          </a>
        )}
      </div>
    </div>
  );
}

function GiftModal({ c, photo, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={c.title}
        onClick={(e) => e.stopPropagation()}
        className="gift-card relative w-full max-w-[400px] max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl animate-pop"
      >
        <div className="relative max-h-[90vh] overflow-y-auto px-4 pt-5 pb-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 text-foreground/70 hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex justify-center">
            <DoubleHappiness className="w-12 h-12 text-2xl bg-white/70" />
          </div>
          <h2 className="font-vibes text-[42px] leading-tight whitespace-nowrap text-primary text-center mt-1">{c.title}</h2>
          <div className="h-px bg-foreground/15 my-4" />
          <div className="grid grid-cols-[1fr_1.1fr] items-center gap-3">
            <img
              src={photo}
              alt=""
              className="w-full aspect-[3/4] object-cover rounded-2xl border-2 border-white shadow-lg"
            />
            <div className="space-y-6">
              {c.accounts.map((account) => (
                <GiftAccount key={account.number} account={account} c={c} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeddingPage() {
  const c = content;
  const guest = useGuestName(c.invitation.defaultGuest);
  const [giftOpen, setGiftOpen] = useState(false);
  const closeGift = useCallback(() => setGiftOpen(false), []);
  const d = images.deco;
  const [groom, bride] = c.families.couple;

  return (
    <div className="min-h-screen bg-[#f3eeee] text-foreground font-sans">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      {/* Mẫu 10 không có màn bấm mở — tuyết & tim rơi ngay khi vào trang */}
      <FallingEffects active />

      <main className="relative mx-auto min-h-screen max-w-[420px] overflow-hidden shadow-2xl" style={{ backgroundColor: RED }}>
        {/* Đầu thiệp: nền đỏ 囍, Save the date, tên viết tay, tranh cô dâu chú rể */}
        <section className="relative h-[776px]">
          <div className="absolute inset-x-0 top-0 h-[529px] overflow-hidden">
            <img src={d.nenHy} alt="" className="absolute left-0 top-[-12px] w-full max-w-none" />
          </div>
          <Reveal variant="left" duration={3} className="absolute left-[7px] top-[11px]">
            <p className="font-yeseva text-[30px] leading-[48px] uppercase text-white">{c.hero.kicker}</p>
          </Reveal>
          <Reveal variant="left" duration={3} className="absolute left-[1px] top-[55px] w-[125px] text-center">
            <p className="font-sans text-[18px] leading-[28.8px] text-white">{c.hero.dateLine}</p>
          </Reveal>
          <Reveal variant="bounce" duration={3} className="absolute inset-x-0 top-[111px] text-center">
            <p className="font-script text-[clamp(28px,8.8vw,38px)] leading-[72px] text-white whitespace-nowrap">
              {c.hero.names[0]} &amp; {c.hero.names[1]}
            </p>
          </Reveal>
          <img
            src={d.coDauChuRe}
            alt={`${c.hero.names[0]} & ${c.hero.names[1]}`}
            className="absolute left-[13%] top-[183px] w-[88%] max-w-none"
          />
        </section>

        {/* Thẻ kem */}
        <div className="relative mx-3 rounded-t-[30px] bg-[#fffcec] pb-1">
          {/* Gia đình + báo tin */}
          <section className="pt-[7px] text-center">
            <h2 className="font-vibes text-[35px] leading-[56px]">{c.families.title}</h2>
            <div className="mt-5 grid grid-cols-[1fr_40px_1fr] items-start gap-1 px-3">
              <Reveal variant="left" duration={3}>
                <FamilySide side={c.families.sides[0]} />
              </Reveal>
              <img src={d.hy} alt="" className="mt-2 h-[40px] w-[40px]" />
              <Reveal variant="right" duration={3}>
                <FamilySide side={c.families.sides[1]} />
              </Reveal>
            </div>
            <Reveal variant="up" duration={3} className="mt-7">
              <p className="font-lora font-bold uppercase text-[15px] leading-[25.6px] text-[#830b0b]">{c.families.announce}</p>
            </Reveal>
            <div className="mt-3">
              <Reveal variant="right" duration={4}>
                <p className="font-script text-[clamp(32px,10vw,43px)] leading-[56px] whitespace-nowrap">{groom.name}</p>
                <p className="font-lora font-bold text-[14px] leading-none text-foreground/70">{groom.role}</p>
              </Reveal>
              <Reveal variant="bounce" duration={2}>
                <p className="font-script text-[43px] leading-[60px]">&amp;</p>
              </Reveal>
              <Reveal variant="left" duration={4}>
                <p className="font-script text-[clamp(30px,9.5vw,43px)] leading-[56px] whitespace-nowrap">{bride.name}</p>
                <p className="font-lora font-bold text-[14px] leading-none text-foreground/70">{bride.role}</p>
              </Reveal>
            </div>
          </section>

          <div className="mt-3">
            <TicketNotch />
          </div>

          {/* Lời mời + ngày giờ + lịch */}
          <section className="text-center">
            <Reveal>
              <p className="font-lora font-bold uppercase text-[18px] leading-[28.8px] text-[#830b0b]">{c.invitation.kicker}</p>
              <p className="font-guest text-[34px] leading-[45px] text-[#8b0000] mx-auto w-[203px] border-b border-dotted border-black">
                {guest}
              </p>
              <p className="font-lora uppercase text-[15px] leading-[24px] mt-2">{c.invitation.title}</p>
              <p className="font-lora text-[17px] leading-[27px] mt-2">{c.invitation.timeLabel}</p>
            </Reveal>
            <div className="mt-1">
              <p className="font-lora uppercase text-[20px] leading-[32px]">{c.event.weekday}</p>
              <div className="flex items-center justify-center">
                <Reveal variant="slide-left" duration={2} className="w-[103px]">
                  <p className="font-lora font-bold uppercase text-[19px] leading-[32px]">{c.event.hour}</p>
                </Reveal>
                <span className="mx-[6px] h-[63px] w-px bg-black" aria-hidden />
                <p className="w-[90px] font-lora text-[68px] leading-[90px]">{c.event.day}</p>
                <span className="mx-[6px] h-[63px] w-px bg-black" aria-hidden />
                <Reveal variant="slide-right" duration={2} className="w-[103px]">
                  <p className="font-lora font-bold uppercase text-[19px] leading-[32px]">{c.event.year}</p>
                </Reveal>
              </div>
              <p className="font-lora uppercase text-[20px] leading-[32px]">{c.event.month}</p>
              <Reveal variant="up" duration={3}>
                <p className="font-sans italic text-[14px] leading-[22.4px] mt-1">{c.event.lunar}</p>
              </Reveal>
            </div>
            {c.calendar.dateIso && (
              <Reveal className="mt-6 px-5">
                <MonthCalendar dateIso={c.calendar.dateIso} />
              </Reveal>
            )}
          </section>

          <div className="mt-8">
            <TicketNotch />
          </div>

          {/* Địa điểm */}
          <section className="text-center px-4">
            <Reveal>
              <h2 className="font-script text-[35px] leading-[56px]">{c.venue.title}</h2>
              <p className="font-oswald font-medium uppercase text-[30px] leading-[44px]">{c.venue.label}</p>
              <p className="font-sans text-[15px] leading-[24px]">{c.venue.address}</p>
              <a
                href={mapUrl(c.venue.mapQuery ?? c.venue.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-[20px] bg-[#008037] px-3.5 py-[3px] font-display text-[15px] leading-[24px] text-white transition hover:scale-105"
              >
                {c.venue.mapLabel}
              </a>
            </Reveal>
            <div className="mt-4">
              <MapEmbed query={c.venue.mapQuery ?? c.venue.address} />
            </div>
          </section>

          <div className="mt-7">
            <TicketNotch />
          </div>

          {/* Lời chúc + mừng cưới (ẩn theo content) */}
          {(c.rsvp.show || c.gift.accounts.length > 0) && (
            <section className="px-3 pb-6">
              {c.rsvp.show && (
                <Reveal>
                  <RsvpForm c={c.rsvp} />
                </Reveal>
              )}
              {c.gift.accounts.length > 0 && (
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => setGiftOpen(true)}
                    className="rounded-[20px] bg-[#830b0b] px-9 py-1 font-oswald font-bold uppercase text-[15px] leading-[24px] text-white animate-pulse-soft"
                  >
                    {c.gift.button}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Lời kết */}
          <section className="px-6 pb-2 text-center">
            <Reveal variant="up" duration={3}>
              <p className="font-sans text-[15px] leading-[24px]">{c.closing.note}</p>
            </Reveal>
            <div className="mt-5 border-t-2 border-[#830b0b] pt-1">
              <Reveal variant="up" duration={3}>
                <p className="font-script text-[30px] leading-[48px]">{c.closing.title}</p>
              </Reveal>
            </div>
          </section>
        </div>
        <div className="mx-3 h-6 rounded-b-[30px] bg-[#fffcec]" />
        <div className="h-4" />
      </main>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(<WeddingPage />);
