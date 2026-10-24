import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  MapPin,
  Pointer,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { content } from "./content.js";
import { images } from "./image.js";
import "./index.css";
import GuestLinksPage, { isGuestLinksPage } from "./GuestLinks.jsx";

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
  /** Không chạy hiệu ứng khi phong bì còn che — tránh phần đầu thiệp "diễn" trước khi khách thấy */
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

/* ---------- Họa tiết trang trí (CSS / SVG vẽ tay, không cần file ảnh) ---------- */

/** Hạt ngọc trai */
function Pearl({ size = 14, className = "", style }) {
  return <span className={`pearl ${className}`} style={{ width: size, height: size, ...style }} aria-hidden />;
}

/** Chuỗi ngọc trai rủ xuống, hạt nhỏ dần */
function PearlString({ count = 12, from = 9, to = 5, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-[2px] ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Pearl key={i} size={from - ((from - to) * i) / Math.max(1, count - 1)} />
      ))}
    </div>
  );
}

/** Hoa trắng năm cánh, nhụy ngọc trai */
function Flower({ size = 64, className = "", style }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="petal" cx="50%" cy="85%" r="90%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f6f2f3" />
          <stop offset="100%" stopColor="#d9cfd3" />
        </radialGradient>
        <radialGradient id="core" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#efe4ea" />
          <stop offset="100%" stopColor="#bba5b1" />
        </radialGradient>
      </defs>
      <g style={{ filter: "drop-shadow(0 2px 2px rgba(80,40,50,.25))" }}>
        {[0, 72, 144, 216, 288].map((r) => (
          <path
            key={r}
            transform={`rotate(${r} 50 50)`}
            d="M50 50 C30 38 30 10 50 6 C70 10 70 38 50 50 Z"
            fill="url(#petal)"
            stroke="#e3d9dd"
            strokeWidth="1"
          />
        ))}
        <circle cx="50" cy="50" r="11" fill="url(#core)" />
      </g>
    </svg>
  );
}

