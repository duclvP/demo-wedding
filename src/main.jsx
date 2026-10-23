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

/* ---------- Mẫu 05: phong bì đỏ đô, hoa văn vàng (ảnh PNG của mẫu gốc, xem image.js → deco) ---------- */

/**
 * Màn đầu dựng theo tọa độ của mẫu gốc trên khung 420×870, quy ra % để co theo màn hình.
 * Mỗi ảnh của mẫu bị cắt khung (background cover + offset) → img đặt tuyệt đối trong hộp overflow-hidden
 * với width/left/top đúng tỉ lệ cắt của mẫu.
 */
const CANVAS = { w: 420, h: 870 };
const box = (x, y, w, h) => ({
  left: `${(x / CANVAS.w) * 100}%`,
  top: `${(y / CANVAS.h) * 100}%`,
  width: `${(w / CANVAS.w) * 100}%`,
  aspectRatio: `${w} / ${h}`,
});

/** Ảnh trang trí cắt khung: crop = { w, l, t } tính theo % hộp (w, l theo chiều rộng; t theo chiều cao) */
function Cropped({ src, crop, className = "", style, alt = "" }) {
  return (
    <div className={`absolute overflow-hidden ${className}`} style={style} aria-hidden={!alt}>
      <img
        src={src}
        alt={alt}
        className="absolute max-w-none"
        style={{ width: `${crop.w}%`, left: `${crop.l}%`, top: `${crop.t}%` }}
      />
    </div>
  );
}

/**
 * Phong bì: trước khi mở là ảnh phong bì đóng; bấm → đổi sang bộ ảnh phong bì mở (mặt sau + ảnh cưới + mặt trước),
 * ảnh cưới trượt lên 300px trong 2s (đúng hiệu ứng moveUp của mẫu).
 */
