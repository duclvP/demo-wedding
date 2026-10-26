import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, Copy, Download, Gift, Volume2, VolumeX, X } from "lucide-react";
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

/** Màn mở thiệp xanh rêu, tách sang hai bên khi khách chạm — cú chạm này cũng mở khóa nhạc nền */
function OpeningCurtain({ onOpen, onDone, initials }) {
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
        className={`absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700 ${
          opening ? "scale-50 opacity-0" : ""
        }`}
      >
        <Lily className="w-44 -mb-6 drop-shadow-lg" />
        <button type="button" className="seal animate-pulse-soft" aria-label="Mở thiệp">
          <span className="font-script text-[44px] leading-none text-primary whitespace-nowrap">{initials}</span>
        </button>
        <p className="mt-5 font-lora text-sm tracking-[0.3em] uppercase text-white/90 drop-shadow">Chạm để mở thiệp</p>
      </div>
    </div>
  );
}

/* ---------- Họa tiết trang trí (SVG vẽ tay, không cần file ảnh) ---------- */

/** Một bông ly trắng 6 cánh */
function LilyBloom({ x, y, r = 1, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path
          key={a}
          transform={`rotate(${a})`}
          d="M0 0 C 7 -8 8 -24 0 -36 C -8 -24 -7 -8 0 0 Z"
          fill="#fbfaf3"
          stroke="#c9d3bd"
          strokeWidth="1"
        />
      ))}
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={`v${a}`} transform={`rotate(${a})`} d="M0 -4 L0 -28" stroke="#dfe6d3" strokeWidth="1" />
      ))}
      {[20, 80, 140, 200, 260, 320].map((a) => (
        <g key={`s${a}`} transform={`rotate(${a})`}>
          <path d="M0 0 L0 -16" stroke="#8a9a5b" strokeWidth="0.9" />
          <ellipse cx="0" cy="-17" rx="1.6" ry="3" fill="#8b4a2b" />
        </g>
      ))}
      <circle r="3" fill="#e7edc9" />
    </g>
  );
}

/** Cành ly trắng + lá — thay cho ảnh hoa của mẫu */
function Lily({ className = "", flip = false }) {
  return (
    <svg viewBox="0 0 200 160" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <g fill="#5d7a48" stroke="#41582f" strokeWidth="0.8">
        <path d="M20 150 C 60 120 110 110 190 118 C 120 122 70 132 20 150 Z" />
        <path d="M30 152 C 40 110 70 80 92 70 C 74 92 52 120 30 152 Z" />
        <path d="M60 140 C 90 128 120 98 128 70 C 116 100 92 124 60 140 Z" opacity="0.85" />
        <path d="M10 120 C 30 110 52 112 70 124 C 50 118 30 118 10 120 Z" opacity="0.8" />
      </g>
      <path d="M24 150 C 70 120 100 90 120 50" stroke="#4d6a3a" strokeWidth="2" fill="none" />
      <path d="M70 118 C 60 90 62 66 70 44" stroke="#4d6a3a" strokeWidth="1.6" fill="none" />
      <LilyBloom x={120} y={50} r={1.05} rot={10} />
      <LilyBloom x={70} y={46} r={0.85} rot={-15} />
      <LilyBloom x={160} y={104} r={0.7} rot={40} />
      <ellipse cx="40" cy="100" rx="5" ry="13" transform="rotate(-30 40 100)" fill="#eef2e2" stroke="#b6c4a3" />
      <ellipse cx="150" cy="78" rx="4" ry="11" transform="rotate(35 150 78)" fill="#eef2e2" stroke="#b6c4a3" />
    </svg>
  );
}

/** Trái tim vẽ một nét (quanh ngày cưới trên lịch, cạnh tên) */
function HeartDoodle({ className = "" }) {
  return (
    <svg viewBox="0 0 64 70" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M32 58 C 10 44 2 30 6 18 C 10 6 26 4 32 18 C 38 4 56 6 59 18 C 62 32 50 46 32 58 Z" />
      <path d="M32 58 C 30 62 34 64 31 69" />
    </svg>
  );
}

