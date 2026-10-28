/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Font thay thế gần nhất cho font của mẫu lovecard thiepso13 (ghi chú: font gốc) */
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
        /** 1FTV VIP High Spirited — tên trong "Trân trọng báo tin" và dòng tên dưới lời mời */
        script: ['Ephesis', 'cursive'],
        /** SFU Edwardian Script — tên trên màn phong bì */
        edward: ['"Pinyon Script"', 'cursive'],
        /** Tiêu đề hộp quà mừng cưới */
        vibes: ['"Great Vibes"', 'cursive'],
        /** Ed Drayton — chữ "Quý khách" */
        guest: ['"Imperial Script"', 'cursive'],
        arizonia: ['Arizonia', 'cursive'],
        dancing: ['"Dancing Script"', 'cursive'],
        monte: ['MonteCarlo', 'cursive'],
        culpa: ['"Mea Culpa"', 'cursive'],
        passions: ['"Passions Conflict"', 'cursive'],
        philo: ['Philosopher', 'sans-serif'],
        trirong: ['Trirong', 'serif'],
        judson: ['Judson', 'serif'],
        chonburi: ['Chonburi', 'serif'],
        opensans: ['"Open Sans"', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        lora: ['Lora', 'serif'],
        /** Cormorant Upright — "Thư Mời Cưới"; LF Aretha Bridge — "Địa điểm tổ chức" */
        upright: ['"Cormorant Upright"', 'serif'],
        oswald: ['Oswald', 'sans-serif'],
        /** Tinos — "Nhà Trai / Nhà Gái", thứ trên lịch */
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
