import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, Copy, Download, Gift, Volume2, VolumeX, X } from "lucide-react";
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

function Reveal({ as: Tag = "div", variant = "up", delay = 0, className = "", children }) {
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
        style={{ transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` }}
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
function OpeningCurtain({ onOpen, onDone }) {
  const [opening, setOpening] = useState(false);

  const open = useCallback(() => {
    setOpening((was) => {
      if (!was) onOpen();
      return true;
    });
  }, [onOpen]);

  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [opening, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[160] mx-auto max-w-[460px] overflow-hidden ${opening ? "pointer-events-none" : ""}`}
      onClick={open}
      aria-hidden
    >
      <div className={`curtain curtain-left ${opening ? "is-open" : ""}`} />
      <div className={`curtain curtain-right ${opening ? "is-open" : ""}`} />
      <div
        className={`absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700 ${
          opening ? "scale-50 opacity-0" : ""
        }`}
      >
        <button type="button" className="seal animate-pulse-soft" aria-label="Mở thiệp">
          <span className="font-display font-bold text-[64px] leading-none text-[#f3d27a]">囍</span>
        </button>
        <p className="mt-4 font-lora text-sm tracking-widest uppercase text-[#f8e4a6] drop-shadow">
          Chạm để mở thiệp
        </p>
      </div>
    </div>
  );
}

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

function Knot({ className = "" }) {
  return (
    <svg viewBox="0 0 40 90" className={className} aria-hidden>
      <g fill="none" stroke="#e0782f" strokeWidth="2">
        <line x1="20" y1="0" x2="20" y2="14" />
        <path d="M20 14 L32 26 L20 38 L8 26 Z" />
        <path d="M14 20 L26 32 M26 20 L14 32" />
        <circle cx="8" cy="26" r="3" />
        <circle cx="32" cy="26" r="3" />
        <line x1="20" y1="38" x2="20" y2="48" />
      </g>
      <path d="M16 48 h8 l2 34 h-12 z" fill="#e0782f" opacity="0.85" />
    </svg>
  );
}

function Lantern({ className = "" }) {
  return (
    <svg viewBox="0 0 40 70" className={className} aria-hidden>
      <line x1="20" y1="0" x2="20" y2="10" stroke="#b8860b" strokeWidth="1.5" />
      <rect x="13" y="10" width="14" height="4" rx="1" fill="#b8860b" />
      <ellipse cx="20" cy="32" rx="16" ry="18" fill="#d6262b" />
      <path d="M20 14 Q8 32 20 50 M20 14 Q32 32 20 50" stroke="#a01519" strokeWidth="1.2" fill="none" />
      <rect x="13" y="49" width="14" height="4" rx="1" fill="#b8860b" />
      <path d="M17 53 h6 l1 14 h-8 z" fill="#d6262b" />
    </svg>
  );
}

/** Viền hoa văn vàng chạy dọc mép thiệp */
function KeyBorder({ side }) {
  return (
    <div
      className={`key-border pointer-events-none absolute inset-y-0 ${side === "left" ? "left-1.5" : "right-1.5"} w-4 z-20`}
      aria-hidden
    />
  );
}

