module.exports = {
  mode: "jit",
  content: ["./src/**/*.{html,ts,js}"],
  theme: {
    extend: {     
      screens: {
        // 'xs': '425px',
        'sm': "1024px",
        'md': "1280px",
        'lg': "1440px",
        'xl': "1600px",
        '2xl': "1900px",
        'xl-only': {'min': '1280px', 'max': '1535px'},
      },

      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },

      textColor: {
        'body': "hsl(var(--text-foreground))", // base color applied to text
        'dark': "hsl(var(--text-dark))",
        'light': "hsl(var(--text-light))",
        'lighter': "hsl(var(--text-lighter))",
        'link': "hsl(var(--text-brand))",
      },
      backgroundColor: {
        'base': "#e2e8f0", // slate-200
        'lighter-2': "#F9F9F9", // zinc-50
        'lighter': "#F2F5F7",
        'light': "#EFF3F5",
        'active': "#E6E6E6",
        'dark': "#64748b", // slate-500
        'darker': "#334155", // slate-700
        'laborder': "#34D399",
      },
      borderColor: {
        'base': "#E2E8F0",
        'lighter': "#F8FAFC",
        'light': "#F1F5F9",
        'dark': "#CBD5E1",
        'darker': "#94A3B8",
      },
      colors: {
        primary: {
          base: "#005CF3",
          50: "#edf8ff",
          100: "#d6eeff",
          200: "#b5e3ff",
          300: "#83d2ff",
          400: "#48b8ff",
          500: "#1e95ff",
          600: "#0675ff",
          700: "#005cf3 ",
          800: "#084ac5",
          900: "#0d439b",
          950: "#0e295d",
        },
      },
      spacing: {
        "2xs": "0.25rem",
        xs: "0.5rem",
        sm: "0.75rem",
        base: "1rem",
        md: "1.5rem",
        lg: "3rem",
        xl: "4rem",
        "2xl": "6rem",
        "3xl": "8rem",
      },
    },
    plugins: [],
    variants: {
      extend: {
        borderStyle: ["hover"],
      },
    },
  },
};
