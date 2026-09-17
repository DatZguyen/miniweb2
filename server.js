import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  try {
    let reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(reqUrl.pathname);

    // Normalize root to index.html
    if (pathname === '/') {
      pathname = '/index.html';
    }

    let filePath = path.join(__dirname, pathname);

    // If path has no extension and file doesn't exist, check for .html
    if (!path.extname(filePath) && !fs.existsSync(filePath)) {
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      }
    }

    // Security check: ensure path stays within root
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    // If directory, check for index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      // Fallback for 404
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>404 Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404 Not Found</h1><p><a href="/">Quay về trang chủ</a> | <a href="/pmatch.html">Peer-Matching</a></p></body></html>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error: ' + err.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`PeerBond static website server listening on port ${PORT}`);
});
