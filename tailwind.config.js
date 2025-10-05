/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Violet Palette (linked to your CSS variables)
        primary: "var(--md-sys-color-primary)",
        "on-primary": "var(--md-sys-color-on-primary)",
        surface: "var(--md-sys-color-surface)",
        "on-surface": "var(--md-sys-color-on-surface)",
        "surface-container": "var(--md-sys-color-surface-container)",
        "surface-container-low": "var(--md-sys-color-surface-container-low)",
        "surface-variant": "var(--md-sys-color-surface-variant)",
        "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
        "outline-variant": "var(--md-sys-color-outline-variant)",
        error: "var(--md-sys-color-error)",
      },
    },
  },
  safelist: [
    "bg-surface",
    "bg-surface-container",
    "bg-surface-container-low",
    "bg-surface-variant",
    "border-outline-variant",
    "text-on-surface",
    "text-on-surface-variant",
    "bg-primary",
    "text-on-primary",
    "text-error",
  ],
  plugins: [],
};
