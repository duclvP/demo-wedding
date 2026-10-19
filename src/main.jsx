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

/** true khi cửa thiệp đã mở */
const DoorsContext = React.createContext(true);

/** Hiện dần khi cuộn tới — variant: up | down | left | right | zoom | bounce */
function Reveal({ as: Tag = "div", variant = "up", delay = 0, className = "", children }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  /** Không chạy hiệu ứng khi cửa còn đóng — tránh phần đầu thiệp "diễn" trước khi khách thấy */
  const doorsOpen = React.useContext(DoorsContext);
  const visible = seen && doorsOpen;

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

/** Bắt đầu khi `active` = true: rơi một đợt ngay, sau đó rơi đều */
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

function mapUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Tên khách lấy từ link ?khach=..., không có thì dùng mặc định */
function useGuestName(fallback) {
  return useState(() => {
    try {
      const name = new URLSearchParams(window.location.search).get("khach");
      return name?.trim() || fallback;
    } catch {
      return fallback;
    }
  })[0];
}

/* ---------- Họa tiết trang trí (SVG vẽ tay, không cần file ảnh) ---------- */

/** Số ngẫu nhiên có seed — đường xé giấy giữ nguyên giữa các lần render */
function seeded(seed) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

function tornPath(seed) {
  const rnd = seeded(seed);
  const pts = [];
  /** Đi ngẫu nhiên (không nhảy độc lập từng điểm) để mép trông như vết cọ, thỉnh thoảng có sợi giấy nhọn */
  let y = 8;
  for (let x = 0; x <= 400; x += 2) {
    y = Math.min(16, Math.max(2, y + (rnd() - 0.5) * 3.2));
    const fiber = rnd() < 0.06 ? 4 + rnd() * 6 : 0;
    pts.push(`${x},${(y + fiber).toFixed(1)}`);
  }
  return `M0,0 L${pts.join(" L")} L400,0 Z`;
}

function roughRectPath(seed) {
  const rnd = seeded(seed);
  const j = (v, a) => (v + (rnd() - 0.5) * a).toFixed(1);
  const pts = [];
  for (let x = 6; x <= 194; x += 5) pts.push(`${x},${j(6, 9)}`);
  for (let y = 10; y <= 50; y += 5) pts.push(`${j(194, 10)},${y}`);
  for (let x = 194; x >= 6; x -= 5) pts.push(`${x},${j(54, 9)}`);
  for (let y = 50; y >= 10; y -= 5) pts.push(`${j(6, 10)},${y}`);
  return `M${pts.join(" L")} Z`;
}

const TORN = [tornPath(7), tornPath(23), tornPath(41)];
const PATCH = roughRectPath(11);

/** Mép giấy xé màu xanh tràn ra khỏi dải nền (lên trên hoặc xuống dưới) */
function TornEdge({ side, variant = 0 }) {
  return (
    <svg
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      className={`absolute inset-x-0 h-6 w-full text-primary ${side === "top" ? "bottom-full -scale-y-100" : "top-full"}`}
      aria-hidden
    >
      <path d={TORN[variant % TORN.length]} fill="currentColor" />
    </svg>
  );
}

/** Dải nền xanh rêu với hai mép xé giấy */
function GreenBand({ edges = ["top", "bottom"], variant = 0, className = "", children }) {
  return (
    <section className={`relative z-10 bg-primary text-primary-foreground ${className}`}>
      {edges.includes("top") && <TornEdge side="top" variant={variant} />}
      {children}
      {edges.includes("bottom") && <TornEdge side="bottom" variant={variant + 1} />}
    </section>
  );
}

/** Miếng giấy kem mép xé (Save the date, Our Story) */
function PaperPatch({ className = "", children }) {
  return (
    <div className={`relative inline-block text-primary ${className}`}>
      <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-background" aria-hidden>
        <path d={PATCH} fill="currentColor" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

/** Hoa ly nét mảnh */
function Lily({ className = "" }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M62 64 C52 42 54 20 63 4 C70 22 70 44 62 64Z" />
      <path d="M62 64 C42 56 26 42 14 22 C36 26 52 40 62 64Z" />
      <path d="M62 64 C82 56 98 42 110 24 C88 26 72 40 62 64Z" />
      <path d="M62 64 C44 64 26 72 12 84 C34 86 50 78 62 64Z" />
      <path d="M62 64 C78 66 94 74 106 86 C86 88 72 80 62 64Z" />
      <path d="M62 60 C60 42 61 26 63 12 M58 60 C46 50 34 40 22 28 M66 60 C78 50 90 40 102 30" opacity="0.55" />
      <path d="M62 64 L48 36 M62 64 L57 30 M62 64 L68 31 M62 64 L77 38 M62 64 L84 46" />
      {[
        [48, 36],
        [57, 30],
        [68, 31],
        [77, 38],
        [84, 46],
      ].map(([cx, cy]) => (
        <ellipse key={cx} cx={cx} cy={cy} rx="2.2" ry="1.1" fill="currentColor" transform={`rotate(-30 ${cx} ${cy})`} />
      ))}
      <path d="M40 58 C34 50 34 40 40 32 C46 40 46 50 40 58Z" opacity="0.8" />
      <path d="M40 58 C46 66 58 66 62 64" />
    </svg>
  );
}

/** Khung hoa văn chữ lồng: chữ thứ nhất trên trái, chữ thứ hai dưới phải */
function Monogram({ letters }) {
  const corners = [
    [12, 18, 1, 1],
    [80, 18, -1, 1],
    [12, 112, 1, -1],
    [80, 112, -1, -1],
  ];
  return (
    <div className="relative mx-auto h-[130px] w-[92px] text-primary">
      <svg viewBox="0 0 92 130" className="absolute inset-0 h-full w-full" fill="none" stroke="currentColor" aria-hidden>
        <path d="M14 22 Q14 8 30 8 L62 8 Q78 8 78 22 L78 108 Q78 122 62 122 L30 122 Q14 122 14 108 Z" strokeWidth="1.1" />
        <path d="M18 24 Q18 12 31 12 L61 12 Q74 12 74 24 L74 106 Q74 118 61 118 L31 118 Q18 118 18 106 Z" strokeWidth="0.5" />
        {corners.map(([x, y, sx, sy]) => (
          <g key={`${x}-${y}`} strokeWidth="0.9">
            <path d={`M${x} ${y + sy * 12} C${x - sx * 10} ${y + sy * 2} ${x + sx * 2} ${y - sy * 12} ${x + sx * 12} ${y - sy * 4}`} />
            <circle cx={x - sx * 3} cy={y - sy * 4} r="2.2" />
            <path d={`M${x + sx * 4} ${y + sy * 20} q${-sx * 6} ${-sy * 4} ${-sx * 2} ${-sy * 10}`} />
          </g>
        ))}
        <path d="M34 4 Q46 12 58 4 M34 126 Q46 118 58 126" strokeWidth="0.9" />
      </svg>
      <span className="absolute left-[24px] top-[22px] font-names text-[38px] leading-none">{letters[0]}</span>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-names text-xl">&</span>
      <span className="absolute bottom-[22px] right-[24px] font-names text-[38px] leading-none">{letters[1]}</span>
    </div>
  );
}

/** Hai chiếc nhẫn lồng nhau */
function Rings({ className = "" }) {
  return (
    <svg viewBox="0 0 64 30" className={className} fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
      <ellipse cx="24" cy="17" rx="15" ry="9" />
      <ellipse cx="24" cy="17" rx="12" ry="6.5" strokeWidth="0.6" />
      <ellipse cx="40" cy="15" rx="15" ry="9" />
      <ellipse cx="40" cy="15" rx="12" ry="6.5" strokeWidth="0.6" />
      <path d="M38 6 l2 -4 l2 4 l-2 2 z" />
    </svg>
  );
}

/** Vòng lá ôm quanh ảnh tròn */
function Wreath({ className = "" }) {
  const leaves = [];
  [
    [-80, -10],
    [100, 170],
  ].forEach(([from, to]) => {
    for (let a = from; a <= to; a += 9) leaves.push(a);
  });
  return (
    <svg viewBox="0 0 220 220" className={className} fill="none" stroke="currentColor" aria-hidden>
      <circle cx="110" cy="110" r="100" strokeWidth="1.4" />
      {leaves.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const r = 103 + (i % 2 ? 5 : -2);
        const x = 110 + r * Math.cos(rad);
        const y = 110 + r * Math.sin(rad);
        return (
          <ellipse
            key={a}
            cx={x}
            cy={y}
            rx="7"
            ry="2.6"
            fill="currentColor"
            opacity="0.85"
            transform={`rotate(${a + 90 + (i % 2 ? 35 : -35)} ${x} ${y})`}
          />
        );
      })}
    </svg>
  );
}

