// dev-server.js (ローカル開発用サーバー: Vercelログイン不要)
// 起動方法: node dev-server.js

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local から GEMINI_API_KEY を読み込む
try {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) {
      process.env.GEMINI_API_KEY = match[1].trim();
      console.log("🔑 Loaded GEMINI_API_KEY from .env.local");
    }
  }
} catch (e) {
  console.warn("Could not read .env.local:", e.message);
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // --- API Routes (/api/analyze) ---
  if (pathname === "/api/analyze") {
    try {
      const { default: handler } = await import(`./api/analyze.js?t=${Date.now()}`);

      // Bodyパーサー（POST JSON）
      let rawBody = "";
      req.on("data", (chunk) => {
        rawBody += chunk;
      });

      req.on("end", async () => {
        let body = {};
        if (rawBody) {
          try {
            body = JSON.parse(rawBody);
          } catch (err) {
            body = {};
          }
        }
        req.body = body;

        // Vercel風レスポンスヘルパー
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          await handler(req, res);
        } catch (handlerErr) {
          console.error("Handler execution error:", handlerErr);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
      });
      return;
    } catch (importErr) {
      console.error("Failed to import api/analyze.js:", importErr);
      res.statusCode = 500;
      res.end("API route error");
      return;
    }
  }

  // --- 静的ファイル配信 ---
  let filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);

  // ディレクトリトラバーサル防止
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Local Dev Server running at: http://localhost:${PORT}`);
  console.log(`✨ AI Advisor endpoint (/api/analyze) is ready!`);
  console.log(`Press Ctrl+C to stop.\n`);
});

