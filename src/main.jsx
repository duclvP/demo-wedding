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


/**
 * Hiện dần khi cuộn tới — variant: up | down | left | right | zoom | bounce
 * duration: giây (mẫu vé máy bay dùng fadeIn 3–5s, dịch 20–40px)
 */
function Reveal({ as: Tag = "div", variant = "up", delay = 0, duration, className = "", style, children }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

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
   * đẩy ra ngoài khung, nó có thể không bao giờ "giao" với màn hình.
   */
  return (
    <div ref={ref}>
      <Tag
        style={{
          transitionDelay: `${delay}ms`,
          animationDelay: `${delay}ms`,
          ...(duration ? { transitionDuration: `${duration}s` } : null),
          ...style,
        }}
        className={`reveal reveal-${variant} ${seen ? "is-visible" : ""} ${className}`}
      >
        {children}
      </Tag>
    </div>
  );
}

/** Tuyết ❆ và tim ❤ rơi khắp màn hình, giống mẫu lovecard */
const FALLING = [
  { kind: "snowflake", chars: ["❆", "❅"], every: 2500, burst: 6, size: [0.6, 0.5], duration: [15, 5] },
  { kind: "heart", chars: ["❤"], every: 4000, burst: 4, size: [0.8, 0.6], duration: [10, 5] },
];

function FallingEffects() {
  const [items, setItems] = useState([]);

  useEffect(() => {
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
  }, []);

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


/* ---------- Họa tiết mẫu vé máy bay (vẽ lại bằng SVG, không dùng ảnh của trang mẫu) ---------- */

const GOLD = "#a78950";

/** Bản đồ thế giới giản lược (các lục địa bo tròn), màu xám nhạt */
function WorldMap({ className = "", style, fill = "#dcd9d2" }) {
  return (
    <svg viewBox="0 0 1000 520" className={className} style={style} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <g fill={fill} stroke={fill} strokeWidth="18" strokeLinejoin="round">
        {/* Bắc Mỹ + Greenland */}
        <path d="M70,95 L150,70 L235,62 L300,78 L322,108 L296,140 L300,168 L262,196 L236,232 L214,262 L196,276 L178,252 L160,226 L128,206 L104,176 L78,150 L58,120 Z" />
        <path d="M335,40 L392,32 L410,62 L372,96 L340,80 Z" />
        {/* Nam Mỹ */}
        <path d="M232,290 L282,292 L326,320 L340,350 L318,388 L296,424 L282,470 L262,486 L254,450 L250,404 L236,360 L222,320 Z" />
        {/* Châu Âu */}
        <path d="M452,92 L486,72 L530,66 L566,82 L556,112 L534,130 L502,140 L474,136 L458,118 Z" />
        <path d="M430,90 L446,84 L448,104 L432,108 Z" />
        {/* Châu Phi */}
        <path d="M456,178 L506,162 L552,166 L588,196 L604,236 L588,276 L568,316 L548,356 L522,372 L506,340 L496,296 L476,262 L452,236 L444,206 Z" />
        <path d="M612,320 L624,312 L628,344 L614,352 Z" />
        {/* Châu Á */}
        <path d="M570,70 L660,52 L760,50 L852,64 L924,92 L936,120 L904,146 L866,160 L846,196 L816,218 L790,214 L770,240 L748,262 L730,232 L704,226 L680,248 L664,222 L640,196 L612,182 L590,150 L576,112 Z" />
        <path d="M884,170 L902,160 L910,186 L892,204 Z" />
        {/* Đông Nam Á */}
        <path d="M770,268 L812,272 L842,286 L826,298 L784,290 Z" />
        <path d="M850,300 L888,304 L900,318 L862,316 Z" />
        {/* Úc */}
        <path d="M806,350 L862,334 L912,350 L928,386 L902,420 L850,424 L816,402 L800,376 Z" />
        <path d="M952,430 L966,424 L962,452 L948,454 Z" />
      </g>
    </svg>
  );
}

/** Máy bay nhìn từ trên (đặc), mũi hướng lên */
function PlaneIcon({ className = "", style, color = GOLD }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      <path
        fill={color}
        d="M32 2c2.6 0 4 3.4 4 7.5V24l23 13.5v6L36 36.5V49l8 6v4.5L32 56l-12 3.5V55l8-6V36.5L5 43.5v-6L28 24V9.5C28 5.4 29.4 2 32 2z"
      />
    </svg>
  );
}

/** Ghim định vị */
function PinIcon({ className = "", color = GOLD }) {
  return (
    <svg viewBox="0 0 24 34" className={className} aria-hidden>
      <path d="M12 0C5.4 0 0 5.3 0 11.8 0 20.6 12 34 12 34s12-13.4 12-22.2C24 5.3 18.6 0 12 0z" fill={color} />
      <circle cx="12" cy="11.5" r="4.6" fill="#f4f3f1" />
    </svg>
  );
}

/** Quả địa cầu nhỏ giữa hai tên trên hộ chiếu */
function GlobeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="21" fill="#9a7b5f" />
      <g fill="#f3efe8">
        <path d="M9 14c4-2 8-1 10 2 1 3-2 5-1 8 1 2 4 3 3 6-1 4-4 5-6 9-3-3-5-6-6-10-1-5-1-10 0-15z" />
        <path d="M24 7c3-1 7 0 10 2-1 2-4 2-5 4 2 2 5 1 7 3 1 3-1 5 1 7 2 1 4 0 5 2 0 4-1 8-3 11-2-2-2-5-5-6-3 0-4 3-6 2-2-2 0-5-1-8-2-2-5-1-6-4 0-3 4-3 4-6 0-3-3-4-1-7z" />
      </g>
      <circle cx="24" cy="24" r="21" fill="none" stroke="#9a7b5f" strokeWidth="2" />
    </svg>
  );
}

