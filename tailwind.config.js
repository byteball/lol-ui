const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter var", ...defaultTheme.fontFamily.sans],
			},
			colors: {
				"primary-light": "#0F1018",
				primary: "#0281EB", // bittrex
			},
			screens: {
				...defaultTheme.screens,
				xs: "440px",
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