/** Dấu sáp vàng viền gợn sóng, hoa ở giữa */
function WaxSeal({ className = "" }) {
  const bumps = 14;
  const d = Array.from({ length: bumps * 2 }, (_, i) => {
    const a = (Math.PI * i) / bumps;
    const r = i % 2 ? 44 : 48;
    return `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="wax" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#f6dc8c" />
          <stop offset="45%" stopColor="#c9952f" />
          <stop offset="100%" stopColor="#7d5410" />
        </radialGradient>
      </defs>
      <path d={`${d} Z`} fill="url(#wax)" style={{ filter: "drop-shadow(0 3px 3px rgba(0,0,0,.35))" }} />
      <circle cx="50" cy="50" r="33" fill="none" stroke="#8a5d15" strokeWidth="1.5" opacity=".7" />
      <g fill="none" stroke="#7a520f" strokeWidth="2" strokeLinecap="round" opacity=".85">
        {[0, 60, 120, 180, 240, 300].map((r) => (
          <path key={r} transform={`rotate(${r} 50 50)`} d="M50 50 C44 42 44 32 50 28 C56 32 56 42 50 50" />
        ))}
        <circle cx="50" cy="50" r="4" />
      </g>
    </svg>
  );
}

/* ---------- Màn phong bì ---------- */

function Envelope({ c, guest, onOpen, onDone }) {
  const [opening, setOpening] = useState(false);

  const open = useCallback(() => {
    setOpening((was) => {
      if (!was) onOpen();
      return true;
    });
  }, [onOpen]);

  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [opening, onDone]);

  return (
    <div
      className={`paper fixed inset-0 z-[160] mx-auto flex max-w-[460px] flex-col items-center overflow-hidden px-6 pt-[8vh] transition-[opacity,transform] duration-1000 delay-1000 ${
        opening ? "pointer-events-none scale-105 opacity-0" : ""
      }`}
      onClick={open}
    >
      <p className="font-display text-[26px] uppercase text-hime">{c.kicker}</p>
      <p className="mt-6 w-full border-b border-dotted border-hime pb-2 text-center font-names text-[38px] leading-tight text-hime">
        {guest}
      </p>

      <div className="relative mt-[10vh] w-[82%]">
        <div className={`envelope ${opening ? "is-open" : ""}`}>
          <div className="envelope-flap" />
        </div>
        <button
          type="button"
          aria-label="Mở thiệp"
          className={`absolute left-1/2 top-[52%] w-[30%] -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
            opening ? "scale-75 opacity-0" : "animate-pulse-soft"
          }`}
        >
          <WaxSeal className="w-full" />
          <Pointer className="absolute -bottom-2 -right-3 h-9 w-9 text-white drop-shadow animate-tap" aria-hidden />
        </button>
        {/* Hoa & chuỗi ngọc hai góc */}
        <div className="absolute -left-6 -top-4 flex flex-col items-center">
          <Flower size={70} />
          <Flower size={46} className="-mt-3 ml-8" />
          <PearlString count={14} className="-mt-1 -ml-4" />
        </div>
        <div className="absolute -right-5 -top-6 flex flex-col items-center">
          <div className="flex items-end">
            <Flower size={66} />
            <Flower size={40} className="-ml-2 -mt-6" />
          </div>
          <Flower size={40} className="-mt-2 ml-6" />
          <div className="flex gap-2">
            <PearlString count={18} />
            <PearlString count={22} from={8} to={4} />
          </div>
        </div>
      </div>

      <p className="mt-[9vh] font-display text-[30px] text-hime">{c.dateLine}</p>
      <p className="mt-2 font-display text-xs uppercase tracking-[0.3em] text-hime/60">{c.hint}</p>
    </div>
  );
}

/* ---------- Các khối nội dung ---------- */

function FamilySide({ side, c, align }) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <h3 className="mb-1 font-display text-[15px] font-bold uppercase text-hime">{side.label}</h3>
      {side.father && <p className="font-display text-[15px] text-hime">{c.fatherLabel}: {side.father}</p>}
      {side.mother && <p className="font-display text-[15px] text-hime">{c.motherLabel}: {side.mother}</p>}
      {side.address && <p className="mt-2 font-display text-[14px] leading-snug text-hime/90">{side.address}</p>}
    </div>
  );
}

function EventRow({ item, mapLabel, flip }) {
  const details = (
    <div className={`min-w-0 flex-1 font-display text-[15px] leading-relaxed text-hime ${flip ? "text-right" : "text-left"}`}>
      <p className="uppercase">{item.time}</p>
      <p>{item.date}</p>
      <p className="whitespace-nowrap text-[13px] italic text-hime/70">{item.lunar}</p>
      <p>{item.place}</p>
      <p className="text-[13px] text-hime/75">{item.address}</p>
    </div>
  );
  const map = (
    <a
      href={mapUrl(item.mapQuery ?? item.address)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 flex-col items-center gap-2 whitespace-nowrap font-elegant text-[16px] font-semibold uppercase text-hime transition hover:scale-105"
    >
      <MapPin className="h-8 w-8 animate-bob fill-hime text-hime [&>circle]:fill-white [&>circle]:stroke-white" aria-hidden />
      {mapLabel}
    </a>
  );
  return (
    <div>
      <div className={`flex items-center gap-3 ${flip ? "flex-row-reverse" : ""}`}>
        <span className="h-px flex-1 bg-hime/70" />
        <h3 className="font-elegant text-[24px] uppercase leading-none text-hime">{item.title}</h3>
      </div>
      <div className={`mt-4 flex items-center justify-between gap-4 ${flip ? "flex-row-reverse" : ""}`}>
        {details}
        {map}
      </div>
    </div>
  );
}

function useCountdown(targetIso) {
  const target = new Date(targetIso).getTime();
  const calc = () => Math.max(0, target - Date.now());
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

function Countdown({ c }) {
  const parts = useCountdown(c.target);
  return (
    <div className="text-center text-white">
      <h2 className="font-elegant text-[30px] uppercase tracking-wide">{c.title}</h2>
      <div className="mt-2 grid grid-cols-4">
        {parts.map((v, i) => (
          <div key={c.labels[i]}>
            <p className="font-display text-[34px] leading-tight tabular-nums">{String(v).padStart(2, "0")}</p>
            <p className="font-display text-[15px]">{c.labels[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Hàng ngọc trai viền mép khối ảnh */
function PearlRow({ className = "" }) {
  const sizes = [16, 22, 26, 20, 14, 12, 10];
  return (
    <div className={`pointer-events-none absolute flex items-center ${className}`} aria-hidden>
      {sizes.map((s, i) => (
        <Pearl key={i} size={s} className="-ml-1" />
      ))}
    </div>
  );
}

function RsvpForm({ c }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", message: "", attend: "", guestOf: "" });

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!c.endpoint) {
      console.warn("Chưa cấu hình rsvp.endpoint trong content.js — lời nhắn không được lưu.", form);
      setSent(true);
      return;
    }
    setSending(true);
    setError(null);
    try {
      /** Google Apps Script không trả header CORS → gửi no-cors (không đọc được phản hồi) */
      await fetch(c.endpoint, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          name: form.name.trim(),
          message: form.message.trim(),
          attend: !c.askAttend ? "" : form.attend === "yes" ? c.attendYes : c.attendNo,
          guestOf: c.askAttend ? form.guestOf : "",
        }),
      });
      setSent(true);
    } catch {
      setError(c.error);
    } finally {
      setSending(false);
    }
  }

  const box = "w-full rounded-[14px] border border-hime bg-white/60 px-3 py-2.5 font-sans text-[14px] text-hime outline-none placeholder:text-hime/70 focus:ring-2 focus:ring-hime/30";

  return (
    <div>
      <p className="text-center font-display text-[17px] leading-relaxed text-hime">{c.intro}</p>
      {sent ? (
        <p className="py-8 text-center font-display text-lg text-hime">{c.thanks}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={box} />
          <input value={form.message} onChange={update("message")} placeholder={c.placeholders.message} className={box} />
          {c.askAttend && (
            <>
              <div className={`${box} space-y-1`}>
                {[
                  ["yes", c.attendYes],
                  ["no", c.attendNo],
                ].map(([v, label]) => (
                  <label key={v} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="attend"
                      value={v}
                      required
                      checked={form.attend === v}
                      onChange={update("attend")}
                      className="accent-hime"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {c.guestOfOptions.length > 0 && (
              <select
                required
                value={form.guestOf}
                onChange={update("guestOf")}
                className={`${box} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M0 0h12L6 8z' fill='%239e3745'/%3E%3C/svg%3E")] bg-[length:10px] bg-[right_14px_center] bg-no-repeat`}
              >
                <option value="" disabled>
                  {c.placeholders.guestOf}
                </option>
                {c.guestOfOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              )}
            </>
          )}
          {error && <p className="text-center text-sm text-hime">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-[14px] border border-hime bg-white/60 py-2 font-oswald text-[19px] uppercase text-hime transition hover:bg-hime hover:text-white disabled:opacity-70"
          >
            {sending ? c.sending : c.submit}
          </button>
        </form>
      )}
    </div>
  );
}

