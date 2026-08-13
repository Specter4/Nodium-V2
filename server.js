#!/usr/bin/env node
/* ==========================================================================
   NODIUM — zero-dependency dev server (plain Node, no npm packages needed)
   --------------------------------------------------------------------------
   Usage:
     npm run dev            → serves the site at http://localhost:8080
     node server.js 3000    → custom port
     PORT=4000 npm run dev  → custom port via env

   Works on any machine with Node.js — no Python required.
   ========================================================================== */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = parseInt(process.argv[2] || process.env.PORT || "8080", 10);
const HOST = process.env.HOST || "0.0.0.0"; // localhost + LAN + previews

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function serve(res, code, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("500 Internal Server Error");
      return;
    }
    res.writeHead(code, {
      "Content-Type": type,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  try {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch (e) {
      urlPath = req.url.split("?")[0];
    }
    if (urlPath === "/") urlPath = "/index.html";

    /* resolve safely — block path traversal */
    let filePath = path.normalize(path.join(ROOT, urlPath));
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403);
      res.end("403 Forbidden");
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      fs.access(filePath, fs.constants.R_OK, (err2) => {
        if (!err2) {
          serve(res, 200, filePath);
        } else {
          /* unknown page → friendly 404 */
          serve(res, 404, path.join(ROOT, "404.html"));
        }
      });
    });
  } catch (e) {
    res.writeHead(500);
    res.end("500 Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("  ⬛ NODIUM — dev server running");
  console.log("  ─────────────────────────────────────────────");
  console.log("  Local:   http://localhost:" + PORT);
  console.log("  Network: http://" + HOST + ":" + PORT);
  console.log("  Ctrl+C to stop");
  console.log("");
});
