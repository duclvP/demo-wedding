import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Check, ChevronLeft, ChevronRight, Copy, Download, Gift, Volume2, VolumeX, X } from "lucide-react";
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

/** Màu mẫu lovecard thiepso53: chữ xanh ô liu, hồng đất (lời mời, chỉ đường), đỏ rượu (timeline) */
const OLIVE = "#6f6c4a";
const ROSE = "#ba4353";
const RED = "#7f0606";

/** Bìa: ảnh lớn 420×630, tên hai người + ngày đè phần dưới, chữ "&" mờ phía sau */
function Cover({ c }) {
  const b = boxIn(630);
  return (
    <Frame H={630} className="overflow-hidden text-white">
      <img src={images.hero} alt={c.names.join(" & ")} className="absolute inset-0 h-full w-full object-cover object-top" />
      <div className="absolute inset-x-0 bottom-0 h-[41%] bg-gradient-to-b from-transparent to-black/45" />
      <img src={images.deco.amp} alt="" className="pointer-events-none opacity-50" style={b(141, 398, 163, 163)} />
      <div style={b(0, 416, 420, 72)}>
        <Reveal variant="right" duration={4}>
          <h1 className="font-didot text-center uppercase leading-[1.6] whitespace-nowrap" style={{ fontSize: fz(45) }}>{c.names[0]}</h1>
        </Reveal>
      </div>
      <div style={b(4, 480, 420, 72)}>
        <Reveal variant="left" duration={4}>
          <p className="font-didot text-center uppercase leading-[1.6] whitespace-nowrap" style={{ fontSize: fz(45) }}>{c.names[1]}</p>
        </Reveal>
      </div>
      <div style={b(4, 570, 420, 35)}>
        <Reveal variant="up" duration={4}>
          <p className="font-didot text-center leading-[1.6]" style={{ fontSize: fz(22) }}>{c.dateLine}</p>
        </Reveal>
      </div>
    </Frame>
  );
}

