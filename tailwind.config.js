/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Font thay thế gần nhất cho font của mẫu lovecard (ghi chú: font gốc) */
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
        /** 1FTV VIP High Spirited */
        script: ['Ephesis', 'cursive'],
        /** Tiêu đề hộp quà mừng cưới */
        vibes: ['"Great Vibes"', 'cursive'],
        /** Ed Drayton — chữ "Quý khách" */
        guest: ['"Imperial Script"', 'cursive'],
        /** 1FTV VIP Askilon — ngày tháng (khách muốn chữ nhẹ nhàng hơn: Prata → Cormorant Garamond) */
        date: ['"Cormorant Garamond"', 'serif'],
        /** UTM Avo — thẻ sự kiện, "Trân Trọng Kính Mời" */
        avo: ['Montserrat', 'sans-serif'],
        /** Lora / Oswald của mẫu → Cormorant Garamond nét mảnh (khách muốn chữ nhẹ nhàng hơn) */
        lora: ['"Cormorant Garamond"', 'serif'],
        upright: ['"Cormorant Upright"', 'serif'],
        oswald: ['"Cormorant Garamond"', 'serif'],
        /** Số trên lịch */
        display: ['Tinos', 'serif'],
      },
      colors: {
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
