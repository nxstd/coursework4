import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        mint: "#5dd9a7",
        coral: "#ff6f61"
      }
    }
  },
  plugins: []
};

export default config;