/** Ảnh dọc + cành lá vàng, chữ "DARLING" và câu thơ — nửa sau mỗi dòng nằm trên ảnh (chữ trắng) */
function Darling({ d }) {
  const H = 420;
  const b = boxIn(H);
  return (
    <Frame H={H}>
      <img src={images.deco.leafDarling} alt="" className="pointer-events-none" style={b(114, 124, 171, 222)} />
      <div className="overflow-hidden" style={b(199, 63, 189, 283)}>
        <img src={images.darling} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-b from-transparent to-black/55" />
      </div>
      <div style={b(23, 268, 334, 40)}>
        <Reveal variant="left" duration={4}>
          <h2 className="font-didot text-center uppercase leading-[1.6]" style={{ fontSize: fz(25), color: OLIVE }}>{d.title}</h2>
        </Reveal>
      </div>
      {d.lines.map(([left, right], i) => (
        <React.Fragment key={left}>
          <p className="font-cormorant font-medium leading-[1.6] whitespace-nowrap" style={{ ...b(131, 303 + i * 22.4), fontSize: fz(14.5), color: OLIVE }}>
            {left}
          </p>
          {right && (
            <p className="font-cormorant font-medium leading-[1.6] whitespace-nowrap text-white" style={{ ...b(204, 303 + i * 22.4), fontSize: fz(14.5) }}>
              {right}
            </p>
          )}
        </React.Fragment>
      ))}
    </Frame>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Lịch tháng: tên tháng viết tay + năm bên trái vạch dọc, ngày cưới in trên tim vân tay */
function MonthCalendar({ dateIso }) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="flex items-center" style={{ color: OLIVE }}>
      <Reveal variant="left" duration={4} wrapClassName="w-[29.5%] shrink-0">
        <p className="font-pinyon text-center leading-[1.6]" style={{ fontSize: fz(27) }}>{MONTHS_EN[m - 1]}</p>
        <p className="font-didot font-bold text-right leading-[1.6] pr-[19%]" style={{ fontSize: fz(21) }}>{y}</p>
      </Reveal>
      <div className="w-px self-stretch my-[6%] bg-[#6f6c4a]/80" />
      <div className="flex-1 pl-[1.5%] pr-[1%]">
        <div className="grid grid-cols-7 font-didot font-bold uppercase" style={{ fontSize: fz(10.5) }}>
          {WEEKDAYS.map((w) => (
            <span key={w} className="text-center leading-[1.6]">{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 font-notoserif mt-[3%]" style={{ fontSize: fz(11) }}>
          {cells.map((day, i) =>
            day === d ? (
              <span key={i} className="relative flex items-center justify-center" style={{ height: fz(26.4) }}>
                <Reveal variant="right" duration={3} wrapClassName="absolute inset-0 flex items-center justify-center">
                  <img src={images.deco.heart} alt="" className="max-w-none animate-pulse-soft" style={{ width: fz(31) }} />
                </Reveal>
                <span className="relative text-white">{day}</span>
              </span>
            ) : (
              <span key={i} className="flex items-center justify-center" style={{ height: fz(26.4) }}>
                {day ?? ""}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

/** Ảnh ngang toàn khung */
function WideImage({ src, ratio }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio }}>
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

function FamilySide({ side, align }) {
  return (
    <div className={`font-lora uppercase ${align}`} style={{ color: OLIVE }}>
      <h3 className="font-bold leading-[1.6]" style={{ fontSize: fz(15) }}>{side.label}</h3>
      {side.father && <p className="leading-[1.6] mt-0.5" style={{ fontSize: fz(12) }}>Ông {side.father}</p>}
      {side.mother && <p className="leading-[1.6]" style={{ fontSize: fz(12) }}>Bà {side.mother}</p>}
    </div>
  );
}

/** Tháng / năm giữa hai vạch ngang đỏ hai bên ngày to */
function Ruled({ children, variant }) {
  return (
    <Reveal variant={variant} duration={4}>
      <div className="border-y border-[#ba4353]/80 py-[3px] text-center font-lora leading-[1.6]" style={{ fontSize: fz(20) }}>
        {children}
      </div>
    </Reveal>
  );
}

function EventBlock({ item, mapLabel }) {
  const [dd, mm, yyyy] = item.date.split(/\.\s*/);
  return (
    <div className="text-center" style={{ color: OLIVE }}>
      {item.title && (
        <p className="font-lora font-bold uppercase leading-[1.6] mb-1" style={{ fontSize: fz(18) }}>{item.title}</p>
      )}
      <p className="font-lora uppercase leading-[1.6]" style={{ fontSize: fz(17) }}>{item.time}</p>
      <div className="flex items-center justify-center gap-[4%]" style={{ height: fz(80) }}>
        <div className="w-[25%]">
          <Ruled variant="left">THÁNG {mm}</Ruled>
        </div>
        <Reveal variant="fade" duration={5}>
          <p className="font-lora leading-none" style={{ fontSize: fz(70) }}>{dd}</p>
        </Reveal>
        <div className="w-[25%]">
          <Ruled variant="right">NĂM {yyyy}</Ruled>
        </div>
      </div>
      <Reveal variant="fade" duration={3}>
        <p className="font-quicksand leading-[1.6]" style={{ fontSize: fz(13), color: ROSE }}>{item.lunar}</p>
      </Reveal>
      {item.places.map((place) => (
        <div key={place.label} className="relative mt-[3%]">
          <Reveal variant="left" duration={4}>
            <p className="font-cormorant font-bold uppercase leading-[1.6]" style={{ fontSize: fz(21) }}>{place.label}</p>
          </Reveal>
          <Reveal variant="fade" duration={3}>
            <p className="font-quicksand leading-[1.6] px-[9%]" style={{ fontSize: fz(12) }}>Địa chỉ: {place.address}</p>
          </Reveal>
          <img src={images.deco.pearl} alt="" className="pointer-events-none absolute right-[3%] animate-pulse-soft" style={{ width: fz(23), bottom: fz(-14) }} />
          <a
            href={mapUrl(place.mapQuery ?? place.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[5%] inline-flex flex-col items-center font-didot font-bold uppercase animate-pulse-3"
            style={{ fontSize: fz(14), color: ROSE }}
          >
            <img src={images.deco.mapPin} alt="" style={{ width: fz(34) }} />
            <span className="leading-[1.6] mt-[2px]">{mapLabel}</span>
          </a>
        </div>
      ))}
    </div>
  );
}

/** Lời mời: góc hoa vàng, Nhà gái / Nhà trai, tên khách, tên hai người, sự kiện */
function Invitation({ c, guest }) {
  const hasParents = c.families.sides.some((s) => s.father || s.mother);
  const [nameA, nameB] = c.families.fullNames;
  return (
    <section className="relative pb-[9%]">
      <img src={images.deco.corner} alt="" className="pointer-events-none absolute left-0 top-0 w-[66.9%]" />
      <div className={hasParents ? "pt-[35.7%]" : "pt-[22%]"} />
      {hasParents && (
        <div className="relative grid grid-cols-[1fr_1fr] gap-x-[12.8%] px-[1%] mb-[6%]">
          {c.families.sides.map((side, i) => (
            <Reveal key={side.label} variant={i ? "right" : "left"} duration={3}>
              <FamilySide side={side} align={i ? "text-left" : "text-right"} />
            </Reveal>
          ))}
        </div>
      )}

      <div className="relative text-center font-lora uppercase" style={{ color: OLIVE }}>
        <p className="leading-[1.6]" style={{ fontSize: fz(16), color: ROSE }}>{c.invitation.kicker}</p>
        <div className="mx-auto w-[48.3%] border-b border-dotted" style={{ borderColor: ROSE }}>
          <p className="font-guest normal-case leading-[1.5] whitespace-nowrap" style={{ fontSize: fz(guest.length > 18 ? 24 : 32), color: RED }}>
            {guest}
          </p>
        </div>
        <p className="whitespace-pre-line leading-[1.6] mt-[2%]" style={{ fontSize: fz(16) }}>{c.invitation.title}</p>

        <div className="normal-case mt-[5%]">
          <Reveal variant="right" duration={4}>
            <p className="font-pinyon leading-[1.5]" style={{ fontSize: fz(36) }}>{nameA}</p>
          </Reveal>
          <Reveal variant="right" duration={5}>
            <p className="font-cormorant italic leading-[1.3]" style={{ fontSize: fz(26) }}>&amp;</p>
          </Reveal>
          <Reveal variant="left" duration={4}>
            <p className="font-pinyon leading-[1.5]" style={{ fontSize: fz(36) }}>{nameB}</p>
          </Reveal>
        </div>
      </div>

      <div className="relative mt-[8%] space-y-[10%]">
        {c.events.items.map((item) => (
          <EventBlock key={item.id} item={item} mapLabel={c.events.mapLabel} />
        ))}
      </div>
    </section>
  );
}

/** "Romantic LOVE": ảnh lớn làm mờ phía sau, hai ảnh khung trắng so le */
function RomanticLove({ r }) {
  const H = 798;
  const b = boxIn(H);
  const framed = "overflow-hidden border-[3px] border-white shadow-[0_4px_14px_rgba(0,0,0,0.12)]";
  return (
    <Frame H={H} style={{ color: OLIVE }}>
      <img src={images.deco.leafTall} alt="" className="pointer-events-none" style={b(0, 42, 104, 341)} />
      <h2 className="font-pinyon text-center leading-[1.6]" style={{ ...b(50, 45, 334, 74), fontSize: fz(40) }}>{r.title}</h2>
      <div style={b(198, 81, 200, 80)}>
        <Reveal variant="right" duration={4}>
          <p className="font-didot uppercase leading-[1.6]" style={{ fontSize: fz(50) }}>{r.word}</p>
        </Reveal>
      </div>
      {/* blur không cắt khung → mép ảnh tự loang mờ vào nền giấy như mẫu */}
      <img src={images.romantic.blur} alt="" className="object-cover blur-[5px]" style={b(50, 173, 322, 481)} loading="lazy" />
      <div style={b(240, 264, 159, 209)}>
        <Reveal variant="right" duration={3} className="h-full" wrapClassName="h-full">
          <div className={`${framed} h-full`}>
            <img src={images.romantic.right} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
          </div>
        </Reveal>
      </div>
      <div style={b(22, 344, 154, 215)}>
        <Reveal variant="left" duration={3} className="h-full" wrapClassName="h-full">
          <div className={`${framed} h-full`}>
            <img src={images.romantic.left} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
          </div>
        </Reveal>
      </div>
      <img src={images.deco.cornerBottom} alt="" className="pointer-events-none" style={b(119, 654, 300, 144)} />
    </Frame>
  );
}

/** 4 ô (chữ, chấm, icon) trên đường cong của mẫu — toạ độ trong khung Timeline */
const TIMELINE_SLOTS = [
  { text: [236, 121, 118], dot: [154, 190], icon: [275, 179, 39, 66], anim: "right" },
  { text: [32, 273, 123], dot: [199, 318], icon: [66, 338, 55, 61], anim: "left" },
  { text: [280, 348, 123], dot: [260, 432], icon: [313, 408, 58, 74], anim: "right" },
  { text: [35, 585, 123], dot: [217, 608], icon: [70, 635, 55, 61], anim: "up" },
];
/** Ô dùng theo số mốc — ít mốc thì bỏ ô giữa để mốc đầu / cuối vẫn ở hai đầu đường cong */
const TIMELINE_ORDER = { 1: [0], 2: [0, 3], 3: [0, 2, 3], 4: [0, 1, 2, 3] };

function Timeline({ t }) {
  const H = 949;
  const b = boxIn(H);
  return (
    <Frame H={H}>
      <h2 className="font-pinyon text-center leading-[1.6]" style={{ ...b(0, 0, 420, 74), fontSize: fz(40), color: OLIVE }}>
        {t.title}
      </h2>
      <img src={images.deco.timeline} alt="" className="pointer-events-none" style={b(144, 122, 136, 544)} />
      {t.items.slice(0, 4).map((item, i, list) => {
        const s = TIMELINE_SLOTS[TIMELINE_ORDER[list.length][i]];
        return (
          <React.Fragment key={item.time + item.label}>
            <span className="rounded-full" style={{ ...b(s.dot[0], s.dot[1], 10), aspectRatio: "1", background: RED }} />
            <div style={b(...s.text)}>
              <Reveal variant={s.anim} duration={4}>
                <p className="font-lora font-bold text-center uppercase leading-[1.6]" style={{ fontSize: fz(20), color: RED }}>{item.time}</p>
                <p className="font-lora text-center uppercase leading-[1.6]" style={{ fontSize: fz(13.5), color: RED }}>{item.label}</p>
              </Reveal>
            </div>
            <img src={images.deco[item.icon]} alt="" className="object-contain" style={b(...s.icon)} loading="lazy" />
          </React.Fragment>
        );
      })}
      <img src={images.deco.leafBottom} alt="" className="pointer-events-none" style={b(0, 718, 262, 231)} />
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

function CountdownNumbers({ c, b }) {
  const parts = useCountdown(c.target);
  const xs = [78, 147, 216, 285];
  return parts.map((v, i) => (
    <React.Fragment key={c.labels[i]}>
      <p className="font-didot text-center tabular-nums leading-[1.6]" style={{ ...b(xs[i], 217, 59, 43), fontSize: fz(27) }}>
        {String(v).padStart(2, "0")}
      </p>
      <p className="font-cormorant font-medium text-center leading-[1.6]" style={{ ...b(xs[i] + 7, 258, 49, 27), fontSize: fz(17) }}>
        {c.labels[i]}
      </p>
      {i > 0 && (
        <p className="font-cormorant text-center leading-[1.6]" style={{ ...b(xs[i] - 23, 219, 23, 40), fontSize: fz(20) }}>:</p>
      )}
    </React.Fragment>
  ));
}

/** Đếm ngược + "Romantic LOVE STORY" + ghép ảnh + câu trích dẫn — khung 420 × 1386 của mẫu */
function Story({ countdown, s }) {
  const H = 1386;
  const b = boxIn(H);
  const photo = (src, box, pos = "object-center", extra = "") => (
    <div className="overflow-hidden" style={b(...box)}>
      <img src={src} alt="" className={`h-full w-full object-cover ${pos} ${extra}`} loading="lazy" />
    </div>
  );
  return (
    <Frame H={H} style={{ color: OLIVE }}>
      <img src={images.deco.branch} alt="" className="pointer-events-none" style={b(142, 34, 139, 75)} />
      {countdown && (
        <>
          <div style={b(0, 124, 420, 65)}>
            <Reveal variant="right" duration={5}>
              <h2 className="font-pinyon text-center leading-[1.6]" style={{ fontSize: fz(35) }}>{countdown.title}</h2>
            </Reveal>
          </div>
          <CountdownNumbers c={countdown} b={b} />
        </>
      )}
      <img src={images.deco.leafTall} alt="" className="pointer-events-none" style={b(0, 320, 103, 335)} />
      <img src={images.deco.leafRight} alt="" className="pointer-events-none" style={b(321, 500, 99, 189)} />
      <h2 className="font-pinyon text-center leading-[1.6]" style={{ ...b(16, 487, 334, 59), fontSize: fz(32) }}>{s.title}</h2>
      <p className="font-didot text-center uppercase leading-[1.6]" style={{ ...b(47, 531, 316, 51), fontSize: fz(32) }}>{s.subtitle}</p>
      <p className="font-pinyon text-center leading-[1.6]" style={{ ...b(33, 562, 334, 47), fontSize: fz(25) }}>{s.tagline}</p>

      {photo(images.story[0], [146, 689, 263, 178], "object-center", "grayscale")}
      <div style={b(0, 734, 146, 35)}>
        <Reveal variant="left" duration={4}>
          <p className="font-cormorant italic font-medium text-center leading-[1.6]" style={{ fontSize: fz(22) }}>{s.caption}</p>
        </Reveal>
      </div>
      {photo(images.story[1], [11, 776, 133, 91])}
      <span style={{ ...b(56, 869, 87, 87), background: OLIVE }} />
      <span style={{ ...b(70, 960, 73, 73), background: "rgba(112,108,75,0.2)" }} />
      {photo(images.story[2], [146, 869, 165, 251], "object-top")}
      {photo(images.story[3], [316, 869, 94, 143], "object-top")}
      <img src={images.deco.floral} alt="" className="pointer-events-none" style={b(0, 1036, 321, 350)} />
      <div style={b(305, 1025, 115, 48)}>
        <Reveal variant="right" duration={4}>
          <p className="font-cormorant text-center uppercase leading-[1.6]" style={{ fontSize: fz(30) }}>{s.word}</p>
        </Reveal>
      </div>
      {s.quote.map((line, i) => (
        <div key={line} style={b(0, 1171 + i * 55, 420, 48)}>
          <Reveal variant={i ? "right" : "left"} duration={4}>
            <p className="font-lora italic text-center whitespace-pre-line leading-[1.6] opacity-80" style={{ fontSize: fz(15) }}>{line}</p>
          </Reveal>
        </div>
      ))}
    </Frame>
  );
}

/** Ảnh lớn có nút trước / sau + dải ảnh nhỏ (bấm để đổi, tự chuyển 4 giây) */
function Gallery({ list }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef(null);
  const go = (step) => setActive((i) => (i + step + list.length) % list.length);
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
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "408 / 600" }}>
        {list.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <button type="button" onClick={() => go(-1)} aria-label="Ảnh trước" className="absolute left-[2%] top-1/2 -translate-y-1/2 p-2 text-[#333]/80">
          <ChevronLeft className="h-7 w-7" strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Ảnh sau" className="absolute right-[2%] top-1/2 -translate-y-1/2 p-2 text-[#333]/80">
          <ChevronRight className="h-7 w-7" strokeWidth={1.5} />
        </button>
      </div>
      <div ref={stripRef} className="no-scrollbar mt-[6px] flex gap-[6px] overflow-x-auto">
        {list.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ảnh ${i + 1}`}
            className={`shrink-0 basis-[calc((100%-30px)/6)] transition-opacity ${i === active ? "opacity-100" : "opacity-55"}`}
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

  const inputCls =
    "w-full rounded-full border border-[#a6a6a6] bg-white/70 px-4 py-[11px] font-cormorant font-medium text-[15px] text-[#6f6c4a] placeholder:text-[#6f6c4a]/80 outline-none focus:ring-2 focus:ring-[#6f6c4a]/30";

  return (
    <div className="text-center" style={{ color: OLIVE }}>
      <Reveal variant="down" duration={4}>
        <h2 className="font-cormorant uppercase leading-[1.6]" style={{ fontSize: fz(32) }}>{c.title}</h2>
      </Reveal>
      <p className="font-quicksand italic leading-[1.6] px-[12%]" style={{ fontSize: fz(15) }}>{c.intro}</p>
      {sent ? (
        <p className="font-lora text-lg py-6 px-[9%]">{c.thanks}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-[5%] w-[85.7%] space-y-[13px]">
          <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={inputCls} />
          <input value={form.message} onChange={update("message")} placeholder={c.placeholders.message} className={inputCls} />
          {c.askAttend && (
            <select
              required
              value={form.attend}
              onChange={update("attend")}
              className={`${inputCls} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='10'%20height='6'%3E%3Cpath%20d='M0%200h10L5%206z'%20fill='%236f6c4a'/%3E%3C/svg%3E")] bg-[length:10px_6px] bg-[right_16px_center] bg-no-repeat`}
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
              className="w-[73%] rounded-full py-[9px] font-lora text-[15px] uppercase text-white shadow transition hover:brightness-110 disabled:opacity-70"
              style={{ background: OLIVE }}
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
          className="w-36 h-36 rounded-xl border-2 border-[#6f6c4a]/70 bg-white p-1.5 shadow-md"
        />
      )}
      <dl className="mt-3 space-y-1 font-lora font-bold text-[13px] uppercase text-[#6f6c4a]">
        <div><dt className="inline">CTK: </dt><dd className="inline">{account.holder}</dd></div>
        <div><dt className="inline">STK: </dt><dd className="inline tracking-wide">{account.number}</dd></div>
        <div><dt className="inline">NH: </dt><dd className="inline">{account.bank}</dd></div>
      </dl>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#6f6c4a] px-4 py-1.5 font-lora text-sm text-white shadow transition hover:brightness-110"
        >
          {copied ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
          {copied ? c.copiedLabel : c.copyLabel}
        </button>
        {account.qr && (
          /** Khách mở thiệp trên chính điện thoại thì không quét được — lưu ảnh rồi chọn trong app ngân hàng */
          <a
            href={account.qr}
            download={`QR-${account.bank}-${account.number}.png`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#6f6c4a]/50 px-4 py-1.5 font-lora text-sm text-[#6f6c4a] transition hover:bg-[#6f6c4a] hover:text-white"
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
            className="absolute right-4 top-4 text-[#6f6c4a]/70 hover:text-[#6f6c4a]"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="font-pinyon text-[36px] leading-tight whitespace-nowrap text-[#6f6c4a] text-center mt-3">{c.title}</h2>
          <div className="h-px bg-[#6f6c4a]/20 my-4" />
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

/** Thank You: ảnh lớn loang hồng đất ở dưới, chữ cảm ơn + ký tên */
function ThankYou({ t }) {
  /** Cao hơn mẫu (472) để dòng ký tên không nằm dưới nút nhạc */
  const H = 560;
  const b = boxIn(H);
  return (
    <Frame H={H} className="overflow-hidden text-white">
      <img src={images.thankYou} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_12%]" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[42%] via-[#ba4353]/60 via-[64%] to-[#a83a4b]" />
      <div style={b(0, 300, 420, 54)}>
        <Reveal variant="down" duration={5}>
          <h2 className="font-pinyon text-center leading-[1.6]" style={{ fontSize: fz(36) }}>{t.title}</h2>
        </Reveal>
      </div>
      <p className="font-cormorant font-medium text-center leading-[1.6]" style={{ ...b(29, 368, 363, 80), fontSize: fz(16) }}>
        {t.text}
      </p>
      <p className="font-pinyon text-center leading-[1.6]" style={{ ...b(0, 470, 420, 44), fontSize: fz(t.sign.length > 24 ? 22 : 27) }}>
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
  const hasGift = c.gift.accounts.length > 0;

  return (
    <div className="min-h-screen bg-[#e7e5e2] font-lora">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects />

      <main className="paper relative mx-auto max-w-[420px] overflow-hidden shadow-2xl [container-type:inline-size]" style={{ color: OLIVE }}>
        <Cover c={c.hero} />
        <Darling d={c.darling} />

        {c.calendar.dateIso && (
          <section className="pt-[1%] pb-[11%]">
            <MonthCalendar dateIso={c.calendar.dateIso} />
          </section>
        )}

        <WideImage src={images.wide} ratio="420 / 280" />

        <Invitation c={c} guest={guest} />

        <RomanticLove r={c.romantic} />

        {c.timeline && (
          <section className="pt-[8.5%]">
            <Timeline t={c.timeline} />
          </section>
        )}

        <WideImage src={images.big} ratio="420 / 619" />

        <Story countdown={c.countdown} s={c.story} />

        <Gallery list={images.album} />

        <section className="relative pt-[41%] pb-[12%]">
          <img src={images.deco.corner} alt="" className="pointer-events-none absolute left-0 top-0 w-[72%]" />
          <img src={images.deco.borderBottom} alt="" className="pointer-events-none absolute inset-x-0 bottom-0 w-full" />
          <div className="relative">
            {c.rsvp.show && <RsvpForm c={c.rsvp} />}
            {hasGift && (
              <div className="mt-[4%] text-center">
                <button
                  type="button"
                  onClick={() => setGiftOpen(true)}
                  className="inline-flex w-[78%] items-center justify-center gap-2 rounded-full border border-[#a6a6a6] bg-white/60 py-[10px] font-lora uppercase animate-pulse-3"
                  style={{ fontSize: fz(15), color: OLIVE }}
                >
                  <Gift className="h-[1.2em] w-[1.2em]" aria-hidden />
                  {c.gift.button}
                </button>
              </div>
            )}
          </div>
        </section>

        <ThankYou t={c.thanks} />
      </main>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
