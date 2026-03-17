// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
  : "/";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: isGitHubActions ? repoName : "/",
});
