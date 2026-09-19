const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const port = process.env.PORT || 3000;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(publicDir, relative));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (statError, stat) => {
    const resolved = !statError && stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    fs.readFile(resolved, (error, data) => {
      if (error) {
        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
        return res.end('Not found');
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(resolved).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': path.extname(resolved) === '.html' ? 'no-cache' : 'public, max-age=86400'
      });
      res.end(data);
    });
  });
}).listen(port, '0.0.0.0', () => {
  console.log(`Funding brief listening on port ${port}`);
});
