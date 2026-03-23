import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CalendarHeart,
  Clock,
  Gift,
  Heart,
  MapPin,
} from 'lucide-react';
import { content } from './content.js';
import { images } from './image.js';
import './index.css';

function useCountdown(target) {
  const targetTime = useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const diff = Math.max(0, targetTime - now);
    const s = Math.floor(diff / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  }, [now, targetTime]);
}

function Divider() {
  if (images.divider) {
    return (
      <div className="flex justify-center opacity-60">
        <img
          alt=""
          className="h-10 md:h-14 object-contain"
          src={images.divider}
        />
      </div>
    );
  }
  return (
    <div
      className="flex justify-center items-center gap-3 opacity-50"
      aria-hidden
    >
      <span className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-secondary/50" />
      <span className="text-secondary text-lg font-display">✦</span>
      <span className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-secondary/50" />
    </div>
  );
}

function EventIcon({ id }) {
  const cls = 'w-7 h-7 text-primary';
  if (id === 'nap-tai') return <Gift className={cls} aria-hidden />;
  if (id === 'tiec-cuoi') return <Heart className={cls} aria-hidden />;
  return <CalendarHeart className={cls} aria-hidden />;
}

function EventLines({ item }) {
  return (
    <div className="space-y-3 text-foreground/80 flex-grow text-sm md:text-base">
      {item.lines.map((line, i) => {
        if (line.type === 'time') {
          return (
            <p key={i} className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-secondary shrink-0" aria-hidden />
              {line.text}
            </p>
          );
        }
        if (line.type === 'date') {
          return (
            <p key={i} className="flex items-center justify-center gap-2">
              <CalendarHeart
                className="w-4 h-4 text-secondary shrink-0"
                aria-hidden
              />
              {line.text}
            </p>
          );
        }
        if (line.type === 'lunar') {
          return (
            <p key={i} className="text-xs text-foreground/50">
              {line.text}
            </p>
          );
        }
        if (line.type === 'place') {
          if (line.primary != null) {
            return (
              <p
                key={i}
                className="flex items-start justify-center gap-2 mt-3"
              >
                <MapPin
                  className="w-4 h-4 text-secondary shrink-0 mt-0.5"
                  aria-hidden
                />
                <span className="text-left">
                  {line.primary}
                  <br />
                  <span className="text-xs text-foreground/60">
                    {line.secondary}
                  </span>
                </span>
              </p>
            );
          }
          return (
            <p
              key={i}
              className="flex items-start justify-center gap-2 mt-3"
            >
              <MapPin
                className="w-4 h-4 text-secondary shrink-0 mt-0.5"
                aria-hidden
              />
              <span>{line.text}</span>
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

function WeddingPage() {
  const c = content;
  const cd = useCountdown(c.countdown.targetIso);
  const [attending, setAttending] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    guestCount: 1,
    message: '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, attending };
    console.log('RSVP', payload);
    alert('Đã ghi nhận (demo). Kết nối API/backend để lưu thật.');
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Hero Background"
            className="w-full h-full object-cover object-top opacity-80"
            src={images.heroBackground}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background" />
        </div>
        <div className="relative z-10 text-center px-4 flex flex-col items-center w-full max-w-4xl">
          <div className="mb-8">
            <h2 className="text-secondary font-sans tracking-[0.4em] uppercase text-sm md:text-base font-semibold mb-8">
              {c.hero.subtitle}
            </h2>
            <h1 className="font-script text-7xl md:text-9xl text-primary drop-shadow-sm leading-tight mb-2">
              {c.hero.groom}
            </h1>
            <h1 className="font-script text-5xl md:text-7xl text-secondary mb-2">
              &
            </h1>
            <h1 className="font-script text-7xl md:text-9xl text-primary drop-shadow-sm leading-tight">
              {c.hero.bride}
            </h1>
          </div>
          <div className="flex items-center gap-6 mt-8">
            <div className="w-16 md:w-32 h-px bg-secondary/60" />
            <p className="font-display text-2xl md:text-3xl text-foreground/80 tracking-widest">
              {c.hero.dateLine}
            </p>
            <div className="w-16 md:w-32 h-px bg-secondary/60" />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-12">
            {c.countdown.title}
          </h2>
          <div className="flex gap-3 md:gap-6 justify-center">
            {[
              ['Ngày', cd.days],
              ['Giờ', cd.hours],
              ['Phút', cd.minutes],
              ['Giây', cd.seconds],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 flex items-center justify-center mb-2">
                  <span className="font-display text-3xl md:text-5xl text-primary">
                    {String(value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-semibold text-foreground/70 uppercase tracking-widest">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
              {c.families.title}
            </h2>
            <p className="text-foreground/70 max-w-lg mx-auto">
              {c.families.intro}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[c.families.brideSide, c.families.groomSide].map((side) => (
              <div
                key={side.label}
                className="rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl text-card-foreground shadow-2xl shadow-primary/5 p-8 md:p-10 text-center h-full flex flex-col items-center"
              >
                <div className="mb-4">
                  <span className="inline-block text-xs tracking-[0.3em] uppercase font-semibold text-secondary border border-secondary/30 rounded-full px-4 py-1.5 mb-6">
                    {side.label}
                  </span>
                </div>
                <p className="text-foreground/60 text-sm mb-3">
                  {side.parentsPrefix}
                </p>
                <h3 className="font-display text-2xl md:text-3xl text-primary mb-2">
                  {side.father}
                </h3>
                <p className="font-display text-lg text-foreground/70 mb-1">
                  &
                </p>
                <h3 className="font-display text-2xl md:text-3xl text-primary mb-6">
                  {side.mother}
                </h3>
                <div className="w-12 h-px bg-primary/20 mb-6" />
                <p className="text-foreground/60 text-sm leading-relaxed flex items-start gap-2">
                  <MapPin
                    className="w-4 h-4 text-secondary shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <span>{side.address}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
              {c.events.title}
            </h2>
            <p className="text-foreground/70 max-w-lg mx-auto">
              {c.events.intro}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.events.items.map((item) => (
              <div
                key={item.id}
                className={
                  item.highlight
                    ? 'rounded-3xl border bg-card/80 backdrop-blur-xl text-card-foreground shadow-2xl shadow-primary/5 p-6 md:p-8 text-center h-full flex flex-col items-center border-primary/30'
                    : 'rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl text-card-foreground shadow-2xl shadow-primary/5 p-6 md:p-8 text-center h-full flex flex-col items-center'
                }
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <EventIcon id={item.id} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl mb-5">
                  {item.title}
                </h3>
                <EventLines item={item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section className="py-16 px-4 overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
            {c.gallery.title}
          </h2>
          <p className="text-foreground/70">{c.gallery.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="md:col-span-1 md:translate-y-12">
            <img
              className="rounded-3xl shadow-2xl shadow-primary/10 w-full object-cover aspect-[3/4] hover:scale-105 transition-transform duration-700"
              alt={c.gallery.alts[0]}
              src={images.gallery.one}
            />
          </div>
          <div className="md:col-span-1">
            <img
              className="rounded-3xl shadow-2xl shadow-primary/10 w-full object-cover aspect-square md:aspect-[3/4] hover:scale-105 transition-transform duration-700 object-top"
              alt={c.gallery.alts[1]}
              src={images.gallery.two}
            />
          </div>
          <div className="md:col-span-1 md:translate-y-24">
            <img
              className="rounded-3xl shadow-2xl shadow-primary/10 w-full object-cover aspect-[3/4] hover:scale-105 transition-transform duration-700"
              alt={c.gallery.alts[2]}
              src={images.gallery.three}
            />
          </div>
        </div>
      </section>

      <div className="mt-32 md:mt-48" />

      <footer className="bg-primary/5 py-16 text-center relative z-10 border-t border-primary/10">
        <h2 className="font-script text-5xl text-primary mb-6">
          {c.footer.names}
        </h2>
        <p className="font-sans text-sm md:text-base text-foreground/60 max-w-lg mx-auto mb-10 px-4 leading-relaxed">
          {c.footer.quote}
        </p>
        <a
          href={c.footer.adminHref}
          className="text-xs tracking-widest uppercase text-foreground/30 hover:text-primary transition-colors font-semibold"
        >
          {c.footer.adminLabel}
        </a>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WeddingPage />
  </React.StrictMode>
);
