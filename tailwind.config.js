/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Font thay thế (Google Fonts) cho font trả phí của mẫu lovecard thiepso53 (ghi chú: font gốc) */
        sans: ['Lora', 'serif'],
        /** Lora (font gốc của mẫu) — chữ thường, sự kiện, gia đình */
        lora: ['Lora', 'serif'],
        /** Tên + ngày ở bìa, DARLING, LOVE, thứ trong lịch, đếm ngược, Xem chỉ đường (font gốc: 1FTV VIP Ergisa) */
        didot: ['"Cormorant Garamond"', 'serif'],
        /** Câu thơ, Thank You, nhãn đếm ngược, Xác Nhận Tham Dự (font gốc: "sss") */
        cormorant: ['"Cormorant Garamond"', 'serif'],
        /** Tên tháng, Romantic, Timeline, Countdown, họ tên hai người, Thank You (font gốc: BHN BP Ecatherina) */
        pinyon: ['"Pinyon Script"', 'cursive'],
        /** Ed Drayton — "Quý khách" */
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