/* ---------- Cửa mở thiệp ---------- */

/** Bông ly trắng nhìn từ trên xuống: 6 cánh + nhị nâu */
function LilyBloom({ x, y, scale = 1, rotate = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      {[0, 60, 120, 180, 240, 300].map((a, i) => (
        <g key={a} transform={`rotate(${a + (i % 2 ? 8 : 0)})`}>
          <path
            d="M0 0 C-9 -10 -8 -26 0 -36 C8 -26 9 -10 0 0Z"
            fill={i % 2 ? "#ffffff" : "#f6f7f0"}
            stroke="#c9d3bb"
            strokeWidth="0.8"
          />
          <path d="M0 -4 L0 -28" stroke="#dfe6d2" strokeWidth="1" />
        </g>
      ))}
      <circle r="4" fill="#d9e6b8" />
      {[-50, -20, 10, 40, 70].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        const ex = 15 * Math.cos(rad);
        const ey = 15 * Math.sin(rad);
        return (
          <g key={a}>
            <path d={`M0 0 L${ex.toFixed(1)} ${ey.toFixed(1)}`} stroke="#a7b77f" strokeWidth="0.8" />
            <ellipse cx={ex} cy={ey} rx="2.6" ry="1.2" fill="#8a5a3c" transform={`rotate(${a} ${ex} ${ey})`} />
          </g>
        );
      })}
    </g>
  );
}