function GoldFrame({ src, alt, className = "", imgClass = "" }) {
  return (
    <div className={`gold-frame p-[6px] shadow-xl ${className}`}>
      <div className="bg-white p-1.5">
        <img src={src} alt={alt} className={`w-full object-cover ${imgClass}`} loading="lazy" />
      </div>
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

function FamilySide({ side }) {
  return (
    <div className="text-center">
      <h3 className="font-upright font-semibold text-[28px] text-foreground mb-1">{side.label}</h3>
      {side.father && (
        <p className="font-oswald font-medium text-[15px] uppercase">Bố: {side.father}</p>
      )}
      {side.mother && (
        <p className="font-oswald font-medium text-[15px] uppercase mb-2">Mẹ: {side.mother}</p>
      )}
      {side.address && (
        <p className="text-sm text-foreground/75 leading-relaxed mt-1">{side.address}</p>
      )}
    </div>
  );
}

function EventCard({ item, mapLabel }) {
  return (
    <div className="rounded-[28px] bg-primary text-primary-foreground px-6 py-7 text-center shadow-lg shadow-primary/25">
      <h3 className="font-avo font-semibold uppercase text-lg mb-2">{item.title}</h3>
      <p className="font-avo text-base mb-1">{item.time}</p>
      <p className="font-avo font-semibold text-3xl mb-1">{item.date}</p>
      <p className="italic text-xs opacity-85 mb-5">{item.lunar}</p>
      <div className="space-y-5">
        {item.places.map((place) => (
          <div key={place.label}>
            <p className="font-avo uppercase text-lg mb-1">{place.label}</p>
            <p className="text-sm opacity-90 mb-3">{place.address}</p>
            <a
              href={mapUrl(place.mapQuery ?? place.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-white px-8 py-1.5 font-lora text-primary text-base shadow transition hover:scale-105"
            >
              {mapLabel}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function MonthCalendar({ dateIso }) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <p className="text-center font-date text-xl text-primary uppercase mb-4">
        Tháng {m} - {y}
      </p>
      <div className="grid grid-cols-7 bg-primary text-primary-foreground text-center font-semibold text-sm py-2.5">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center font-display text-lg mt-3">
        {cells.map((day, i) =>
          day === d ? (
            <span key={i} className="relative flex items-center justify-center h-10">
              <svg viewBox="0 0 24 24" className="absolute w-11 h-11 text-[#e0303a] animate-pulse-soft" aria-hidden>
                <path
                  fill="currentColor"
                  opacity="0.85"
                  d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 3 5 6.4 5c2 0 3.6 1.1 4.6 2.6C12 6.1 13.6 5 15.6 5 19 5 21.1 8.6 19.6 11.9 17.5 16.4 12 21 12 21z"
                />
              </svg>
              <span className="relative font-bold text-white">{day}</span>
            </span>
          ) : (
            <span key={i} className="flex items-center justify-center h-10">
              {day ?? ""}
            </span>
          ),
        )}
      </div>
    </div>
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
  /** opened: rèm bắt đầu kéo ra; curtainGone: rèm đã kéo xong, gỡ khỏi trang */
  const [opened, setOpened] = useState(false);
  const [curtainGone, setCurtainGone] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);
  const handleCurtainDone = useCallback(() => setCurtainGone(true), []);
  const [first, second] = c.hero.names;

  return (
    <div className="min-h-screen bg-[#f3eeee] text-foreground font-sans">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects active={opened} />
      {!curtainGone && <OpeningCurtain onOpen={handleOpen} onDone={handleCurtainDone} />}

      <CurtainContext.Provider value={opened}>
      <main className="relative mx-auto max-w-[460px] bg-white overflow-hidden shadow-2xl">
        <KeyBorder side="left" />
        <KeyBorder side="right" />

        <div className="px-8">
          {/* Save the date */}
          <section className="relative pt-10 pb-12 text-center">
            <Reveal variant="down">
              <h2 className="font-lora text-[32px] uppercase">{c.hero.subtitle}</h2>
            </Reveal>
            <Reveal variant="zoom" delay={150}>
              <p className="font-script text-[clamp(28px,9vw,42px)] leading-tight whitespace-nowrap text-foreground mt-4">
                {first} & {second}
              </p>
            </Reveal>
            <Reveal variant="zoom" delay={300} className="relative mt-6 flex items-center justify-center">
              <Knot className="absolute left-6 top-0 w-9 h-20 animate-swing" />
              <DoubleHappiness className="w-14 h-14 text-3xl animate-pulse-soft" />
              <Knot className="absolute right-6 top-0 w-9 h-20 animate-swing [animation-delay:0.8s]" />
            </Reveal>
            <Reveal delay={400}>
              <p className="font-date text-[32px] mt-12 mb-6">{c.hero.dateLine}</p>
            </Reveal>
            <Reveal variant="left" delay={500}>
              <GoldFrame src={images.hero} alt={`${first} & ${second}`} imgClass="aspect-[2/3]" />
            </Reveal>
            <Lantern className="absolute -right-2 bottom-0 w-9 h-16 animate-swing" />
            <Lantern className="absolute right-6 bottom-8 w-7 h-12 animate-swing [animation-delay:0.6s]" />
          </section>

          {/* Gia đình hai bên */}
          <section className="pb-12 text-center">
            <Reveal variant="down" className="mb-10">
              <div className="flex flex-col items-center animate-swing">
              <span className="w-px h-6 bg-primary/70" />
              <DoubleHappiness className="w-16 h-16 text-3xl" />
              <Knot className="w-8 h-16 -mt-1" />
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {c.families.sides.map((side, i) => (
                <Reveal key={side.label} variant={i ? "right" : "left"}>
                  <FamilySide side={side} />
                </Reveal>
              ))}
            </div>
            <Reveal variant="left">
              <p className="font-script text-5xl">{c.families.fullNames[0]}</p>
            </Reveal>
            <Reveal variant="bounce" delay={300}>
              <p className="font-script text-4xl my-1">&</p>
            </Reveal>
            <Reveal variant="right">
              <p className="font-script text-5xl">{c.families.fullNames[1]}</p>
            </Reveal>
            <Reveal variant="up" className="mt-10">
              <GoldFrame src={images.couple} alt="" imgClass="aspect-[4/5] object-top" />
            </Reveal>
          </section>

          {/* Lời mời */}
          <section className="pb-8 text-center">
            <Reveal>
              <p className="font-avo uppercase text-xl text-foreground/75 font-medium">{c.invitation.kicker}</p>
              <p className="font-guest text-[40px] text-primary mt-3 pb-1 border-b border-dashed border-foreground/30 mx-8">
                {guest}
              </p>
              <p className="font-lora uppercase text-xl mt-4">{c.invitation.title}</p>
            </Reveal>
            <div className="grid grid-cols-3 gap-1.5 mt-6 -mx-4">
              {images.dateStrip.map((src, i) => (
                <Reveal key={i} variant="up" delay={i * 150} className="relative border-[3px] border-[#ecc8c8]">
                  <img src={src} alt="" className="w-full aspect-[3/5] object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 inset-x-0 text-center font-lora font-bold text-3xl text-white drop-shadow">
                    {c.invitation.dateParts[i]}
                  </span>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Sự kiện */}
          <section className="space-y-3 pb-12">
            {c.events.items.map((item, i) => (
              <Reveal key={item.id} variant={i % 2 ? "right" : "left"}>
                <EventCard item={item} mapLabel={c.events.mapLabel} />
              </Reveal>
            ))}
          </section>

          {/* Lịch */}
          {c.calendar.dateIso && (
            <section className="pb-12 -mx-2">
              <Reveal variant="right">
                <h2 className="text-center font-lora text-3xl text-primary uppercase mb-1">{c.calendar.title}</h2>
                <MonthCalendar dateIso={c.calendar.dateIso} />
              </Reveal>
            </section>
          )}

          {/* Xác nhận + mừng cưới */}
          <section className="pb-10 -mx-2">
            {c.rsvp.show && (
              <Reveal>
                <RsvpForm c={c.rsvp} />
              </Reveal>
            )}
            {c.gift.accounts.length > 0 && (
              <Reveal className={`text-center ${c.rsvp.show ? "mt-8" : ""}`}>
                <button
                  type="button"
                  onClick={() => setGiftOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-2.5 font-upright font-semibold text-lg uppercase text-white shadow-lg shadow-primary/30 animate-pulse-soft"
                >
                  <Gift className="w-5 h-5" aria-hidden />
                  {c.gift.button}
                </button>
              </Reveal>
            )}
          </section>

          {/* Album */}
          <section className="grid grid-cols-2 gap-1.5 pb-3 -mx-2">
            {images.album.map((src, i) => (
              <Reveal key={i} variant={i % 2 ? "right" : "left"} className="border-2 border-[#e6e6e6]">
                <img src={src} alt="" className="w-full aspect-[2/3] object-cover" loading="lazy" />
              </Reveal>
            ))}
          </section>

          {/* Thank you */}
          <section className="relative -mx-2 overflow-hidden">
            <img src={images.thankYou} alt="" className="w-full aspect-[3/4] object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            {/* Định vị ở lớp ngoài — Reveal quan sát lớp bọc của nó, lớp đó phải có chiều cao thật */}
            <div className="absolute inset-x-0 bottom-0">
              <Reveal variant="up" className="px-4 pb-14 text-center text-white">
                <h2 className="font-script text-7xl mb-3 drop-shadow-lg">{c.thanks.title}</h2>
                <p className="text-sm leading-relaxed drop-shadow">{c.thanks.text}</p>
                <p className="font-script text-4xl mt-4 drop-shadow-lg">
                  {c.families.fullNames[0]} &amp; {c.families.fullNames[1]}
                </p>
              </Reveal>
            </div>
          </section>
        </div>
      </main>
      </CurtainContext.Provider>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* ---------- Mẫu 06 (lovecard thiepso06): xanh rêu + kem, mép giấy xé ---------- */

/** Ảnh trang trí lấy từ mẫu gốc thiepso06 */
const TPL06 = (name) => `/images/tpl06/${name}.png`;

const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS_EN = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];

/** Chữ cái đầu của tên gọi (chữ cuối) — "Anh Tuấn" → "T" */
const initialOf = (name) => name.trim().split(/\s+/).pop().charAt(0).toUpperCase();

/** "18:00 - Thứ Tư" → "Vào lúc 18 giờ 00 phút - Thứ Tư" */
function timeLine(time) {
  const m = time.match(/^(\d{1,2}):(\d{2})\s*-\s*(.+)$/);
  return m ? `Vào lúc ${m[1]} giờ ${m[2]} phút - ${m[3]}` : time;
}

/**
 * Mép giấy xé giữa hai section (ảnh của mẫu gốc): nét xé ở trên, phủ kín ở dưới.
 * Đặt ở đầu section, màu = màu section đó, nằm trên nền section phía trước.
 */
function TornEdge({ color }) {
  return (
    <img
      src={TPL06(color === GREEN ? "torn-green" : "torn-cream")}
      alt=""
      className="block w-full -mb-px select-none pointer-events-none"
      aria-hidden
    />
  );
}

/** Hình chữ nhật 400×120 có bốn cạnh răng cưa (mảnh giấy xé) */
function badgePath(seed) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts = [];
  for (let x = 0; x < 400; x += 6 + rand() * 10) pts.push([x, rand() * 12]);
  for (let y = 0; y < 120; y += 8 + rand() * 10) pts.push([388 + rand() * 12, y]);
  for (let x = 400; x > 0; x -= 6 + rand() * 10) pts.push([x, 108 + rand() * 12]);
  for (let y = 120; y > 0; y -= 8 + rand() * 10) pts.push([rand() * 12, y]);
  return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} Z`;
}

/** Mảnh giấy xé làm nền cho chữ ("Save the date", "Our Story") */
function TornBadge({ color, seed = 3, className = "", children }) {
  return (
    <div className={`relative inline-block px-10 py-3 ${className}`}>
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ color }} aria-hidden>
        <path fill="currentColor" d={badgePath(seed)} />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

/** Khung monogram (ảnh có lề trong suốt: khung chiếm ~76% ngang, ~62% dọc) + hai chữ cái đầu */
function Monogram({ a, b }) {
  return (
    <div className="relative mx-auto w-[124px] h-[220px] text-black">
      <img src={TPL06("monogram-frame")} alt="" className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-x-[12%] inset-y-[19%]">
        <span className="absolute left-[22%] top-[12%] font-elegant text-[36px] leading-none">{a}</span>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-pinyon text-[20px]">&amp;</span>
        <span className="absolute right-[22%] bottom-[12%] font-elegant text-[36px] leading-none">{b}</span>
      </div>
    </div>
  );
}

function Calendar06({ dateIso }) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="text-white">
      <div className="relative flex flex-col items-center pt-6">
        <img src={TPL06("lily-gold")} alt="" className="w-[150px]" />
        <p className="relative -mt-14 font-pinyon text-[54px] leading-tight">{MONTHS_EN[m - 1]}</p>
      </div>
      <div className="grid grid-cols-7 text-center font-josefin text-[13px] tracking-wide mt-6 mb-3">
        {WEEKDAYS_EN.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-3 text-center font-display text-[17px]">
        {cells.map((day, i) => (
          <span key={i} className="relative flex items-center justify-center h-10">
            {day === d && (
              <img src={TPL06("heart")} alt="" className="absolute w-12 h-12 object-contain animate-pulse-soft" />
            )}
            <span className="relative">{day ?? ""}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Một sự kiện: giờ, ngày dạng "THÁNG 10 | 28 | NĂM 2026", âm lịch, địa điểm + chỉ đường */
function Event06({ item, mapLabel }) {
  const [d, mo, y] = item.date.split(".").map((s) => s.trim());
  const rule = "border-y border-[#22371a]/70 py-1.5 font-josefin text-[17px] uppercase text-[#22371a]";
  return (
    <div className="text-center text-[#22371a]">
      <p className="font-josefin font-semibold text-[22px] uppercase">{item.title}</p>
      <p className="font-josefin text-[16px] uppercase mt-2 opacity-80">{timeLine(item.time)}</p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-5">
        <span className={`${rule} text-left pl-1`}>Tháng {mo}</span>
        <span className="font-date text-[78px] leading-none text-[#22371a]/85">{d}</span>
        <span className={`${rule} text-right pr-1`}>Năm {y}</span>
      </div>
      <p className="italic font-josefin text-[14px] mt-4 opacity-80">{item.lunar}</p>
      {item.places.map((place) => (
        <div key={place.label} className="mt-6">
          <p className="font-josefin font-semibold text-[20px] uppercase">{place.label}</p>
          <p className="font-josefin text-[14px] mt-2 px-2 text-black/75">{place.address}</p>
          <a
            href={mapUrl(place.mapQuery ?? place.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#22371a] px-7 py-2 font-upright font-semibold text-[15px] uppercase text-white shadow-lg animate-pulse-soft"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
              <path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
            </svg>
            {mapLabel}
          </a>
        </div>
      ))}
    </div>
  );
}

/**
 * Màn mở mẫu 06: hai cánh cửa kem có hoa ly, con dấu sáp ở giữa — chạm để mở (cũng mở khóa nhạc).
 * Ảnh cửa lấy từ mẫu gốc: mỗi ảnh có một nửa là cánh cửa, nửa kia trong suốt (cửa trái: nửa trái,
 * kèm con dấu đè lên mép; cửa phải: nửa phải) → ảnh rộng gấp đôi cánh cửa.
 */
function DoorOpening06({ onOpen, onDone }) {
  const [opening, setOpening] = useState(false);

  const open = useCallback(() => {
    setOpening((was) => {
      if (!was) onOpen();
      return true;
    });
  }, [onOpen]);

  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [opening, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[160] mx-auto max-w-[460px] overflow-hidden ${opening ? "pointer-events-none" : ""}`}
      onClick={open}
      aria-hidden
    >
      <div className={`door door-right ${opening ? "is-open" : ""}`}>
        <img src="/images/tpl06/door-right.png" alt="" className="door-img door-img-right" />
      </div>
      <div className={`door door-left ${opening ? "is-open" : ""}`}>
        <img src="/images/tpl06/door-left.png" alt="" className="door-img" />
      </div>
      <p
        className={`absolute inset-x-0 top-1/2 mt-[72px] text-center font-josefin text-[13px] tracking-[0.2em] uppercase text-[#22371a]/70 transition-opacity duration-700 ${
          opening ? "opacity-0" : ""
        }`}
      >
        Chạm để mở thiệp
      </p>
    </div>
  );
}

const GREEN = "#22371a";
const CREAM = "#fffdea";

function WeddingPage06() {
  const c = content;
  const guest = useGuestName(c.invitation.defaultGuest);
  const [giftOpen, setGiftOpen] = useState(false);
  const closeGift = useCallback(() => setGiftOpen(false), []);
  const [opened, setOpened] = useState(false);
  const [curtainGone, setCurtainGone] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);
  const handleCurtainDone = useCallback(() => setCurtainGone(true), []);
  const [first, second] = c.hero.names;
  const [groomSide, brideSide] = [c.families.sides.find((s) => s.label === "Nhà Trai"), c.families.sides.find((s) => s.label === "Nhà Gái")];

  return (
    <div className="theme-06 min-h-screen bg-[#e9e6dc] font-josefin">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects active={opened} />
      {!curtainGone && <DoorOpening06 onOpen={handleOpen} onDone={handleCurtainDone} />}

      <CurtainContext.Provider value={opened}>
        <main className="relative mx-auto max-w-[460px] overflow-hidden shadow-2xl" style={{ background: GREEN }}>
          {/* Ảnh đầu + tên */}
          <section className="relative text-center text-white">
            <img src={images.hero} alt={`${first} & ${second}`} className="w-full aspect-[1/1] object-cover object-top" />
            <div className="-mt-12 relative">
              <TornEdge color={GREEN} />
            </div>
            <div className="px-6 pt-8 pb-14">
              <Reveal variant="down">
                <p className="font-elegant text-[46px] uppercase leading-tight text-[#ece4c8]">{first}</p>
              </Reveal>
              <Reveal variant="zoom" delay={150}>
                <p className="font-pinyon text-[50px] leading-none my-1 text-[#ece4c8]">and</p>
              </Reveal>
              <Reveal variant="up" delay={300}>
                <p className="font-elegant text-[46px] uppercase leading-tight text-[#ece4c8]">{second}</p>
              </Reveal>
              <Reveal variant="zoom" delay={450} className="mt-10">
                <TornBadge color="#ecebd8">
                  <p className="font-pinyon text-[28px] text-[#22371a] leading-tight">Save the date</p>
                  <p className="font-lora font-bold text-[24px] text-[#22371a] tracking-wide">{c.hero.dateLine}</p>
                </TornBadge>
              </Reveal>
            </div>
          </section>

          {/* Lịch */}
          {c.calendar.dateIso && (
            <section className="px-6 pb-14">
              <Reveal variant="up">
                <Calendar06 dateIso={c.calendar.dateIso} />
              </Reveal>
            </section>
          )}

          {/* Monogram, gia đình, lời mời, sự kiện */}
          <section style={{ background: CREAM }}>
            <div style={{ background: GREEN }}>
              <TornEdge color={CREAM} />
            </div>
            <div className="px-6 pt-10 pb-16 text-center">
              <Reveal variant="zoom">
                <Monogram a={initialOf(first)} b={initialOf(second)} />
              </Reveal>
              <div className="grid grid-cols-2 gap-3 mt-10 text-[#22371a]">
                {[groomSide, brideSide].filter(Boolean).map((side, i) => (
                  <Reveal key={side.label} variant={i ? "right" : "left"}>
                    <p className="font-josefin font-semibold text-[18px] uppercase">{side.label}</p>
                    {side.father && <p className="font-josefin text-[15px] mt-2 opacity-80">Ông: {side.father}</p>}
                    {side.mother && <p className="font-josefin text-[15px] mt-1 opacity-80">Bà: {side.mother}</p>}
                    {side.address && <p className="font-josefin text-[13px] mt-2 opacity-70">{side.address}</p>}
                  </Reveal>
                ))}
              </div>

              <Reveal className="mt-10">
                <p className="font-josefin font-semibold text-[16px] uppercase text-[#22371a]">{c.invitation.kicker}</p>
                <p className="font-guest text-[38px] text-[#8b0000] mt-1 pb-1 border-b border-dotted border-[#22371a]/50 mx-10">
                  {guest}
                </p>
                <p className="font-josefin text-[15px] uppercase text-[#22371a] mt-4 px-4">{c.invitation.title}</p>
              </Reveal>

              <Reveal variant="zoom" className="mt-6 text-[#22371a]">
                <p className="font-elegant text-[38px] uppercase leading-tight">{c.families.fullNames[0]}</p>
                <img src={TPL06("rings")} alt="" className="w-14 mx-auto my-2" />
                <p className="font-elegant text-[38px] uppercase leading-tight">{c.families.fullNames[1]}</p>
              </Reveal>

              <div className="mt-10 space-y-12">
                {c.events.items.map((item, i) => (
                  <Reveal key={item.id} variant={i % 2 ? "right" : "left"}>
                    {i > 0 && <div className="w-44 h-px bg-[#22371a]/60 mx-auto -mt-4 mb-10" />}
                    <Event06 item={item} mapLabel={c.events.mapLabel} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Chú rể, cô dâu, câu chuyện */}
          <section className="pb-14">
            <div style={{ background: CREAM }}>
              <TornEdge color={GREEN} />
            </div>
            {/* Tên chú rể & cô dâu thẳng hàng, hai ảnh chân dung ngay bên dưới */}
            <div className="relative px-5 pt-10 grid grid-cols-2 gap-x-4 gap-y-5 text-center text-[#e9e2c6]">
              {[
                ["Chú rể", c.families.fullNames[0]],
                ["Cô dâu", c.families.fullNames[1]],
              ].map(([role, name]) => (
                <Reveal key={role} variant="zoom">
                  <p className="font-upright text-[22px]">{role}</p>
                  <p className="font-elegant text-[28px] uppercase leading-tight">{name}</p>
                </Reveal>
              ))}
              {[
                [images.groom, c.families.fullNames[0], "left"],
                [images.bride, c.families.fullNames[1], "right"],
              ].map(([src, name, side]) => (
                <Reveal key={side} variant={side}>
                  <img src={src} alt={name} className="w-full aspect-[3/4] rounded-[50%] object-cover border-2 border-[#d9cfa8]/60" loading="lazy" />
                </Reveal>
              ))}
            </div>
            {c.story && (
              <div className="px-6 mt-12 text-center">
                <Reveal variant="zoom">
                  <TornBadge color="#9aa58b">
                    <p className="font-pinyon text-[34px] text-[#22371a] leading-tight">{c.story.title}</p>
                  </TornBadge>
                </Reveal>
                {c.story.paragraphs.map((p, i) => (
                  <Reveal key={i} variant="up" delay={i * 150}>
                    <p className="font-josefin text-[15px] leading-relaxed text-[#e9e2c6] mt-5">{p}</p>
                  </Reveal>
                ))}
              </div>
            )}
          </section>

          {/* Ảnh tròn + mừng cưới */}
          <section style={{ background: CREAM }}>
            <div style={{ background: GREEN }}>
              <TornEdge color={CREAM} />
            </div>
            <div className="px-6 pt-10 pb-14 text-center">
              {c.rsvp.show && (
                <Reveal className="mb-10">
                  <RsvpForm c={c.rsvp} />
                </Reveal>
              )}
              <Reveal variant="zoom">
                <div className="relative mx-auto w-[70%] aspect-square">
                  <img src={images.circle} alt="" className="absolute inset-[5%] w-[90%] h-[90%] rounded-full object-cover" loading="lazy" />
                  <img src={TPL06("circle-frame")} alt="" className="absolute inset-0 w-full h-full" />
                </div>
              </Reveal>
              {c.gift.accounts.length > 0 && (
                <Reveal className="mt-8">
                  <button
                    type="button"
                    onClick={() => setGiftOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#22371a] px-9 py-2.5 font-upright font-semibold text-[15px] uppercase text-white shadow-lg animate-pulse-soft"
                  >
                    <Gift className="w-5 h-5" aria-hidden />
                    {c.gift.button}
                  </button>
                </Reveal>
              )}
            </div>
          </section>

          {/* Album */}
          <section className="pb-6">
            <div style={{ background: CREAM }}>
              <TornEdge color={GREEN} />
            </div>
            <Reveal variant="zoom">
              <h2 className="text-center font-pinyon text-[40px] text-white pt-8 pb-6">Album of Love</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-1.5 px-1.5">
              {images.album.map((src, i) => (
                <Reveal key={i} variant={i % 2 ? "right" : "left"} className="border-2 border-white/80">
                  <img src={src} alt="" className="w-full aspect-[2/3] object-cover" loading="lazy" />
                </Reveal>
              ))}
            </div>
          </section>

          {/* Thank you */}
          <section className="relative overflow-hidden">
            <img src={images.thankYou} alt="" className="w-full aspect-[3/4] object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#22371a] via-[#22371a]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0">
              <Reveal variant="up" className="px-5 pb-14 text-center text-white">
                <h2 className="font-pinyon text-[56px] mb-2 drop-shadow-lg">{c.thanks.title}</h2>
                <p className="font-josefin text-[14px] leading-relaxed drop-shadow">{c.thanks.text}</p>
                <p className="font-pinyon text-[34px] mt-3 drop-shadow-lg">
                  {c.families.fullNames[0]} <span className="font-upright text-[26px]">&amp;</span> {c.families.fullNames[1]}
                </p>
              </Reveal>
            </div>
          </section>
        </main>
      </CurtainContext.Provider>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* ---------- Mẫu 07: xanh rêu nhạt + giấy kem xé mép (Nắng Wedding) ---------- */

const G7 = "#3b520d";
const SAGE = "#5d6b41";
const PAPER = "#f5f4ef";
const RUST = "#b5532a";

/** Đa giác mép giấy xé theo px (clip-path), dùng được với mọi chiều cao */
function tornClip(seed) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts = [];
  for (let x = 0; x <= 100; x += 2 + rand() * 3) pts.push(`${x.toFixed(1)}% ${(rand() * 5).toFixed(1)}px`);
  for (let y = 4; y <= 96; y += 5 + rand() * 6) pts.push(`calc(100% - ${(rand() * 5).toFixed(1)}px) ${y.toFixed(1)}%`);
  for (let x = 100; x >= 0; x -= 2 + rand() * 3) pts.push(`${x.toFixed(1)}% calc(100% - ${(rand() * 5).toFixed(1)}px)`);
  for (let y = 96; y >= 4; y -= 5 + rand() * 6) pts.push(`${(rand() * 5).toFixed(1)}px ${y.toFixed(1)}%`);
  return `polygon(${pts.join(",")})`;
}

/** Tấm giấy kem mép xé có đổ bóng */
function PaperCard({ seed = 1, className = "", children }) {
  const clip = useMemo(() => tornClip(seed), [seed]);
  return (
    <div style={{ filter: "drop-shadow(0 3px 5px rgba(60,60,40,.28))" }}>
      <div className={`relative ${className}`} style={{ background: "#efeee9", clipPath: clip }}>
        {children}
      </div>
    </div>
  );
}

function useCountdown(target) {
  const calc = () => Math.max(0, target - Date.now());
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

function Countdown07({ target }) {
  const parts = useCountdown(target);
  const labels = ["Days", "Hours", "Minutes", "Seconds"];
  return (
    <div className="flex items-start justify-center gap-2" style={{ color: G7 }}>
      {parts.map((v, i) => (
        <React.Fragment key={labels[i]}>
          {i > 0 && <span className="font-hepta text-[34px] leading-[1.15]">:</span>}
          <div className="w-[62px] text-center">
            <p className="font-hepta text-[38px] leading-none tabular-nums">{String(v).padStart(2, "0")}</p>
            <p className="font-hepta text-[13px] text-black/80 mt-1">{labels[i]}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function Title07({ children, className = "" }) {
  return <h2 className={`font-sig text-[44px] leading-tight text-center ${className}`} style={{ color: G7 }}>{children}</h2>;
}

function Event07({ item, mapLabel, seed }) {
  return (
    <PaperCard seed={seed} className="px-6 pt-9 pb-9 text-center">
      <p className="font-hepta font-bold text-[21px] uppercase" style={{ color: G7 }}>{item.title}</p>
      <p className="font-hepta text-[16px] mt-2 text-black/75">{item.time}</p>
      <p className="font-hepta font-bold text-[30px] mt-1" style={{ color: G7 }}>{item.date}</p>
      <p className="font-hepta italic text-[13px] mt-1 text-black/60">{item.lunar}</p>
      {item.places.map((place) => (
        <div key={place.label} className="mt-5">
          <p className="font-hepta font-bold text-[17px] uppercase text-black/80">{place.label}</p>
          <p className="font-hepta text-[14px] mt-1 px-1 text-black/70">{place.address}</p>
          <a
            href={mapUrl(place.mapQuery ?? place.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full px-8 py-2 font-hepta font-bold text-[14px] uppercase text-white shadow"
            style={{ background: SAGE }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
              <path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
            </svg>
            {mapLabel}
          </a>
        </div>
      ))}
      <p className="font-sig text-[27px] mt-6" style={{ color: G7 }}>Rất hân hạnh được đón tiếp !</p>
    </PaperCard>
  );
}

function WeddingPage07() {
  const c = content;
  const guest = useGuestName(c.invitation.defaultGuest);
  const [first, second] = c.hero.names;
  const [dd, mm, yy] = c.invitation.dateParts;
  const [giftOpen, setGiftOpen] = useState(false);
  const closeGift = useCallback(() => setGiftOpen(false), []);
  const firstEvent = c.events.items[0];
  const target = useMemo(() => {
    const t = firstEvent.time.match(/(\d{1,2}):(\d{2})/);
    return new Date(`${c.calendar.dateIso ?? "2026-01-01"}T${t ? `${t[1].padStart(2, "0")}:${t[2]}` : "00:00"}:00+07:00`).getTime();
  }, [firstEvent, c.calendar.dateIso]);
  const photoOf = (side) => (side.label === "Nhà Trai" ? images.groom : images.bride);
  const [sideA, sideB] = c.families.sides;

  return (
    <div className="min-h-screen bg-[#dcdad0] font-hepta">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <main className="relative mx-auto max-w-[460px] overflow-hidden shadow-2xl" style={{ background: PAPER }}>
        {/* Ảnh đầu + tên + ngày */}
        <section className="relative">
          <div className="relative overflow-hidden rounded-b-[28px]">
            <img src={images.hero} alt={`${first} & ${second}`} className="w-full aspect-[3/4.7] object-cover object-[60%_top]" />
            <div className="absolute inset-[6px] rounded-b-[24px] rounded-t-sm border border-white/80 pointer-events-none" />
          </div>
          {/* Con dấu 囍, thẻ tên và ba hình thoi ngày-tháng-năm nằm thẳng một trục */}
          <div className="absolute right-[7%] top-[27%] w-[104px] flex flex-col items-center">
            <div className="w-[62px] h-[62px] rounded-lg flex items-center justify-center shadow" style={{ background: RUST, color: "#ffe8d1" }}>
              <span className="text-[40px] leading-none" style={{ fontFamily: '"Noto Serif SC", "Songti SC", serif' }}>囍</span>
            </div>
            <div className="mt-4 w-full rounded-[22px] border border-white/90 py-5 text-center text-white" style={{ background: SAGE }}>
              <Reveal variant="down">
                <p className="font-sig text-[34px] leading-[1.05]">{first.split(" ").map((w, i) => <span key={i} className="block">{w}</span>)}</p>
                <p className="text-[13px] my-2 leading-none">●</p>
                <p className="font-sig text-[34px] leading-[1.05]">{second.split(" ").map((w, i) => <span key={i} className="block">{w}</span>)}</p>
              </Reveal>
            </div>
            <div className="mt-2 flex flex-col items-center -space-y-1.5">
              {[dd, mm, yy].map((v) => (
                <div key={v} className="w-[40px] h-[40px] rotate-45 flex items-center justify-center rounded-[3px] shadow-md" style={{ background: RUST }}>
                  <span className="-rotate-45 font-hepta text-[14px]" style={{ color: "#ffe8d1" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Đếm ngược */}
        <section className="px-4 pt-10">
          <Reveal variant="zoom">
            <Title07>Our wedding day</Title07>
          </Reveal>
          <Reveal variant="up" className="mt-2">
            <PaperCard seed={5} className="py-6">
              <Countdown07 target={target} />
            </PaperCard>
          </Reveal>
        </section>

        {/* Save the date */}
        <section className="px-4 pt-10">
          <Reveal variant="up">
            <div className="relative overflow-hidden rounded-[26px] aspect-[4/5] text-white" style={{ background: "#33422a" }}>
              <img src={images.couple} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
              <div className="absolute left-6 top-6">
                <p className="font-sig text-[40px] leading-none">Save</p>
                <p className="font-hepta text-[30px] leading-none text-white/70 ml-4">The</p>
                <p className="font-sig text-[46px] leading-none">Date</p>
                <p className="font-hepta text-[17px] mt-3 tracking-wider">{c.hero.dateLine}</p>
              </div>
              <img src={images.bride} alt="" className="absolute right-4 top-4 w-[40%] aspect-[3/4] rounded-[22px] object-cover border border-white/60" loading="lazy" />
            </div>
          </Reveal>
        </section>

        {/* Lời mời + sự kiện */}
        <section className="px-4 pt-12 text-center">
          <Reveal>
            <p className="font-hepta font-bold text-[15px] uppercase" style={{ color: G7 }}>{c.invitation.kicker}</p>
            <p className="font-guest text-[38px] text-[#8b0000] mt-1 pb-1 border-b border-dotted border-black/30 mx-10">{guest}</p>
            <p className="font-hepta text-[15px] uppercase mt-4 px-4" style={{ color: G7 }}>{c.invitation.title}</p>
          </Reveal>
          <div className="mt-8 space-y-7">
            {c.events.items.map((item, i) => (
              <Reveal key={item.id} variant="up">
                <Event07 item={item} mapLabel={c.events.mapLabel} seed={11 + i * 7} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Hai bên gia đình */}
        <section className="px-4 pt-14">
          <Reveal variant="zoom">
            <Title07>Wedding of</Title07>
          </Reveal>
          <div className="relative mt-4 grid grid-cols-2 gap-4 items-start">
            {[sideA, sideB].map((side, i) => (
              <Reveal key={side.label} variant={i ? "right" : "left"} className={i ? "mt-14" : ""}>
                <img src={photoOf(side)} alt={side.label} className="w-full aspect-[3/4] rounded-[22px] object-cover" loading="lazy" />
                <div className={`mt-4 flex gap-3 ${i ? "flex-row-reverse text-right" : "text-left"}`}>
                  <span className="mt-1 w-px self-stretch" style={{ background: G7 }} />
                  <div>
                    <p className="font-hepta font-bold text-[16px] uppercase" style={{ color: G7 }}>{side.label}</p>
                    {side.father && <p className="font-hepta text-[14px] mt-1 text-black/75">Ông: {side.father}</p>}
                    {side.mother && <p className="font-hepta text-[14px] text-black/75">Bà: {side.mother}</p>}
                    {side.address && <p className="font-hepta text-[13px] mt-1 text-black/60">{side.address}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Our Memories + album */}
        <section className="px-4 pt-14">
          <Reveal variant="zoom">
            <Title07>Our Memories</Title07>
          </Reveal>
          <Reveal variant="up" className="mt-2">
            <PaperCard seed={23} className="px-6 py-6 text-center">
              <p className="font-hepta text-[14px] leading-relaxed text-black/70">
                Mỗi trang album là một chương nhỏ của câu chuyện tình yêu, được viết bằng những ánh mắt, nụ cười và những lần nắm tay thật chặt.
              </p>
            </PaperCard>
          </Reveal>
          <div className="grid grid-cols-2 gap-2.5 mt-6">
            {images.album.map((src, i) => (
              <Reveal key={i} variant={i % 2 ? "right" : "left"} className={i % 2 ? "mt-8" : ""}>
                <img src={src} alt="" className="w-full aspect-[2/3] rounded-[20px] object-cover" loading="lazy" />
              </Reveal>
            ))}
          </div>
          <Reveal variant="zoom">
            <Title07 className="mt-6">Forever</Title07>
          </Reveal>
        </section>

        {/* RSVP / mừng cưới (ẩn nếu không bật) */}
        {(c.rsvp.show || c.gift.accounts.length > 0) && (
          <section className="px-6 pt-10 text-center">
            {c.rsvp.show && (
              <Reveal className="mb-6">
                <RsvpForm c={c.rsvp} />
              </Reveal>
            )}
            {c.gift.accounts.length > 0 && (
              <Reveal>
                <button
                  type="button"
                  onClick={() => setGiftOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full px-9 py-2.5 font-hepta text-[15px] uppercase text-white shadow-lg"
                  style={{ background: SAGE }}
                >
                  <Gift className="w-5 h-5" aria-hidden />
                  {c.gift.button}
                </button>
              </Reveal>
            )}
          </section>
        )}

        {/* Thank you */}
        <section className="relative mt-10 overflow-hidden">
          <img src={images.thankYou} alt="" className="w-full aspect-[3/4] object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b3a1c] via-[#2b3a1c]/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <Reveal variant="up" className="px-5 pb-12 text-center text-white">
              <p className="font-hepta text-[14px] leading-relaxed drop-shadow">{c.thanks.text}</p>
              <h2 className="font-sig text-[52px] mt-2 drop-shadow-lg">{c.thanks.title}!</h2>
              <p className="font-sig text-[30px] drop-shadow-lg">
                {c.families.fullNames[0]} <span className="font-upright text-[24px]">&amp;</span> {c.families.fullNames[1]}
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

const PAGES = { "01": WeddingPage, "06": WeddingPage06, "07": WeddingPage07 };
const Page = PAGES[content.template] ?? WeddingPage;

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(<Page />);