function EnvelopeCover({ open, photo, alt, hint, names, dateLines }) {
  const d = images.deco;
  /** Lớp phong bì đóng mờ dần 300ms rồi mới gỡ — đổi ảnh tức thì như mẫu gốc nhìn bị giật */
  const [closedGone, setClosedGone] = useState(false);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setClosedGone(true), 400);
    return () => clearTimeout(t);
  }, [open]);
  return (
    <div className="relative mx-auto w-full max-w-[420px]" style={{ aspectRatio: `${CANVAS.w} / ${CANVAS.h}` }}>
      {/* Góc hoa văn vàng — ảnh vuông bị kéo thành 69×97 như mẫu */}
      <img src={d.gocVang} alt="" className="absolute left-0 top-0 h-auto" style={{ ...box(0, 0, 69, 97) }} />
      <img src={d.gocVang} alt="" className="absolute top-0 -scale-x-100" style={{ ...box(351, 0, 69, 97) }} />
      {/* Chữ "Thiệp Mời Cưới" (ảnh) — đứng yên, chỉ nhích lên 8px sau khi mở (mẫu cho chạy lại fadeInDown → chớp tắt) */}
      <img
        src={d.thiepMoiCuoi}
        alt="Thiệp mời cưới"
        className="absolute transition-[top] duration-700 ease-out"
        style={{ ...box(124, open ? 13 : 21, 172, 95) }}
      />

      {!closedGone && (
        <div className={`transition-opacity duration-300 ${open ? "opacity-0 pointer-events-none" : ""}`}>
          <Cropped src={d.hyVang} crop={{ w: 92.5, l: 2, t: 5.5 }} className="anim-fade-up-4" style={box(160, 148.5, 100, 108.5)} />
          <Cropped src={d.pbDong} crop={{ w: 107.34, l: -3.62, t: -47.5 }} style={box(33, 292, 350, 255.5)} />
          <p
            className="absolute inset-x-0 text-center font-lora text-[18px] leading-[1.6] text-[#9c0505] animate-pulse-soft"
            style={{ top: `${(554.5 / CANVAS.h) * 100}%` }}
          >
            - {hint} -
          </p>
        </div>
      )}
      {open && (
        <div className="anim-fade-in-300">
          <Cropped src={d.pbMoSau} crop={{ w: 102.2, l: -3.62, t: 3.58 }} style={box(34.5, 157.8, 366.5, 390.6)} />
          <div className="absolute left-0 top-0 w-full overflow-hidden" style={{ height: `${(538 / CANVAS.h) * 100}%` }}>
            <div
              className="env-photo absolute overflow-hidden rounded-[20px] border-2 border-[#a6a6a6] bg-white"
              style={{ ...box(55.1, 421.9, 305.4, 380), top: `${(421.9 / 538) * 100}%` }}
            >
              <img src={photo} alt={alt} className="h-full w-full object-cover object-top" />
            </div>
          </div>
          <Cropped src={d.pbMoTruoc} crop={{ w: 103.4, l: -1.54, t: -37.1 }} style={box(26.4, 271, 363.5, 271.1)} />
        </div>
      )}

      {/* Tên + ngày + 囍 hồng: chỉ gắn vào trang sau khi mở (mẫu gốc đổi tab) */}
      {open && (
      <div className="absolute inset-x-0" style={{ top: `${(584.5 / CANVAS.h) * 100}%` }}>
        <div className="border-y-[3px] border-[#b2bca3]/30 py-2 relative">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-1">
            <Reveal variant="left" duration={4} className="text-right">
              <span className="font-script text-[clamp(30px,10vw,42px)] leading-[1.6] whitespace-nowrap">{names[0]}</span>
            </Reveal>
            <Reveal variant="bounce" duration={5}>
              <Heart className="h-[38px] w-[39px] text-[#b9051a]" />
            </Reveal>
            <Reveal variant="right" duration={5} className="text-left">
              <span className="font-script text-[clamp(30px,10vw,42px)] leading-[1.6] whitespace-nowrap">{names[1]}</span>
            </Reveal>
          </div>
        </div>
        <Reveal variant="down" duration={5} className="mt-2 text-center">
          <p className="font-lora text-[48px] leading-[1.3]">{dateLines[0]}</p>
          <p className="font-lora text-[50px] leading-[1.3] -mt-3">{dateLines[1]}</p>
        </Reveal>
      </div>
      )}
      {open && (
        <>
          <img src={d.hyHong} alt="" className="absolute opacity-30" style={box(28, 766, 88, 88)} />
          <img src={d.hyHong} alt="" className="absolute opacity-30" style={box(308.5, 766, 88, 88)} />
        </>
      )}
    </div>
  );
}

function Heart({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 3 5 6.4 5c2 0 3.6 1.1 4.6 2.6C12 6.1 13.6 5 15.6 5 19 5 21.1 8.6 19.6 11.9 17.5 16.4 12 21 12 21z"
      />
    </svg>
  );
}

/** Nhẫn đôi (ảnh của mẫu, cắt khung 69×56) */
function Rings({ className = "" }) {
  return (
    <Cropped
      src={images.deco.nhanDoi}
      crop={{ w: 158.5, l: -48.1, t: -109.4 }}
      className={`relative ${className}`}
      style={{ aspectRatio: "69.5 / 56" }}
    />
  );
}

/** Khối một bên gia đình — cỡ chữ theo mẫu: tên bên 18px đậm, bố mẹ 13px đậm in hoa, địa chỉ 12px */
function FamilySide({ side }) {
  return (
    <div className="text-left font-avo">
      <h3 className="font-bold uppercase text-[18px] leading-[28.8px] mb-[7px]">{side.label}</h3>
      {side.father && <p className="font-bold uppercase text-[13px] leading-[20.8px]">Ông {side.father}</p>}
      {side.mother && <p className="font-bold uppercase text-[13px] leading-[20.8px]">Bà {side.mother}</p>}
      {side.address && <p className="font-sans text-[12px] leading-[19.2px] mt-[2px]">{side.address}</p>}
    </div>
  );
}

