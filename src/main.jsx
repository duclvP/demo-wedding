import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Car, Check, ChevronLeft, ChevronRight, Copy, Download, HeartHandshake, MapPin, Music, Users, UtensilsCrossed, Volume2, VolumeX, X } from "lucide-react";
import { content } from "./content.js";
import { images } from "./image.js";
import { applyEventOverrides, pickInvitedEvents } from "./eventOverrides.js";
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
          className="music-btn relative flex h-11 w-11 items-center justify-center rounded-full bg-moss/90 text-cream shadow-lg transition-colors hover:bg-moss active:animate-press"
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

/* ---------- Mẫu nawngs.com/thanglinh: nền giấy thạch cao, ảnh bo một góc lớn, chữ serif in hoa + chữ viết tay ---------- */

/** Tháng tiếng Anh cho tiêu đề lịch (chữ viết tay như mẫu) */
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS_EN = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/** "16:00 | Thứ Bảy" → ["16:00", "Thứ Bảy"]; "28. 11. 2026" → ["28", "11", "2026"] */
const splitTime = (time) => time.split("|").map((s) => s.trim());
const splitDate = (date) => date.split(".").map((s) => s.trim());
const toMinutes = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  return m ? +m[1] * 60 + +m[2] : null;
};
const fromMinutes = (n) => `${String(Math.floor(n / 60) % 24).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
/** "16:30" → "16h30" như mẫu */
const timelineHour = (hhmm) => hhmm.replace(":", "h");

/**
 * Timeline = các mốc `timeline` của từng sự kiện đang hiện, cộng mốc `always` của sự kiện khách không được mời
 * (vd rước dâu ngày cưới vẫn hiện cho khách mời ngày hôm trước). Khách đổi giờ sự kiện qua link (?gio=) thì mốc
 * của sự kiện đó dời theo cùng khoảng; timeline gồm từ hai ngày trở lên thì mỗi mốc ghi thêm ngày "28/11".
 */
function buildTimeline(original, all, shown) {
  const parts = all
    .map((ev) => {
      const before = original.find((i) => i.id === ev.id);
      const items = (before.timeline ?? []).filter((t) => shown.includes(ev) || t.always);
      return { ev, before, items };
    })
    .filter((p) => p.items.length);
  const multi = new Set(parts.map((p) => p.ev.date)).size > 1;
  return parts.flatMap(({ ev, before, items }) => {
    const delta = toMinutes(splitTime(ev.time)[0]) - toMinutes(splitTime(before.time)[0]);
    const [d, m] = splitDate(ev.date);
    return items.map((t) => ({
      ...t,
      time: delta ? fromMinutes((toMinutes(t.time) + delta + 1440) % 1440) : t.time,
      date: multi ? `${d}/${m}` : null,
    }));
  });
}

/** Biểu tượng nét mảnh cho từng mốc timeline */
const TIMELINE_ICONS = {
  guests: Users,
  dinner: UtensilsCrossed,
  music: Music,
  car: Car,
  rings: HeartHandshake,
};

/**
 * Hai tên in hoa xếp chéo + nét "and" bay dài (ảnh của mẫu) lượn dưới hai tên — toạ độ theo mẫu trên khung 337×148:
 * tên 1 ở đỉnh, tên 2 thấp hơn 60px, ảnh "and" 242×101 ở x0 y26
 */
function NamesBlock({ names, andSrc, className = "" }) {
  return (
    <div className={`relative ml-auto w-[337px] max-w-full text-right font-serif uppercase text-[55px] leading-[88px] ${className}`}>
      <img src={andSrc} alt="" className="pointer-events-none absolute left-0 top-[26px] w-[242px]" aria-hidden />
      <p className="relative whitespace-nowrap">{names[0]}</p>
      <p className="relative -mt-[28px] whitespace-nowrap">{names[1]}</p>
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

/** Lá phong (ảnh của mẫu, đã đổi sang tông đỏ rượu) */
function Leaf({ className = "" }) {
  return (
    <Reveal variant="zoom" duration={2} className="flex justify-center">
      <img src={images.deco.leaf} alt="" className={`w-[152px] ${className}`} loading="lazy" />
    </Reveal>
  );
}

/** Vạch ngang mảnh kết thúc bằng chấm vuông (LINE + BOX 6×6 của mẫu) */
function DotLine({ className = "", dotLeft = false, light = false }) {
  const color = light ? "bg-cream" : "bg-moss";
  return (
    <span className={`relative block h-px ${light ? "bg-cream/70" : "bg-moss/50"} ${className}`} aria-hidden>
      <span className={`absolute top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full ${color} ${dotLeft ? "left-0" : "right-0"}`} />
    </span>
  );
}

/** Một sự kiện: giờ + thứ, ngày | tháng | năm, âm lịch, địa điểm, địa chỉ, nút chỉ đường */
function EventBlock({ item, mapLabel }) {
  const [hour, weekday] = splitTime(item.time);
  const [d, m, y] = splitDate(item.date);
  const q = item.mapQuery ?? item.address;
  return (
    <div className="text-right">
      {item.title && (
        <Reveal variant="down" duration={1.5}>
          <p className="font-serif uppercase text-[13px] leading-[20.8px] tracking-wide text-ink">{item.title}</p>
        </Reveal>
      )}
      <Reveal variant="up" duration={1.5}>
        <p className="font-serif uppercase text-[23px] leading-[36.8px] text-moss">
          {hour}, {weekday}
        </p>
        <p className="flex items-center justify-end gap-[14px] font-slab text-[23px] leading-[36.8px] text-moss">
          <span>{d}</span>
          <span className="h-[20px] w-px bg-moss/60" aria-hidden />
          <span>{m}</span>
          <span className="h-[20px] w-px bg-moss/60" aria-hidden />
          <span>{y}</span>
        </p>
        {item.lunar && <p className="font-serif text-[14px] leading-[22.4px] text-ink">{item.lunar}</p>}
      </Reveal>
      <Reveal variant="down" duration={1.5} className="mt-[40px]">
        <p className="font-serif uppercase text-[13px] leading-[20.8px] text-ink">{item.placeLabel}</p>
        <p className="mt-[5px] font-serif uppercase text-[24px] leading-[38.4px] text-moss">{item.place}</p>
        <p className="font-serif uppercase text-[13px] leading-[20.8px] text-ink">{item.address}</p>
      </Reveal>
      <div className="mt-6 flex justify-center">
        <a
          href={item.mapLink ?? mapUrl(q)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-moss animate-pulse-soft"
        >
          <MapPin className="h-[28px] w-[22px] fill-moss stroke-cream" strokeWidth={1.5} aria-hidden />
          <span className="mt-1 font-serif uppercase text-[14px] leading-[22.4px]">{mapLabel}</span>
        </a>
      </div>
    </div>
  );
}

/** Một bên gia đình: nhãn + bố mẹ (bỏ dòng null) + địa chỉ + nút chỉ đường riêng của nhà đó */
function FamilySide({ side, align, mapLabel }) {
  const lines = [side.father, side.mother].filter(Boolean);
  const href = side.mapLink ?? (side.address && mapUrl(side.address));
  return (
    <div className={`font-serif uppercase text-[13px] leading-[20.8px] text-ink ${align}`}>
      <p>{side.label}</p>
      {lines.map((l) => (
        <p key={l} className="text-moss">{l}</p>
      ))}
      {side.address && <p className="normal-case">{side.address}</p>}
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[12px] text-moss underline-offset-2 hover:underline">
          <MapPin className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden />
          {mapLabel}
        </a>
      )}
    </div>
  );
}

/** Lịch tháng chữ kem trên nền màu chính, các ngày tổ chức (cùng tháng) phủ tim xám xanh */
function MonthCalendar({ year: y, month: m, days }) {
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="rounded-br-[60px] bg-moss pb-[30px] pt-[5px]">
      <div className="relative h-[88px]">
        <Reveal variant="left" duration={1.5} className="absolute left-[10px] top-0">
          <p className="font-script text-[55px] leading-[88px] text-cream">{MONTHS_EN[m - 1]}</p>
        </Reveal>
        <div className="absolute left-[86px] right-[26px] top-[61px]">
          <Reveal variant="right" duration={1.5}>
            <DotLine light />
          </Reveal>
        </div>
      </div>
      <Reveal duration={1.5} className="mx-[27px] mt-[10px] grid grid-cols-7 text-center font-serif text-[11px] text-cream">
        {WEEKDAYS_EN.map((w) => (
          <span key={w} className="pb-[18px]">{w}</span>
        ))}
        {cells.map((day, i) =>
          days.includes(day) ? (
            <span key={i} className="relative flex h-[37px] items-center justify-center">
              <Heart className="absolute h-[34px] w-[34px] text-[#a9b5ae] animate-pulse-soft" />
              <span className="relative font-bold text-moss">{day}</span>
            </span>
          ) : (
            <span key={i} className="flex h-[37px] items-center justify-center">{day ?? ""}</span>
          ),
        )}
      </Reveal>
    </div>
  );
}

/**
 * Timeline: đường cong vẽ bằng SVG đi qua các mốc so le trái / phải, lá nhỏ ở mỗi khúc cua.
 * Khung 420 × (n × 165): mốc i nằm ở y = 30 + i × 165, mốc chẵn chữ bên trái đường, mốc lẻ bên phải.
 */
const TL_STEP = 165;
function Timeline({ items }) {
  const h = 60 + items.length * TL_STEP;
  /** Đường cong lượn giữa x 150 và x 270 */
  const pts = items.map((_, i) => ({ x: i % 2 ? 150 : 270, y: 30 + i * TL_STEP + 60 }));
  let d = `M ${pts[0].x + 20} 0`;
  pts.forEach((p, i) => {
    const prev = i ? pts[i - 1] : { x: pts[0].x + 20, y: 0 };
    const my = (prev.y + p.y) / 2;
    d += ` C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
  });
  const last = pts[pts.length - 1];
  d += ` C ${last.x} ${last.y + 50}, ${last.x + (last.x > 200 ? -40 : 40)} ${h - 10}, ${last.x + (last.x > 200 ? -60 : 60)} ${h}`;

  return (
    <div className="relative mx-auto w-full max-w-[420px]" style={{ height: h }}>
      <Reveal variant="left" duration={2} className="absolute inset-0">
        <svg viewBox={`0 0 420 ${h}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
          <path d={d} stroke="#062520" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </Reveal>
      {items.map((t, i) => {
        const Icon = TIMELINE_ICONS[t.icon] ?? Heart;
        const right = i % 2 === 1;
        const p = pts[i];
        return (
          <div key={i}>
            <img
              src={images.deco.leaf}
              alt=""
              className={`absolute w-[28px] ${i % 2 ? "-rotate-12" : "rotate-12"} opacity-80`}
              style={{ left: p.x - 14, top: p.y - 15 }}
              aria-hidden
            />
            <div
              className="absolute w-[150px] text-center"
              style={{ top: 30 + i * TL_STEP - 10, left: right ? 215 : 45 }}
            >
              <Reveal variant={right ? "right" : "left"} duration={1.5}>
                <p className="font-hepta font-bold text-[17px] leading-[26px] text-moss">
                  {timelineHour(t.time)}
                  {t.date && <span className="font-normal text-[14px] text-ink"> · {t.date}</span>}
                </p>
                <p className="font-hepta uppercase text-[14px] leading-[22px] text-moss">{t.label}</p>
                <Icon className="mx-auto mt-2 h-[46px] w-[46px] text-moss/75" strokeWidth={1} aria-hidden />
              </Reveal>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Album: ảnh lớn + dải ảnh nhỏ, bấm mũi tên / ảnh nhỏ để đổi, tự chạy 4 giây một ảnh */
function Gallery({ photos }) {
  const [index, setIndex] = useState(0);
  const thumbsRef = useRef(null);
  const n = photos.length;
  const go = useCallback((i) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    const t = setTimeout(() => go(index + 1), 4000);
    return () => clearTimeout(t);
  }, [index, go]);

  useEffect(() => {
    const strip = thumbsRef.current;
    const el = strip?.children[index];
    if (!strip || !el) return;
    /** Chỉ cuộn dải ảnh nhỏ, không kéo cả trang tới album */
    strip.scrollTo({ left: el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2, behavior: "smooth" });
  }, [index]);

  if (!n) return null;
  return (
    <div>
      <div className="relative aspect-[420/490] w-full overflow-hidden bg-black/5">
        {photos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <button type="button" onClick={() => go(index - 1)} aria-label="Ảnh trước" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white drop-shadow">
          <ChevronLeft className="h-8 w-8" strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => go(index + 1)} aria-label="Ảnh sau" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white drop-shadow">
          <ChevronRight className="h-8 w-8" strokeWidth={1.5} />
        </button>
      </div>
      <div ref={thumbsRef} className="mt-[10px] flex gap-[10px] overflow-x-auto [scrollbar-width:none]">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Ảnh ${i + 1}`}
            className={`h-[80px] w-[80px] shrink-0 overflow-hidden transition-opacity ${i === index ? "opacity-100" : "opacity-60"}`}
          >
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Form trên nền đỏ rượu: tên, lời chúc, xác nhận tham dự, số người — đúng 4 trường script dùng chung đọc */
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
    const attending = form.attend === "yes";
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
          attend: !c.askAttend ? "" : attending ? c.attendYes : c.attendNo,
          guestCount: !c.askAttend ? "" : attending ? form.guestCount || "1" : "0",
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
    "w-full rounded-[18px] border-0 bg-cream/90 px-3 py-[6px] font-hepta text-[14px] text-moss placeholder:italic placeholder:text-moss/60 outline-none focus:ring-2 focus:ring-cream/60";

  if (sent) return <p className="py-6 text-center font-hepta text-[16px] text-cream">{c.thanks}</p>;
  return (
    <form onSubmit={handleSubmit} className="space-y-[10px]">
      <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={inputCls} />
      <textarea value={form.message} onChange={update("message")} placeholder={c.placeholders.message} rows={4} className={`${inputCls} resize-none`} />
      {c.askAttend && (
        <>
          <select required value={form.attend} onChange={update("attend")} className={inputCls}>
            <option value="" disabled>
              {c.placeholders.attend}
            </option>
            <option value="yes">{c.attendYes}</option>
            <option value="no">{c.attendNo}</option>
          </select>
          {/* Luôn hiện như mẫu; khách báo không tham dự thì khóa lại (gửi 0 người) */}
          <select
            value={form.attend === "no" ? "" : form.guestCount}
            onChange={update("guestCount")}
            disabled={form.attend === "no"}
            className={`${inputCls} disabled:opacity-60`}
          >
            <option value="">{c.placeholders.guestCount}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n === 1 ? "1 người (chỉ mình tôi)" : `${n} người`}</option>
            ))}
          </select>
        </>
      )}
      {error && <p className="text-center text-sm text-cream/90">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-[18px] bg-cream/25 py-[7px] font-hepta uppercase text-[16px] text-white transition hover:bg-cream/35 disabled:opacity-70"
      >
        {sending ? c.sending : c.submit}
      </button>
    </form>
  );
}

