import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/isgf-vit-website/", // served from GitHub Pages project subpath
  plugins: [react()],
});
