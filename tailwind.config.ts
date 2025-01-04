import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		daisyui: {
  			themes: [
  				{
  					mytheme: {
  						"primary": "#5d55de",
  						"primary-content": "#dadefc",
  						"secondary": "#e05e92",
  						"secondary-content": "#120308",
  						"accent": "#63e05b",
  						"accent-content": "#031203",
  						"neutral": "#262931",
  						"neutral-content": "#cfd0d2",
  						"base-100": "#eee9f3",
  						"base-200": "#cfcbd3",
  						"base-300": "#b1adb4",
  						"base-content": "#141314",
  						"info": "#2563EB",
  						"info-content": "#d2e2ff",
  						"success": "#16A34A",
  						"success-content": "#000a02",
  						"warning": "#D97706",
  						"warning-content": "#110500",
  						"error": "#DC2626",
  						"error-content": "#ffd9d4",
  					},
  				},
  			],
  		},
  	}
  },
  plugins: [require("daisyui"), require("tailwindcss-animate")],
} satisfies Config;