function GiftModal({ c, account, photo, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={account.button}
        onClick={(e) => e.stopPropagation()}
        className="paper relative max-h-[90vh] w-full max-w-[400px] overflow-y-auto rounded-3xl px-5 pb-6 pt-5 shadow-2xl animate-pop"
      >
        <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-4 text-hime/70 hover:text-hime">
          <X className="h-6 w-6" />
        </button>
        <h2 className="px-6 text-center font-names text-[34px] leading-tight text-hime">{c.title}</h2>
        <p className="text-center font-oswald text-lg uppercase text-hime/80">{account.button}</p>
        <div className="my-4 h-px bg-hime/20" />
        <div className="grid grid-cols-[1fr_1.15fr] items-center gap-3">
          <img src={photo} alt="" className="aspect-[3/4] w-full rounded-2xl border-2 border-white object-cover shadow-lg" />
          <div className="flex flex-col items-center text-center">
            {account.qr && (
              <img
                src={account.qr}
                alt={`Mã QR chuyển khoản ${account.bank} ${account.number}`}
                className="h-36 w-36 rounded-xl border-2 border-hime/70 bg-white p-1.5 shadow-md"
              />
            )}
            <dl className="mt-3 space-y-1 font-display text-[13px] font-bold uppercase text-hime">
              <div><dt className="inline">CTK: </dt><dd className="inline">{account.holder}</dd></div>
              <div><dt className="inline">STK: </dt><dd className="inline tracking-wide">{account.number}</dd></div>
              <div><dt className="inline">NH: </dt><dd className="inline">{account.bank}</dd></div>
            </dl>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-full bg-hime px-4 py-1.5 font-display text-sm text-white shadow transition hover:opacity-90"
              >
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? c.copiedLabel : c.copyLabel}
              </button>
              {account.qr && (
                /** Khách mở thiệp trên chính điện thoại thì không quét được — lưu ảnh rồi chọn trong app ngân hàng */
                <a
                  href={account.qr}
                  download={`QR-${account.bank}-${account.number}.png`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hime/50 px-4 py-1.5 font-display text-sm text-hime transition hover:bg-hime hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  {c.saveQrLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Album: ảnh lớn bên phải, cột ảnh nhỏ bên trái; tự chuyển, vuốt / bấm mũi tên để đổi */
function Album({ list }) {
  const [idx, setIdx] = useState(0);
  const thumbsRef = useRef(null);
  const touchX = useRef(null);
  const go = useCallback((d) => setIdx((i) => (i + d + list.length) % list.length), [list.length]);

  useEffect(() => {
    const t = setInterval(() => document.visibilityState !== "hidden" && go(1), 4000);
    return () => clearInterval(t);
  }, [go, idx]);

  useEffect(() => {
    const box = thumbsRef.current;
    const el = box?.children[idx];
    if (box && el) box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" });
  }, [idx]);

  return (
    <div className="grid grid-cols-[1fr_2.9fr] gap-2">
      <div className="relative">
        <div ref={thumbsRef} className="no-scrollbar absolute inset-0 space-y-2 overflow-y-auto">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIdx(i)}
              className={`block w-full overflow-hidden transition ${i === idx ? "ring-2 ring-hime" : "opacity-80"}`}
            >
              <img src={src} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
        <ChevronUp className="pointer-events-none absolute left-1/2 top-1 h-6 w-6 -translate-x-1/2 text-white drop-shadow" aria-hidden />
      </div>
      <div
        className="relative aspect-[2/3] overflow-hidden"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {list.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <button type="button" aria-label="Ảnh trước" onClick={() => go(-1)} className="absolute left-1 top-1/2 -translate-y-1/2 p-2 text-white drop-shadow">
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button type="button" aria-label="Ảnh sau" onClick={() => go(1)} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-white drop-shadow">
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
}

function WeddingPage() {
  const c = content;
  const guest = useGuestName(c.invitation.defaultGuest);
  const [gift, setGift] = useState(null);
  const closeGift = useCallback(() => setGift(null), []);
  /** opened: phong bì bắt đầu mở; envelopeGone: đã mở xong, gỡ khỏi trang */
  const [opened, setOpened] = useState(false);
  const [envelopeGone, setEnvelopeGone] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);
  const handleEnvelopeDone = useCallback(() => setEnvelopeGone(true), []);
  const [first, second] = c.hero.shortNames;
  const [groomName, brideName] = c.families.fullNames;

  return (
    <div className="min-h-screen bg-[#e9e4df] font-display text-hime">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      {!envelopeGone && <Envelope c={c.envelope} guest={guest} onOpen={handleOpen} onDone={handleEnvelopeDone} />}

      <CurtainContext.Provider value={opened}>
        <main className="paper relative mx-auto max-w-[460px] overflow-hidden shadow-2xl">
          {/* Ảnh bìa */}
          <section className="relative">
            <img src={images.hero} alt={`${groomName} & ${brideName}`} className="aspect-[2/3] w-full object-cover" />
            <div className="hero-fade absolute inset-x-0 bottom-0 h-[45%]" />
            <div className="absolute inset-x-0 bottom-6 text-center">
              <Reveal variant="zoom" delay={300}>
                <p className="font-names text-[64px] leading-none text-hime">
                  {first} <span className="text-[44px]">&amp;</span> {second}
                </p>
              </Reveal>
              <Reveal delay={600}>
                <p className="mt-5 font-display text-[16px] uppercase tracking-[0.45em] text-hime">{c.hero.subtitle}</p>
                <p className="mt-1 font-display text-[20px] tracking-[0.3em] text-hime">{c.hero.dateLine}</p>
              </Reveal>
            </div>
            <Pearl size={22} className="absolute -bottom-3 right-3" />
          </section>

          {/* Gia đình hai bên */}
          <section className="relative px-5 pt-8 text-center">
            <div className="grid grid-cols-2 gap-5">
              {c.families.sides.map((side, i) => (
                <Reveal key={side.label} variant={i ? "right" : "left"}>
                  <FamilySide side={side} c={c.families} align={i ? "left" : "right"} />
                </Reveal>
              ))}
            </div>
            <Pearl size={18} className="absolute left-3 top-2" />
            <Reveal className="mt-8">
              <p className="font-elegant text-[19px] uppercase text-hime">{c.invitation.kicker}</p>
              <p className="mx-6 mt-2 border-b border-dotted border-hime/60 pb-1 font-names text-[38px] leading-tight text-hime">{guest}</p>
              <p className="mt-3 font-elegant text-[19px] uppercase text-hime">{c.invitation.title}</p>
            </Reveal>
            <div className="mx-auto mt-5 h-14 w-px bg-hime/70" />
            <div className="py-6">
              <Reveal variant="left">
                <p className="font-names text-[56px] leading-tight text-hime">{groomName}</p>
              </Reveal>
              <Reveal variant="bounce" delay={300}>
                <p className="font-names text-[40px] leading-none text-hime">&amp;</p>
              </Reveal>
              <Reveal variant="right">
                <p className="font-names text-[56px] leading-tight text-hime">{brideName}</p>
              </Reveal>
            </div>
          </section>

          {/* Ảnh ngang "Nhà Có Hỷ" */}
          <section className="relative">
            <Reveal variant="zoom">
              <div className="relative">
                <img src={images.wide} alt="" className="aspect-[3/2] w-full object-cover object-[50%_25%]" loading="lazy" />
                <p className="hy-text absolute left-3 top-1/2 -translate-y-1/2 font-names text-[54px] leading-[0.95] text-[#c8102e]">
                  {c.invitation.photoText.split(" ").map((w) => (
                    <span key={w} className="block odd:ml-0 even:ml-6">
                      {w}
                    </span>
                  ))}
                </p>
              </div>
            </Reveal>
            <Pearl size={28} className="absolute -bottom-3 left-2" />
          </section>

          {/* Sự kiện */}
          <section className="space-y-10 px-5 py-12">
            {c.events.items.map((item, i) => (
              <Reveal key={item.id} variant={i % 2 ? "right" : "left"}>
                <EventRow item={item} mapLabel={c.events.mapLabel} flip={i % 2 === 1} />
              </Reveal>
            ))}
          </section>

          {/* Happy Wedding + đếm ngược */}
          <section className="relative overflow-hidden px-5 pb-10 pt-12">
            <img src={images.happyBg} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-[6px]" loading="lazy" />
            <div className="absolute inset-0 bg-[#5c5c5c]/55" />
            <PearlRow className="right-0 top-1" />
            <div className="relative">
              <Reveal variant="zoom" className="text-center text-white">
                <p className="font-display text-[32px] leading-none">{c.happy.top}</p>
                <p className="-mt-2 font-names text-[84px] leading-none">{c.happy.script}</p>
              </Reveal>
              <div className="mt-4 grid grid-cols-2 gap-6">
                {images.happyPair.map((src, i) => (
                  <Reveal key={src} variant={i ? "right" : "left"}>
                    <img src={src} alt="" className="aspect-[2/3] w-full object-cover shadow-lg" loading="lazy" />
                  </Reveal>
                ))}
              </div>
              <Reveal>
                <p className="mt-6 text-center font-display text-[13px] italic leading-relaxed text-white">{c.happy.quote}</p>
              </Reveal>
              {c.countdown && (
                <Reveal variant="zoom" className="mt-6">
                  <Countdown c={c.countdown} />
                </Reveal>
              )}
            </div>
            <PearlRow className="bottom-1 left-2 flex-row-reverse" />
          </section>

          {/* Xác nhận + mừng cưới */}
          <section className="relative px-5 pt-10">
            {c.rsvp.show && (
              <Reveal>
                <RsvpForm c={c.rsvp} />
              </Reveal>
            )}
            <div className="mt-4 space-y-3">
              {c.gift.accounts.map((account, i) => (
                <Reveal key={account.number} variant={i % 2 ? "right" : "left"}>
                  <button
                    type="button"
                    onClick={() => setGift(account)}
                    className="w-full rounded-full bg-[#a5404c] py-2 font-oswald text-[24px] uppercase text-white shadow-[0_4px_10px_rgba(120,30,45,.35)] transition hover:scale-[1.02] active:scale-95"
                  >
                    {account.button}
                  </button>
                </Reveal>
              ))}
            </div>
            <Pearl size={30} className="absolute -bottom-10 right-6" />
            <Pearl size={14} className="absolute -bottom-3 right-12" />
          </section>

          {/* Album */}
          <section className="px-3 pt-16">
            <Reveal className="mb-5 text-center">
              <h2 className="font-elegant text-[42px] uppercase leading-none text-hime">{c.album.title}</h2>
              <p className="mt-1 font-elegant text-[26px] uppercase text-hime">{c.album.subtitle}</p>
            </Reveal>
            <Reveal variant="up">
              <Album list={images.album} />
            </Reveal>
          </section>

          {/* Thank you */}
          <section className="px-6 pb-20 pt-6 text-center">
            <Reveal>
              <p className="font-display text-[17px] leading-relaxed tracking-wide text-hime">{c.thanks.text}</p>
              <p className="mt-2 font-names text-[46px] leading-tight text-hime">{c.thanks.title}</p>
              <p className="mt-3 font-names text-[30px] text-hime/80">
                {groomName} &amp; {brideName}
              </p>
            </Reveal>
          </section>
        </main>
      </CurtainContext.Provider>

      {gift && <GiftModal c={c.gift} account={gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
