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
        /** 1FTV VIP Askilon — ngày tháng */
        date: ['Prata', 'serif'],
        /** UTM Avo — thẻ sự kiện, "Trân Trọng Kính Mời" */
        avo: ['Montserrat', 'sans-serif'],
        lora: ['Lora', 'serif'],
        upright: ['"Cormorant Upright"', 'serif'],
        oswald: ['Oswald', 'sans-serif'],
        /** Chữ thường của mẫu Hime (Times) */
        display: ['Tinos', 'serif'],
        /** Tên cô dâu chú rể, tên khách, "Wedding", "Thank you!" */
        names: ['"Great Vibes"', 'cursive'],
        /** Tiêu đề mảnh: tên sự kiện, Our Album (thay Beautique Display) */
        elegant: ['"Cormorant Garamond"', 'serif'],
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
        /** Đỏ rượu vang chủ đạo của mẫu Hime — rgb(158, 55, 69) */
        hime: '#9e3745',
      },
    },
  },
  plugins: [],
};
