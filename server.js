// Static dev server for site/. No dependencies.
// Usage: PORT=3100 node server.js   (steps to the next free port if taken)
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const ROOT = path.join(__dirname, 'site');
const START_PORT = Number(process.env.PORT) || 3100;
const LOG = process.env.LOG === '1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const abs = path.normalize(path.join(ROOT, p));
  if (!abs.startsWith(ROOT)) return null;
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return path.join(abs, 'index.html');
  if (!path.extname(abs) && fs.existsSync(abs + '.html')) return abs + '.html';
  return abs;
}

const server = http.createServer((req, res) => {
  const file = resolve(req.url);
  const send = (code, body, type) => {
    res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(body);
    if (LOG) console.log(code, req.url);
  };
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const nf = path.join(ROOT, '404.html');
    return fs.existsSync(nf) ? send(404, fs.readFileSync(nf), MIME['.html']) : send(404, 'Not found');
  }
  send(200, fs.readFileSync(file), MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
});

// A port is only ours if nothing answers on either IP stack (see aside-com/CLAUDE.md).
function portFree(port) {
  const probe = (host) => new Promise((ok) => {
    const s = net.connect({ port, host });
    s.once('connect', () => { s.destroy(); ok(false); });
    s.once('error', () => ok(true));
  });
  return Promise.all([probe('127.0.0.1'), probe('::1')]).then((r) => r.every(Boolean));
}

(async () => {
  let port = START_PORT;
  while (!(await portFree(port))) port += 1;
  server.listen(port, () => {
    console.log(`\n  IconKit landing\n  http://127.0.0.1:${port}/\n`);
  });
})();
