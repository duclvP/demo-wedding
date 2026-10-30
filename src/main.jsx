import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, Download, Gift, Volume2, VolumeX, X } from "lucide-react";
import { content } from "./content.js";
import { images } from "./image.js";
import "./index.css";
import GuestLinksPage, { isGuestLinksPage } from "./GuestLinks.jsx";

/**
 * Giao diện theo mẫu lovecard.click/thiepso05 (phong bì đỏ, chữ 囍 vàng, thẻ treo đỏ, hoa sen).
 * Toạ độ lấy từ trang mẫu (khung rộng 420px) — cả khung được phóng/thu theo bề rộng màn hình (giống LadiPage).
 */
const DESIGN_WIDTH = 420;
const DECOR = "/images/mau05";

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

/* ---------- Khung 420px của mẫu ---------- */

function getDesignScale() {
  try {
    return Math.min(window.innerWidth || DESIGN_WIDTH, DESIGN_WIDTH) / DESIGN_WIDTH;
  } catch {
    return 1;
  }
}

/** Màn hình hẹp hơn 420px → thu cả khung lại (giống LadiPage), rộng hơn thì giữ 420px ở giữa */
function useDesignScale() {
  const [scale, setScale] = useState(getDesignScale);
  useEffect(() => {
    const onResize = () => setScale(getDesignScale());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return scale;
}

/** false khi phong bì còn đóng — chưa chạy hiệu ứng để khách mở ra mới thấy */
const OpenedContext = React.createContext(true);

/**
 * Hiệu ứng khi cuộn tới, như mẫu (animate.css): fadeInDown | fadeInUp | fadeInLeft | fadeInRight | bounceIn | zoomIn.
 * Lớp ngoài giữ vị trí & được quan sát, lớp trong chạy hiệu ứng.
 */
function Ani({ fx = "fadeInUp", dur = 2, delay = 0, className = "", style, children }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  const opened = React.useContext(OpenedContext);
  const on = seen && opened;

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
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      <div
        className={`ani h-full ${on ? "ani-in" : ""}`}
        style={on ? { animationName: fx, animationDuration: `${dur}s`, animationDelay: `${delay}s` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/** Ảnh cắt trong khung như ảnh LadiPage: khung (x, y, w, h), ảnh bên trong (iw, ih) lệch (ix, iy) */
function Cut({ src, x, y, w, h, iw, ih, ix = 0, iy = 0, className = "", style }) {
  return (
    <div className={`absolute overflow-hidden ${className}`} style={{ left: x, top: y, width: w, height: h, ...style }}>
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute max-w-none object-cover object-left-top"
        style={{ left: ix, top: iy, width: iw, height: ih }}
      />
    </div>
  );
}

/** Chữ một dòng tự thu nhỏ cỡ chữ nếu dài hơn khung (tên dài) */
function FitText({ text, max, min = 18, className = "", style }) {
  const boxRef = useRef(null);
  const textRef = useRef(null);
  const [size, setSize] = useState(max);

  React.useLayoutEffect(() => {
    const box = boxRef.current;
    const span = textRef.current;
    if (!box || !span) return;
    function fit() {
      let s = max;
      span.style.fontSize = `${s}px`;
      while (span.offsetWidth > box.clientWidth && s > min) {
        s -= 1;
        span.style.fontSize = `${s}px`;
      }
      setSize(s);
    }
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
  }, [text, max, min]);

  return (
    <div ref={boxRef} className={className} style={style}>
      <span ref={textRef} className="inline-block whitespace-nowrap" style={{ fontSize: size }}>
        {text}
      </span>
    </div>
  );
}

function GoldCorners({ top }) {
  const cls = "absolute object-cover object-left-top";
  return (
    <>
      <img src={`${DECOR}/goc-vang.webp`} alt="" className={cls} style={{ left: 0.5, top, width: 69.07, height: 96.7 }} />
      <img
        src={`${DECOR}/goc-vang.webp`}
        alt=""
        className={cls}
        style={{ left: 351.37, top, width: 69.07, height: 96.7, transform: "scaleX(-1)" }}
      />
    </>
  );
}

/* ---------- Phong bì đóng: màn đầu, chạm để mở ---------- */

function EnvelopeCover({ c, scale, onOpen, onDone }) {
  const [leaving, setLeaving] = useState(false);

  const open = useCallback(() => {
    setLeaving((was) => {
      if (!was) onOpen();
      return true;
    });
  }, [onOpen]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[160] cursor-pointer bg-white transition-opacity duration-700 ${
        leaving ? "pointer-events-none opacity-0" : ""
      }`}
      onClick={open}
      role="button"
      aria-label="Mở thiệp"
    >
      <div className="relative mx-auto overflow-hidden" style={{ width: DESIGN_WIDTH, height: 860, zoom: scale }}>
        <GoldCorners top={0} />
        <img
          src={`${DECOR}/tieu-de.png`}
          alt="Thiệp mời cưới"
          className="ani ani-in absolute"
          style={{ left: 124, top: 21, width: 172.65, height: 95, animationName: "fadeInDown", animationDuration: "4s" }}
        />
        <img
          src={`${DECOR}/hy-vang.webp`}
          alt=""
          className="ani ani-in absolute"
          style={{ left: 161.84, top: 154.5, width: 92.5, height: 92.5, animationName: "fadeInUp", animationDuration: "4s" }}
        />
        <Cut
          src={`${DECOR}/phong-bi-dong.webp`}
          x={32.99}
          y={292.19}
          w={350.01}
          h={255.5}
          iw={375.68}
          ih={516.18}
          ix={-12.67}
          iy={-121.43}
        />
        <p
          className="f-lora absolute left-0 text-center uppercase animate-pulse-slow"
          style={{ top: 554.5, width: DESIGN_WIDTH, fontSize: 18, lineHeight: 1.6, color: "rgb(156, 5, 5)" }}
        >
          {c.hero.openHint}
        </p>
      </div>
    </div>
  );
}

/* ---------- Phong bì mở: ảnh trồi lên, tên, ngày, gia đình ---------- */

function EnvelopeTop({ c, opened }) {
  const [first, second] = c.hero.names;
  const [day, month, year] = c.invitation.dateParts;

  return (
    <div className="relative" style={{ height: 1400 }}>
      <GoldCorners top={2} />
      <Ani fx="fadeInDown" dur={3} className="absolute" style={{ left: 124, top: 13, width: 172, height: 95 }}>
        <img src={`${DECOR}/tieu-de.png`} alt="Thiệp mời cưới" style={{ width: 172.65, height: 95 }} />
      </Ani>

      {/* Lưng phong bì → ảnh cưới trồi lên → nền trắng che phần ảnh dưới phong bì → mặt trước phong bì */}
      <Cut src={`${DECOR}/phong-bi-sau.webp`} x={34.49} y={157.81} w={366.47} h={390.64} iw={374.58} ih={524.42} ix={-13.25} iy={13.98} />
      <div
        className={`envelope-photo absolute ${opened ? "is-up" : ""}`}
        style={{ left: 55.1, top: 121.89, width: 305.42, height: 380.01 }}
      >
        <img
          src={images.hero}
          alt={`${first} & ${second}`}
          className="h-full w-full object-cover"
          style={{ border: "2px solid rgb(166, 166, 166)", borderRadius: 20, objectPosition: images.heroPosition }}
        />
      </div>
      <div className="absolute bg-white" style={{ left: 0, top: 470.89, width: DESIGN_WIDTH, height: 357.01 }} />
      <Cut src={`${DECOR}/phong-bi-truoc.webp`} x={26.39} y={271.06} w={363.53} h={271.12} iw={376.03} ih={521.74} ix={-5.59} iy={-100.62} />

      {/* Tên hai bạn giữa hai đường kẻ */}
      <div className="absolute left-0" style={{ top: 592.5, width: DESIGN_WIDTH, borderTop: "3px solid rgba(178, 188, 163, 0.3)" }} />
      <div className="absolute left-0" style={{ top: 672.5, width: DESIGN_WIDTH, borderTop: "3px solid rgba(178, 188, 163, 0.3)" }} />
      <Ani fx="fadeInLeft" dur={4} className="absolute" style={{ left: 0, top: 601, width: 180 }}>
        <FitText text={first} max={40} className="f-names text-right" style={{ lineHeight: "64px" }} />
      </Ani>
      <Ani fx="fadeInRight" dur={5} className="absolute" style={{ left: 234, top: 601.39, width: 186 }}>
        <FitText text={second} max={40} className="f-names text-left" style={{ lineHeight: "64px" }} />
      </Ani>
      <Ani fx="bounceIn" dur={5} className="absolute" style={{ left: 186.48, top: 619.35, width: 39.38, height: 37.65 }}>
        <svg viewBox="0 0 1792 1896.08" width="100%" height="100%" preserveAspectRatio="none" fill="rgb(185, 5, 26)" aria-hidden>
          <path d="M896 1664q-26 0-44-18l-624-602q-10-8-27.5-26T145 952.5 77 855 23.5 734 0 596q0-220 127-344t351-124q62 0 126.5 21.5t120 58T820 276t76 68q36-36 76-68t95.5-68.5 120-58T1314 128q224 0 351 124t127 344q0 221-229 450l-623 600q-18 18-44 18z" />
        </svg>
      </Ani>

      {/* Ngày cưới giữa hai chữ 囍 mờ */}
      <Ani fx="fadeInDown" dur={5} className="absolute" style={{ left: 135.91, top: 683.5, width: 144.48, height: 137 }}>
        <p className="f-lora text-center" style={{ width: 139, fontSize: 48, lineHeight: 1.6 }}>
          {day}.{month}
        </p>
        <p className="f-lora absolute" style={{ left: 10.48, top: 57, width: 134, fontSize: 50, lineHeight: 1.6 }}>
          {year}
        </p>
      </Ani>
      <img src={`${DECOR}/hy-mo.webp`} alt="" className="absolute opacity-30" style={{ left: 22.87, top: 766.45, width: 87.58, height: 88.42 }} />
      <img src={`${DECOR}/hy-mo.webp`} alt="" className="absolute opacity-30" style={{ left: 308.53, top: 766.45, width: 87.58, height: 88.42 }} />

      {/* Thư Mời Cưới + gia đình hai bên, thẻ treo đỏ bên phải */}
      <div className="absolute bg-black" style={{ left: 15.95, top: 901.63, width: 1, height: 66 }} />
      <Ani fx="fadeInRight" dur={4} className="absolute" style={{ left: 15.64, top: 959.63, width: 90 }}>
        {c.hero.letter.map((word) => (
          <p key={word} className="f-upright" style={{ fontSize: 30, lineHeight: "48px" }}>
            {word}
          </p>
        ))}
      </Ani>
      <div className="absolute bg-black" style={{ left: 15.95, top: 1089.63, width: 1, height: 273 }} />
      <div className="absolute" style={{ left: 314.88, top: 967.27, width: 86.57, height: 244, background: "rgb(125, 31, 42)" }}>
        <img src={`${DECOR}/khoen-vang.webp`} alt="" className="absolute" style={{ left: 27.08, top: 14.53, width: 32.02, height: 32.02 }} />
        <Ani fx="fadeInUp" dur={4} className="absolute" style={{ left: 9.43, top: 151.4, width: 71.22, height: 77.2 }}>
          <img src={`${DECOR}/the-hy.png`} alt="" style={{ width: 71.22, height: 77.2 }} />
        </Ani>
      </div>
      <div
        className="absolute overflow-hidden opacity-25"
        style={{ left: 261.61, top: 1280.4, width: 157.89, height: 259.23, transform: "rotate(-17deg)" }}
        aria-hidden
      >
        <img src={`${DECOR}/sen.png`} alt="" className="max-w-none" style={{ width: 259.23, height: 259.23 }} />
      </div>
      <div className="absolute" style={{ left: 24.95, top: 1125.67, width: 292 }}>
        {c.families.sides.map((side, i) => (
          <Ani key={side.label} fx="fadeInRight" dur={4} style={{ marginTop: i ? 19.9 : 0 }}>
            <p className="f-oswald font-bold uppercase" style={{ fontSize: 18, lineHeight: "28.8px" }}>
              {side.label}
            </p>
            <div className="f-oswald uppercase" style={{ fontSize: 15, lineHeight: "24px", marginTop: i ? 3 : 4.4 }}>
              {side.father && <p>Ông {side.father}</p>}
              {side.mother && <p>Bà {side.mother}</p>}
            </div>
            {side.address && (
              <p className="f-diachi" style={{ fontSize: 12, lineHeight: "19.2px", marginTop: i ? 6.7 : 8 }}>
                {side.address}
              </p>
            )}
          </Ani>
        ))}
      </div>
    </div>
  );
}

/* ---------- Lời mời, sự kiện, lịch ---------- */

function mapUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}


function EventCard({ item, mapLabel }) {
  return (
    <div
      className="mx-[28px] text-center text-white"
      style={{ background: "rgb(135, 1, 1)", border: "2px solid rgb(104, 1, 1)", borderRadius: 30, padding: "13px 4px 16px" }}
    >
      <h3 className="f-opensans uppercase" style={{ fontSize: 18, lineHeight: "28.8px" }}>
        {item.title}
      </h3>
      {item.time && (
        <p className="f-tinos" style={{ fontSize: 16, lineHeight: "25.6px", marginTop: 10 }}>
          {item.time}
        </p>
      )}
      <p className="f-opensans font-bold" style={{ fontSize: 25, lineHeight: "40px", marginTop: 1 }}>
        {item.date}
      </p>
      <p className="f-quicksand italic" style={{ fontSize: 12, lineHeight: "19.2px", marginTop: 1 }}>
        {item.lunar}
      </p>
      {item.places.map((place) => (
        <div key={place.label} style={{ marginTop: 14 }}>
          <p className="f-opensans font-bold uppercase" style={{ fontSize: 18, lineHeight: "28.8px" }}>
            {place.label}
          </p>
          <p className="f-quicksand px-3" style={{ fontSize: 12, lineHeight: "19.2px", marginTop: 8 }}>
            {place.address}
          </p>
          <a
            href={mapUrl(place.mapQuery ?? place.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="f-lora mt-[13px] inline-block bg-white transition hover:scale-105"
            style={{
              width: 169,
              padding: "2px 0",
              fontSize: 15,
              lineHeight: "24px",
              color: "rgb(160, 11, 11)",
              border: "1px solid rgb(166, 166, 166)",
              borderRadius: 20,
              boxShadow: "rgb(0, 0, 0) 0px 15px 20px -15px",
            }}
          >
            {mapLabel}
          </a>
        </div>
      ))}
    </div>
  );
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** dateIso: một ngày '2026-11-16' hoặc mảng nhiều ngày cùng tháng — ngày cưới có tim vân tay đỏ */
function MonthCalendar({ title, dateIso }) {
  const dates = [].concat(dateIso).map((s) => s.split("-").map(Number));
  const [y, m] = dates[0];
  const marked = new Set(dates.filter(([yy, mm]) => yy === y && mm === m).map(([, , dd]) => dd));
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const cols = { gridTemplateColumns: "repeat(7, 45.17px)", marginLeft: 52.4 };

  return (
    <div style={{ color: "rgb(160, 11, 11)" }}>
      <h2 className="f-lora text-center uppercase" style={{ fontSize: 26, lineHeight: "41.6px" }}>
        {title}
      </h2>
      <p className="f-tinos text-center uppercase" style={{ fontSize: 20, lineHeight: "32px", marginTop: -1.6 }}>
        Tháng {m} - {y}
      </p>
      <div className="relative" style={{ marginLeft: 38, width: 349, height: 34, marginTop: 2, background: "rgb(160, 11, 11)" }}>
        <div className="grid h-full items-center text-center text-white" style={{ ...cols, marginLeft: 14.4 }}>
          {WEEKDAYS.map((w) => (
            <span key={w} className="f-bellerose font-bold" style={{ fontSize: 16 }}>
              {w}
            </span>
          ))}
        </div>
      </div>
      <div className="grid text-center text-black" style={{ ...cols, marginTop: 9 }}>
        {cells.map((day, i) =>
          marked.has(day) ? (
            <span key={i} className="relative flex items-center justify-center" style={{ height: 42 }}>
              <img src={`${DECOR}/tim-lich.png`} alt="" className="absolute animate-pulse-soft" style={{ width: 46, height: 46 }} />
              <span className="f-tinos relative font-bold text-white" style={{ fontSize: 16 }}>
                {day}
              </span>
            </span>
          ) : (
            <span key={i} className="f-tinos flex items-center justify-center" style={{ height: 42, fontSize: 16 }}>
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

  const inputCls = "f-judson block w-full bg-white px-3 text-black outline-none placeholder:text-[#737373] focus:ring-2 focus:ring-white/60";
  const inputStyle = { height: 38.42, fontSize: 15, border: "1px solid rgb(115, 115, 115)" };

  return (
    <div className="mx-[28px]" style={{ background: "rgb(135, 1, 1)", borderRadius: 20, padding: "15px 9px 19px 12px" }}>
      <h2 className="f-spirited whitespace-nowrap text-center text-white" style={{ fontSize: 32, lineHeight: "51.2px" }}>
        {c.title}
      </h2>
      {sent ? (
        <p className="f-lora py-8 text-center text-lg text-white">{c.thanks}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-[12.6px]" style={{ marginTop: 11 }}>
          <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={inputCls} style={inputStyle} />
          <input value={form.message} onChange={update("message")} placeholder={c.placeholders.message} className={inputCls} style={inputStyle} />
          {c.askAttend && (
            <select
              required
              value={form.attend}
              onChange={update("attend")}
              className={`${inputCls} rsvp-select ${form.attend ? "" : "text-[#737373]"}`}
              style={inputStyle}
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
              style={inputStyle}
            />
          )}
          <div className="pt-[0.4px] text-center">
            {error && <p className="mb-3 text-sm text-white/90">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="f-bellerose bg-white font-bold uppercase transition hover:scale-105 disabled:opacity-70"
              style={{
                width: 180,
                height: 32,
                fontSize: 15,
                color: "rgb(131, 11, 11)",
                borderRadius: 30,
                boxShadow: "rgb(0, 0, 0) 0px 15px 20px -18px",
              }}
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

  const btnCls = "f-lora inline-flex items-center justify-center gap-1 text-white transition hover:brightness-90";
  const btnStyle = { height: 29, padding: "0 9px", fontSize: 12, background: "rgb(166, 166, 166)", borderRadius: 5 };

  return (
    <div className="flex flex-col items-center text-center">
      {account.qr && (
        <img
          src={account.qr}
          alt={`Mã QR chuyển khoản ${account.bank} ${account.number}`}
          className="bg-white object-contain"
          style={{ width: 102, height: 103, padding: 4, border: "1px dotted #000", borderRadius: 10 }}
        />
      )}
      <dl className="f-bellerose font-bold uppercase" style={{ marginTop: 9, fontSize: 15, lineHeight: "24px", color: "rgb(125, 1, 1)" }}>
        <div>
          <dt className="inline">CTK: </dt>
          <dd className="inline">{account.holder}</dd>
        </div>
        <div style={{ fontSize: 16, lineHeight: "25.6px", marginTop: 2 }}>
          <dt className="inline">STK: </dt>
          <dd className="inline">{account.number}</dd>
        </div>
        <div style={{ marginTop: 3 }}>
          <dt className="inline">NN: </dt>
          <dd className="inline">{account.bank}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap justify-center gap-1.5" style={{ marginTop: 8 }}>
        <button type="button" onClick={copy} className={btnCls} style={btnStyle}>
          {copied && <Check className="h-3 w-3" aria-hidden />}
          {copied ? c.copiedLabel : c.copyLabel}
        </button>
        {account.qr && (
          /** Khách mở thiệp trên chính điện thoại thì không quét được — lưu ảnh rồi chọn trong app ngân hàng */
          <a href={account.qr} download={`QR-${account.bank}-${account.number}.png`} className={btnCls} style={btnStyle}>
            <Download className="h-3 w-3" aria-hidden />
            {c.saveQrLabel}
          </a>
        )}
      </div>
    </div>
  );
}

/** Hộp quà như mẫu: nền vân đá, hoa hồng, ảnh cưới bên trái, QR + STK bên phải */
function GiftModal({ c, photo, scale, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={c.title}
        onClick={(e) => e.stopPropagation()}
        className="relative overflow-hidden animate-pop"
        style={{
          width: 361,
          maxHeight: `${90 / scale}vh`,
          zoom: scale,
          borderRadius: 20,
          background: `#fff url(${DECOR}/nen-hop-qua.jpg) center top / cover no-repeat`,
        }}
      >
        <div className="relative overflow-y-auto" style={{ maxHeight: `${90 / scale}vh`, minHeight: 415, paddingBottom: 24 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute flex items-center justify-center"
            style={{ left: 330, top: 4, width: 28, height: 28 }}
          >
            <X className="h-5 w-5 text-black" strokeWidth={1.6} />
          </button>
          <img src={`${DECOR}/hoa-hop-qua.png`} alt="" className="mx-auto block" style={{ width: 124, height: 64 }} />
          <h2
            className="f-spirited whitespace-nowrap text-center"
            style={{ marginTop: -1, height: 61, fontSize: 38, lineHeight: "60.8px", color: "rgb(0, 128, 55)" }}
          >
            {c.title}
          </h2>
          <div style={{ marginTop: -2, borderTop: "1px solid rgb(217, 217, 217)" }} />
          <div className="flex items-start" style={{ marginTop: 32, paddingLeft: 26 }}>
            <img
              src={photo}
              alt=""
              className="shrink-0 object-cover"
              style={{ width: 146, height: 229, border: "2px solid rgb(217, 217, 217)", borderRadius: 15 }}
            />
            <div className="space-y-6" style={{ width: 191, marginTop: 3 }}>
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
  const scale = useDesignScale();
  const guest = useGuestName(c.invitation.defaultGuest);
  const [giftOpen, setGiftOpen] = useState(false);
  const closeGift = useCallback(() => setGiftOpen(false), []);
  /** opened: khách vừa chạm mở phong bì; coverGone: màn phong bì đóng đã mờ hẳn, gỡ khỏi trang */
  const [opened, setOpened] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const handleOpen = useCallback(() => {
    window.scrollTo(0, 0);
    setOpened(true);
  }, []);
  const handleCoverDone = useCallback(() => setCoverGone(true), []);
  const [first, second] = c.families.fullNames;

  return (
    <div className="min-h-screen bg-white text-black">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects active={opened} />
      {!coverGone && <EnvelopeCover c={c} scale={scale} onOpen={handleOpen} onDone={handleCoverDone} />}

      <OpenedContext.Provider value={opened}>
        <main className="relative mx-auto overflow-hidden bg-white" style={{ width: DESIGN_WIDTH, zoom: scale }}>
          <EnvelopeTop c={c} opened={opened} />

          {/* Báo tin lễ thành hôn */}
          <section className="text-center" style={{ paddingTop: 9 }}>
            <Ani fx="fadeInDown" dur={4}>
              <p className="f-gsans uppercase" style={{ fontSize: 15, lineHeight: "24px", letterSpacing: 1 }}>
                {c.announce.before}{" "}
                <b style={{ color: "rgb(168, 1, 1)" }}>{c.announce.event}</b> {c.announce.after}
              </p>
            </Ani>
            <div className="f-names" style={{ color: "rgb(156, 5, 5)", marginTop: 13 }}>
              <Ani fx="fadeInRight" dur={4}>
                <FitText text={first} max={36} className="px-2" style={{ lineHeight: "57.6px", height: 44 }} />
              </Ani>
              <Ani fx="bounceIn" dur={3}>
                <p style={{ fontSize: 35, lineHeight: "56px", height: 50 }}>&amp;</p>
              </Ani>
              <Ani fx="fadeInLeft" dur={4}>
                <FitText text={second} max={35} className="px-2" style={{ lineHeight: "56px" }} />
              </Ani>
            </div>
            <Ani fx="fadeInUp" dur={3} style={{ margin: "17px 16px 0 17px" }}>
              <img
                src={images.couple}
                alt=""
                className="w-full object-cover"
                style={{ height: 240, border: "2px solid rgb(217, 217, 217)", borderRadius: 15, objectPosition: images.couplePosition }}
              />
            </Ani>
          </section>

          {/* Kính mời + tên khách */}
          <section className="text-center">
            <p className="f-opensans font-bold uppercase" style={{ fontSize: 20, lineHeight: "32px", marginTop: 14, color: "rgb(160, 1, 1)" }}>
              {c.invitation.kicker}
            </p>
            <Ani fx="zoomIn" dur={2} className="relative" style={{ marginTop: 14, height: 53 }}>
              <FitText
                text={guest}
                max={40}
                className="f-eddrayton px-6"
                style={{ lineHeight: "53px", color: "rgb(156, 5, 5)" }}
              />
              <div
                className="absolute"
                style={{ left: 108, top: 37, width: 203, borderTop: "1px dotted rgb(0, 128, 55)" }}
                aria-hidden
              />
            </Ani>
            <div className="flex" style={{ marginTop: 10, paddingLeft: 17, gap: 5.5 }}>
              {images.dateStrip.map((src, i) => (
                <Ani key={src} fx="fadeInUp" dur={2} delay={i * 0.3}>
                  <img
                    src={src}
                    alt=""
                    className="object-cover"
                    style={{ width: 124, height: 186, border: "3px solid rgb(220, 196, 195)" }}
                    loading="lazy"
                  />
                </Ani>
              ))}
            </div>
          </section>

          {/* Sự kiện */}
          <section className="space-y-3" style={{ marginTop: 13 }}>
            {c.events.items.map((item, i) => (
              <Ani key={item.id} fx={i % 2 ? "fadeInRight" : "fadeInLeft"} dur={2}>
                <EventCard item={item} mapLabel={c.events.mapLabel} />
              </Ani>
            ))}
          </section>

          {/* Lịch */}
          {c.calendar.dateIso && (
            <section style={{ marginTop: 23 }}>
              <Ani fx="fadeInUp" dur={2}>
                <MonthCalendar title={c.calendar.title} dateIso={c.calendar.dateIso} />
              </Ani>
            </section>
          )}

          {/* Lời chúc & xác nhận, ảnh tròn, mừng cưới */}
          <section className="text-center" style={{ paddingTop: 30 }}>
            {c.rsvp.show && (
              <Ani fx="fadeInUp" dur={2}>
                <RsvpForm c={c.rsvp} />
              </Ani>
            )}
            <Ani fx="zoomIn" dur={2} className="relative mx-auto" style={{ marginTop: 33, width: 199, height: 199 }}>
              <img src={`${DECOR}/khung-tron.png`} alt="" className="absolute inset-0 h-full w-full" />
              <img
                src={images.circle}
                alt=""
                className="absolute object-cover"
                style={{
                  left: 12,
                  top: 8,
                  width: 182,
                  height: 186,
                  border: "5px solid #fff",
                  borderRadius: 720,
                  objectPosition: images.circlePosition,
                }}
                loading="lazy"
              />
            </Ani>
            {c.gift.accounts.length > 0 && (
              <button
                type="button"
                onClick={() => setGiftOpen(true)}
                className="f-upright relative mx-auto mt-3 flex items-center justify-center gap-3 font-bold uppercase text-white animate-pulse-soft"
                style={{ width: 202, height: 46, fontSize: 15, borderRadius: 100, background: "rgb(135, 84, 41)" }}
              >
                <Gift className="h-6 w-6" aria-hidden />
                {c.gift.button}
              </button>
            )}
          </section>

          {/* Our memories */}
          <section style={{ marginTop: 42 }}>
            <Ani fx="fadeInLeft" dur={2} className="relative" style={{ height: 64 }}>
              <h2 className="f-scriptina absolute" style={{ left: 11, fontSize: 40, lineHeight: "64px", color: "rgb(160, 1, 1)" }}>
                {c.memories.title}
              </h2>
              <div className="absolute" style={{ left: 222, top: 31, width: 186, borderTop: "1px solid rgb(160, 1, 1)" }} />
            </Ani>
            <p className="f-bellerose" style={{ margin: "-10px 21px 0 14px", fontSize: 16, lineHeight: "25.6px", color: "rgb(160, 1, 1)" }}>
              {c.memories.text}
            </p>
            <div className="grid grid-cols-2" style={{ margin: "8px 7px 0", gap: 5 }}>
              {images.album.map((src, i) => (
                <Ani key={src} fx={i % 2 ? "fadeInRight" : "fadeInLeft"} dur={1.6}>
                  <img
                    src={src}
                    alt=""
                    className="aspect-[2/3] w-full object-cover"
                    style={{ border: "2px solid rgb(217, 217, 217)" }}
                    loading="lazy"
                  />
                </Ani>
              ))}
            </div>
          </section>

          {/* Thank you */}
          <section className="relative mx-[6px] overflow-hidden" style={{ marginTop: 5, height: 647 }}>
            <img src={images.thankYou} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center top" }} loading="lazy" />
            <div
              className="absolute inset-x-0"
              style={{ top: 233, height: 364, background: "linear-gradient(rgba(253, 251, 251, 0) 0%, rgb(160, 1, 1) 100%)" }}
            />
            <div className="absolute inset-x-0 bottom-0" style={{ top: 596, background: "rgb(137, 1, 1)" }} />
            <div className="absolute inset-x-0" style={{ top: 453 }}>
              <Ani fx="fadeInUp" dur={2} className="text-center text-white">
                <h2 className="f-scriptina" style={{ fontSize: 40, lineHeight: "64px" }}>
                  {c.thanks.title}
                </h2>
                <p className="f-bellerose mx-auto" style={{ width: 346, marginTop: -7, fontSize: 14, lineHeight: "22.4px" }}>
                  {c.thanks.text}
                </p>
              </Ani>
            </div>
            <p className="f-literata absolute inset-x-0 text-center text-white" style={{ top: 605, fontSize: 16, lineHeight: "25.6px" }}>
              {first} &amp; {second}
            </p>
          </section>
          <div style={{ height: 8 }} />
        </main>
      </OpenedContext.Provider>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} scale={scale} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
