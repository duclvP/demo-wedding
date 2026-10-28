/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Font của mẫu nawngs.com/thanglinh */
        /** Boton (file trong public/fonts) — tên in hoa, giờ, địa điểm, chữ thường */
        serif: ['Boton', 'serif'],
        /** Hayollan (public/fonts) — Love Story, tháng, Timeline, Destiny, The, Thank you, ký tên — KHÔNG có dấu tiếng Việt */
        script: ['Hayollan', 'cursive'],
        /** Roboto Slab — ngày tháng số to */
        slab: ['"Roboto Slab"', 'serif'],
        /** Hepta Slab — timeline, thư cảm ơn, form */
        hepta: ['"Hepta Slab"', 'serif'],
        /** Hộp quà mừng cưới (dùng chung với các mẫu khác) */
        lora: ['Boton', 'serif'],
        vibes: ['Corinthia', 'cursive'],
        display: ['Boton', 'serif'],
      },
      colors: {
        /** Màu của mẫu: xanh rêu đậm (chữ chính, khối lịch / form), kem (chữ trên nền tối), xám xanh (chữ phụ) */
        moss: '#062520',
        cream: '#fffbf0',
        ink: '#69706a',
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
