/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F97316",
          dark: "#EA580C",
          gradient: {
            start: "#FDBA74",
            mid: "#F97316",
            end: "#DC2626",
          },
        },
        sidebar: "#F97316",
        "sidebar-text": "#FFFFFF",
        "sidebar-active": "rgba(255, 255, 255, 0.2)",
        bg: "#F9FAFB",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        text: {
          primary: "#111827",
          secondary: "#6B7280",
        },
        error: "#EF4444",
        success: "#22C55E",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        logo: ["20px", { fontWeight: "700" }],
        heading: ["28px", { fontWeight: "700" }],
        section: ["18px", { fontWeight: "600" }],
        body: ["14px", { fontWeight: "400" }],
        label: ["12px", { fontWeight: "500" }],
        button: ["14px", { fontWeight: "600" }],
      },
      spacing: {
        sidebar: "240px",
        sidebarCollapsed: "64px",
      },
      borderRadius: {
        input: "8px",
        card: "12px",
        button: "8px",
      },
    },
  },
  plugins: [],
};
