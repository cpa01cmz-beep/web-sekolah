import { defineConfig, loadEnv, ViteDevServer } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { exec } from "node:child_process";
import { cloudflare } from "@cloudflare/vite-plugin";

const stripAnsi = (str: string) =>
  str.replace(
    // eslint-disable-next-line no-control-regex -- Allow ANSI escape stripping
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );

const LOG_MESSAGE_BOUNDARY = /\n(?=\[[A-Z][^\]]*\])/g;

const emitLog = (level: "info" | "warn" | "error", rawMessage: string) => {
  const cleaned = stripAnsi(rawMessage).replace(/\r\n/g, "\n");
  const parts = cleaned
    .split(LOG_MESSAGE_BOUNDARY)
    .map((part) => part.trimEnd())
    .filter((part) => part.trim().length > 0);

  if (parts.length === 0) {
    console[level](cleaned.trimEnd());
    return;
  }

  for (const part of parts) {
    console[level](part);
  }
};

const customLogger = {
  warnOnce: (msg: string) => emitLog("warn", msg),
  info: (msg: string) => emitLog("info", msg),
  warn: (msg: string) => emitLog("warn", msg),
  error: (msg: string) => emitLog("error", msg),
  hasErrorLogged: () => false,
  clearScreen: () => {},
  hasWarned: false,
};

function watchDependenciesPlugin() {
  return {
    name: "watch-dependencies",
    configureServer(server: ViteDevServer) {
      const filesToWatch = [
        path.resolve("package.json"),
        path.resolve("bun.lock"),
      ];

      server.watcher.add(filesToWatch);

      server.watcher.on("change", (filePath: string) => {
        if (filesToWatch.includes(filePath)) {
          console.log(
            `\n📦 Dependency file changed: ${path.basename(
              filePath
            )}. Clearing caches...`
          );

          exec(
            "rm -f .eslintcache tsconfig.tsbuildinfo",
            (err, stdout, stderr) => {
              if (err) {
                console.error("Failed to clear caches:", stderr);
                return;
              }
              console.log("✅ Caches cleared successfully.\n");
            }
          );
        }
      });
    },
  };
}

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    plugins: [react(), cloudflare(), watchDependenciesPlugin()],
    build: {
      minify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'pdf';
              }
              if (id.includes('@tanstack/react-query')) {
                return 'query';
              }
              if (id.includes('lucide-react')) {
                return 'icons';
              }
              if (id.includes('zod') || id.includes('react-hook-form')) {
                return 'forms';
              }
              if (id.includes('immer')) {
                return 'state';
              }
              if (id.includes('embla-carousel')) {
                return 'carousel';
              }
              if (id.includes('dompurify')) {
                return 'sanitization';
              }
              if (id.includes('@radix-ui') || id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor';
              }
            }
            return undefined;
          },
        },
      },
    },
    customLogger: env.VITE_LOGGER_TYPE === 'json' ? customLogger : undefined,
    css: {
      devSourcemap: true,
    },
    server: {
      allowedHosts: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
      exclude: ["agents"],
      force: true,
    },
    define: {
      global: "globalThis",
    },
    cacheDir: "node_modules/.vite",
  });
};