function EventBlock({ item, mapLabel }) {
  const lineCls = "min-w-[92px] border-y border-foreground/35 px-2 py-1.5 whitespace-nowrap font-lora uppercase";
  return (
    <div className="text-center">
      <p className="font-oswald font-medium text-[18px] uppercase tracking-wide text-[#a30d0d]">{item.title}</p>
      <p className="font-avo font-semibold uppercase text-[15px] text-primary mt-3">Vào lúc {item.hour}</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <span className={`${lineCls} text-[17px]`}>{item.weekday}</span>
        <span className="font-lora font-bold text-[64px] leading-none text-[#a30d0d]">{item.day}</span>
        <span className={`${lineCls} text-[17px]`}>{item.monthYear}</span>
      </div>
      <p className="italic text-[13px] text-primary/90 mt-3">{item.lunar}</p>
      {item.places.map((place) => (
        <div key={place.label} className="mt-4">
          <p className="font-oswald font-medium text-[24px] uppercase text-[#b24a4a] leading-tight">{place.label}</p>
          <p className="text-[13px] text-foreground/60 mt-1">( {place.address} )</p>
          <a
            href={mapUrl(place.mapQuery ?? place.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#a30d0d] px-12 py-2.5 font-avo font-semibold uppercase text-[17px] text-white shadow-md transition hover:scale-105"
          >
            <MapPin className="h-5 w-5" aria-hidden />
            {mapLabel}
          </a>
        </div>
      ))}
    </div>
  );
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** dateIso: mảng ngày ISO cùng một tháng — các ngày đó được đánh dấu trái tim */
function MonthCalendar({ dateIso }) {
  const marked = dateIso.map((iso) => iso.split("-").map(Number));
  const [y, m] = marked[0];
  const days = marked.map((d) => d[2]);
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div>
      <p className="font-script text-[32px] leading-none text-white text-right pr-3 mb-3">
        Tháng {m} - {y}
      </p>
      <div className="grid grid-cols-7 text-center font-display font-bold text-[13px] text-white">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center font-display text-[15px] text-white mt-1">
        {cells.map((day, i) =>
          days.includes(day) ? (
            <span key={i} className="relative flex h-9 items-center justify-center">
              <Heart className="absolute h-9 w-9 text-[#e0303a] animate-pulse-soft" />
              <span className="relative font-bold">{day}</span>
            </span>
          ) : (
            <span key={i} className="flex h-9 items-center justify-center">{day ?? ""}</span>
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
  /** opened: phong bì đã mở (ảnh trượt lên, nhạc + hiệu ứng bắt đầu) */
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);
  const [first, second] = c.hero.names;

  /**
   * Khóa cuộn trang cho tới khi khách mở phong bì. Chrome giữ vị trí cuộn khi reload → nếu không kéo về
   * đầu trang, phong bì nằm ngoài màn hình mà khách lại không cuộn lên được.
   */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!opened) window.scrollTo(0, 0);
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  return (
    <div className="min-h-screen bg-[#f3eeee] text-foreground font-sans">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects active={opened} />

      <CurtainContext.Provider value={opened}>
        <main className="relative mx-auto min-h-screen max-w-[460px] bg-white overflow-hidden shadow-2xl">
          {/* Phong bì + tên + ngày */}
          <section className="relative cursor-pointer" onClick={handleOpen}>
            <EnvelopeCover
              open={opened}
              photo={images.hero}
              alt={`${first} & ${second}`}
              hint={c.hero.hint}
              names={c.hero.names}
              dateLines={c.hero.dateLines}
            />
          </section>

          {/* Phần còn lại chỉ gắn vào trang sau khi mở phong bì — màn hình cao hơn khung 870px sẽ không thấy ló mục dưới */}
          {opened && (
            <div className="anim-fade-in-500">
            {/* Gia đình hai bên — bố cục theo tọa độ mẫu (khung 420): vạch dọc trái, "Thư Mời Cưới" rồi hai nhà xếp dọc, ô đỏ bên phải */}
            <section className="relative mx-auto w-full max-w-[420px] pt-8 pb-[53px]">
              <div className="relative ml-4 mr-[128px] min-h-[461px]">
                <span className="absolute left-0 top-0 h-[66px] w-px bg-black" aria-hidden />
                <Reveal variant="right" duration={4} className="pt-[58px]">
                  <p className="font-upright text-[30px] leading-[48px]">
                    Thư
                    <br />
                    Mời
                    <br />
                    Cưới
                  </p>
                </Reveal>
                <span className="absolute left-0 top-[188px] bottom-0 w-px bg-black" aria-hidden />
                <div className="mt-[22px] ml-[9px] space-y-[29px]">
                  {c.families.sides.map((side) => (
                    <Reveal key={side.label} variant="right" duration={4}>
                      <FamilySide side={side} />
                    </Reveal>
                  ))}
                </div>
              </div>
              <div className="absolute right-[18px] top-[97px] h-[244px] w-[87px] bg-[#7d1f2a] text-white">
                <img src={images.deco.nhanVang} alt="" className="absolute left-[27px] top-[14px] h-8 w-8" />
                <Reveal variant="up" duration={4} className="absolute inset-x-0 top-[152px] text-center">
                  <span className="font-display font-bold text-[64px] leading-[77px]">囍</span>
                </Reveal>
              </div>
              <img
                src={images.deco.hoaSen}
                alt=""
                className="pointer-events-none absolute left-[262px] top-[410px] z-10 w-[158px] -rotate-[17deg] opacity-25"
                loading="lazy"
              />
            </section>

            {/* Báo tin */}
            <section className="px-3 pb-12 text-center">
              <Reveal>
                <p className="font-lora text-[16px] leading-[25.6px] uppercase text-black">
                  {c.invitation.announce[0]} <span className="text-[#9c0505] font-bold">{c.invitation.announce[1]}</span>{" "}
                  {c.invitation.announce[2]}
                </p>
              </Reveal>
              <Reveal variant="right" duration={4} className="mt-[11px]">
                <p className="font-script text-[40px] leading-[64px] text-[#9c0505]">{c.families.fullNames[0]}</p>
              </Reveal>
              <Reveal variant="bounce" duration={2} className="-my-4">
                <p className="font-script text-[39px] leading-[62px] text-[#9c0505]">&</p>
              </Reveal>
              <Reveal variant="left" duration={4}>
                <p className="font-script text-[40px] leading-[64px] text-[#9c0505]">{c.families.fullNames[1]}</p>
              </Reveal>
              <Reveal variant="up" duration={2} className="mt-6">
                <img
                  src={images.wide}
                  alt=""
                  className="w-full aspect-[387/240] rounded-[15px] border-2 border-[#d9d9d9] object-cover object-[center_22%]"
                  loading="lazy"
                />
              </Reveal>
            </section>

            {/* Lời mời + sự kiện */}
            <section className="pb-12 text-center">
              <Reveal className="relative">
                <Reveal variant="right" duration={3} className="absolute right-8 -top-5">
                  <img src={images.deco.timVanTay} alt="" className="h-10 w-10" loading="lazy" />
                </Reveal>
                <p className="font-lora font-bold uppercase text-[19px] text-[#a30d0d]">{c.invitation.kicker}</p>
                <p className="font-guest text-[44px] leading-tight text-[#a30d0d] mt-1 mx-12 border-b border-dotted border-foreground/60">
                  {guest}
                </p>
              </Reveal>
              <div className="grid grid-cols-3 gap-1.5 mt-6 px-1.5">
                {images.dateStrip.map((src, i) => (
                  <Reveal key={i} variant="up" delay={i * 150} className="relative border-[3px] border-[#e4c8cd]">
                    <img src={src} alt="" className="w-full aspect-[3/5] object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
                    <span className="absolute bottom-2 inset-x-0 text-center font-lora font-bold text-[32px] text-white/90 drop-shadow">
                      {c.invitation.dateParts[i]}
                    </span>
                  </Reveal>
                ))}
              </div>
              <Reveal className="mt-8">
                <p className="font-lora font-bold uppercase text-[22px] text-[#a30d0d]">{c.invitation.title}</p>
                <div className="mt-2 flex items-center justify-center gap-4">
                  <span className="font-script text-[26px] text-[#d79ca5]">{first}</span>
                  <Rings className="w-[70px]" />
                  <span className="font-script text-[26px] text-[#d79ca5]">{second}</span>
                </div>
              </Reveal>
              <div className="mt-8 space-y-12 px-4">
                {c.events.items.map((item, i) => (
                  <Reveal key={item.id} variant="up">
                    {i > 0 && (
                      <div className="mx-auto mb-10 flex w-48 items-center">
                        <img src={images.deco.timVanTay} alt="" className="h-8 w-8" loading="lazy" />
                        <div className="h-px flex-1 bg-primary/40" />
                      </div>
                    )}
                    <EventBlock item={item} mapLabel={c.events.mapLabel} />
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Lịch */}
            {c.calendar.dateIso.length > 0 && (
              <Reveal className="bg-primary px-3 py-6">
                <div className="grid grid-cols-[132px_1fr] items-center gap-3">
                  <div className="bg-white p-2 pb-1 shadow-md">
                    <img src={images.polaroid} alt="" className="w-full aspect-[3/4] object-cover object-top" loading="lazy" />
                    <p className="font-script text-[22px] text-center text-foreground/70 leading-tight">{c.calendar.photoCaption}</p>
                  </div>
                  <MonthCalendar dateIso={c.calendar.dateIso} />
                </div>
              </Reveal>
            )}

            {/* Xác nhận + mừng cưới */}
            <section className="px-4 pt-12 pb-10">
              {c.rsvp.show && (
                <Reveal>
                  <RsvpForm c={c.rsvp} />
                </Reveal>
              )}
              <Reveal variant="zoom" className="mt-4 flex justify-center">
                <div className="relative h-[199px] w-[199px]">
                  <img src={images.circle} alt="" className="absolute inset-[14px] h-[171px] w-[171px] rounded-full object-cover object-top" loading="lazy" />
                  <img src={images.deco.vongLa} alt="" className="absolute inset-0 h-full w-full" loading="lazy" />
                </div>
              </Reveal>
              {c.gift.accounts.length > 0 && (
                <Reveal className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setGiftOpen(true)}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#8a5a2b] px-9 py-3 font-lora font-semibold uppercase text-[15px] text-white shadow-lg animate-pulse-soft"
                  >
                    <Gift className="h-5 w-5" aria-hidden />
                    {c.gift.button}
                  </button>
                </Reveal>
              )}
            </section>

            {/* Our memories + album */}
            <section className="pb-4">
              <Reveal variant="left" className="px-4">
                <h2 className="font-script text-[50px] leading-none text-[#a30d0d] flex items-end gap-2">
                  {c.story.title}
                  <span className="mb-2 h-px flex-1 bg-[#a30d0d]" />
                </h2>
              </Reveal>
              <Reveal className="mt-3 px-5 font-script text-[19px] leading-relaxed text-[#a30d0d]">
                {c.story.text}
              </Reveal>
              <div className="mt-5 grid grid-cols-2 gap-2 px-2">
                {images.album.map((src, i) => (
                  <Reveal key={i} variant={i % 2 ? "right" : "left"} className={i % 2 ? "mt-6" : ""}>
                    <img src={src} alt="" className="w-full aspect-[2/3] object-cover border border-black/10" loading="lazy" />
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Thank you */}
            <section className="relative mx-2 mt-6 mb-0 overflow-hidden">
              <img src={images.thankYou} alt="" className="block w-full aspect-[3/4] object-cover object-top" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#8a0f1a] via-[#d98a95]/40 to-transparent" />
              {/* Định vị ở lớp ngoài — Reveal quan sát lớp bọc của nó, lớp đó phải có chiều cao thật */}
              <div className="absolute inset-x-0 bottom-0">
                <Reveal variant="up" className="px-5 pb-8 text-center text-white">
                  <h2 className="font-script text-[60px] leading-tight text-white/80 drop-shadow-lg">{c.thanks.title}</h2>
                  <p className="text-[13px] leading-relaxed drop-shadow">{c.thanks.text}</p>
                  <p className="font-script text-[34px] mt-3 drop-shadow-lg">
                    {c.families.fullNames[0]} &amp; {c.families.fullNames[1]}
                  </p>
                </Reveal>
              </div>
            </section>
            </div>
          )}
        </main>
      </CurtainContext.Provider>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(<WeddingPage />);
