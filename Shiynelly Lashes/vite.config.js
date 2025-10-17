import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	base: "/Shiynelly-lashes-web",
	server: {
		fs: {
			strict: false,
		},
	},
	optimizeDeps: {
		exclude: ["edge-wallet"],
	},
});
