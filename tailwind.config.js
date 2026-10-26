/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Font thay thế (Google Fonts) cho font trả phí của mẫu lovecard mau-49 (ghi chú: font gốc) */
        sans: ['Lora', 'serif'],
        /** Lora (font gốc của mẫu) — chữ thường, sự kiện, gia đình */
        lora: ['Lora', 'serif'],
        /** "SAVE DATE", chữ lồng, ngày trên ảnh, tên hai người (font gốc: 1FTV VIP Askilon / font hash) */
        didot: ['"Cormorant Garamond"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        /** "the", Timeline, Countdown, Two hearts…, Moments (font gốc: script trả phí) */
        pinyon: ['"Pinyon Script"', 'cursive'],
        /** Ed Drayton — tên tháng, "Quý khách", Thank You, Xác Nhận Tham Dự */
        guest: ['"Imperial Script"', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        taviraj: ['Taviraj', 'serif'],
        trirong: ['Trirong', 'serif'],
        notoserif: ['"Noto Serif"', 'serif'],
        tinos: ['Tinos', 'serif'],
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
