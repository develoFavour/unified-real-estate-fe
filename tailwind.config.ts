import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
	darkMode: "class",
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", "Arial", "Helvetica", "sans-serif"],
				heading: [
					"var(--font-heading)",
					"var(--font-sans)",
					"Arial",
					"Helvetica",
					"sans-serif",
				],
			},
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				border: "var(--border)",
				input: "var(--input)",
				ring: "var(--ring)",
				primary: {
					DEFAULT: "#C19B76",
					foreground: "var(--primary-foreground)",
					hover: "#A67C52",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					foreground: "var(--secondary-foreground)",
				},
				muted: {
					DEFAULT: "var(--muted)",
					foreground: "var(--muted-foreground)",
				},
				accent: {
					DEFAULT: "var(--accent)",
					foreground: "var(--accent-foreground)",
				},
				popover: {
					DEFAULT: "var(--popover)",
					foreground: "var(--popover-foreground)",
				},
				card: {
					DEFAULT: "rgba(255, 255, 255, 0.05)",
					foreground: "var(--card-foreground)",
					border: "rgba(255, 255, 255, 0.1)",
				},
			},
		},
	},
	plugins: [animate],
};
export default config;