function LilyLeaf({ x, y, length = 60, rotate = 0, tone = "#7f9f6a" }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M0 0 C${length * 0.15} ${-length * 0.08} ${length * 0.7} ${-length * 0.1} ${length} 0 C${length * 0.7} ${length * 0.1} ${length * 0.15} ${length * 0.08} 0 0Z`} fill={tone} />
      <path d={`M0 0 L${length * 0.9} 0`} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.8" />
    </g>
  );
}

function LilyBud({ x, y, rotate = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d="M0 0 C-6 -10 -5 -26 0 -34 C5 -26 6 -10 0 0Z" fill="#e3ecd2" stroke="#a9bd8f" strokeWidth="0.8" />
      <path d="M0 0 L0 12" stroke="#7f9f6a" strokeWidth="1.6" />
    </g>
  );
}

/** Cụm hoa ly + lá ở góc cửa (góc trên trái; lật 180° cho góc dưới phải) */
function LilyCorner({ className = "" }) {
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden>
      <LilyLeaf x={20} y={30} length={150} rotate={62} tone="#9cb889" />
      <LilyLeaf x={30} y={20} length={130} rotate={18} tone="#6f9160" />
      <LilyLeaf x={60} y={50} length={110} rotate={40} tone="#86a675" />
      <LilyLeaf x={10} y={80} length={100} rotate={78} tone="#7f9f6a" />
      <LilyLeaf x={90} y={20} length={90} rotate={-8} tone="#9cb889" />
      <LilyBud x={150} y={44} rotate={70} />
      <LilyBud x={52} y={150} rotate={160} />
      <LilyBloom x={48} y={46} scale={1.15} rotate={10} />
      <LilyBloom x={118} y={30} scale={0.9} rotate={-15} />
      <LilyBloom x={28} y={118} scale={0.85} rotate={30} />
    </svg>
  );
}

/** Đường viền con dấu sáp lượn sóng không đều */
const WAX_EDGE = (() => {
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const t = (i / 90) * Math.PI * 2;
    const r = 45 + 2.2 * Math.sin(7 * t) + 1.4 * Math.sin(12 * t + 1) + 0.8 * Math.sin(19 * t + 2);
    pts.push(`${(50 + r * Math.cos(t)).toFixed(1)},${(50 + r * Math.sin(t)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
})();

/** Con dấu sáp xanh hình cỏ bốn lá */
function WaxSeal({ className = "" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="wax" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#62c17e" />
          <stop offset="0.45" stopColor="#2c8a4b" />
          <stop offset="1" stopColor="#135028" />
        </radialGradient>
        <radialGradient id="wax-inner" cx="60%" cy="65%" r="70%">
          <stop offset="0" stopColor="#3a9b59" />
          <stop offset="1" stopColor="#1d6a37" />
        </radialGradient>
      </defs>
      <path d={WAX_EDGE} fill="url(#wax)" />
      <circle cx="50" cy="50" r="33" fill="url(#wax-inner)" stroke="#124d27" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="34.5" fill="none" stroke="#8ddba3" strokeOpacity="0.45" strokeWidth="1" />
      {[45, 135, 225, 315].map((a) => (
        <g key={a} transform={`rotate(${a} 50 50)`}>
          <path
            d="M50 50 C45 44 39 39 41 32 C43 26 49 27 50 32 C51 27 57 26 59 32 C61 39 55 44 50 50Z"
            fill="#2f8f4f"
            stroke="#114a25"
            strokeWidth="1"
          />
          <path d="M50 49 L50 33 M50 42 L46 37 M50 42 L54 37" stroke="#114a25" strokeWidth="0.6" fill="none" />
        </g>
      ))}
      <path d="M50 50 C52 56 55 60 60 62" stroke="#114a25" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

/** Hai cánh cửa kem hoa ly, tự mở sau vài giây (hoặc khi chạm) */
function OpeningDoors({ onOpen, onDone }) {
  const [opening, setOpening] = useState(false);

  const open = useCallback(() => {
    setOpening((was) => {
      if (!was) onOpen();
      return true;
    });
  }, [onOpen]);

  useEffect(() => {
    const t = setTimeout(open, 3000);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [opening, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[160] mx-auto max-w-[420px] overflow-hidden ${opening ? "pointer-events-none" : ""}`}
      onClick={open}
      aria-hidden
    >
      <div className={`door door-left ${opening ? "is-open" : ""}`}>
        <LilyCorner className="absolute -left-3 -top-3 w-[96%] max-w-[320px]" />
      </div>
      <div className={`door door-right ${opening ? "is-open" : ""}`}>
        <LilyCorner className="absolute -bottom-3 -right-3 w-[96%] max-w-[320px] rotate-180" />
      </div>
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700 ${
          opening ? "scale-50 opacity-0" : ""
        }`}
      >
        <button type="button" className="animate-pulse-soft drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]" aria-label="Mở thiệp">
          <WaxSeal className="h-28 w-28" />
        </button>
        <p className="mt-3 font-sans text-[13px] uppercase tracking-[0.25em] text-primary/80">Chạm để mở thiệp</p>
      </div>
    </div>
  );
}

/* ---------- Các khối nội dung ---------- */

const WEEKDAYS = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];

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
    <div className="px-2">
      <div className="grid grid-cols-7 text-center font-sans text-[13px]">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center font-display text-[17px]">
        {cells.map((day, i) =>
          day === d ? (
            <span key={i} className="relative flex h-11 items-center justify-center">
              <svg viewBox="0 0 24 24" className="absolute h-14 w-14 animate-pulse-soft" aria-hidden>
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  d="M12 20.5s-7.8-4.7-9.4-9.4C1.4 7.6 3.6 4.5 6.8 4.5c2.1 0 3.9 1.3 5.2 3.1 1.3-1.8 3.1-3.1 5.2-3.1 3.2 0 5.4 3.1 4.2 6.6-1.6 4.7-9.4 9.4-9.4 9.4z"
                />
              </svg>
              <span className="relative">{day}</span>
            </span>
          ) : (
            <span key={i} className="flex h-11 items-center justify-center">
              {day ?? ""}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function FamilySide({ side }) {
  return (
    <div className="text-center">
      <h3 className="font-sans font-bold uppercase text-[17px] mb-1.5">{side.label}</h3>
      {side.father && <p className="font-sans text-[14px] leading-7">Ông: {side.father}</p>}
      {side.mother && <p className="font-sans text-[14px] leading-7">Bà: {side.mother}</p>}
    </div>
  );
}

function EventBlock({ item, mapLabel }) {
  const sideCls = "w-[104px] border-y border-primary py-2 font-sans font-bold uppercase text-[17px]";
  return (
    <div className="text-center">
      {item.title && <h3 className="font-sans font-bold uppercase text-[22px] mb-3">{item.title}</h3>}
      <p className="font-sans font-semibold uppercase text-[15px]">{item.timeLine}</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <span className={sideCls}>{item.month}</span>
        <span className="font-names font-medium text-[86px] leading-[0.75] pt-2 [font-variant-numeric:lining-nums]">{item.day}</span>
        <span className={sideCls}>{item.year}</span>
      </div>
      <p className="font-sans italic text-[14px] mt-4">{item.lunar}</p>
      <h4 className="font-sans font-bold uppercase text-[21px] mt-7">{item.place}</h4>
      <p className="font-sans text-[14px] leading-relaxed mt-2">Địa Chỉ: {item.address}</p>
      <a
        href={mapUrl(item.address)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-2.5 font-display font-bold uppercase text-[16px] text-primary-foreground shadow-[0_3px_8px_rgba(0,0,0,0.35)] ring-1 ring-white/20 transition hover:scale-105"
      >
        <MapPin className="h-5 w-5" aria-hidden />
        {mapLabel}
      </a>
    </div>
  );
}

function RsvpForm({ c }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", attend: "", guestCount: "", message: "" });

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
          attend: form.attend === "yes" ? c.attendYes : c.attendNo,
          guestCount: form.attend === "yes" ? form.guestCount || "1" : "0",
        }),
      });
      setSent(true);
    } catch {
      setError(c.error);
    } finally {
      setSending(false);
    }
  }

  const boxCls = "w-full rounded-[10px] border border-primary/80 bg-white px-3 font-display text-[15px] text-foreground";
  const inputCls = `${boxCls} py-2.5 placeholder:text-foreground/80 outline-none focus:ring-2 focus:ring-primary/30`;

  return (
    <div className="px-5 text-center">
      <h2 className="font-hand text-[44px] leading-tight">{c.title}</h2>
      <p className="font-display text-[16px] leading-relaxed mt-1 px-6">{c.intro}</p>
      {sent ? (
        <p className="font-display text-lg py-8">{c.thanks}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-2.5 px-2 text-left">
          <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={inputCls} />
          <fieldset className={`${boxCls} py-2 space-y-1`}>
            {[
              ["yes", c.attendYes],
              ["no", c.attendNo],
            ].map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="attend"
                  required
                  value={value}
                  checked={form.attend === value}
                  onChange={update("attend")}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </fieldset>
          {form.attend !== "no" && (
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
          <textarea
            rows={3}
            value={form.message}
            onChange={update("message")}
            placeholder={c.placeholders.message}
            className={`${inputCls} resize-none`}
          />
          <div className="text-center pt-2">
            {error && <p className="text-sm text-accent mb-3">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="bg-primary px-14 py-2.5 font-display font-bold uppercase text-[16px] text-primary-foreground transition hover:opacity-90 disabled:opacity-70"
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
        className="relative w-full max-w-[400px] max-h-[90vh] overflow-y-auto rounded-3xl bg-background px-4 pt-6 pb-7 shadow-2xl animate-pop"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 text-foreground/70 hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-sans font-bold uppercase text-2xl text-center">{c.title}</h2>
        <div className="h-px bg-primary/20 my-4" />
        <div className="grid grid-cols-[1fr_1.1fr] items-center gap-3">
          <img src={photo} alt="" className="w-full aspect-[3/4] object-cover rounded-2xl border-2 border-white shadow-lg" />
          <div className="space-y-6">
            {c.accounts.map((account) => (
              <GiftAccount key={account.number} account={account} c={c} />
            ))}
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
  const [first, second] = c.hero.names;
  const [personA, personB] = c.story.people;
  /** opened: cửa bắt đầu mở; doorsGone: cửa đã mở xong, gỡ khỏi trang */
  const [opened, setOpened] = useState(false);
  const [doorsGone, setDoorsGone] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);
  const handleDoorsDone = useCallback(() => setDoorsGone(true), []);

  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects active={opened} />
      {!doorsGone && <OpeningDoors onOpen={handleOpen} onDone={handleDoorsDone} />}

      <DoorsContext.Provider value={opened}>
      <main className="relative mx-auto max-w-[420px] bg-background overflow-hidden shadow-2xl">
        {/* Ảnh bìa */}
        <img src={images.hero} alt={`${first} & ${second}`} className="block w-full aspect-square object-cover object-top" />

        {/* Tên + Save the date + lịch */}
        <GreenBand className="pt-16 pb-14 text-center">
          <Reveal variant="down">
            <p className="font-names font-medium uppercase text-[40px] leading-tight">{first}</p>
          </Reveal>
          <Reveal variant="zoom" delay={200}>
            <p className="font-script text-[44px] leading-none my-2">{c.hero.joiner}</p>
          </Reveal>
          <Reveal variant="up" delay={350}>
            <p className="font-names font-medium uppercase text-[40px] leading-tight">{second}</p>
          </Reveal>
          <Reveal variant="zoom" delay={500} className="mt-12">
            <PaperPatch className="px-14 py-3">
              <p className="font-script text-[26px] leading-tight">{c.hero.subtitle}</p>
              <p className="font-display font-bold text-[24px] leading-tight">{c.hero.dateLine}</p>
            </PaperPatch>
          </Reveal>

          <Reveal variant="zoom" className="relative mt-24 mb-8 flex flex-col items-center">
            <Lily className="h-28 w-32 text-[#d8cba4]" />
            <p className="-mt-8 font-script text-[48px] leading-none drop-shadow">{c.calendar.monthLabel}</p>
          </Reveal>
          <Reveal>
            <MonthCalendar dateIso={c.calendar.dateIso} />
          </Reveal>
        </GreenBand>

        {/* Gia đình + lời mời + sự kiện */}
        <section className="px-5 pt-16 pb-16 text-center">
          <Reveal variant="zoom">
            <Monogram letters={c.families.monogram} />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3">
            {c.families.sides.map((side, i) => (
              <Reveal key={side.label} variant={i % 2 ? "right" : "left"}>
                <FamilySide side={side} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-5">
            <p className="font-sans font-bold uppercase text-[15px]">{c.invitation.kicker}</p>
            <p className="font-guest text-[30px] leading-tight text-accent mx-auto mt-1 w-[200px] border-b border-dotted border-primary/70">
              {guest}
            </p>
            <p className="font-sans font-bold uppercase text-[clamp(11px,3.3vw,13.5px)] whitespace-nowrap mt-2">{c.invitation.lead}</p>
          </Reveal>
          <Reveal variant="zoom" className="mt-3">
            <p className="font-names font-medium uppercase text-[38px] leading-tight">{first}</p>
            <Rings className="mx-auto my-1 h-8 w-14" />
            <p className="font-names font-medium uppercase text-[38px] leading-tight">{second}</p>
          </Reveal>
          <div className="mt-6 space-y-10">
            {c.events.items.map((item, i) => (
              <Reveal key={item.id} variant="up">
                {i > 0 && <div className="mx-auto mb-10 h-px w-44 bg-primary" />}
                <EventBlock item={item} mapLabel={c.events.mapLabel} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Cô dâu chú rể + Our Story */}
        <GreenBand variant={1} className="pt-14 pb-16">
          <div className="relative px-6">
            <div className="flex items-center gap-4">
              <Reveal variant="left">
                <img src={images.people[0]} alt={personA.name} className="h-56 w-40 rounded-[50%] object-cover" loading="lazy" />
              </Reveal>
              <Reveal variant="right" className="flex-1 text-center">
                <p className="font-names text-[20px]">{personA.label}</p>
                <p className="font-names font-medium uppercase text-[26px] leading-tight">{personA.name}</p>
              </Reveal>
            </div>
            <Lily className="absolute left-1/2 top-[44%] h-24 w-24 -translate-x-1/2 text-white/90" />
            <div className="mt-2 flex flex-row-reverse items-center gap-4">
              <Reveal variant="right">
                <img src={images.people[1]} alt={personB.name} className="h-56 w-40 rounded-[50%] object-cover" loading="lazy" />
              </Reveal>
              <Reveal variant="left" className="flex-1 text-center">
                <p className="font-names text-[20px]">{personB.label}</p>
                <p className="font-names font-medium uppercase text-[26px] leading-tight">{personB.name}</p>
              </Reveal>
            </div>
          </div>

          <Reveal variant="zoom" className="mt-16 text-center">
            <PaperPatch className="px-12 py-3">
              <h2 className="font-script text-[38px] leading-tight">{c.story.title}</h2>
            </PaperPatch>
          </Reveal>
          <Reveal className="mt-6 space-y-5 px-6 text-center font-sans text-[14px] leading-[1.9]">
            {c.story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
        </GreenBand>

        {/* Ảnh polaroid + xác nhận + mừng cưới */}
        <section className="pt-14 pb-20">
          <Reveal variant="zoom" className="px-3">
            <div className="relative bg-white p-3.5 pb-5 shadow-[0_14px_18px_-8px_rgba(0,0,0,0.45)]">
              <span className="absolute -top-4 left-1/2 h-9 w-32 -translate-x-1/2 -rotate-2 bg-[#efe3d6]/90 shadow-sm" aria-hidden />
              <img src={images.polaroid} alt="" className="w-full aspect-[6/5] object-cover object-[center_20%]" loading="lazy" />
            </div>
          </Reveal>
          <Reveal className="mt-10">
            <RsvpForm c={c.rsvp} />
          </Reveal>
          <Reveal variant="zoom" className="mt-10">
            <div className="relative mx-auto h-52 w-52 text-primary">
              <img src={images.circle} alt="" className="absolute inset-[8px] h-[calc(100%-16px)] w-[calc(100%-16px)] rounded-full object-cover object-[center_25%]" loading="lazy" />
              <Wreath className="absolute -inset-1.5" />
            </div>
          </Reveal>
          {c.gift.accounts.length > 0 && (
            <Reveal className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setGiftOpen(true)}
                className="inline-flex items-center gap-3 rounded-full bg-primary px-12 py-3 font-names font-medium uppercase text-[17px] text-primary-foreground shadow-lg animate-pulse-soft"
              >
                <Gift className="h-6 w-6" aria-hidden />
                {c.gift.button}
              </button>
            </Reveal>
          )}
        </section>

        {/* Album + Thank you */}
        <GreenBand edges={["top"]} variant={2} className="pt-14 pb-2">
          <Reveal variant="zoom">
            <h2 className="text-center font-script text-[46px] mb-6">{c.album.title}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-2 px-2">
            {images.album.map((src, i) => (
              <Reveal key={i} variant={i % 2 ? "right" : "left"}>
                <img src={src} alt="" className="w-full aspect-[2/3] object-cover border-[3px] border-white" loading="lazy" />
              </Reveal>
            ))}
          </div>
          <div className="relative mx-2 mt-2 border-[3px] border-white">
            <img src={images.thankYou} alt="" className="block w-full aspect-[4/5] object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
            <Reveal variant="up" className="absolute inset-x-0 bottom-0 px-6 pb-6 text-center">
              <h2 className="font-script text-[56px] leading-tight drop-shadow-lg">{c.thanks.title}</h2>
              <p className="font-sans text-[13px] leading-relaxed drop-shadow">{c.thanks.text}</p>
            </Reveal>
          </div>
        </GreenBand>
      </main>
      </DoorsContext.Provider>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(<WeddingPage />);
