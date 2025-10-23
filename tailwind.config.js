// tailwind.config.js
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0b1220", // page
          subtle: "#0f1727", // banners/headers
          soft: "#101a2e",
          overlay: "rgba(11,18,32,0.92)",
        },

        surface: {
          DEFAULT: "#101a2e", // not used directly by your components, safe
          muted: "#152138", // subtle inner blocks
          elevated: "#1e293b", // main card body (≈ slate-800)
          highlight: "#23324d", // slightly lighter (≈ mix of 700/800)
        },

        // CTA / accents (quiet versions of blue-500 → purple-600)
        primary: {
          DEFAULT: "#3b82f6", // blue-500
          emphasis: "#2563eb", // blue-600
          muted: "#6ea5fb",
          soft: "rgba(59,130,246,0.12)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#7c3aed", // purple-600
          emphasis: "#6d28d9", // purple-700
          muted: "#a78bfa",
          soft: "rgba(124,58,237,0.12)",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#8b5cf6", // violet-500
          emphasis: "#7c3aed",
          muted: "#a78bfa",
          soft: "rgba(139,92,246,0.12)",
          foreground: "#ffffff",
        },

        // Typography tuned for the darker panels
        text: {
          primary: "#eef2ff",
          secondary: "#c7d0e4",
          muted: "#9aa6bf",
          subtle: "#7f8eac",
          inverted: "#0b1220",
        },

        // Borders (≈ slate-700, but softer default)
        border: {
          DEFAULT: "#22314f", // edge lines on cards
          muted: "#1b2943", // inner borders
          strong: "#2a3a60",
          primary: "rgba(63, 99, 241, 0.28)", // calm blue glow
        },

        success: {
          DEFAULT: "#22c55e",
          emphasis: "#16a34a",
          soft: "rgba(34,197,94,0.15)",
          bright: "#34d399",
        },
        warning: {
          DEFAULT: "#facc15",
          emphasis: "#eab308",
          soft: "rgba(250,204,21,0.15)",
        },
        danger: {
          DEFAULT: "#ff5757",
          emphasis: "#ff4040",
          soft: "rgba(255,87,87,0.15)",
        },
        info: {
          DEFAULT: "#22d3ee",
          emphasis: "#06b6d4",
          soft: "rgba(34,211,238,0.15)",
        },

        // Card shortcuts to keep everything deep
        card: {
          bg: "#101b31",
          header: "#0c1528",
          hover: "#15223d",
        },
        button: {
          primary: "#6b8aff",
          primaryHover: "#5775ff",
          secondary: "#2a3555",
          secondaryHover: "#384771",
        },

        // lower-contrast gradient for CTAs
        gradient: {
          start: "#5f7cf0",
          middle: "#7568e8",
          end: "#9066e8",
        },

        icon: {
          purple: "#7b6aff",
          blue: "#5775ff",
          green: "#22c55e",
          cyan: "#22d3ee",
          orange: "#fb923c",
          pink: "#ec4899",
          red: "#ff5757",
        },
      },

      ringColor: {
        DEFAULT: "#5775ff",
      },
      divideColor: {
        DEFAULT: "#22314f",
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(107, 138, 255, 0.4)",
        card: "0 2px 8px rgba(0, 0, 0, 0.45)",
        "card-hover": "0 6px 18px rgba(0, 0, 0, 0.55)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-primary":
          "linear-gradient(135deg, #6b8aff 0%, #8b6aff 48%, #b77aff 100%)",
        "gradient-primary-hover":
          "linear-gradient(135deg, #5775ff 0%, #7b6aff 48%, #a76aff 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [forms],
};

export default config;