function WeddingPage() {
  const c = content;
  const guest = useGuestName(c.invitation.defaultGuest);
  const [giftOpen, setGiftOpen] = useState(false);
  const closeGift = useCallback(() => setGiftOpen(false), []);
  const names = c.hero.names;
  const hasGift = c.gift.accounts.length > 0;
  /**
   * Sự kiện editable đổi được giờ / ngày qua link ?gio=&ngay= (thứ hai: gio2 / ngay2); ?moi=N chỉ hiện sự kiện thứ N
   * (khách được mời một ngày) — trang /tao-link ghép sẵn
   */
  const allEvents = applyEventOverrides(c.events.items);
  const events = pickInvitedEvents(allEvents);
  const main = events[0];
  const [d, m, y] = splitDate(main.date);
  const timeline = buildTimeline(c.events.items, allEvents, events);
  /** Lịch tháng của ngày đầu tiên, khoanh mọi ngày tổ chức đang hiện trong tháng đó */
  const calendarDays = [
    ...new Set(
      events
        .map((e) => splitDate(e.date))
        .filter(([, mm, yy]) => mm === m && yy === y)
        .map(([dd]) => +dd),
    ),
  ];

  const giftButton = hasGift && (
    <button
      type="button"
      onClick={() => setGiftOpen(true)}
      className="w-full rounded-[18px] bg-cream/25 py-[7px] font-hepta uppercase text-[16px] text-white transition hover:bg-cream/35"
    >
      {c.gift.button}
    </button>
  );

  return (
    <div className="paper min-h-screen font-serif text-moss">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />

      <main className="paper relative mx-auto min-h-screen max-w-[420px] overflow-hidden shadow-2xl">
        {/* Ảnh bìa bo góc dưới phải + hai tên */}
        <section className="relative px-[11px] pr-[24px]">
          <Reveal variant="zoom" duration={2}>
            <div className="relative aspect-[385/613] overflow-hidden rounded-br-[170px]">
              <img src={images.hero} alt={`${names[0]} & ${names[1]}`} className="h-full w-full object-cover object-top" />
              <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-black/40 to-transparent" />
            </div>
          </Reveal>
          <div className="absolute right-[34px] top-[15px]">
            <Reveal variant="down" duration={1.5}>
              <NamesBlock names={names} andSrc={images.deco.andTrang} className="text-cream" />
            </Reveal>
          </div>
        </section>

        {/* Love Story + ngày xếp dọc */}
        <section className="grid grid-cols-[1fr_108px] gap-2 pl-[22px] pr-[8px] pt-[2px]">
          <div className="pt-[38px]">
            <Reveal variant="left" duration={1.5}>
              <p className="font-script text-[51px] leading-[61px] whitespace-nowrap">{c.hero.storyTitle}</p>
            </Reveal>
            <Reveal duration={2}>
              <p className="mt-[6px] pl-[10px] font-serif text-[14px] leading-[16.8px] text-[#9e9e9e]">{c.hero.story}</p>
            </Reveal>
          </div>
          <Reveal variant="right" duration={1.5} className="text-center font-slab text-[55px] leading-[66px]">
            <p>{d}</p>
            <span className="mx-auto block h-px w-[61px] bg-moss" aria-hidden />
            <p>{m}</p>
            <span className="mx-auto block h-px w-[61px] bg-moss" aria-hidden />
            <p>{y.slice(-2)}</p>
          </Reveal>
        </section>

        {/* Ảnh ngang */}
        <Reveal duration={2} className="mt-[30px]">
          <img src={images.wide} alt="" className="block aspect-[420/210] w-full object-cover object-[center_30%]" loading="lazy" />
        </Reveal>

        {/* Lời mời: tên khách, hai tên, sự kiện, gia đình */}
        <section className="px-[22px] pt-[40px]">
          <Reveal variant="down" duration={1.5}>
            <p className="ml-auto max-w-[378px] text-right font-serif uppercase text-[13px] leading-[20.8px] text-ink">
              {c.invitation.before} {guest} {c.invitation.after}
            </p>
          </Reveal>
          <Reveal variant="left" duration={1.5} className="mt-[10px]">
            <NamesBlock names={names} andSrc={images.deco.andXanh} />
          </Reveal>

          <div className="mt-[10px] space-y-[50px]">
            {events.map((item) => (
              <EventBlock key={item.id} item={item} mapLabel={c.events.mapLabel} />
            ))}
          </div>

          <Reveal duration={1.5} className="mt-[30px]">
            <DotLine />
          </Reveal>
          <div className="mt-[22px] grid grid-cols-2 gap-6">
            <Reveal variant="left" duration={1.5}>
              <FamilySide side={c.families.sides[0]} align="text-left" mapLabel={c.events.mapLabel} />
            </Reveal>
            <Reveal variant="right" duration={1.5}>
              <FamilySide side={c.families.sides[1]} align="text-right" mapLabel={c.events.mapLabel} />
            </Reveal>
          </div>
        </section>

        <div className="pt-[50px] pb-[16px]">
          <Leaf className="opacity-45" />
        </div>

        {/* Lịch */}
        {c.calendar.show && <MonthCalendar year={+y} month={+m} days={calendarDays} />}

        {/* Ảnh "Destiny" bo góc trên trái */}
        <section className="relative mt-[26px]">
          <Reveal duration={2}>
            <div className="relative aspect-[420/630] overflow-hidden rounded-tl-[170px]">
              <img src={images.destiny} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/55 to-transparent" />
            </div>
          </Reveal>
          <div className="absolute inset-x-0 bottom-[6px]">
            <Reveal variant="down" duration={1.5}>
              <p className="pl-[40px] font-script text-[100px] leading-[123px] text-cream/90">{c.destiny}</p>
            </Reveal>
          </div>
        </section>

        {/* Timeline */}
        {timeline.length > 0 && (
          <section className="pt-[40px]">
            <div className="relative h-[107px]">
              <Reveal variant="right" duration={1.5} className="absolute left-[150px] top-0">
                <p className="font-script text-[67px] leading-[107px]">{c.timeline.title}</p>
              </Reveal>
              <span className="absolute right-0 top-[54px] h-px w-[60px] bg-moss/60" aria-hidden />
            </div>
            <Timeline items={timeline} />
          </section>
        )}

        {/* Dresscode — chỉ hiện khi có màu */}
        {c.dresscode.colors.length > 0 && (
          <section className="pt-[40px]">
            <div className="relative h-[96px]">
              <span className="absolute left-0 top-[46px] h-px w-[60px] bg-moss/60" aria-hidden />
              <Reveal variant="left" duration={1.5} className="absolute left-[66px] top-0">
                <p className="font-script text-[60px] leading-[96px]">{c.dresscode.title}</p>
              </Reveal>
            </div>
            <Reveal variant="up" duration={1.5} className="mt-[-4px] flex justify-center gap-[23px]">
              {c.dresscode.colors.map((col) => (
                <span key={col} className="h-[46px] w-[46px] rounded-full shadow-inner" style={{ background: col }} />
              ))}
            </Reveal>
          </section>
        )}

        <div className="pt-[40px] pb-[30px]">
          <Leaf />
        </div>

        {/* The Album: ảnh bo góc lệch phải, dải mờ ngang đè lên */}
        <section className="relative h-[458px]">
          <Reveal variant="right" duration={2} className="absolute right-[21px] top-0 w-[305px]">
            <img src={images.albumCover} alt="" className="aspect-[305/458] w-full rounded-[40px] object-cover" loading="lazy" />
          </Reveal>
          <div className="absolute inset-x-0 top-[84px] h-[300px] bg-black/25 backdrop-blur-[3px]" aria-hidden />
          <div className="absolute left-[10px] top-[143px]">
            <Reveal variant="left" duration={1.5}>
              <p className="font-script text-[97px] leading-[100px] text-cream drop-shadow">The</p>
              <p className="-mt-[6px] pl-[48px] font-serif uppercase text-[49px] leading-[60px] text-cream drop-shadow">{c.album.title}</p>
            </Reveal>
          </div>
        </section>

        <section className="pt-[56px]">
          <Gallery photos={images.album} />
        </section>

        {/* Thư cảm ơn trong khung viền bo tròn */}
        <section className="px-[13px] pt-[30px] pb-[34px]">
          <Reveal duration={1.5} className="rounded-[50px] border border-moss px-[23px] pt-[24px] pb-[16px] text-center">
            {/* Ảnh chữ của mẫu — Hayollan không có dấu tiếng Việt */}
            <img src={images.deco.tranTrong} alt={c.letter.title} className="mx-auto h-[39px] w-[200px]" loading="lazy" />
            <span className="mx-auto mt-[20px] block h-[5px] w-[5px] rounded-full bg-moss" aria-hidden />
            <div className="mt-[30px] space-y-[26px] text-justify font-hepta text-[13px] leading-[26px]">
              {c.letter.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <span className="mx-auto mt-[38px] block h-[5px] w-[5px] rounded-full bg-moss" aria-hidden />
            <p className="mt-[40px] font-hepta uppercase text-[13px] leading-[26px]">{c.letter.closing}</p>
            <p className="font-script text-[32px] leading-[64px] whitespace-nowrap">
              {c.letter.signature}
            </p>
          </Reveal>
        </section>

        {/* Xác nhận tham dự + mừng cưới */}
        {(c.rsvp.show || hasGift) && (
          <section className="rounded-br-[60px] bg-moss px-[31px] pt-[53px] pb-[60px] text-cream">
            {c.rsvp.show && (
              <Reveal variant="up" duration={1.5}>
                <p className="mb-[22px] text-center font-hepta text-[13px] leading-[20.8px] whitespace-pre-line">{c.rsvp.intro}</p>
                <RsvpForm c={c.rsvp} />
              </Reveal>
            )}
            {giftButton && <Reveal className={c.rsvp.show ? "mt-[13px]" : ""}>{giftButton}</Reveal>}
          </section>
        )}

        {/* Thank you */}
        <section className="relative mt-[18px]">
          <img src={images.thankYou} alt="" className="block aspect-[420/203] w-full rounded-tl-[60px] object-cover object-[center_25%]" loading="lazy" />
          <div className="absolute inset-0 rounded-tl-[60px] bg-gradient-to-r from-black/45 to-transparent" />
          <div className="absolute left-[20px] top-[50px]">
            <Reveal variant="left" duration={1.5}>
              <p className="font-script text-[54px] leading-[107px] text-cream whitespace-nowrap">{c.thanks.title}</p>
            </Reveal>
          </div>
        </section>
      </main>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
