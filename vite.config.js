import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Dev: the React app runs on http://localhost:5173 and forwards /api to the Node server.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.PORT || 3000;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
        },
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
