import { useEffect, useState } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

export function useCountdown(targetIso) {
  const [units, setUnits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    if (Number.isNaN(target)) return;

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);
      setUnits({ days, hours, minutes, seconds: seconds });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return {
    ...units,
    daysStr: pad(units.days),
    hoursStr: pad(units.hours),
    minutesStr: pad(units.minutes),
    secondsStr: pad(units.seconds),
  };
}
