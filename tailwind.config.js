/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Font thay thế cho font của mẫu lovecard.click/vemaybay (ghi chú: font gốc) */
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
        /** SFU Edwardian Script — tên cô dâu chú rể */
        edw: ['"Pinyon Script"', 'cursive'],
        /** 1FTV VIP High Spirited — "Countdown", "Timeline" */
        script: ['Ephesis', 'cursive'],
        /** UTM Candlescript — "Tháng 12 - 2026", "&", "Dresscode", "Album of Love"; tiêu đề hộp quà */
        vibes: ['"Great Vibes"', 'cursive'],
        /** Ed Drayton — "Thank You", tên khách */
        guest: ['"Imperial Script"', 'cursive'],
        /** Font chữ in (bfbfb) — "KÍNH MỜI…", "TƯ GIA NHÀ GÁI", "NHẤN VÀO PASSPORT" */
        josefin: ['"Josefin Sans"', 'sans-serif'],
        /** Font chữ máy (gdgdgdg) — "DESTINATION: MARRIAGE", đầu vé */
        mono: ['"Space Mono"', 'monospace'],
        /** Tiêu đề form lời chúc */
        hand: ['"Dancing Script"', 'cursive'],
        lora: ['Lora', 'serif'],
        upright: ['"Cormorant Upright"', 'serif'],
        /** Số trên lịch, giờ trong Timeline */
        display: ['Tinos', 'serif'],
      },
      colors: {
        /** Vàng đồng mẫu vé máy bay rgb(167, 137, 80) / chữ phụ rgb(145, 131, 98) */
        gold: '#a78950',
        goldsoft: '#918362',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
      },
    },
  },
  plugins: [],
};