/** La bàn (compass rose) nét vàng */
function Compass({ className = "" }) {
  const pts = (r1, r2, n, rot = 0) =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = ((i * 180) / n + rot - 90) * (Math.PI / 180);
      const r = i % 2 ? r2 : r1;
      return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
    }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="30" fill="none" stroke={GOLD} strokeWidth="0.8" />
      <circle cx="50" cy="50" r="27" fill="none" stroke={GOLD} strokeWidth="0.5" strokeDasharray="1 2" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={GOLD} strokeWidth="0.4" opacity=".6" />
      <polygon points={pts(34, 6, 8, 22.5)} fill="#c8b28a" opacity=".7" />
      <polygon points={pts(46, 7, 4)} fill="none" stroke={GOLD} strokeWidth="0.9" />
      {[0, 90, 180, 270].map((r) => (
        <path key={r} d="M50 50 L50 4 L44 43 Z" fill={GOLD} transform={`rotate(${r} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="4" fill="#f4f3f1" stroke={GOLD} strokeWidth="1" />
      <text x="50" y="3.2" textAnchor="middle" fontSize="5" fill={GOLD} fontFamily="Lora, serif">N</text>
    </svg>
  );
}

/** Con dấu "LOVE VISA · APPROVED" quanh ngày cưới */
function VisaStamp({ className = "", children }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id="visa-top" d="M16 50 A34 34 0 0 1 84 50" />
          <path id="visa-bot" d="M14 50 A36 36 0 0 0 86 50" />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke={GOLD} strokeWidth="2.5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={GOLD} strokeWidth="1" />
        <circle cx="50" cy="50" r="25" fill="none" stroke={GOLD} strokeWidth="1.4" />
        <text fontSize="11" fill={GOLD} fontWeight="700" fontFamily="Josefin Sans, sans-serif" letterSpacing="1.5">
          <textPath href="#visa-top" startOffset="50%" textAnchor="middle">LOVE VISA</textPath>
        </text>
        <text fontSize="10" fill={GOLD} fontWeight="700" fontFamily="Josefin Sans, sans-serif" letterSpacing="1.5" dominantBaseline="hanging">
          <textPath href="#visa-bot" startOffset="50%" textAnchor="middle">APPROVED</textPath>
        </text>
        <path d="M12 50 l4 -2 v4 z M88 50 l-4 -2 v4 z" fill={GOLD} />
      </svg>
      <span className="relative flex h-full w-full items-center justify-center">{children}</span>
    </div>
  );
}

/** Icon nét mảnh cho Timeline */
function TimelineIcon({ name, className = "" }) {
  const p = { fill: "none", stroke: "#8c8c8c", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    camera: (
      <g {...p}>
        <rect x="8" y="30" width="84" height="52" rx="5" />
        <path d="M14 30 v-6 h14 v6 M60 30 l6 -8 h16 l4 8" />
        <circle cx="50" cy="56" r="18" />
        <circle cx="50" cy="56" r="12" />
        <circle cx="50" cy="56" r="5" />
        <rect x="72" y="36" width="12" height="8" rx="1.5" />
        <path d="M8 46 h22 M70 46 h22" />
        <path d="M86 10 q2 6 8 8 q-6 2 -8 8 q-2 -6 -8 -8 q6 -2 8 -8z M74 6 q1 3 4 4 q-3 1 -4 4 q-1 -3 -4 -4 q3 -1 4 -4z" />
      </g>
    ),
    cheers: (
      <g {...p}>
        <path d="M22 26 l22 -4 l2 26 q-8 12 -20 8 z" transform="rotate(-12 34 40)" />
        <path d="M30 60 l4 28 M24 92 l18 -4" transform="rotate(-12 34 40)" />
        <path d="M56 22 l22 4 l-4 30 q-12 4 -20 -8 z" transform="rotate(12 66 40)" />
        <path d="M68 60 l-4 28 M58 88 l18 4" transform="rotate(12 66 40)" />
        <path d="M27 40 h16 M58 40 h16" opacity=".6" />
        <path d="M50 14 c-4 -6 -12 -2 -8 4 l8 7 l8 -7 c4 -6 -4 -10 -8 -4z" />
      </g>
    ),
    music: (
      <g {...p}>
        <path d="M30 76 V30 l34 -10 v46" />
        <ellipse cx="24" cy="78" rx="8" ry="6" />
        <ellipse cx="58" cy="68" rx="8" ry="6" />
        <path d="M30 40 l34 -10" />
        <path d="M76 44 v26" />
        <ellipse cx="71" cy="72" rx="6" ry="4.5" />
        <path d="M76 44 q8 4 6 12" />
        <path d="M14 30 v24" />
        <ellipse cx="10" cy="56" rx="5" ry="4" />
      </g>
    ),
    rings: (
      <g {...p}>
        <circle cx="38" cy="60" r="24" />
        <circle cx="38" cy="60" r="20" />
        <circle cx="62" cy="60" r="24" />
        <circle cx="62" cy="60" r="20" />
        <path d="M50 30 c-4 -6 -12 -2 -8 4 l8 7 l8 -7 c4 -6 -4 -10 -8 -4z" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {icons[name] ?? icons.camera}
    </svg>
  );
}

/** Kẹp giấy ánh hồng kim */
function PaperClip({ className = "" }) {
  return (
    <svg viewBox="0 0 40 90" className={className} aria-hidden>
      <path
        d="M14 30 V70 a8 8 0 0 0 16 0 V18 a12 12 0 0 0 -24 0 V68 a16 16 0 0 0 32 0 V30"
        fill="none"
        stroke="#c9a59a"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M14 30 V70 a8 8 0 0 0 16 0 V18 a12 12 0 0 0 -24 0" fill="none" stroke="#f3dfd7" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Dây thừng vàng xoắn + mặt máy bay ở giữa */
function GoldRope({ className = "" }) {
  return (
    <svg viewBox="0 0 420 26" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <pattern id="rope" width="6" height="8" patternUnits="userSpaceOnUse">
          <rect width="6" height="8" fill="#c99a2e" />
          <path d="M-1 8 L5 0 M5 8 L11 0" stroke="#f3d27a" strokeWidth="2" />
          <path d="M2 8 L8 0" stroke="#8a6416" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect x="0" y="3" width="420" height="7" fill="url(#rope)" rx="3" />
      <path d="M210 10 v4" stroke="#c99a2e" strokeWidth="1.5" />
      <g transform="translate(210 18) rotate(90) scale(0.16) translate(-32 -32)">
        <path fill="#d9a441" d="M32 2c2.6 0 4 3.4 4 7.5V24l23 13.5v6L36 36.5V49l8 6v4.5L32 56l-12 3.5V55l8-6V36.5L5 43.5v-6L28 24V9.5C28 5.4 29.4 2 32 2z" />
      </g>
    </svg>
  );
}

/** Vòng địa cầu nét vàng + máy bay bay vòng trên đỉnh (quanh ảnh tròn) */
function GlobeRing({ className = "" }) {
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden>
      <path d="M40 40 A100 100 0 1 0 186 52" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
      <path d="M196 70 A100 100 0 0 1 206 112" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <path d="M46 34 Q100 2 170 34" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="5 5" />
      <g transform="translate(92 24) rotate(78) scale(1.15) translate(-32 -32)">
        <path fill={GOLD} d="M32 2c2.6 0 4 3.4 4 7.5V24l23 13.5v6L36 36.5V49l8 6v4.5L32 56l-12 3.5V55l8-6V36.5L5 43.5v-6L28 24V9.5C28 5.4 29.4 2 32 2z" />
      </g>
    </svg>
  );
}

/** Nút "Xem chỉ đường" nền vàng */
function MapButton({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-[39px] w-[178px] items-center justify-center rounded-full border border-[#a6a6a6] bg-gradient-to-b from-[#b39662] to-[#9c7e46] font-lora text-[15px] text-white shadow-[0_10px_16px_rgba(0,0,0,0.22)] animate-pulse-btn"
    >
      {label}
    </a>
  );
}

/* ---------- Màn đóng: tấm vé Boarding pass ---------- */

/** Tấm vé Boarding pass (khung 317×577 của mẫu) — dây thừng + chìa khóa + bản đồ */
function BoardingPass({ c }) {
  return (
    <div className="relative mx-auto w-full" style={{ aspectRatio: "317 / 577", containerType: "inline-size" }}>
      {/* Vé nền kem */}
      <div className="absolute inset-0 rounded-[6%/3.3%] bg-[#efe9dd] shadow-[10px_14px_18px_rgba(0,0,0,0.28)]" />
      {/* Đầu vé vàng */}
      <div className="absolute left-[4%] right-[4%] top-[2.3%] h-[9%] rounded-[3cqw] bg-[#a8894f] text-center font-mono text-white" style={{ fontSize: "4.3cqw", lineHeight: "6.6cqw", paddingTop: "1.6cqw" }}>
        <p className="uppercase tracking-[0.08em]">{c.header.split(" ").slice(0, 4).join(" ")}</p>
        <p className="uppercase tracking-[0.08em]">
          <HeartSolid className="inline w-[4.4cqw] h-[4cqw] -mt-[1cqw] mr-[3cqw]" />
          {c.header.split(" ").slice(4).join(" ")}
          <HeartSolid className="inline w-[4.4cqw] h-[4cqw] -mt-[1cqw] ml-[3cqw]" />
        </p>
      </div>
      {/* lỗ bấm hai bên */}
      <span className="absolute left-[-2.5%] top-[11%] h-[5%] w-[9%] rounded-full bg-[#f3f2f0]" />
      <span className="absolute right-[-2.5%] top-[11%] h-[5%] w-[9%] rounded-full bg-[#f3f2f0]" />

      {/* Bìa hộ chiếu trắng (lệch phải, đổ bóng) */}
      <div className="absolute left-[-1%] right-[-8%] top-[13%] h-[66.5%] overflow-hidden rounded-[5%/3.5%] bg-white shadow-[4px_8px_14px_rgba(0,0,0,0.25)]">
        <p className="mt-[3.5%] text-center font-josefin font-semibold uppercase text-[#a78950]" style={{ fontSize: "6.9cqw", lineHeight: "10cqw" }}>
          {c.title[0]}
          <br />
          {c.title[1]}
        </p>
        <WorldMap className="absolute left-[2%] top-[54%] w-[96%]" fill="#efebe5" />
        {/* đường bay nét đứt + máy bay */}
        <svg viewBox="0 0 300 200" className="absolute left-0 top-[48%] w-full" aria-hidden>
          <path d="M40 190 C 60 150, 150 170, 170 140 C 190 110, 130 90, 150 70 C 170 50, 230 110, 250 40" fill="none" stroke="#d8c8ab" strokeWidth="2.5" strokeDasharray="7 6" />
          <g transform="translate(260 22) rotate(50) scale(0.5) translate(-32 -32)">
            <path fill="#d8c8ab" d="M32 2c2.6 0 4 3.4 4 7.5V24l23 13.5v6L36 36.5V49l8 6v4.5L32 56l-12 3.5V55l8-6V36.5L5 43.5v-6L28 24V9.5C28 5.4 29.4 2 32 2z" />
          </g>
        </svg>
        {/* dây thừng + nơ + chìa khóa */}
        <svg viewBox="0 0 300 160" className="absolute left-0 top-[24%] w-full" aria-hidden>
          <g fill="none" strokeLinecap="round">
            <path d="M0 34 Q150 24 300 30" stroke="#b08a6c" strokeWidth="5" />
            <path d="M0 40 Q150 30 300 36" stroke="#c9a385" strokeWidth="4" />
            <path d="M0 34 Q150 24 300 30" stroke="#e2c6ab" strokeWidth="1.2" strokeDasharray="3 4" />
            <path d="M150 30 C 120 -6, 92 14, 120 30 C 132 36, 144 34, 150 30" stroke="#b08a6c" strokeWidth="4.5" />
            <path d="M150 30 C 180 -6, 208 14, 180 30 C 168 36, 156 34, 150 30" stroke="#b08a6c" strokeWidth="4.5" />
            <path d="M148 34 C 140 60, 126 80, 118 104" stroke="#b08a6c" strokeWidth="4" />
            <path d="M152 34 C 160 60, 176 82, 186 110" stroke="#b08a6c" strokeWidth="4" />
            <path d="M150 34 V 62" stroke="#c9a385" strokeWidth="2.5" />
          </g>
          <circle cx="150" cy="31" r="6" fill="#b08a6c" />
          {/* chìa khóa đầu trái tim */}
          <g fill="#d9b39a" stroke="#b58b70" strokeWidth="1.5">
            <path d="M150 90 C 140 80, 134 72, 138 66 C 142 60, 148 62, 150 66 C 152 62, 158 60, 162 66 C 166 72, 160 80, 150 90 Z" />
            <rect x="147.5" y="88" width="5" height="44" rx="1.5" />
            <path d="M152 112 h8 v5 h-8 z M152 121 h6 v5 h-6 z" />
          </g>
          <path d="M150 62 v6" stroke="#b58b70" strokeWidth="2" />
          <circle cx="150" cy="73" r="4" fill="#fff" stroke="#b58b70" strokeWidth="1.2" />
        </svg>
      </div>

      {/* hàng lỗ xé */}
      <div className="absolute left-[7%] right-[7%] top-[80.5%] border-t-[2px] border-dotted border-[#a39c8e]" />
      {/* cuống vé */}
      <div className="absolute left-[7%] right-[7%] top-[82.5%] h-[13.5%] rounded-[3cqw] bg-white text-center">
        <p className="flex items-center justify-center gap-[4cqw] pt-[3.5%] font-mono uppercase text-[#a78950]" style={{ fontSize: "4.1cqw" }}>
          <span>{c.names[0]}</span>
          <HeartSolid className="w-[6cqw] h-[5.4cqw] text-[#a78950]" />
          <span>{c.names[1]}</span>
        </p>
        <p className="font-mono text-[#3d3d3d]" style={{ fontSize: "4.3cqw", marginTop: "2.2cqw" }}>{c.date}</p>
      </div>
    </div>
  );
}

/** Máy bay trắng kéo vệt mây bay vụt lên khi vừa tải trang (IMAGE103 mU 4s của mẫu) */
function TakeoffIntro() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 4200);
    return () => clearTimeout(t);
  }, []);
  if (done) return null;
  return (
    <div className="takeoff pointer-events-none fixed inset-x-0 top-0 z-[170] mx-auto h-[100vh] max-w-[430px]" aria-hidden>
      <div className="absolute inset-x-0 bottom-[150px] top-[-120vh] bg-gradient-to-b from-[#f4f3f1] via-[#f4f3f1] to-[#f4f3f1]/0" />
      <svg viewBox="0 0 200 260" className="absolute bottom-0 left-1/2 w-[46%] -translate-x-1/2">
        <defs>
          <linearGradient id="trail" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity=".95" />
            <stop offset="1" stopColor="#f4f3f1" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d="M82 0 H118 V120 H82 Z" fill="url(#trail)" />
        <g transform="translate(100 170) scale(2.6) translate(-32 -32)" filter="drop-shadow(0 2px 2px rgba(0,0,0,.25))">
          <path fill="#ffffff" stroke="#c9c9c9" strokeWidth="0.6" d="M32 2c2.6 0 4 3.4 4 7.5V24l23 13.5v6L36 36.5V49l8 6v4.5L32 56l-12 3.5V55l8-6V36.5L5 43.5v-6L28 24V9.5C28 5.4 29.4 2 32 2z" />
          <circle cx="32" cy="8" r="1.4" fill="#9fb4c8" />
        </g>
      </svg>
    </div>
  );
}

function Cover({ c, onOpen, leaving }) {
  return (
    <div
      className={`paper fixed inset-0 z-[160] mx-auto flex max-w-[430px] cursor-pointer flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${leaving ? "pointer-events-none opacity-0" : ""}`}
      onClick={onOpen}
      role="button"
      aria-label="Mở thiệp"
    >
      <div className="w-[74%] max-w-[340px]" style={{ width: "min(74%, 52vh)" }}>
        <BoardingPass c={c} />
      </div>
      <p className="mt-[6vh] font-josefin font-bold text-[16px] uppercase text-gold animate-pulse-soft">{c.hint}</p>
    </div>
  );
}


/** Trái tim đặc */
function HeartSolid({ className = "", style }) {
  return (
    <svg viewBox="0 0 64 58" className={className} style={style} aria-hidden>
      <path
        d="M32 56 C 12 42 2 31 2 18 C 2 8 10 1 19 1 C 25 1 30 4 32 9 C 34 4 39 1 45 1 C 54 1 62 8 62 18 C 62 31 52 42 32 56 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Trái tim vẽ một nét (hộp quà) */
function HeartDoodle({ className = "" }) {
  return (
    <svg viewBox="0 0 64 70" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M32 58 C 10 44 2 30 6 18 C 10 6 26 4 32 18 C 38 4 56 6 59 18 C 62 32 50 46 32 58 Z" />
      <path d="M32 58 C 30 62 34 64 31 69" />
    </svg>
  );
}

/** Đặt phần tử theo tọa độ khung mẫu (rộng 420) → % để co theo màn hình */
function box(x, y, w, h, H) {
  return { position: "absolute", left: `${(x / 420) * 100}%`, top: `${(y / H) * 100}%`, width: `${(w / 420) * 100}%`, height: h == null ? undefined : `${(h / H) * 100}%` };
}
/** Cỡ chữ theo khung 420px (cqw — khung có container-type: inline-size) */
const fz = (px) => `${(px / 4.2).toFixed(3)}cqw`;

/* ---------- Các khối nội dung ---------- */

/** Khung mở đầu: bản đồ + máy bay + hộ chiếu có ảnh (khung 420×718 của mẫu) */
function PassportHero({ c, photo }) {
  const H = 718;
  return (
    <section className="relative w-full" style={{ aspectRatio: `420 / ${H}`, containerType: "inline-size" }}>
      <WorldMap style={box(0, 105, 420, 490, H)} className="opacity-90" />
      {/* đường bay nét đứt: máy bay trên → sau hộ chiếu → vòng trái xuống ghim */}
      <svg viewBox={`0 0 420 ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M296 104 L284 150" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="6 5" />
        <path d="M58 380 C 10 400, 4 440, 32 466" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="6 5" />
      </svg>
      <div style={box(270, 40, 64, 64, H)} className="animate-float">
        <PlaneIcon className="h-full w-full rotate-[35deg]" />
      </div>
      <div style={box(26, 458, 26, 36, H)}>
        <PinIcon className="h-full w-full" />
      </div>

      {/* Hộ chiếu */}
      <div style={box(56, 155, 309, 432, H)} className="rounded-[14px] bg-gradient-to-b from-[#f7f7f5] via-[#eeedea] to-[#e4e3df] shadow-[0_6px_16px_rgba(0,0,0,0.25)] ring-1 ring-white">
        <div className="absolute inset-[6px] rounded-[10px] border border-[#d9d8d4]" />
        <div className="absolute inset-x-0 top-[49.5%] h-[10px] bg-gradient-to-b from-black/[0.06] to-transparent" />
      </div>
      <div style={box(67, 170, 292, 199, H)} className="overflow-hidden rounded-[8px] shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
        <img src={photo} alt={`${c.names[0]} & ${c.names[1]}`} className="h-full w-full object-cover" />
      </div>
      <div style={box(64, 369, 293, 58, H)}>
        <Reveal variant="right" duration={4}>
          <p className="text-center font-edw text-gold whitespace-nowrap" style={{ fontSize: fz(36), lineHeight: fz(58) }}>{c.names[0]}</p>
        </Reveal>
      </div>
      <div style={box(190, 430, 45, 44, H)}>
        <GlobeIcon className="h-full w-full animate-spin-slow-30" />
      </div>
      <div style={box(62, 467, 293, 58, H)}>
        <Reveal variant="left" duration={4}>
          <p className="text-center font-edw text-gold whitespace-nowrap" style={{ fontSize: fz(36), lineHeight: fz(58) }}>{c.names[1]}</p>
        </Reveal>
      </div>
      <div style={box(62, 530, 295, 40, H)}>
        <Reveal variant="up" duration={4}>
          <p className="text-center font-mono uppercase text-black" style={{ fontSize: fz(12), lineHeight: fz(19.5) }}>
            {c.lines[0]}
            <br />
            {c.lines[1]}
          </p>
        </Reveal>
      </div>
    </section>
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

/** Ảnh nền + "Countdown" + 4 ô số trắng (khung 418×317) */
function Countdown({ c, photo }) {
  const parts = useCountdown(c.target);
  const H = 317;
  return (
    <section className="relative w-full" style={{ aspectRatio: `420 / ${H}`, containerType: "inline-size" }}>
      <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-b from-transparent via-black/20 to-black/45" />
      <div style={box(0, 160, 420, 86, H)}>
        <Reveal variant="down" duration={4}>
          <h2 className="text-center font-script text-white drop-shadow" style={{ fontSize: fz(54), lineHeight: fz(86) }}>{c.title}</h2>
        </Reveal>
      </div>
      {parts.map((v, i) => (
        <div key={c.labels[i]} style={box(77 + i * 66.5, 236, 60, 70, H)} className="text-center text-white drop-shadow">
          <p className="font-lora tabular-nums" style={{ fontSize: fz(24), lineHeight: fz(42) }}>{String(v).padStart(2, "0")}</p>
          <p className="font-lora" style={{ fontSize: fz(15), lineHeight: fz(24) }}>{c.labels[i]}</p>
        </div>
      ))}
    </section>
  );
}

/** Lịch tháng chữ vàng, ngày cưới đóng dấu "Love Visa" */
function MonthCalendar({ dateIso }) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <section className="px-[7%] pt-6 pb-4 text-gold">
      <p className="text-center text-[21px] leading-[34px] tracking-[0.1em]">• • • • • • • • ♥</p>
      <Reveal variant="down" duration={3}>
        <p className="text-center font-vibes text-[38px] leading-[58px]">
          Tháng {String(m).padStart(2, "0")} - {y}
        </p>
      </Reveal>
      <div className="mt-3 grid grid-cols-7 text-center font-josefin text-[13px] tracking-wide text-goldsoft">
        {["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"].map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-[20px] text-center font-display text-[17px]">
        {cells.map((day, i) =>
          day === d ? (
            <span key={i} className="relative flex h-[28px] items-center justify-center">
              <VisaStamp className="absolute h-[58px] w-[58px] animate-swing-stamp">
                <span className="font-bold">{day}</span>
              </VisaStamp>
            </span>
          ) : (
            <span key={i} className="flex h-[28px] items-center justify-center">
              {day ?? ""}
            </span>
          ),
        )}
      </div>
    </section>
  );
}

/** Một cột gia đình: NHÀ GÁI / BỐ … / MẸ … / địa chỉ */
function FamilySide({ side }) {
  return (
    <div className="px-2 py-3 text-center">
      <h3 className="font-lora font-bold text-[14px] leading-[22px] uppercase text-gold">{side.label}</h3>
      {side.father && <p className="font-lora text-[12px] leading-[19px] uppercase text-goldsoft">Bố: {side.father}</p>}
      {side.mother && <p className="font-lora text-[12px] leading-[19px] uppercase text-goldsoft">Mẹ: {side.mother}</p>}
      {side.address && <p className="mt-1 font-display text-[14px] leading-[22px] text-gold">{side.address}</p>}
    </div>
  );
}


/** Một sự kiện: giờ – ngày to – âm lịch – nơi tổ chức – nút chỉ đường */
function EventBlock({ item, mapLabel }) {
  return (
    <div className="text-center text-gold">
      <Reveal variant="down" duration={3}>
        <p className="font-josefin font-bold text-[15px] uppercase tracking-[0.18em] text-goldsoft">{item.title}</p>
      </Reveal>
      <p className="mt-1 font-josefin text-[16px] leading-[26px] uppercase">{item.time}</p>
      <p className="font-lora font-bold text-[35px] leading-[56px]">{item.date}</p>
      <p className="font-sans italic text-[15px] leading-6">{item.lunar}</p>
      <p className="mt-3 font-josefin font-bold text-[23px] leading-[37px] uppercase">{item.place}</p>
      <p className="px-6 font-sans italic text-[15px] leading-6">{item.address}</p>
      <div className="mt-4">
        <MapButton href={mapUrl(item.mapQuery ?? item.address)} label={mapLabel} />
      </div>
    </div>
  );
}

/** Đường bay Timeline: đường cong nét đứt giữa, ghim xen kẽ, chữ & icon hai bên */
function Timeline({ c }) {
  const n = c.items.length;
  const ROW = 134;
  const H = n * ROW + 20;
  const pinX = (i) => (i % 2 ? 196 : 222);
  let d = `M${pinX(0)} 0`;
  for (let i = 0; i < n; i++) {
    const y = i * ROW + ROW / 2;
    const x = pinX(i);
    d += ` C ${x + (i % 2 ? -40 : 40)} ${y - 50}, ${x + (i % 2 ? 40 : -40)} ${y - 20}, ${x} ${y}`;
  }
  d += ` C ${pinX(n - 1) + 30} ${H - 30}, ${pinX(n - 1) - 30} ${H - 10}, ${pinX(n - 1)} ${H}`;
  return (
    <section className="relative pb-6">
      <Reveal variant="down" duration={3}>
        <h2 className="text-center font-script text-[60px] leading-[96px] text-gold">{c.title}</h2>
      </Reveal>
      <div className="relative mx-auto max-w-[420px]" style={{ height: H, containerType: "inline-size" }}>
        <WorldMap className="absolute inset-x-0 top-0 h-[55%] w-full" fill="#e6e3dd" />
        <WorldMap className="absolute inset-x-0 bottom-0 h-[45%] w-full -scale-x-100" fill="#e6e3dd" />
        <svg viewBox={`0 0 420 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d={d} fill="none" stroke={GOLD} strokeWidth="2.5" strokeDasharray="9 7" />
        </svg>
        {c.items.map((it, i) => {
          const textLeft = i % 2 === 1;
          const top = i * ROW;
          return (
            <div key={i} className="absolute inset-x-0" style={{ top, height: ROW }}>
              <div className="absolute" style={{ left: `${((pinX(i) - 12) / 420) * 100}%`, top: ROW / 2 - 30, width: 24, height: 34 }}>
                <PinIcon className="h-full w-full" />
              </div>
              <div className={`absolute top-[22px] w-[42%] ${textLeft ? "left-[3%]" : "right-[3%]"}`}>
                <Reveal variant={textLeft ? "left" : "right"} duration={3}>
                  <p className="text-center font-display font-bold text-[19px] leading-8 text-goldsoft">{it.time}</p>
                  <p className="text-center font-display text-[20px] leading-8 text-goldsoft">{it.label}</p>
                </Reveal>
              </div>
              <div className={`absolute top-[14px] w-[26%] ${textLeft ? "right-[7%]" : "left-[7%]"}`}>
                <Reveal variant={textLeft ? "right" : "left"} duration={3}>
                  <TimelineIcon name={it.icon} className="mx-auto h-[96px] w-[100px]" />
                </Reveal>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Thẻ ảnh treo: kẹp giấy, khung trắng, "Chú rể" + tên */
function HangingCard({ person, photo }) {
  return (
    <div className="bg-white p-[4%] pb-2 shadow-[0_12px_18px_rgba(0,0,0,0.18)]">
      <img src={photo} alt={person.name} className="block aspect-square w-full object-cover" loading="lazy" />
      <Reveal variant="right" duration={3}>
        <p className="mt-1.5 text-center font-lora text-[13px] text-gold">{person.role}</p>
        <p className="text-center font-edw text-[24px] leading-9 text-gold">{person.name}</p>
      </Reveal>
    </div>
  );
}

/** Album nền vàng: 8 ô so le theo khung mẫu, còn lại xếp cặp 2:3 */
const ALBUM_LEFT = ["200/296", "199/303", "197/140", "198/313"];
const ALBUM_RIGHT = ["201/266", "200/331", "200/213", "200/241"];
function Album({ title, photos }) {
  const head = photos.slice(0, 8);
  const rest = photos.slice(8);
  const cell = (src, ratio, i, variant) => (
    <Reveal key={i} variant={variant} duration={3} className="border-[3px] border-white/90">
      <img src={src} alt="" className="block w-full object-cover" style={{ aspectRatio: ratio }} loading="lazy" />
    </Reveal>
  );
  return (
    <section className="bg-[#a88a4f] px-[1.7%] pt-6 pb-8">
      <Reveal variant="up" duration={4}>
        <h2 className="mb-3 text-center font-vibes text-[38px] leading-[56px] text-white">{title}</h2>
      </Reveal>
      <div className="grid grid-cols-2 gap-[7px]">
        <div className="space-y-[7px]">{head.filter((_, i) => i % 2 === 0).map((src, j) => cell(src, ALBUM_LEFT[j], `l${j}`, "right"))}</div>
        <div className="space-y-[7px]">{head.filter((_, i) => i % 2 === 1).map((src, j) => cell(src, ALBUM_RIGHT[j], `r${j}`, "left"))}</div>
      </div>
      {rest.length > 0 && (
        <div className="mt-[7px] grid grid-cols-2 gap-[7px]">{rest.map((src, i) => cell(src, "198/296", `p${i}`, i % 2 ? "left" : "right"))}</div>
      )}
    </section>
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

  const boxCls = "w-full rounded-[10px] border border-gold bg-white px-2.5 font-sans text-[16px] text-goldsoft outline-none focus:ring-2 focus:ring-gold/30";

  return (
    <div className="text-center text-gold">
      <Reveal variant="down" duration={4}>
        <h2 className="font-hand font-bold text-[30px] leading-[46px]">{c.title}</h2>
      </Reveal>
      {c.subtitle && <p className="font-sans text-[14px] leading-[22px] px-12 mt-1">{c.subtitle}</p>}
      {sent ? (
        <p className="font-sans text-lg py-8 px-8">{c.thanks}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-[8.5%] mt-4 space-y-2.5 text-left">
          <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={`${boxCls} h-[47px] placeholder:text-gold/80`} />
          {c.askAttend && (
            <div className={`${boxCls} py-1.5 space-y-0.5`} role="radiogroup" aria-label={c.placeholders.attend}>
              {[
                ["yes", c.attendYes],
                ["no", c.attendNo],
              ].map(([v, label]) => (
                <label key={v} className="flex items-center gap-2 text-[15px] text-gold cursor-pointer">
                  <input type="radio" name="attend" value={v} required checked={form.attend === v} onChange={update("attend")} className="accent-[#a78950]" />
                  {label}
                </label>
              ))}
            </div>
          )}
          {c.askAttend && form.attend !== "no" && (
            <input
              type="number"
              min={1}
              max={20}
              value={form.guestCount}
              onChange={update("guestCount")}
              placeholder={c.placeholders.guestCount}
              className={`${boxCls} h-[41px] placeholder:text-gold/80`}
            />
          )}
          <textarea
            value={form.message}
            onChange={update("message")}
            placeholder={c.placeholders.message}
            rows={3}
            className={`${boxCls} py-2 h-[82px] resize-none placeholder:text-gold/80`}
          />
          <div className="text-center pt-2">
            {error && <p className="text-sm mb-2">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="h-[40px] w-[214px] bg-gold font-sans font-bold text-[14px] uppercase text-white shadow transition hover:scale-105 disabled:opacity-70"
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
  /** opened: đã bấm mở vé (gắn trang chính); coverGone: màn vé đã mờ xong, gỡ khỏi trang */
  const [opened, setOpened] = useState(false);
  const [coverGone, setCoverGone] = useState(false);

  /** Chrome giữ vị trí cuộn cũ khi tải lại → màn vé lệch; luôn về đầu trang khi chưa mở */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  const handleOpen = useCallback(() => {
    if (opened) return;
    window.scrollTo(0, 0);
    setOpened(true);
    setTimeout(() => setCoverGone(true), 550);
  }, [opened]);

  const [top, bottom] = c.families.fullNames;

  return (
    <div className="min-h-screen bg-[#e7e5e4] text-foreground font-sans">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects />
      {!coverGone && <TakeoffIntro />}
      {!coverGone && <Cover c={c.cover} onOpen={handleOpen} leaving={opened} />}

      {opened && (
        <main className="paper relative mx-auto min-h-screen max-w-[430px] overflow-hidden shadow-2xl animate-fade-in">
          <PassportHero c={c.hero} photo={images.hero} />

          {c.countdown && <Countdown c={c.countdown} photo={images.countdown} />}

          {c.calendar.dateIso && <MonthCalendar dateIso={c.calendar.dateIso} />}

          {/* BOARDING PASS — Nhà gái | Nhà trai */}
          <section className="pt-10">
            <Reveal variant="down" duration={4}>
              <h2 className="text-center font-lora font-bold text-[30px] leading-[48px] uppercase text-gold/60">{c.families.title}</h2>
            </Reveal>
            <div className="mt-3 grid grid-cols-2 border-y border-[#555]/70">
              {c.families.sides.map((side, i) => (
                <div key={side.label} className={i ? "" : "border-r border-[#555]/70"}>
                  <Reveal variant={i ? "right" : "left"} duration={4}>
                    <FamilySide side={side} />
                  </Reveal>
                </div>
              ))}
            </div>
          </section>

          {/* La bàn + lời mời + tên khách + tên hai người */}
          <section className="pt-7 text-center">
            <Reveal variant="bounce" className="mx-auto w-[97px]">
              <Compass className="h-[97px] w-[97px]" />
            </Reveal>
            <Reveal variant="down" duration={4}>
              <p className="mt-4 font-josefin font-bold text-[15px] uppercase tracking-[0.12em] text-goldsoft">{c.invitation.kicker}</p>
              <div className="relative mx-auto mt-1 w-fit min-w-[200px] max-w-[88%] border-b border-dashed border-gold/60 px-4">
                <PlaneIcon className="absolute -left-5 bottom-1 h-4 w-4 rotate-90" />
                <p className="font-guest text-[32px] leading-[50px] text-gold">{guest}</p>
              </div>
              <p className="mt-3 font-josefin font-bold text-[16px] leading-[26px] uppercase text-goldsoft">
                {c.invitation.title[0]}
                <br />
                {c.invitation.title[1]}
              </p>
            </Reveal>
            <div className="mt-4">
              <Reveal variant="right" duration={4}>
                <p className="font-edw text-[clamp(32px,9.6vw,41px)] leading-[66px] text-gold whitespace-nowrap">{top}</p>
              </Reveal>
              <Reveal variant="bounce">
                <p className="font-vibes text-[32px] leading-[40px] text-gold">&amp;</p>
              </Reveal>
              <Reveal variant="left" duration={4}>
                <p className="font-edw text-[clamp(32px,9.6vw,41px)] leading-[64px] text-gold whitespace-nowrap">{bottom}</p>
              </Reveal>
            </div>
          </section>

          {/* Sự kiện */}
          <section className="space-y-12 pt-6 pb-12">
            {c.events.items.map((item) => (
              <EventBlock key={item.id} item={item} mapLabel={c.events.mapLabel} />
            ))}
          </section>

          {/* Polaroid "Love is a journey" */}
          <section className="px-[7%] pb-14">
            <Reveal variant="zoom" duration={3}>
              <div className="relative rotate-[-1.5deg] bg-gradient-to-br from-[#f7f6f3] to-[#e8e6e1] p-[4%] pb-0 shadow-[10px_14px_22px_rgba(0,0,0,0.25)]">
                <img src={images.journey} alt="" className="block w-full aspect-[336/351] object-cover" loading="lazy" />
                <div className="flex items-center justify-between py-3">
                  <PlaneIcon className="h-9 w-9 rotate-90" />
                  <p className="font-josefin font-bold text-[clamp(15px,4.4vw,19px)] uppercase tracking-wide text-gold">{c.journey}</p>
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8a6a52]/80">
                    <HeartSolid className="h-6 w-6 text-[#8a6a52]" />
                    <span className="absolute -bottom-1 left-0 right-0 border-t-2 border-dashed border-[#8a6a52]/60" />
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* Timeline */}
          {c.timeline && <Timeline c={c.timeline} />}

          {/* Dresscode */}
          {c.dresscode && (
            <section className="pb-10 text-center">
              <Reveal variant="down" duration={3}>
                <h2 className="font-vibes text-[45px] leading-[72px] text-gold">{c.dresscode.title}</h2>
              </Reveal>
              <div className="mt-1 flex justify-center gap-2">
                {c.dresscode.colors.map((col) => (
                  <Reveal key={col} variant="zoom" duration={2}>
                    <span className="block h-[52px] w-[52px] rounded-full border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]" style={{ background: col }} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* Thẻ ảnh treo Chú rể | Cô dâu */}
          <section className="relative pb-14 pt-2">
            <GoldRope className="relative z-[1] h-[22px] w-full" />
            <div className="-mt-[14px] grid grid-cols-2 gap-[6%] px-[5%]">
              {[
                [c.couple.groom, images.groom],
                [c.couple.bride, images.bride],
              ].map(([p, src]) => (
                <div key={p.role} className="relative pt-3">
                  <PaperClip className="absolute left-1/2 -top-6 z-[2] h-[54px] w-[24px] -translate-x-1/2 rotate-[-18deg]" />
                  <HangingCard person={p} photo={src} />
                </div>
              ))}
            </div>
          </section>

          <Album title={c.album.title} photos={images.album} />

          {/* Xác nhận tham dự */}
          {c.rsvp.show && (
            <section className="pt-10 pb-4">
              <RsvpForm c={c.rsvp} />
            </section>
          )}

          {/* Ảnh tròn vòng địa cầu + máy bay, nút mừng cưới */}
          <section className="pt-6 pb-6 text-center">
            <Reveal variant="zoom" className="relative mx-auto h-[222px] w-[222px]">
              <GlobeRing className="absolute inset-0 h-full w-full" />
              <div className="absolute left-[15.8%] top-[9.5%] h-[164px] w-[161px] overflow-hidden rounded-full border-[5px] border-white shadow">
                <img src={images.circle} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            </Reveal>
            {c.gift.accounts.length > 0 && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setGiftOpen(true)}
                  className="inline-flex h-11 w-[193px] items-center justify-center gap-2.5 rounded-full bg-gold font-upright font-bold text-[13px] uppercase text-white shadow-lg shadow-gold/30 animate-pulse-soft"
                >
                  <Gift className="w-5 h-5" aria-hidden />
                  {c.gift.button}
                </button>
              </div>
            )}
          </section>

          {/* Thank you */}
          <section className="px-[2.2%] pb-5">
            <div className="relative overflow-hidden border-[3px] border-white">
              <img src={images.thankYou} alt="" className="block w-full aspect-[402/438] object-cover object-top" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-b from-transparent via-[#4a3b22]/40 to-[#3b2f1a]/80" />
              {/* Định vị ở lớp ngoài — Reveal quan sát lớp bọc của nó, lớp đó phải có chiều cao thật */}
              <div className="absolute inset-x-0 bottom-0">
                <Reveal variant="down" duration={4} className="px-[8%] pb-6 text-center text-white">
                  <h2 className="font-guest text-[51px] leading-[72px] drop-shadow-lg">{c.thanks.title}</h2>
                  <p className="font-sans text-[14px] leading-[22px] drop-shadow">{c.thanks.text}</p>
                  <p className="mt-2 font-edw text-[30px] drop-shadow-lg">
                    {c.cover.names[0]} &amp; {c.cover.names[1]}
                  </p>
                </Reveal>
              </div>
            </div>
          </section>
        </main>
      )}

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
