/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /* Font thay thế gần nhất cho font của mẫu lovecard thiepso06 */
        /** Chữ thường + tiêu đề in hoa (NHÀ TRAI, TRÂN TRỌNG KÍNH MỜI...) */
        sans: ['"Josefin Sans"', 'system-ui', 'sans-serif'],
        /** Tên cô dâu chú rể, số ngày lớn */
        names: ['"Cormorant Garamond"', 'serif'],
        /** Save the date, tháng, Our Story, Album of Love, Thank You */
        script: ['"Great Vibes"', 'cursive'],
        /** "Xác nhận tham dự" — nét bút mảnh */
        hand: ['Ephesis', 'cursive'],
        /** Tên khách mời */
        guest: ['"Imperial Script"', 'cursive'],
        /** Số trên lịch, ngày trong "Save the date", form */
        display: ['Tinos', 'serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        accent: 'hsl(var(--accent))',
        border: 'hsl(var(--border))',
      },
    },
  },
  plugins: [],
};
