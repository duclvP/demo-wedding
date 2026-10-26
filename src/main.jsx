import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, Copy, Download, Gift, MapPin, Volume2, VolumeX, X } from "lucide-react";
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

/** Hiện dần khi cuộn tới — variant: up | down | left | right | fade | zoom | bounce; duration giây */
function Reveal({ as: Tag = "div", variant = "up", delay = 0, duration, className = "", wrapClassName, style, children }) {
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
   * đẩy ra ngoài khung, nó không bao giờ "giao" với màn hình.
   */
  return (
    <div ref={ref} className={wrapClassName}>
      <Tag
        style={{
          transitionDelay: `${delay}ms`,
          animationDelay: `${delay}ms`,
          ...(duration ? { transitionDuration: `${duration}s`, animationDuration: `${duration}s` } : null),
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
  { kind: "snowflake", chars: ["❆", "❅"], every: 2500, burst: 8, size: [0.8, 0.6], duration: [15, 5] },
  { kind: "heart", chars: ["❤"], every: 4000, burst: 6, size: [1.2, 1], duration: [10, 5] },
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

/* ---------- Toạ độ theo khung 420px của mẫu (co giãn theo bề rộng thiệp) ---------- */

/** Cỡ chữ px của mẫu → đơn vị theo bề rộng khung (main là container 420px) */
const fz = (px) => `${(px / 4.2).toFixed(3)}cqw`;

/** Hộp tuyệt đối theo toạ độ mẫu, trong một mục cao H px (khung 420 × H) */
function boxIn(H) {
  return (x, y, w, h) => ({
    position: "absolute",
    left: `${(x / 420) * 100}%`,
    top: `${(y / H) * 100}%`,
    width: w == null ? undefined : `${(w / 420) * 100}%`,
    height: h == null ? undefined : `${(h / H) * 100}%`,
  });
}

/** Khung tọa độ cố định: aspect 420 / H, con đặt bằng boxIn(H) */
function Frame({ H, className = "", style, children }) {
  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: `420 / ${H}`, ...style }}>
      {children}
    </div>
  );
}

/** Ly sâm banh chạm nhau — vẽ nét cùng kiểu icon timeline của mẫu */
function ToastIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 64 80" className={className} fill="none" stroke="#7f0606" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 22 L22 18 L28 40 C 29 46 25 50 20 51 C 15 52 11 49 10 44 Z" />
      <path d="M20 51 L24 68 M17 70 L31 66" />
      <path d="M11 30 L25 26" />
      <path d="M54 22 L42 18 L36 40 C 35 46 39 50 44 51 C 49 52 53 49 54 44 Z" />
      <path d="M44 51 L40 68 M33 66 L47 70" />
      <path d="M53 30 L39 26" />
      <path d="M32 4 L32 12 M24 8 L27 13 M40 8 L37 13" />
    </svg>
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

/* ---------- Các khối nội dung ---------- */

const RED = "#7f0606";

/** Bìa: ảnh lớn 420×630, "SAVE the DATE" + tên đè phần dưới */
function Cover({ c, names }) {
  const b = boxIn(630);
  return (
    <Frame H={630} className="overflow-hidden text-white">
      <img src={images.hero} alt={names.join(" & ")} className="absolute inset-0 h-full w-full object-cover object-top" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent to-black/45" />
      <div style={b(35, 393, 215, 112)}>
        <Reveal variant="left" duration={3}>
          <p className="font-didot leading-[1.6] whitespace-nowrap" style={{ fontSize: fz(70) }}>SAVE</p>
        </Reveal>
      </div>
      <div style={b(48, 468, 92, 128)}>
        <Reveal variant="fade" duration={3}>
          <p className="font-pinyon text-center leading-[1.6]" style={{ fontSize: fz(66) }}>the</p>
        </Reveal>
      </div>
      <div style={b(150, 476, 270, 112)}>
        <Reveal variant="right" duration={3}>
          <p className="font-didot leading-[1.6] whitespace-nowrap" style={{ fontSize: fz(70) }}>DATE</p>
        </Reveal>
      </div>
      <div style={b(0, 574, 390, 40)}>
        <Reveal variant="right" duration={3}>
          <h1 className="font-didot uppercase text-right whitespace-nowrap leading-[1.6]" style={{ fontSize: fz(25) }}>
            {names[0]} &amp; {names[1]}
          </h1>
        </Reveal>
      </div>
    </Frame>
  );
}

/** Chữ lồng 2 chữ cái đầu + câu tiếng Anh */
function Monogram({ initials, quote }) {
  const b = boxIn(176);
  return (
    <Frame H={176} style={{ color: RED }}>
      <Reveal variant="fade" duration={3}>
        <div className="absolute inset-0" style={{ color: RED }}>
          <span className="font-didot leading-[1.6]" style={{ ...b(163, 4, 56, 70), fontSize: fz(44), textAlign: "center" }}>
            {initials[0]}
          </span>
          <span className="font-guest leading-[1.6] opacity-60" style={{ ...b(170, 10, 72, 63), fontSize: fz(40), textAlign: "center" }}>
            &amp;
          </span>
          <span className="font-didot leading-[1.6]" style={{ ...b(202, 33, 54, 70), fontSize: fz(44), textAlign: "center" }}>
            {initials[1]}
          </span>
        </div>
      </Reveal>
      <p className="font-taviraj text-center leading-[1.6]" style={{ ...b(60, 117, 301, 40), fontSize: fz(11), color: RED }}>
        {quote}
      </p>
    </Frame>
  );
}

/** 3 ảnh dọc khung hồng, chữ ngày / tháng / năm */
function DateStrip({ parts }) {
  const b = boxIn(196);
  const xs = [8, 144, 281];
  return (
    <Frame H={196}>
      {images.dateStrip.map((src, i) => (
        <div key={i} className="overflow-hidden border-[3px] border-[#dcc4c3]" style={b(xs[i], 0, 131, 196)}>
          <img src={src} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
          <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-b from-transparent to-black/35" />
          <div className="absolute inset-x-0 top-[66%]">
            <Reveal variant="up" duration={3} delay={i * 150}>
              <p className="font-didot text-center text-white leading-[1.6]" style={{ fontSize: fz(35) }}>
                {parts[i]}
              </p>
            </Reveal>
          </div>
        </div>
      ))}
    </Frame>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Lịch tháng: tên tháng viết tay, ngày cưới in trên tim vân tay */
function MonthCalendar({ dateIso }) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div style={{ color: RED }}>
      <p className="font-guest text-center leading-[1.6]" style={{ fontSize: fz(38) }}>
        {MONTHS_EN[m - 1]}
      </p>
      <div className="mx-auto w-[78%] translate-x-[1%]">
        <div className="grid grid-cols-7 font-montserrat font-bold uppercase" style={{ fontSize: fz(12.5) }}>
          {WEEKDAYS.map((w) => (
            <span key={w} className="text-center">{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 font-lora mt-[3%]" style={{ fontSize: fz(14) }}>
          {cells.map((day, i) =>
            day === d ? (
              <span key={i} className="relative flex aspect-[46/41] items-center justify-center">
                <span className="absolute inset-0 flex items-center justify-center">
                  <img src={images.deco.heart} alt="" className="w-[100%] max-w-none animate-pulse-soft" />
                </span>
                <span className="relative font-bold text-white [text-shadow:0_0_3px_rgba(127,6,6,0.6)]">{day}</span>
              </span>
            ) : (
              <span key={i} className="flex aspect-[46/41] items-center justify-center">
                {day ?? ""}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function FamilySide({ side }) {
  return (
    <div className="font-lora uppercase text-center" style={{ color: RED }}>
      <h3 className="font-bold leading-[1.6]" style={{ fontSize: fz(15) }}>{side.label}</h3>
      {side.father && (
        <p className="leading-[1.6] mt-0.5" style={{ fontSize: fz(12) }}>Ông {side.father}</p>
      )}
      {side.mother && (
        <p className="leading-[1.6]" style={{ fontSize: fz(12) }}>Bà {side.mother}</p>
      )}
      {side.address && (
        <p className="font-quicksand normal-case leading-snug mt-1 opacity-80" style={{ fontSize: fz(11.5) }}>{side.address}</p>
      )}
    </div>
  );
}

/** Đoạn kẻ ngang hai bên tháng / năm */
function Ruled({ children, variant }) {
  return (
    <Reveal variant={variant} duration={3}>
      <div className="border-y border-[#7f0606]/70 py-[2px] text-center font-lora leading-[1.6]" style={{ fontSize: fz(20), width: "100%" }}>
        {children}
      </div>
    </Reveal>
  );
}

function EventBlock({ item, mapLabel }) {
  const [dd, mm, yyyy] = item.date.split(/\.\s*/);
  if (item.compact) {
    return (
      <div className="text-center font-lora opacity-80" style={{ color: RED }}>
        <h3 className="font-bold uppercase leading-[1.6]" style={{ fontSize: fz(16) }}>{item.title}</h3>
        <p className="uppercase leading-[1.6]" style={{ fontSize: fz(14) }}>
          {item.time} · {dd}.{mm}.{yyyy}
        </p>
        <p className="font-quicksand italic leading-[1.6]" style={{ fontSize: fz(12) }}>{item.lunar}</p>
      </div>
    );
  }
  return (
    <div className="text-center font-lora" style={{ color: RED }}>
      {item.badge && (
        <p className="mx-auto mb-2 inline-block rounded-full px-[5%] py-[0.6%] font-bold uppercase tracking-wider text-white" style={{ background: RED, fontSize: fz(13) }}>
          {item.badge}
        </p>
      )}
      <Reveal variant="left" duration={3}>
        <h3 className="font-bold uppercase leading-[1.6]" style={{ fontSize: fz(22) }}>{item.title}</h3>
      </Reveal>
      <p className="uppercase leading-[1.6] mt-1" style={{ fontSize: fz(17) }}>{item.time}</p>
      <div className="flex items-center justify-center" style={{ height: fz(78) }}>
        <div className="w-[25%]">
          <Ruled variant="left">THÁNG {Number(mm)}</Ruled>
        </div>
        <div className="w-[28%]">
          <Reveal variant="fade" duration={4}>
            <p className="leading-none" style={{ fontSize: fz(70) }}>{dd}</p>
          </Reveal>
        </div>
        <div className="w-[25%]">
          <Ruled variant="right">NĂM {yyyy}</Ruled>
        </div>
      </div>
      <p className="font-quicksand italic leading-[1.6]" style={{ fontSize: fz(14) }}>{item.lunar}</p>
      {item.places.map((place) => (
        <div key={place.label} className="mt-2">
          <Reveal variant="left" duration={3}>
            <p className="uppercase leading-[1.6]" style={{ fontSize: fz(22) }}>{place.label}</p>
          </Reveal>
          <p className="font-quicksand leading-[1.6] px-[9%] mt-0.5" style={{ fontSize: fz(13) }}>
            Địa chỉ: {place.address}
          </p>
          <a
            href={mapUrl(place.mapQuery ?? place.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex flex-col items-center font-bold uppercase animate-pulse-3"
            style={{ fontSize: fz(15) }}
          >
            <MapPin className="h-[1.8em] w-[1.8em] fill-[#7f0606] text-[#f4f3f1]" strokeWidth={1.6} aria-hidden />
            <span className="mt-1">{mapLabel}</span>
          </a>
        </div>
      ))}
    </div>
  );
}

/** Ảnh lớn có câu chữ viết tay đè phần dưới */
function QuoteImage({ text }) {
  return (
    <Frame H={595} className="overflow-hidden">
      <img src={images.quote} alt="" className="absolute inset-0 h-full w-full object-cover object-top" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-b from-transparent to-black/45" />
      <div className="absolute inset-x-0 top-[76%]">
        <Reveal variant="up" duration={3}>
          <p className="font-pinyon whitespace-pre-line text-center text-white leading-[1.6]" style={{ fontSize: fz(28) }}>
            {text}
          </p>
        </Reveal>
      </div>
    </Frame>
  );
}

/** Ô đặt chữ + icon cho 4 mốc trên đường cong của mẫu */
const TIMELINE_SLOTS = [
  { text: [121, 103], dot: [287, 141], icon: [158, 159, 49, 67], anim: "left" },
  { text: [227, 242], dot: [172, 250], icon: [258, 303, 60, 72], anim: "left" },
  { text: [19, 390], dot: [186, 394], icon: [53, 437, 55, 61], anim: "up" },
  { text: [121, 556], dot: [309, 556], icon: [155, 612, 55, 61], anim: "right" },
];

function TimelineIcon({ name, className }) {
  if (name === "toast") return <ToastIcon className={className} />;
  return <img src={images.deco[name]} alt="" className={`${className} object-contain`} loading="lazy" />;
}

function Timeline({ t }) {
  const H = 776;
  const b = boxIn(H);
  return (
    <Frame H={H} className="overflow-hidden">
      <h2 className="font-pinyon text-center leading-[1.6]" style={{ ...b(0, 0, 420, 56), fontSize: fz(38), color: RED }}>
        {t.title}
      </h2>
      <div style={b(64, 76, 331, 549)}>
        <img src={images.deco.timeline} alt="" className="absolute" style={{ width: "74.3%", left: "3%", top: "0.9%" }} />
      </div>
      {t.items.slice(0, 4).map((item, i) => {
        const s = TIMELINE_SLOTS[i];
        return (
          <React.Fragment key={item.time}>
            <span className="rounded-full" style={{ ...b(s.dot[0], s.dot[1], 10, 10), background: RED, height: "auto", aspectRatio: "1" }} />
            <div style={b(s.text[0], s.text[1], 123)}>
              <Reveal variant={s.anim} duration={3}>
                <p className="font-lora font-bold text-center uppercase leading-[1.6]" style={{ fontSize: fz(14.5), color: RED }}>
                  {item.time}
                </p>
                <p className="font-lora text-center uppercase leading-[1.6]" style={{ fontSize: fz(13), color: RED }}>
                  {item.label}
                </p>
              </Reveal>
            </div>
            <div className="flex items-center justify-center" style={b(...s.icon)}>
              <TimelineIcon name={item.icon} className="h-full w-full" />
            </div>
          </React.Fragment>
        );
      })}
      <img
        src={images.deco.callaCorner}
        alt=""
        className="pointer-events-none"
        style={{ ...b(0, 603, 176, 172), transform: "rotate(90deg) scaleY(-1)" }}
      />
    </Frame>
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

/** Đếm ngược đè lên ảnh lớn */
function Countdown({ c }) {
  const parts = useCountdown(c.target);
  const b = boxIn(630);
  const xs = [16, 116, 217, 317];
  return (
    <Frame H={630} className="overflow-hidden text-white">
      <img src={images.countdown} alt="" className="absolute inset-0 h-full w-full object-cover object-top" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-transparent to-black/50" />
      <div style={b(0, 428, 420, 64)}>
        <Reveal variant="up" duration={3}>
          <h2 className="font-pinyon text-center leading-[1.6]" style={{ fontSize: fz(40) }}>{c.title}</h2>
        </Reveal>
      </div>
      {parts.map((v, i) => (
        <React.Fragment key={c.labels[i]}>
          <p className="font-didot text-center tabular-nums leading-none" style={{ ...b(xs[i], 508, 91, 50), fontSize: fz(38) }}>
            {String(v).padStart(2, "0")}
          </p>
          <p className="font-notoserif text-center leading-[1.6]" style={{ ...b(xs[i] + 4, 559, 81, 26), fontSize: fz(16) }}>
            {c.labels[i]}
          </p>
          {i > 0 && (
            <p className="font-lora text-center leading-none" style={{ ...b(xs[i] - 22, 510, 26, 43), fontSize: fz(26.7) }}>
              :
            </p>
          )}
        </React.Fragment>
      ))}
    </Frame>
  );
}

/** Our Moments: 3 ảnh khung trắng chồng nhau + chữ */
function Moments({ m }) {
  const H = 595;
  const b = boxIn(H);
  const frame = "absolute overflow-hidden border-[5px] border-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]";
  return (
    <Frame H={H} style={{ color: RED }}>
      <div style={b(126, 0, 185, 237)}>
        <Reveal variant="down" duration={3} className="h-full" wrapClassName="h-full">
          <div className={`${frame} inset-0`} style={{ position: "relative", height: "100%" }}>
            <img src={images.moments[0]} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
          </div>
        </Reveal>
      </div>
      <p className="font-trirong italic text-center" style={{ ...b(297, 53, 118, 22), fontSize: fz(14), color: RED }}>{m.captions[1]}</p>
      <div style={b(288, 86, 120, 98)}>
        <Reveal variant="right" duration={3} className="h-full" wrapClassName="h-full">
          <div className={frame} style={{ position: "relative", height: "100%" }}>
            <img src={images.moments[1]} alt="" className="h-full w-full object-cover object-[center_62%]" loading="lazy" />
          </div>
        </Reveal>
      </div>
      <p className="font-taviraj italic text-center" style={{ ...b(20, 104, 118, 22), fontSize: fz(14), color: RED }}>{m.captions[0]}</p>
      <div style={b(12, 136, 188, 221)}>
        <Reveal variant="left" duration={3} className="h-full" wrapClassName="h-full">
          <div className="relative h-full border-[5px] border-white bg-[#f8f3ed]/90">
            <p className="absolute inset-x-0 top-[28%] text-center font-tinos uppercase leading-none" style={{ fontSize: fz(34), color: RED }}>
              {m.title[0]}
            </p>
            <p className="absolute inset-x-0 top-[38%] text-center font-pinyon leading-[1.6]" style={{ fontSize: fz(42), color: RED }}>
              {m.title[1]}
            </p>
          </div>
        </Reveal>
      </div>
      <div style={b(177, 194, 231, 305)}>
        <Reveal variant="up" duration={3} className="h-full" wrapClassName="h-full">
          <div className={frame} style={{ position: "relative", height: "100%" }}>
            <img src={images.moments[2]} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
          </div>
        </Reveal>
      </div>
      <div style={b(0, 370, 173, 45)}>
        <Reveal variant="left" duration={3}>
          <p className="font-taviraj italic text-right leading-[1.6]" style={{ fontSize: fz(14), color: RED }}>{m.text}</p>
        </Reveal>
      </div>
      <img
        src={images.deco.calla}
        alt=""
        className="pointer-events-none object-contain"
        style={{ ...b(-50, 430, 300, 140), transform: "rotate(17deg)" }}
      />
    </Frame>
  );
}

/** Ảnh lớn + dải ảnh nhỏ (bấm để đổi, tự chuyển 4 giây) */
function Gallery({ list }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef(null);
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState !== "hidden") setActive((i) => (i + 1) % list.length);
    }, 4000);
    return () => clearInterval(t);
  }, [list.length, active]);
  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.children[active];
    if (strip && el) strip.scrollTo({ left: el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <div className="border-[6px] border-white bg-white">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "408 / 620" }}>
        {list.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div ref={stripRef} className="no-scrollbar mt-[6px] flex gap-[8px] overflow-x-auto">
        {list.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ảnh ${i + 1}`}
            className={`shrink-0 basis-[calc((100%-40px)/6)] transition-opacity ${i === active ? "opacity-100" : "opacity-55"}`}
          >
            <img src={src} alt="" className="aspect-[56/66] w-full object-cover object-top" loading="lazy" />
          </button>
        ))}
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
    "w-full rounded-full border border-[#22371a] bg-white/60 px-3 py-[11px] font-taviraj text-[15px] text-[#22371a] placeholder:text-[#22371a]/80 outline-none focus:ring-2 focus:ring-[#7f0606]/30";

  return (
    <div className="text-center" style={{ color: RED }}>
      <Reveal variant="down" duration={3}>
        <h2 className="font-guest leading-[1.6]" style={{ fontSize: fz(30) }}>{c.title}</h2>
      </Reveal>
      <p className="font-taviraj leading-[1.6] px-[13%] mt-1" style={{ fontSize: fz(15) }}>{c.intro}</p>
      {sent ? (
        <p className="font-lora text-lg py-6 px-[9%]">{c.thanks}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-4 w-[85%] space-y-[13px]">
          <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={inputCls} />
          <input value={form.message} onChange={update("message")} placeholder={c.placeholders.message} className={inputCls} />
          {c.askAttend && (
            <select
              required
              value={form.attend}
              onChange={update("attend")}
              className={`${inputCls} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='10'%20height='6'%3E%3Cpath%20d='M0%200h10L5%206z'%20fill='%2322371a'/%3E%3C/svg%3E")] bg-[length:10px_6px] bg-[right_16px_center] bg-no-repeat`}
            >
              <option value="" disabled>
                {c.placeholders.attend}
              </option>
              <option value="yes">{c.attendYes}</option>
              <option value="no">{c.attendNo}</option>
            </select>
          )}
          {c.askAttend && form.attend === "yes" && (
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
          <div className="pt-2">
            {error && <p className="text-sm mb-3">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-[70%] rounded-[20px] border border-[#7f0606] bg-[#7f0606] py-[9px] font-lora text-[15px] uppercase text-white shadow transition hover:brightness-110 disabled:opacity-70"
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
          className="w-36 h-36 rounded-xl border-2 border-[#7f0606]/70 bg-white p-1.5 shadow-md"
        />
      )}
      <dl className="mt-3 space-y-1 font-lora font-bold text-[13px] uppercase text-[#7f0606]">
        <div><dt className="inline">CTK: </dt><dd className="inline">{account.holder}</dd></div>
        <div><dt className="inline">STK: </dt><dd className="inline tracking-wide">{account.number}</dd></div>
        <div><dt className="inline">NH: </dt><dd className="inline">{account.bank}</dd></div>
      </dl>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#7f0606] px-4 py-1.5 font-lora text-sm text-white shadow transition hover:brightness-110"
        >
          {copied ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
          {copied ? c.copiedLabel : c.copyLabel}
        </button>
        {account.qr && (
          /** Khách mở thiệp trên chính điện thoại thì không quét được — lưu ảnh rồi chọn trong app ngân hàng */
          <a
            href={account.qr}
            download={`QR-${account.bank}-${account.number}.png`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#7f0606]/50 px-4 py-1.5 font-lora text-sm text-[#7f0606] transition hover:bg-[#7f0606] hover:text-white"
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
        className="paper relative w-full max-w-[400px] max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl animate-pop"
      >
        <div className="relative max-h-[90vh] overflow-y-auto px-4 pt-5 pb-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 text-[#7f0606]/70 hover:text-[#7f0606]"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="font-guest text-[38px] leading-tight whitespace-nowrap text-[#7f0606] text-center mt-3">{c.title}</h2>
          <div className="h-px bg-[#7f0606]/20 my-4" />
          <div className="grid grid-cols-[1fr_1.1fr] items-center gap-3">
            <img
              src={photo}
              alt=""
              className="w-full aspect-[3/4] object-cover rounded-2xl border-4 border-white shadow-lg"
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

/** Ảnh tròn trong vòng lá + nút Gửi mừng cưới */
function CirclePhoto({ gift, onGift }) {
  return (
    <div className="relative mx-auto w-full" style={{ aspectRatio: gift ? "420 / 280" : "420 / 235" }}>
      <div className="absolute animate-tada" style={{ left: "22.9%", top: 0, width: "48.6%", aspectRatio: "1" }}>
        <img src={images.deco.wreath} alt="" className="absolute -left-[2%] -top-[3%] w-[106%] max-w-none" />
        <div className="absolute left-[5%] top-[8%] w-[92%] aspect-square overflow-hidden rounded-full border-[5px] border-white shadow-[0_6px_18px_rgba(127,6,6,0.18)]">
          <img src={images.circle} alt="" className="h-full w-full object-cover object-[center_22%]" loading="lazy" />
        </div>
      </div>
      {gift && (
        <button
          type="button"
          onClick={onGift}
          className="absolute left-1/2 -translate-x-1/2 inline-flex items-center justify-center gap-2 rounded-full bg-[#7f0606] font-lora uppercase text-white shadow-lg animate-pulse-3"
          style={{ top: "84%", width: "42.9%", height: "13.2%", fontSize: fz(13) }}
        >
          <Gift className="h-[1.3em] w-[1.3em]" aria-hidden />
          {gift}
        </button>
      )}
    </div>
  );
}

/** Thank You: ảnh lớn loang đỏ rượu ở dưới, chữ cảm ơn + ký tên */
function ThankYou({ t }) {
  /** Cao hơn mẫu (472) để dòng ký tên không nằm dưới nút nhạc */
  const H = 580;
  const b = boxIn(H);
  return (
    <Frame H={H} className="overflow-hidden text-white">
      <img src={images.thankYou} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_18%]" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% via-[#7f0606]/70 via-[62%] to-[#7f0606]" />
      <div style={b(0, 300, 420, 64)}>
        <Reveal variant="down" duration={3}>
          <h2 className="font-guest text-center leading-[1.6]" style={{ fontSize: fz(42) }}>{t.title}</h2>
        </Reveal>
      </div>
      <p className="font-cormorant text-center leading-[1.6]" style={{ ...b(48, 366, 324, 90), fontSize: fz(15) }}>
        {t.text}
      </p>
      <p className="font-pinyon text-center leading-[1.6]" style={{ ...b(0, 462, 420, 44), fontSize: fz(26) }}>
        {t.sign}
      </p>
    </Frame>
  );
}

function WeddingPage() {
  const c = content;
  const guest = useGuestName(c.invitation.defaultGuest);
  const [giftOpen, setGiftOpen] = useState(false);
  const closeGift = useCallback(() => setGiftOpen(false), []);
  const names = c.hero.names;
  const initials = names.map((n) => n.split(" ").pop()[0]);
  const [nameA, nameB] = c.families.fullNames;

  return (
    <div className="min-h-screen bg-[#e7e5e2] font-lora">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects />

      <main className="paper relative mx-auto max-w-[420px] overflow-hidden shadow-2xl [container-type:inline-size]" style={{ color: RED }}>
        <Cover c={c.hero} names={names} />
        <div className="pt-[2.6%]">
          <Monogram initials={initials} quote={c.hero.quote} />
        </div>
        <DateStrip parts={c.invitation.dateParts} />

        {c.calendar.dateIso && (
          <section className="pt-[3.5%]">
            <MonthCalendar dateIso={c.calendar.dateIso} />
            <Reveal variant="fade" duration={4}>
              <img src={images.deco.calla} alt="" className="mx-auto mt-[4%] w-[50.5%]" />
            </Reveal>
          </section>
        )}

        {/* Nhà trai / Nhà gái */}
        <section className="grid grid-cols-2 gap-x-[12.8%] px-[1%] pt-[14%]">
          {c.families.sides.map((side, i) => (
            <Reveal key={side.label} variant={i ? "right" : "left"} duration={3}>
              <FamilySide side={side} />
            </Reveal>
          ))}
        </section>

        {/* Lời mời + tên khách + tên hai người */}
        <section className="pt-[7%] text-center font-lora uppercase">
          <p className="leading-[1.6]" style={{ fontSize: fz(17) }}>{c.invitation.kicker}</p>
          <div className="mx-auto w-[48.3%] border-b border-dotted border-[#7f0606]/80">
            <p className="font-guest normal-case leading-[1.5] whitespace-nowrap" style={{ fontSize: fz(guest.length > 18 ? 26 : 34) }}>
              {guest}
            </p>
          </div>
          <p className="whitespace-pre-line leading-[1.6] mt-[2%]" style={{ fontSize: fz(17) }}>{c.invitation.title}</p>
          <div className="mx-auto mt-[2%] w-px bg-[#7f0606]" style={{ height: fz(54) }} />
          <div className="relative py-[2%]">
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-guest normal-case opacity-10" style={{ fontSize: fz(100) }} aria-hidden>
              &amp;
            </span>
            <Reveal variant="zoom" duration={3}>
              <p className="font-didot leading-[1.6]" style={{ fontSize: fz(40) }}>{nameA}</p>
              <p className="font-didot leading-[1.6]" style={{ fontSize: fz(40) }}>{nameB}</p>
            </Reveal>
          </div>
          <div className="mx-auto w-px bg-[#7f0606]" style={{ height: fz(54) }} />
        </section>

        {/* Sự kiện */}
        <section className="pt-[3%] pb-[8%]">
          {c.events.items.map((item, i) => (
            <React.Fragment key={item.id}>
              {i > 0 && <div className="mx-auto my-[6%] h-px w-[41%] bg-[#7f0606]/60" />}
              <EventBlock item={item} mapLabel={c.events.mapLabel} />
            </React.Fragment>
          ))}
        </section>

        <QuoteImage text={c.quoteImage} />

        <section className="pt-[6%]">
          <Timeline t={c.timeline} />
        </section>

        {c.countdown && <Countdown c={c.countdown} />}

        <section className="pt-[8%] pb-[2%]">
          <Moments m={c.moments} />
        </section>

        <Gallery list={images.album} />

        {c.rsvp.show && (
          <section className="pt-[9%]">
            <RsvpForm c={c.rsvp} />
          </section>
        )}

        <section className="pt-[7%] pb-[3%]">
          <CirclePhoto gift={c.gift.accounts.length > 0 ? c.gift.button : null} onGift={() => setGiftOpen(true)} />
        </section>

        <ThankYou t={c.thanks} />
      </main>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
