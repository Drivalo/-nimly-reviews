import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spa: {
          backdrop: "#A8A99A",
          sidebar: "#605F4B",
          row: "#E3D6CA",
          statcard: "#3A3A38",
          copper: "#CDAD85",
        },
        ink: {
          DEFAULT: "#3A3A38",
          60: "rgba(58, 58, 56, 0.6)",
        },
        cream: {
          DEFAULT: "#F9F4EA",
          85: "rgba(249, 244, 234, 0.85)",
          50: "rgba(249, 244, 234, 0.5)",
        },
        badge: {
          pending: "#9B9EC8",
          "pending-text": "#2A2850",
          sms: "#C8896A",
          "sms-text": "#3A1A08",
          reviewed: "#5E6A4E",
          "reviewed-text": "#D0DCC0",
          concern: "#6B4035",
          "concern-text": "#E8C4B4",
        },
      },
      fontFamily: {
        heading: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