/** Thẻ ảnh bo góc, chân ảnh mờ trắng + vai trò (script) + tên (serif) */
function PortraitCard({ src, role, name, className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] shadow-[0_10px_30px_rgba(65,94,52,0.35)] ${className}`}>
      <img src={src} alt={`${role} ${name}`} className="w-full aspect-[4/5] object-cover object-top" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 via-35% to-transparent" />
      <div className="absolute inset-x-0 bottom-4 text-center">
        <p className="font-script text-4xl text-white drop-shadow-[0_1px_3px_rgba(65,94,52,0.9)]">{role}</p>
        <p className="font-date text-[28px] uppercase text-white -mt-1 drop-shadow-[0_1px_4px_rgba(65,94,52,0.9)]">{name}</p>
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
      <h3 className="font-oswald text-[17px] uppercase tracking-wide text-[#8fa486] mb-1">{side.label}</h3>
      {side.father && (
        <p className="font-oswald font-medium text-[15px] uppercase text-[#8fa486]">Bố: {side.father}</p>
      )}
      {side.mother && (
        <p className="font-oswald font-medium text-[15px] uppercase text-[#8fa486]">Mẹ: {side.mother}</p>
      )}
      {side.address && <p className="text-[13px] text-foreground/55 leading-relaxed mt-2">{side.address}</p>}
    </div>
  );
}

function EventCard({ item, mapLabel }) {
  return (
    <div className="rounded-[28px] bg-[#e3e6e1]/90 px-5 py-6 text-center text-primary shadow-[0_6px_20px_rgba(65,94,52,0.12)]">
      <h3 className="font-lora uppercase text-[22px] text-[#8fa486] mb-3">{item.title}</h3>
      <p className="font-lora uppercase text-[15px] mb-1">
        Được tổ chức vào lúc <b>{item.time}</b>
      </p>
      <p className="font-lora font-bold text-2xl mb-1">{item.date}</p>
      <p className="italic text-sm text-primary/80 mb-4">{item.lunar}</p>
      <div className="space-y-5">
        {item.places.map((place) => (
          <div key={place.label}>
            <p className="font-lora font-bold uppercase text-lg">{place.label}</p>
            <p className="text-[13px] text-primary/85 mb-3">{place.address}</p>
            <a
              href={mapUrl(place.mapQuery ?? place.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-primary px-10 py-1.5 font-lora uppercase text-white text-base shadow transition hover:scale-105"
            >
              {mapLabel}
            </a>
          </div>
        ))}
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
    <div className="text-center">
      <h2 className="font-script text-[44px] leading-tight text-primary mb-4">{c.title}</h2>
      <div className="grid grid-cols-4 gap-2.5">
        {parts.map((v, i) => (
          <div key={c.labels[i]} className="rounded-2xl bg-primary text-white py-3 shadow-lg shadow-primary/25">
            <p className="font-lora font-semibold text-3xl leading-none lining-nums tabular-nums">{String(v).padStart(2, "0")}</p>
            <p className="font-lora text-xs uppercase mt-1.5 opacity-90">{c.labels[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Lịch tháng chữ trắng trên nền xanh, ngày cưới khoanh trái tim vẽ tay */
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
    <div className="text-white">
      <p className="text-center font-script text-[40px] mb-5">
        {MONTHS_EN[m - 1]} {y}
      </p>
      <div className="grid grid-cols-7 text-center font-display text-lg mb-3">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-3 text-center font-display text-lg">
        {cells.map((day, i) =>
          day === d ? (
            <span key={i} className="relative flex items-center justify-center h-10">
              <HeartDoodle className="absolute w-14 h-16 -top-2 text-white animate-pulse-soft" />
              <span className="relative font-bold">{day}</span>
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
    if (!c.endpoint || !c.coupleId) {
      console.warn("Chưa cấu hình rsvp.endpoint / rsvp.coupleId trong content.js — lời chúc không được lưu.", form);
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
          couple: c.coupleId,
          coupleName: c.coupleName || "",
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
            <HeartDoodle className="w-12 h-12 text-primary" />
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
  /** opened: màn mở bắt đầu tách ra; curtainGone: đã tách xong, gỡ khỏi trang */
  const [opened, setOpened] = useState(false);
  const [curtainGone, setCurtainGone] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);
  const handleCurtainDone = useCallback(() => setCurtainGone(true), []);
  const [first, second] = c.hero.names;
  const initials = `${first.split(" ").pop()[0]} & ${second.split(" ").pop()[0]}`;
  /** Bản nhà gái: thẻ cô dâu trước */
  const cards = c.families.sides[0].label === "Nhà Gái" ? [c.couple.bride, c.couple.groom] : [c.couple.groom, c.couple.bride];
  const cardImg = (who) => (who === c.couple.bride ? images.bride : images.groom);

  return (
    <div className="min-h-screen bg-[#e9ece6] text-foreground font-sans">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects active={opened} />
      {!curtainGone && <OpeningCurtain onOpen={handleOpen} onDone={handleCurtainDone} initials={initials} />}

      <CurtainContext.Provider value={opened}>
      <main className="paper relative mx-auto max-w-[460px] overflow-hidden shadow-2xl">
        {/* Bìa: ảnh mờ dần vào nền xanh, tên viết tay, Save The Date + lịch */}
        <section className="relative bg-primary text-white">
          <div className="relative">
            <img src={images.hero} alt={`${first} & ${second}`} className="w-full aspect-[3/4.4] object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-40% to-primary" />
            <Lily className="absolute -right-6 -top-4 w-40 rotate-[200deg] opacity-95" flip />
            {/* Tên đè lên phần váy, xa mặt: tên trước lệch trái-trên, tên sau lệch phải-dưới */}
            <div className="absolute inset-x-0 bottom-[30%]">
              <Reveal variant="left">
                <p className="font-script text-[clamp(50px,16vw,70px)] leading-none -rotate-[16deg] ml-5 whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                  {first}
                </p>
              </Reveal>
            </div>
            <div className="absolute right-[14%] bottom-[24%]">
              <Reveal variant="zoom" delay={250}>
                <HeartDoodle className="w-12 h-12 text-white -rotate-12" />
              </Reveal>
            </div>
            <div className="absolute inset-x-0 bottom-[6%]">
              <Reveal variant="right" delay={200}>
                <p className="font-script text-[clamp(50px,16vw,70px)] leading-none -rotate-[16deg] text-right mr-6 whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                  {second}
                </p>
              </Reveal>
            </div>
          </div>
          <div className="px-6 pb-4 pt-6 text-center">
            <Reveal>
              <h1 className="font-date text-[36px] uppercase tracking-wide">{c.hero.subtitle}</h1>
            </Reveal>
            {c.calendar.dateIso && (
              <Reveal variant="up" delay={150} className="mt-2">
                <MonthCalendar dateIso={c.calendar.dateIso} />
              </Reveal>
            )}
          </div>
          <div className="relative h-56">
            <Lily className="absolute -left-4 bottom-0 w-64" />
            <p className="absolute right-8 top-6 font-script text-[42px] leading-[1.05] text-center">
              Our wedding
              <br />
              day
            </p>
            <div className="absolute inset-x-0 -bottom-px h-10 bg-gradient-to-b from-transparent to-[#f5f5f3]" />
          </div>
        </section>

        <div className="px-6">
          {/* Thẻ ảnh cô dâu / chú rể */}
          <section className="pt-10 pb-6">
            <Reveal variant="left">
              <PortraitCard src={cardImg(cards[0])} role={cards[0].role} name={cards[0].name} className="-rotate-2 mr-6" />
            </Reveal>
            <Reveal variant="right" className="-mt-6">
              <PortraitCard src={cardImg(cards[1])} role={cards[1].role} name={cards[1].name} className="rotate-[8deg] ml-10 mt-10" />
            </Reveal>
          </section>

          {/* Lời mời + gia đình */}
          <section className="pt-6 pb-8 text-center text-primary">
            <Reveal>
              <p className="font-lora font-semibold uppercase text-lg">{c.invitation.kicker}</p>
              <p className="font-guest text-[40px] text-[#b0262f] leading-tight mt-1 pb-0.5 border-b border-primary/40 mx-10">{guest}</p>
              <p className="font-lora font-semibold uppercase text-lg mt-2">{c.invitation.title}</p>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {c.families.sides.map((side, i) => (
                <Reveal key={side.label} variant={i ? "right" : "left"}>
                  <FamilySide side={side} />
                </Reveal>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-8 -mx-3">
              {images.dateStrip.map((src, i) => (
                <Reveal key={i} variant="up" delay={i * 150} className="relative border-[3px] border-[#e8d5d5] overflow-hidden">
                  <img src={src} alt="" className="w-full aspect-[3/4.4] object-cover object-top" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 inset-x-0 text-center font-lora font-bold text-[28px] text-white/90">
                    {c.invitation.dateParts[i]}
                  </span>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Sự kiện */}
          <section className="space-y-4 pb-10">
            {c.events.items.map((item, i) => (
              <Reveal key={item.id} variant={i % 2 ? "right" : "left"}>
                <EventCard item={item} mapLabel={c.events.mapLabel} />
              </Reveal>
            ))}
          </section>

          {/* Ảnh dán băng keo */}
          <section className="pb-12">
            <Reveal variant="zoom" className="relative bg-white p-3.5 pb-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)] -rotate-1">
              <span className="absolute left-1/2 -top-4 h-9 w-36 -translate-x-1/2 rotate-[-4deg] bg-[#efd9cf]/85 shadow-sm" aria-hidden />
              <img src={images.polaroid} alt="" className="w-full aspect-[4/5] object-cover object-top" loading="lazy" />
            </Reveal>
          </section>

          {/* Đếm ngược */}
          {c.countdown && (
            <section className="pb-12">
              <Reveal variant="zoom">
                <Countdown c={c.countdown} />
              </Reveal>
            </section>
          )}

          {/* Xác nhận + ảnh tròn + mừng cưới */}
          <section className="pb-12 text-center">
            {c.rsvp.show && (
              <Reveal className="mb-10">
                <RsvpForm c={c.rsvp} />
              </Reveal>
            )}
            <Reveal variant="zoom" className="relative mx-auto w-52 h-52">
              <div className="absolute inset-0 rounded-full border-[6px] border-white shadow-[0_8px_24px_rgba(65,94,52,0.35)] overflow-hidden">
                <img src={images.circle} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <Lily className="absolute -left-10 -bottom-6 w-28" />
              <Lily className="absolute -right-10 -top-6 w-24 rotate-180" />
            </Reveal>
            {c.gift.accounts.length > 0 && (
              <Reveal className="mt-8">
                <button
                  type="button"
                  onClick={() => setGiftOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-2.5 font-lora font-semibold uppercase text-white shadow-lg shadow-primary/30 animate-pulse-soft"
                >
                  <Gift className="w-5 h-5" aria-hidden />
                  {c.gift.button}
                </button>
              </Reveal>
            )}
          </section>
        </div>

        {/* Album of Love */}
        <section className="pb-3">
          <Reveal variant="left" className="bg-primary text-white px-6 py-5">
            <p className="font-date text-[44px] uppercase leading-none">Album</p>
            <p className="text-right font-date text-[44px] uppercase leading-none mt-1">
              <span className="font-script normal-case text-[52px] mr-3">of</span>Love
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-1.5 px-2 mt-2">
            {images.album.map((src, i) => (
              <Reveal key={i} variant={i % 2 ? "right" : "left"} className="border-2 border-white shadow">
                <img src={src} alt="" className="w-full aspect-[2/3] object-cover" loading="lazy" />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Thank you */}
        <section className="relative overflow-hidden">
          <img src={images.thankYou} alt="" className="w-full aspect-[3/4] object-cover object-top" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 via-35% to-transparent" />
          {/* Định vị ở lớp ngoài — Reveal quan sát lớp bọc của nó, lớp đó phải có chiều cao thật */}
          <div className="absolute inset-x-0 bottom-0">
            <Reveal variant="up" className="px-6 pb-14 text-center text-white">
              <h2 className="font-script text-7xl mb-3 drop-shadow-lg">{c.thanks.title}</h2>
              <p className="text-sm leading-relaxed drop-shadow">{c.thanks.text}</p>
              <p className="font-script text-4xl mt-4 drop-shadow-lg">
                {c.families.fullNames[0]} &amp; {c.families.fullNames[1]}
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

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
