const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DIR = __dirname;

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (req.url.startsWith("/api")) {
    handleApi(req, res);
    return;
  }

  // Serve static files
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(DIR, filePath);

  const ext = path.extname(filePath);
  const contentType = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json",
  }[ext] || "text/plain";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Arquivo não encontrado");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  res.setHeader("Content-Type", "application/json");

  // Rotas de exemplo
  if (pathname === "/api/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "OK" }));
  } else if (pathname === "/api/auth") {
    if (method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const { email, password } = JSON.parse(body);
        // Simulado: aceita qualquer email com senha >= 6 caracteres
        if (email && password.length >= 6) {
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, token: "demo-token-123" }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({ error: "Credenciais inválidas" }));
        }
      });
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Rota não encontrada" }));
  }
}

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
