const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DIR = __dirname;
const STORAGE_FILE = path.join(DIR, "storage.json");

const defaultDb = {
  users: [
    { id: "u1", name: "Administrador", email: "admin@demo.com", provider: "local" },
  ],
  products: [
    { id: "p1", name: "Camiseta básica", sku: "SKU-001", quantity: 38, price: 49.9, category: "Vestuário" },
    { id: "p2", name: "Calculadora financeira", sku: "SKU-002", quantity: 14, price: 129.9, category: "Eletrônicos" },
    { id: "p3", name: "Caderno A4", sku: "SKU-003", quantity: 120, price: 8.5, category: "Papelaria" },
  ],
  customers: [
    { id: "c1", name: "Ana Souza", email: "ana.souza@mail.com", phone: "(11) 91234-5678", city: "São Paulo", status: "Ativo" },
    { id: "c2", name: "Carlos Lima", email: "carlos.lima@mail.com", phone: "(21) 99876-5432", city: "Rio de Janeiro", status: "Ativo" },
  ],
  sales: [],
};

let db = loadStorage();

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url.startsWith("/api")) {
    handleApi(req, res);
    return;
  }

  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(DIR, filePath);

  const ext = path.extname(filePath);
  const contentType = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
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

function loadStorage() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn("Não foi possível ler storage.json:", error);
  }
  return defaultDb;
}

function saveStorage() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Erro ao salvar storage.json:", error);
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  if (pathname === "/api/health") {
    return sendJson(res, 200, { status: "OK" });
  }

  if (pathname === "/api/auth" && method === "POST") {
    try {
      const body = await parseBody(req);
      const { email, password } = body;
      if (!email || !password || password.length < 6) {
        return sendJson(res, 401, { error: "Credenciais inválidas" });
      }

      let user = db.users.find((u) => u.email === email);
      if (!user) {
        user = { id: `u${Date.now()}`, name: email.split("@")[0], email, provider: "local" };
        db.users.push(user);
        saveStorage();
      }

      return sendJson(res, 200, { success: true, token: `demo-token-${Date.now()}`, user });
    } catch (error) {
      return sendJson(res, 400, { error: "JSON inválido" });
    }
  }

  if (pathname === "/api/oauth/google" && method === "POST") {
    const user = { id: "google-user-1", name: "Usuário Google", email: "usuario.google@demo.com", provider: "google" };
    if (!db.users.find((u) => u.email === user.email)) {
      db.users.push(user);
      saveStorage();
    }
    return sendJson(res, 200, { success: true, token: "google-demo-token-123", user });
  }

  if (pathname === "/api/sync" && method === "GET") {
    return sendJson(res, 200, { products: db.products, customers: db.customers, sales: db.sales });
  }

  if (pathname === "/api/backup" && method === "POST") {
    try {
      const body = await parseBody(req);
      db.products = body.products || db.products;
      db.customers = body.customers || db.customers;
      db.sales = body.sales || db.sales;
      saveStorage();
      return sendJson(res, 200, { success: true });
    } catch (error) {
      return sendJson(res, 400, { error: "JSON inválido" });
    }
  }

  if (pathname.startsWith("/api/products")) {
    const id = pathname.split("/").pop();

    if (method === "GET") {
      return sendJson(res, 200, { products: db.products });
    }

    if (method === "POST") {
      try {
        const body = await parseBody(req);
        const product = { id: `p${Date.now()}`, ...body };
        db.products.push(product);
        saveStorage();
        return sendJson(res, 201, product);
      } catch (error) {
        return sendJson(res, 400, { error: "JSON inválido" });
      }
    }

    if (method === "PUT") {
      try {
        const body = await parseBody(req);
        const item = db.products.find((product) => product.id === id);
        if (!item) {
          return sendJson(res, 404, { error: "Produto não encontrado" });
        }
        Object.assign(item, body);
        saveStorage();
        return sendJson(res, 200, item);
      } catch (error) {
        return sendJson(res, 400, { error: "JSON inválido" });
      }
    }

    if (method === "DELETE") {
      const before = db.products.length;
      db.products = db.products.filter((product) => product.id !== id);
      if (db.products.length === before) {
        return sendJson(res, 404, { error: "Produto não encontrado" });
      }
      saveStorage();
      return sendJson(res, 200, { success: true });
    }
  }

  if (pathname.startsWith("/api/customers")) {
    const id = pathname.split("/").pop();

    if (method === "GET") {
      return sendJson(res, 200, { customers: db.customers });
    }

    if (method === "POST") {
      try {
        const body = await parseBody(req);
        const customer = { id: `c${Date.now()}`, ...body };
        db.customers.push(customer);
        saveStorage();
        return sendJson(res, 201, customer);
      } catch (error) {
        return sendJson(res, 400, { error: "JSON inválido" });
      }
    }

    if (method === "PUT") {
      try {
        const body = await parseBody(req);
        const item = db.customers.find((customer) => customer.id === id);
        if (!item) {
          return sendJson(res, 404, { error: "Cliente não encontrado" });
        }
        Object.assign(item, body);
        saveStorage();
        return sendJson(res, 200, item);
      } catch (error) {
        return sendJson(res, 400, { error: "JSON inválido" });
      }
    }

    if (method === "DELETE") {
      const before = db.customers.length;
      db.customers = db.customers.filter((customer) => customer.id !== id);
      if (db.customers.length === before) {
        return sendJson(res, 404, { error: "Cliente não encontrado" });
      }
      saveStorage();
      return sendJson(res, 200, { success: true });
    }
  }

  if (pathname.startsWith("/api/sales")) {
    const id = pathname.split("/").pop();

    if (method === "GET") {
      return sendJson(res, 200, { sales: db.sales });
    }

    if (method === "POST") {
      try {
        const body = await parseBody(req);
        const sale = { id: `s${Date.now()}`, ...body };
        db.sales.push(sale);
        saveStorage();
        return sendJson(res, 201, sale);
      } catch (error) {
        return sendJson(res, 400, { error: "JSON inválido" });
      }
    }

    if (method === "DELETE") {
      const before = db.sales.length;
      db.sales = db.sales.filter((sale) => sale.id !== id);
      if (db.sales.length === before) {
        return sendJson(res, 404, { error: "Venda não encontrada" });
      }
      saveStorage();
      return sendJson(res, 200, { success: true });
    }
  }

  sendJson(res, 404, { error: "Rota não encontrada" });
}

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
