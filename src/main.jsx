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
 * duration: giây (mẫu mau37 dùng fadeIn 4–5s, dịch 20–40px)
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

/* ---------- Họa tiết ---------- */

/** Trái tim vẽ một nét (hộp quà) */
function HeartDoodle({ className = "" }) {
  return (
    <svg viewBox="0 0 64 70" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M32 58 C 10 44 2 30 6 18 C 10 6 26 4 32 18 C 38 4 56 6 59 18 C 62 32 50 46 32 58 Z" />
      <path d="M32 58 C 30 62 34 64 31 69" />
    </svg>
  );
}

/** Trái tim đặc (quanh ngày cưới trên lịch, cạnh tên khách) */
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

/** Polaroid nghiêng: khung trắng 196×269, ảnh 177×222 (số đo mẫu mau37) */
function Polaroid({ src, rotate, className = "" }) {
  return (
    <div
      className={`bg-white p-[3.6%] pb-[20%] shadow-[0_8px_22px_rgba(0,0,0,0.22)] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <img src={src} alt="" className="block w-full aspect-[177/222] object-cover object-top" loading="lazy" />
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

/** Một cột gia đình: NHÀ TRAI / ÔNG … / BÀ … / địa chỉ */
function FamilySide({ side }) {
  return (
    <div className="text-center text-wine">
      <h3 className="font-serif37 font-bold text-[16px] leading-[26px] uppercase">{side.label}</h3>
      {side.father && <p className="font-oswald font-bold text-[15px] leading-6 uppercase">Ông {side.father}</p>}
      {side.mother && <p className="font-oswald font-bold text-[15px] leading-6 uppercase">Bà {side.mother}</p>}
      {side.address && <p className="font-sans text-[12px] leading-[19px] mt-1 px-1">{side.address}</p>}
    </div>
  );
}

/** Thẻ sự kiện nền xám-xanh nhạt bo góc (mẫu: BOX11 391 px, rgba(65,94,52,.1)) */
function EventCard({ item, mapLabel }) {
  return (
    <div className="rounded-[32px] bg-[rgba(65,94,52,0.1)] px-3 pt-4 pb-5 text-center text-wine">
      <Reveal variant="down" duration={4}>
        <h3 className="font-serif37 font-bold text-[20px] leading-8 uppercase">{item.title}</h3>
      </Reveal>
      <p className="mt-2 text-[15px] leading-[26px] uppercase">
        <span className="font-lora">Được tổ chức vào lúc </span>
        <b className="font-serif37 text-[17px]">{item.time}</b>
      </p>
      <p className="font-serif37 font-bold text-[22px] leading-8 mt-0.5">{item.date}</p>
      <p className="font-sans italic text-[14px] leading-[22px]">{item.lunar}</p>
      {item.note && <p className="font-sans text-[13px] leading-5 mt-1 opacity-90">{item.note}</p>}
      <div className="space-y-4 mt-3">
        {item.places.map((place) => (
          <div key={place.label}>
            <p className="font-serif37 font-bold text-[18px] leading-[29px] uppercase">{place.label}</p>
            <p className="font-sans text-[13px] leading-[21px] px-4">{place.address}</p>
            <a
              href={mapUrl(place.mapQuery ?? place.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex h-[30px] w-[159px] items-center justify-center rounded-full bg-[#3c6b37] font-serif37 text-[15px] uppercase text-white shadow animate-pulse-btn"
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
      <h2 className="font-script text-[44px] leading-tight text-wine mb-3">{c.title}</h2>
      <div className="grid grid-cols-4 gap-2.5">
        {parts.map((v, i) => (
          <div key={c.labels[i]} className="rounded-2xl bg-wine text-white py-3 shadow-lg shadow-wine/25">
            <p className="font-serif37 font-bold text-3xl leading-none tabular-nums">{String(v).padStart(2, "0")}</p>
            <p className="font-serif37 text-xs uppercase mt-1.5 opacity-90">{c.labels[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Lịch tháng chữ trắng trên nền đỏ đô, ngày cưới nằm trong trái tim hồng */
function MonthCalendar({ dateIso, weekdaysImg }) {
  const [y, m, d] = dateIso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  /** Lịch bắt đầu từ Thứ Hai */
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="bg-wine text-white pt-6 pb-10">
      <p className="text-center font-script text-[42px] leading-[67px]">
        Tháng {String(m).padStart(2, "0")} - {y}
      </p>
      <img src={weekdaysImg} alt="MON TUE WED THU FRI SAT SUN" className="block w-full aspect-[418/55]" />
      <div className="grid grid-cols-7 gap-y-[21px] px-[2.5%] pt-2.5 text-center font-display text-[18px]">
        {cells.map((day, i) =>
          day === d ? (
            <span key={i} className="relative flex h-[29px] items-center justify-center">
              <HeartSolid className="absolute w-[54px] h-[50px] text-[#f4c9cf]/90 animate-pulse-soft" />
              <span className="relative text-wine font-bold">{day}</span>
            </span>
          ) : (
            <span key={i} className="flex h-[29px] items-center justify-center">
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

  const boxCls = "w-full rounded-[10px] border border-wine bg-white px-2.5 font-serif37 text-[16px] text-foreground outline-none focus:ring-2 focus:ring-wine/30";

  return (
    <div className="text-center text-wine">
      <Reveal variant="down" duration={4}>
        <h2 className="font-script font-bold text-[45px] leading-[72px]">{c.title}</h2>
      </Reveal>
      {c.subtitle && <p className="font-serif37 text-[16px] leading-[26px] px-10 -mt-1">{c.subtitle}</p>}
      {sent ? (
        <p className="font-serif37 text-lg py-8 px-8">{c.thanks}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-[8.5%] mt-4 space-y-2.5 text-left">
          <input required value={form.name} onChange={update("name")} placeholder={c.placeholders.name} className={`${boxCls} h-[47px] placeholder:text-foreground/70`} />
          {c.askAttend && (
            <div className={`${boxCls} py-1.5 space-y-0.5`} role="radiogroup" aria-label={c.placeholders.attend}>
              {[
                ["yes", c.attendYes],
                ["no", c.attendNo],
              ].map(([v, label]) => (
                <label key={v} className="flex items-center gap-2 text-[15px] text-foreground/85 cursor-pointer">
                  <input type="radio" name="attend" value={v} required checked={form.attend === v} onChange={update("attend")} className="accent-[#5f0806]" />
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
              className={`${boxCls} h-[41px] placeholder:text-foreground/70`}
            />
          )}
          <textarea
            value={form.message}
            onChange={update("message")}
            placeholder={c.placeholders.message}
            rows={3}
            className={`${boxCls} py-2 h-[82px] resize-none placeholder:text-foreground/70`}
          />
          <div className="text-center pt-2">
            {error && <p className="text-sm mb-2">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="h-[42px] w-[227px] rounded-full bg-wine font-serif37 text-[18px] uppercase text-white shadow transition hover:scale-105 disabled:opacity-70"
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
  const [first, second] = c.hero.names;
  /** Cột trái → phải theo thứ tự families.sides (Nhà Trai trước → Chú rể trước) */
  const pair = c.families.sides[0].label === "Nhà Gái" ? [c.couple.bride, c.couple.groom] : [c.couple.groom, c.couple.bride];

  return (
    <div className="min-h-screen bg-[#e7e5e4] text-foreground font-sans">
      <BackgroundMusic src={c.music.src} volume={c.music.volume} />
      <FallingEffects />

      <main className="paper relative mx-auto max-w-[430px] overflow-hidden shadow-2xl">
        {/* Bìa: ảnh tràn khung mờ dần xuống nền giấy, tên in hoa đỏ đô */}
        <section className="relative">
          <img src={images.hero} alt={`${first} & ${second}`} className="block w-full aspect-[420/630] object-cover object-top" />
          <div className="absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-b from-transparent via-[#f4f3f2]/75 via-55% to-[#f4f3f2]" />
          <div className="absolute inset-x-0 top-[66%] text-center text-wine">
            <Reveal variant="left" duration={4}>
              <h1 className="font-serif37 text-[clamp(38px,11.4vw,48px)] leading-[1.6] uppercase whitespace-nowrap">{first}</h1>
            </Reveal>
            <p className="font-serif37 text-[65px] leading-[1.1] opacity-20 -my-3" aria-hidden>
              &amp;
            </p>
            <Reveal variant="right" duration={4}>
              <p className="font-serif37 text-[clamp(38px,11.4vw,48px)] leading-[1.6] uppercase whitespace-nowrap">{second}</p>
            </Reveal>
          </div>
        </section>

        {/* SAVE the DATE + 2 ảnh polaroid nghiêng */}
        <section className="pt-[18%]">
          <img src={images.deco.saveTheDate} alt="Save the Date" className="block mx-auto w-[95.7%] aspect-[402/187]" />
          <div className="relative mt-0 h-0 pb-[73%]">
            <div className="absolute left-[5.7%] top-0 w-[46.7%]">
              <Reveal variant="left" duration={4}>
                <Polaroid src={images.polaroids[0]} rotate={-5} />
              </Reveal>
            </div>
            <div className="absolute left-[49.3%] top-[12.7%] w-[46.7%]">
              <Reveal variant="right" duration={4}>
                <Polaroid src={images.polaroids[1]} rotate={5} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Chú rể | Cô dâu */}
        <section className="relative grid grid-cols-2 pt-10 pb-14 text-center text-wine">
          {pair.map((p, i) => (
            <Reveal key={p.role} variant={i ? "right" : "left"} duration={4}>
              <p className="font-script text-[40px] leading-[56px]">{p.role}</p>
              <p className="font-serif37 text-[clamp(22px,6.4vw,28px)] leading-[48px] uppercase whitespace-nowrap">{p.name}</p>
            </Reveal>
          ))}
          <span className="absolute left-1/2 top-[52px] h-[98px] w-px bg-wine" aria-hidden />
        </section>

        {/* Lịch tháng nền đỏ đô */}
        {c.calendar.dateIso && <MonthCalendar dateIso={c.calendar.dateIso} weekdaysImg={images.deco.weekdays} />}

        {/* Lời mời + tên khách */}
        <section className="pt-16 pb-6 text-center text-wine">
          <Reveal>
            <p className="font-serif37 font-bold text-[16px] leading-[26px] uppercase">{c.invitation.kicker}</p>
            <div className="relative mx-auto mt-1 w-fit min-w-[203px] max-w-[88%] border-b border-wine/70 px-3">
              <HeartSolid className="absolute -left-4 bottom-0 w-3.5 h-3 text-[#e8475f]" />
              <p className="font-guest text-[30px] leading-[46px]">{guest}</p>
            </div>
            <p className="font-serif37 font-bold text-[16px] leading-[26px] uppercase mt-2">{c.invitation.title}</p>
          </Reveal>
        </section>

        {/* Nhà trai | Nhà gái */}
        <section className="grid grid-cols-2 gap-3 px-2 pb-6">
          {c.families.sides.map((side, i) => (
            <Reveal key={side.label} variant={i ? "right" : "left"} duration={4}>
              <FamilySide side={side} />
            </Reveal>
          ))}
        </section>

        {/* 3 ảnh dọc + ngày / tháng / năm */}
        <section className="grid grid-cols-3 gap-[4px] px-[2.6%] pb-7">
          {images.dateStrip.map((src, i) => (
            <div key={i} className="relative border-[3px] border-[#dcc4c3] overflow-hidden">
              <img src={src} alt="" className="block w-full aspect-[131/196] object-cover object-top" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-b from-transparent to-wine/80" />
              <div className="absolute inset-x-0 bottom-3">
                <Reveal variant="up" duration={4} delay={i * 150}>
                  <p className="text-center font-serif37 font-bold text-[26px] leading-[42px] text-white">{c.invitation.dateParts[i]}</p>
                </Reveal>
              </div>
            </div>
          ))}
        </section>

        {/* Thẻ sự kiện */}
        <section className="space-y-[18px] px-[3.8%] pb-10">
          {c.events.items.map((item) => (
            <EventCard key={item.id} item={item} mapLabel={c.events.mapLabel} />
          ))}
        </section>

        {/* Đếm ngược */}
        {c.countdown && (
          <section className="px-6 pb-10">
            <Reveal variant="zoom">
              <Countdown c={c.countdown} />
            </Reveal>
          </section>
        )}

        {/* ALBUM of LOVE nền đỏ đô */}
        <section className="bg-wine px-[2.9%] pt-3 pb-3">
          <Reveal variant="left" duration={3}>
            <img src={images.deco.album} alt="Album of Love" className="block w-full aspect-[413/153]" />
          </Reveal>
          <div className="grid grid-cols-2 gap-[5px] mt-2">
            {images.album.map((src, i) => (
              <Reveal key={i} variant={i % 2 ? "right" : "left"} duration={4} className="border-2 border-[#d9d9d9]">
                <img src={src} alt="" className="block w-full aspect-[200/295] object-cover object-top" loading="lazy" />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Xác nhận tham dự */}
        {c.rsvp.show && (
          <section className="pt-8 pb-4">
            <RsvpForm c={c.rsvp} />
          </section>
        )}

        {/* Ảnh tròn viền lá + mừng cưới */}
        <section className="pt-8 pb-6 text-center">
          <Reveal variant="zoom" className="relative mx-auto w-[217px] h-[217px]">
            <img src={images.deco.leafRing} alt="" className="absolute inset-0 w-full h-full" />
            <div className="absolute left-[3.2%] top-[0.9%] w-[203px] h-[207px] rounded-full border-[5px] border-white overflow-hidden">
              <img src={images.circle} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
            </div>
          </Reveal>
          {c.gift.accounts.length > 0 && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setGiftOpen(true)}
                className="inline-flex h-11 w-[191px] items-center justify-center gap-2.5 rounded-full bg-wine font-upright font-bold text-[13px] uppercase text-white shadow-lg shadow-wine/30 animate-pulse-soft"
              >
                <Gift className="w-5 h-5" aria-hidden />
                {c.gift.button}
              </button>
            </div>
          )}
        </section>

        {/* Thank you */}
        <section className="px-[2.6%] pb-5">
          <div className="relative overflow-hidden">
            <img src={images.thankYou} alt="" className="block w-full aspect-[407/623] object-cover object-top" loading="lazy" />
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent via-[#3a0706]/45 to-[#3a0706]/85" />
            {/* Định vị ở lớp ngoài — Reveal quan sát lớp bọc của nó, lớp đó phải có chiều cao thật */}
            <div className="absolute inset-x-0 bottom-0">
              <Reveal variant="down" duration={5} className="px-[10%] pb-10 text-center text-white">
                <h2 className="font-script text-[48px] leading-[77px] drop-shadow-lg">{c.thanks.title}</h2>
                <p className="font-serif37 text-[15px] leading-[22px] drop-shadow">{c.thanks.text}</p>
                <p className="font-script text-[34px] mt-3 drop-shadow-lg">
                  {c.families.fullNames[0]} &amp; {c.families.fullNames[1]}
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {giftOpen && <GiftModal c={c.gift} photo={images.gift} onClose={closeGift} />}
    </div>
  );
}

/* StrictMode tắt: trong dev mount 2 lần có thể hủy thẻ audio → nhạc tắt giữa chừng. */
createRoot(document.getElementById("root")).render(isGuestLinksPage() ? <GuestLinksPage /> : <WeddingPage />);
