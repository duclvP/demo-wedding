import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, Copy, Download, Gift, Volume2, VolumeX, X } from "lucide-react";
import { content } from "./content.js";
import { images } from "./image.js";
import GuestLinksPage, { isGuestLinksPage } from "./GuestLinks.jsx";
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

/* ---------- Mẫu 13: phong bì xanh rêu dấu sáp, lá màu nước (ảnh PNG của mẫu gốc, xem image.js → deco) ---------- */

/**
 * Màn đầu dựng theo tọa độ của mẫu gốc trên khung 420×880, quy ra % để co theo màn hình.
 * Mỗi ảnh của mẫu bị cắt khung (background cover + offset) → img đặt tuyệt đối trong hộp overflow-hidden
 * với width/left/top đúng tỉ lệ cắt của mẫu.
 */
const CANVAS = { w: 420, h: 880 };
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
 * Phong bì: trước khi mở là 囍 + phong bì đóng; bấm → đổi sang bộ ảnh phong bì mở (mặt sau + ảnh cưới + mặt trước),
 * ảnh cưới trượt lên 295px trong 2s (đúng hiệu ứng moveBottomToTop của mẫu).
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
    <div className="relative mx-auto w-full max-w-[420px] overflow-hidden" style={{ aspectRatio: `${CANVAS.w} / ${CANVAS.h}` }}>
      {/* Lá màu nước góc trên */}
      <img src={d.laMauNuoc} alt="" className="absolute opacity-[0.18]" style={box(-127, -39, 242, 215)} />
      <Cropped src={d.laGoc} crop={{ w: 122.9, l: 0, t: 0 }} className="rotate-[9deg] opacity-30" style={box(372, 23, 82, 101)} />
      <Cropped src={d.laGoc} crop={{ w: 100.9, l: 0, t: 0 }} className="-rotate-[39deg] opacity-30" style={box(381, 87, 92, 93)} />
      {/* Chữ "Thiệp Mời Cưới" (ảnh) — đứng yên khi mở (mẫu cho chạy lại fadeInDown → chớp tắt) */}
      <img src={d.thiepMoiCuoi} alt="Thiệp mời cưới" className="absolute anim-fade-down-5 mix-blend-multiply" style={box(106, -7, 209, 115)} />

      {!closedGone && (
        <div className={`transition-opacity duration-300 ${open ? "opacity-0 pointer-events-none" : ""}`}>
          <img src={d.hyXanh} alt="" className="absolute anim-fade-up-4" style={box(159, 151, 102, 106)} />
          <Cropped src={d.pbDong} crop={{ w: 107.4, l: -3.7, t: -49.3 }} style={box(38, 305, 344, 247)} />
          <p
            className="absolute inset-x-0 text-center font-sans text-[19px] leading-[1.6] tracking-wide text-[#b2bca3] animate-pulse-soft"
            style={{ top: `${(566 / CANVAS.h) * 100}%` }}
          >
            - {hint} -
          </p>
        </div>
      )}
      {open && (
        <div className="anim-fade-in-300">
          <Cropped src={d.pbMoSau} crop={{ w: 100, l: 1, t: 3.5 }} style={box(22, 170, 369, 423)} />
          {/* Khung cắt tới đáy phong bì — ảnh đang trượt không ló ra dưới phong bì */}
          <div className="absolute left-0 top-0 w-full overflow-hidden" style={{ height: `${(545 / CANVAS.h) * 100}%` }}>
            <div
              className="env-photo absolute overflow-hidden rounded-[20px] border-2 border-[#a6a6a6] bg-white"
              style={{ ...box(72, 421, 278, 347), top: `${(421 / 545) * 100}%` }}
            >
              <img src={photo} alt={alt} className="h-full w-full object-cover object-top" />
            </div>
          </div>
          <Cropped src={d.pbMoTruoc} crop={{ w: 102.3, l: -1.5, t: -37.1 }} style={box(30, 281, 362, 264)} />
        </div>
      )}

      {/* Tên + ngày: chỉ gắn vào trang sau khi mở (mẫu gốc đổi tab) */}
      {open && (
        <div className="absolute inset-x-0" style={{ top: `${(572 / CANVAS.h) * 100}%` }}>
          <div className="border-y-[3px] border-[#b2bca3]/25 py-1.5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-1">
              <Reveal variant="left" duration={5} className="text-center">
                <span className="font-edward text-[clamp(26px,8.3vw,35px)] leading-[1.6] whitespace-nowrap">{names[0]}</span>
              </Reveal>
              <Reveal variant="bounce" duration={5}>
                <Heart className="h-[40px] w-[37px] text-[#5d6b4c]" />
              </Reveal>
              <Reveal variant="right" duration={5} className="text-center">
                <span className="font-edward text-[clamp(26px,8.3vw,35px)] leading-[1.6] whitespace-nowrap">{names[1]}</span>
              </Reveal>
            </div>
          </div>
          <Reveal variant="down" duration={5} className="mt-1 text-center">
            <p className="font-philo text-[51px] leading-[1.45]">{dateLines[0]}</p>
            <p className="font-philo text-[52px] leading-[1.45] -mt-4">{dateLines[1]}</p>
          </Reveal>
        </div>
      )}
      {open && (
        <>
          <img src={d.laMauNuoc} alt="" className="absolute opacity-20 -scale-x-100 rotate-[38deg]" style={box(331, 676, 192, 215)} />
          <img src={d.laCanh} alt="" className="absolute opacity-60 rotate-2" style={box(-31, 712, 163, 163)} />
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

/** Nhẫn đôi (ảnh của mẫu, cắt khung 73×59) */
function Rings({ className = "" }) {
  return (
    <Cropped
      src={images.deco.nhanDoi}
      crop={{ w: 160, l: -48.6, t: -109.4 }}
      className={`relative ${className}`}
      style={{ aspectRatio: "73 / 59" }}
    />
  );
}

/** Khối một bên gia đình — cỡ chữ theo mẫu: tên bên 18px Tinos đậm, bố mẹ 14px Trirong đậm in hoa, địa chỉ 13px */
function FamilySide({ side }) {
  return (
    <div className="text-left">
      <h3 className="font-display font-bold uppercase text-[18px] leading-[28.8px] mb-[4px]">{side.label}</h3>
      {side.father && <p className="font-trirong font-bold uppercase text-[14px] leading-[22.4px]">Ông {side.father}</p>}
      {side.mother && <p className="font-trirong font-bold uppercase text-[14px] leading-[22.4px]">Bà {side.mother}</p>}
      {side.address && <p className="font-sans text-[13px] leading-[20.8px] mt-[2px]">{side.address}</p>}
    </div>
  );
}

/** Giờ + thứ | ngày | tháng-năm + âm lịch + nơi tổ chức — chữ xám #737373 như mẫu */
function EventBlock({ item }) {
  const lineCls = "w-[100px] border-y border-[#737373]/60 py-0.5 whitespace-nowrap font-lora font-bold text-[19px]";
  return (
    <div className="text-center text-[#737373]">
      {item.title && <p className="font-judson font-bold uppercase text-[20px] leading-[32px]">{item.title}</p>}
      {item.hour && <p className="font-trirong font-bold uppercase text-[14px] mt-5">Vào lúc {item.hour}</p>}
      <div className="mt-1 flex items-center justify-center gap-4">
        <span className={`${lineCls} uppercase`}>{item.weekday}</span>
        <span className="font-lora font-bold text-[55px] leading-[88px]">{item.day}</span>
        <span className={lineCls}>{item.monthYear}</span>
      </div>
      <p className="italic font-sans text-[14px]">{item.lunar}</p>
      <p className="font-oswald font-bold uppercase text-[20px] leading-[32px] mt-3">{item.place}</p>
      <p className="font-sans text-[14px] mt-1 px-4">( {item.address} )</p>
    </div>
  );
}

/** Ô "Địa điểm tổ chức": tên + địa chỉ + bản đồ nhúng + nút mở Google Maps */
function VenueCard({ item, mapLabel }) {
  const q = item.mapQuery ?? item.address;
  return (
    <div className="rounded-[16px] bg-[#808c70] px-[9px] pt-2 pb-4 text-center text-white">
      <p className="font-trirong font-bold uppercase text-[16px] leading-[25.6px]">{item.place}</p>
      <p className="font-sans text-[12px] leading-[19.2px] px-6">{item.address}</p>
      <iframe
        title={`Bản đồ ${item.place}`}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`}
        className="mt-2 block w-full aspect-[387/216] rounded-[4px] border-0 bg-white/20"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={item.mapLink ?? mapUrl(q)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block rounded-[8px] bg-gradient-to-b from-[#dfe3f0] to-[#c3c9de] px-4 py-[5px] font-trirong font-bold uppercase text-[14px] text-[#940101] shadow transition hover:scale-105"
      >
        {mapLabel}
      </a>
    </div>
  );
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Lịch tháng chữ trắng trên nền xanh xám, ngày cưới phủ tim vân tay đỏ */
function MonthCalendar({ dateIso }) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div>
      <p className="font-philo font-bold text-[22px] leading-[35px] text-white text-center mb-1">
        THÁNG {m} - {y}
      </p>
      <div className="grid grid-cols-7 text-center font-display font-bold text-[15px] text-[#f1f3f4]">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-0.5">{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center font-opensans text-[13px] text-white">
        {cells.map((day, i) =>
          day === d ? (
            <span key={i} className="relative flex h-[35px] items-center justify-center">
              <img src={images.deco.timVanTay} alt="" className="absolute h-[40px] w-[40px] max-w-none animate-pulse-soft" />
              <span className="relative font-bold">{day}</span>
            </span>
          ) : (
            <span key={i} className="flex h-[35px] items-center justify-center">{day ?? ""}</span>
          ),
        )}
      </div>
    </div>
  );
}

/** Form trong ô xanh: Họ tên | khách của ai, xác nhận tham dự, lời chúc — "khách của ai" ghép vào cột tham dự của Sheet */
function RsvpForm({ c }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", guestOf: "", message: "", attend: "" });

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
    const attend = !c.askAttend ? "" : form.attend === "yes" ? c.attendYes : c.attendNo;
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
          attend: [attend, form.guestOf && `(${form.guestOf})`].filter(Boolean).join(" "),
          guestCount: !c.askAttend ? "" : form.attend === "yes" ? "1" : "0",
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
    "w-full rounded-[10px] border border-[#f1f3f4] bg-white px-3 py-2 font-opensans text-[14px] text-foreground placeholder:text-foreground/80 outline-none focus:ring-2 focus:ring-white/60";

  if (sent) return <p className="text-center text-white font-lora text-lg py-6">{c.thanks}</p>;
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-[183fr_192fr] gap-[7px]">
        <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={inputCls} />
        <select value={form.guestOf} onChange={update("guestOf")} className={`${inputCls} px-2`}>
          <option value="">{c.placeholders.guestOf}</option>
          {c.guestOfOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      {c.askAttend && (
        <select required value={form.attend} onChange={update("attend")} className={inputCls}>
          <option value="" disabled>
            {c.placeholders.attend}
          </option>
          <option value="yes">{c.attendYes}</option>
          <option value="no">{c.attendNo}</option>
        </select>
      )}
      <textarea value={form.message} onChange={update("message")} placeholder={c.placeholders.message} rows={2} className={`${inputCls} resize-none`} />
      <div className="text-center pt-1">
        {error && <p className="text-sm text-white/90 mb-2">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-[166px] rounded-[6px] bg-gradient-to-b from-[#f2f2f2] to-[#c8c8c8] py-[5px] font-display font-bold uppercase text-[12px] text-[#9c0505] shadow transition hover:scale-105 disabled:opacity-70"
        >
          {sending ? c.sending : c.submit}
        </button>
      </div>
    </form>
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

/** Album 2 cột so le như mẫu — tỉ lệ khung lặp lại theo hàng (cột trái / cột phải) */
const ALBUM_RATIOS = [
  ["207/309", "208/279"],
  ["206/314", "207/343"],
  ["209/140", "206/221"],
  ["209/324", "208/243"],
];
const ALBUM_ANIM = [
  ["right", "left"],
  ["left", "right"],
  ["down", "down"],
  ["up", "up"],
];

function WeddingPage() {
  const c = content;
  const guest = useGuestName(c.invitation.defaultGuest);
  const [giftOpen, setGiftOpen] = useState(false);
  const closeGift = useCallback(() => setGiftOpen(false), []);
  /** opened: phong bì đã mở (ảnh trượt lên, nhạc + hiệu ứng bắt đầu) */
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => setOpened(true), []);
  const [first, second] = c.hero.names;
  const hasGift = c.gift.accounts.length > 0;
  const columns = [0, 1].map((col) => images.album.filter((_, i) => i % 2 === col));

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

  const giftButton = hasGift && (
    <button
      type="button"
      onClick={() => setGiftOpen(true)}
      className="inline-flex w-[177px] items-center justify-center gap-2 rounded-[6px] bg-gradient-to-b from-[#ffc2a8] to-[#fde3d6] py-[7px] font-display font-bold uppercase text-[12px] text-[#940101] shadow animate-pulse-soft"
    >
      <Gift className="h-4 w-4" aria-hidden />
      {c.gift.button}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#eef0ea] text-foreground font-sans">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects active={opened} />

      <CurtainContext.Provider value={opened}>
        <main className="relative mx-auto min-h-screen max-w-[420px] bg-white overflow-hidden shadow-2xl">
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

          {/* Phần còn lại chỉ gắn vào trang sau khi mở phong bì — màn hình cao hơn khung 880px sẽ không thấy ló mục dưới */}
          {opened && (
            <div className="anim-fade-in-500">
            {/* Gia đình hai bên — vạch dọc trái, "Thư Mời Cưới" rồi hai nhà xếp dọc, ô xanh 囍 bên phải */}
            <section className="relative w-full pt-2 pb-[53px]">
              <div className="relative ml-[3px] mr-[110px] min-h-[461px]">
                <span className="absolute left-0 top-0 h-[66px] w-px bg-black" aria-hidden />
                <Reveal variant="right" duration={2} className="pt-[57px] pl-[10px]">
                  <p className="font-upright text-[29.4px] leading-[47px]">
                    Thư
                    <br />
                    Mời
                    <br />
                    Cưới
                  </p>
                </Reveal>
                <span className="absolute left-0 top-[188px] bottom-0 w-px bg-black" aria-hidden />
                <div className="mt-[25px] ml-[17px] space-y-[30px]">
                  {c.families.sides.map((side) => (
                    <Reveal key={side.label} variant="right" duration={3}>
                      <FamilySide side={side} />
                    </Reveal>
                  ))}
                </div>
              </div>
              <div className="absolute right-[13px] top-[80px] h-[244px] w-[87px] bg-[#b2bca3]">
                <Cropped src={images.deco.nhan} crop={{ w: 42.6, l: 27, t: 17.7 }} className="left-[7px] top-[4px] w-[75px] h-[59px]" />
                <Reveal variant="up" duration={3.5} className="absolute left-[10px] top-[152px]">
                  <Cropped src={images.deco.hyTrang} crop={{ w: 192, l: -47.2, t: -108.7 }} className="relative w-[71px] h-[77px]" />
                </Reveal>
              </div>
              <img
                src={images.deco.hoaSen}
                alt=""
                className="pointer-events-none absolute left-[242px] top-[385px] z-10 w-[187px] -rotate-[17deg] opacity-25"
                loading="lazy"
              />
            </section>

            {/* Báo tin */}
            <section className="px-[17px] pb-3 text-center">
              <Reveal>
                <p className="font-lora text-[clamp(13px,3.8vw,16px)] leading-[25.6px] uppercase whitespace-nowrap text-black">
                  {c.invitation.announce[0]} <span className="text-[#9c0505] font-bold">{c.invitation.announce[1]}</span>{" "}
                  {c.invitation.announce[2]}
                </p>
              </Reveal>
              <Reveal variant="right" duration={2} className="mt-[23px]">
                <p className="font-script text-[42px] leading-[67px] whitespace-nowrap">{c.families.fullNames[0]}</p>
              </Reveal>
              <Reveal variant="bounce" duration={2} className="-my-[22px]">
                <p className="font-arizonia text-[28px] leading-[45px]">&amp;</p>
              </Reveal>
              <Reveal variant="left" duration={2}>
                <p className="font-script text-[42px] leading-[67px] whitespace-nowrap">{c.families.fullNames[1]}</p>
              </Reveal>
              <Reveal variant="up" duration={2} className="mt-6">
                <img
                  src={images.wide}
                  alt=""
                  className="w-full aspect-[387/285] rounded-[15px] border-[3px] border-[#008037] object-cover object-[center_25%]"
                  loading="lazy"
                />
              </Reveal>
            </section>

            {/* Lời mời: 3 ảnh + tên khách + sự kiện */}
            <section className="pb-10 text-center">
              <Reveal>
                <p className="font-lora text-[20px] leading-[32px] uppercase">{c.invitation.kicker}</p>
              </Reveal>
              <div className="mt-3 grid grid-cols-[121fr_140fr_123fr] items-center gap-[5px] px-[13px]">
                {images.trio.map((src, i) => (
                  <Reveal key={i} variant={["left", "bounce", "right"][i]} duration={5}>
                    <img
                      src={src}
                      alt=""
                      className="w-full aspect-[2/3] rounded-[12px] object-cover shadow-[0_6px_14px_rgba(0,0,0,0.28)]"
                      loading="lazy"
                    />
                  </Reveal>
                ))}
              </div>
              <Reveal className="mt-6">
                <p className="font-guest text-[38px] leading-[53px] text-[#a30d0d] mx-auto w-fit min-w-[201px] border-b border-[#737373] px-3">{guest}</p>
                <p className="font-judson font-bold uppercase text-[20px] leading-[32px] text-[#737373] mt-1">{c.invitation.title}</p>
                <div className="mt-1 grid grid-cols-[1fr_73px_1fr] items-center gap-5 text-[#737373]">
                  <span className="font-script text-[30px] leading-[48px] text-right whitespace-nowrap">{first}</span>
                  <Rings className="w-[73px]" />
                  <span className="font-script text-[30px] leading-[48px] text-left whitespace-nowrap">{second}</span>
                </div>
              </Reveal>
              <div className="space-y-10">
                {c.events.items.map((item) => (
                  <Reveal key={item.id} variant="up" duration={3}>
                    <EventBlock item={item} />
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Lịch + polaroid */}
            {c.calendar.dateIso && (
              <Reveal className="mx-[3px] bg-[#808c70] pl-[9px] pr-1 py-[10px]">
                <div className="grid grid-cols-[125px_1fr] items-start gap-3">
                  <div className="mt-[32px] border-2 border-[#f1f3f4] bg-white p-[5px] pb-0">
                    <img src={images.polaroid} alt="" className="w-full aspect-[111/160] object-cover object-top" loading="lazy" />
                    <p className="font-culpa text-[18px] text-center text-[#737373] leading-[36px]">{c.calendar.photoCaption}</p>
                  </div>
                  <MonthCalendar dateIso={c.calendar.dateIso} />
                </div>
              </Reveal>
            )}

            {/* Địa điểm tổ chức */}
            <section className="px-[8px] pt-3">
              <Reveal>
                <h2 className="font-upright text-[34px] leading-[51px] text-[#808c70] text-center">{c.events.venueTitle}</h2>
              </Reveal>
              <div className="mt-1 space-y-4">
                {c.events.items.map((item) => (
                  <Reveal key={item.id} variant="up" duration={2}>
                    <VenueCard item={item} mapLabel={c.events.mapLabel} />
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Xác nhận + lời chúc + mừng cưới */}
            <section className="px-3 pt-10 pb-4">
              {c.rsvp.show ? (
                <>
                  <div className="relative h-[112px]">
                    <Reveal variant="left" duration={2} className="absolute left-[23px] top-0">
                      <p className="font-arizonia text-[22px] leading-[35px] whitespace-nowrap">{c.rsvp.title}</p>
                      <img src={images.deco.chibi} alt="" className="ml-[22px] w-[107px]" loading="lazy" />
                    </Reveal>
                    <Reveal variant="bounce" duration={4} className="absolute left-[206px] top-[25px]">
                      <p className="font-dancing text-[27px] leading-[44px]">&amp;</p>
                    </Reveal>
                    <Reveal variant="right" duration={4} className="absolute left-[247px] top-[26px] text-center">
                      <img src={images.deco.phongThu} alt="" className="mx-auto w-[52px] rotate-[8deg]" loading="lazy" />
                      <p className="font-arizonia text-[20px] leading-[32px] whitespace-nowrap">{c.rsvp.wishTitle}</p>
                    </Reveal>
                  </div>
                  <Reveal className="rounded-[16px] bg-[#808c70]/[0.97] px-[7px] pt-2 pb-4">
                    <h2 className="font-monte text-[30px] leading-[48px] text-white text-center">{c.rsvp.boxTitle}</h2>
                    <p className="mx-auto mt-1 mb-4 w-[260px] text-center font-sans text-[12px] leading-[19px] text-white">{c.rsvp.intro}</p>
                    <RsvpForm c={c.rsvp} />
                    {giftButton && <div className="mt-3 text-center">{giftButton}</div>}
                  </Reveal>
                </>
              ) : (
                giftButton && <Reveal className="text-center">{giftButton}</Reveal>
              )}
            </section>

            {/* Album */}
            <section className="pt-4">
              <Reveal variant="left" className="relative px-[4px]">
                <h2 className="font-chonburi font-bold text-[22px] leading-[35px] text-[#b2bca3]">{c.album.title}</h2>
                <span className="absolute left-[5px] right-0 bottom-[3px] h-px bg-[#b2bca3]" aria-hidden />
                <Heart className="absolute right-[82px] bottom-0 h-[19px] w-[18px] text-[#b2bca3]" />
              </Reveal>
              <div className="mt-[8px] grid grid-cols-2 gap-[5px]">
                {columns.map((list, col) => (
                  <div key={col} className="space-y-[5px]">
                    {list.map((src, row) => (
                      <Reveal key={row} variant={ALBUM_ANIM[row % 4][col]} duration={4}>
                        <img
                          src={src}
                          alt=""
                          className="w-full object-cover object-[center_30%]"
                          style={{ aspectRatio: ALBUM_RATIOS[row % 4][col] }}
                          loading="lazy"
                        />
                      </Reveal>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* Thank you — chữ phủ phần trên ảnh như mẫu */}
            <section className="relative mt-[5px] overflow-hidden">
              <img src={images.thankYou} alt="" className="block w-full aspect-[420/647] object-cover object-bottom" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 via-40% to-transparent" />
              {/* Định vị ở lớp ngoài — Reveal quan sát lớp bọc của nó, lớp đó phải có chiều cao thật */}
              <div className="absolute inset-x-0 top-0">
                <Reveal variant="down" duration={4} className="px-[34px] pt-[4px] text-white">
                  <h2 className="font-dancing font-bold text-[clamp(56px,18vw,78px)] leading-[1.6] whitespace-nowrap drop-shadow-lg">{c.thanks.title}</h2>
                  <p className="font-roboto text-[15px] leading-[24px] text-center -mt-2 drop-shadow">{c.thanks.text}</p>
                  <p className="font-passions text-[clamp(30px,9.5vw,40px)] leading-[64px] mt-1 whitespace-nowrap drop-shadow-lg">
                    {first} &amp; {second}
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
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
