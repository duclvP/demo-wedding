/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Font thay thế gần nhất cho font của mẫu nawngs.com/thanglinh (ghi chú: font gốc) */
        /** Boton — tên in hoa, giờ, địa điểm, chữ thường */
        serif: ['"Brygada 1918"', 'serif'],
        /** Hayollan — Love Story, tháng, Timeline, Destiny, The, Thank you, ký tên */
        script: ['Corinthia', 'cursive'],
        /** Roboto Slab — ngày tháng số to */
        slab: ['"Roboto Slab"', 'serif'],
        /** Hepta Slab — timeline, thư cảm ơn, form */
        hepta: ['"Hepta Slab"', 'serif'],
        /** Hộp quà mừng cưới (dùng chung với các mẫu khác) */
        lora: ['"Brygada 1918"', 'serif'],
        vibes: ['Corinthia', 'cursive'],
        display: ['"Brygada 1918"', 'serif'],
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
