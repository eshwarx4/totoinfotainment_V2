import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        // World colors
        forest: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
          dark: '#1B5E20',
        },
        farm: {
          DEFAULT: '#F57F17',
          light: '#FFC107',
          dark: '#E65100',
        },
        nature: {
          DEFAULT: '#0288D1',
          light: '#03A9F4',
          dark: '#01579B',
        },
        village: {
          DEFAULT: '#6D4C41',
          light: '#8D6E63',
          dark: '#4E342E',
        },
        bodyLand: {
          DEFAULT: '#E91E63',
          light: '#F06292',
          dark: '#AD1457',
        },
        // Game colors
        "game-primary": '#4CAF50',
        "game-secondary": '#FFC107',
        "game-accent": '#FF6F61',
        "game-correct": '#4CAF50',
        "game-wrong": '#F44336',
        "game-locked": '#B0BEC5',
        "game-star": '#FFD700',
        "game-xp": '#7C4DFF',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        'game': '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
        'game-lg': '0 10px 30px 0 rgba(0, 0, 0, 0.12)',
        'game-button': '0 4px 0 0 rgba(0, 0, 0, 0.15)',
        'game-card': '0 8px 24px -4px rgba(0, 0, 0, 0.1)',
        'game-glow': '0 0 20px 4px rgba(76, 175, 80, 0.3)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-scale": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(76, 175, 80, 0.3)" },
          "50%": { boxShadow: "0 0 20px 8px rgba(76, 175, 80, 0.6)" },
        },
        "star-reveal": {
          "0%": { transform: "scale(0) rotate(-180deg)", opacity: "0" },
          "60%": { transform: "scale(1.3) rotate(15deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "xp-pop": {
          "0%": { transform: "scale(0) translateY(0)", opacity: "0" },
          "50%": { transform: "scale(1.3) translateY(-10px)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(-30px)", opacity: "0" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        "card-flip": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        "correct-flash": {
          "0%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(76, 175, 80, 0.2)" },
          "100%": { backgroundColor: "transparent" },
        },
        "path-draw": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "button-press": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1.02)" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1.2) rotate(180deg)" },
        },
        "card-pop": {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(20px)" },
          "60%": { transform: "scale(1.05) translateY(-4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-scale": "fade-in-scale 0.4s ease-out",
        "bounce-in": "bounce-in 0.5s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "star-reveal": "star-reveal 0.6s ease-out forwards",
        "xp-pop": "xp-pop 1.5s ease-out forwards",
        "confetti-fall": "confetti-fall 2s ease-out forwards",
        "card-flip": "card-flip 0.5s ease-in-out",
        "correct-flash": "correct-flash 0.6s ease-out",
        "path-draw": "path-draw 1.5s ease-in-out forwards",
        "float": "float 2s ease-in-out infinite",
        "button-press": "button-press 0.2s ease-out",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "card-pop": "card-pop 0.5s ease-out forwards",
        "gradient-x": "gradient-x 8s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
