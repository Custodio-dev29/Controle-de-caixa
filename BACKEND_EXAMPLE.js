// ===== SERVIDOR EXPRESS EXAMPLE (backend-express.js) =====
// Para usar: npm install express cors body-parser
// Depois: node backend-express.js

/*
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// ===== MIDDLEWARE =====
const users = new Map([
  ["admin@demo.com", { password: "123456", name: "Admin" }]
]);

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || token !== "demo-token") {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
}

// ===== ROTAS DE AUTENTICAÇÃO =====
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  res.json({
    token: "demo-token",
    user: { email, name: user.name }
  });
});

// ===== ROTAS DE PRODUTOS =====
let products = [
  { id: "p1", name: "Camiseta", sku: "SKU-001", quantity: 38, price: 49.9, category: "Vestuário" }
];

app.get("/api/products", authMiddleware, (req, res) => {
  res.json(products);
});

app.post("/api/products", authMiddleware, (req, res) => {
  const product = { id: `p${Date.now()}`, ...req.body };
  products.push(product);
  res.status(201).json(product);
});

app.put("/api/products/:id", authMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Não encontrado" });
  products[idx] = { ...products[idx], ...req.body };
  res.json(products[idx]);
});

app.delete("/api/products/:id", authMiddleware, (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

// ===== ROTAS DE CLIENTES =====
let customers = [
  { id: "c1", name: "Ana Souza", email: "ana@mail.com", phone: "(11) 91234-5678", city: "São Paulo", status: "Ativo" }
];

app.get("/api/customers", authMiddleware, (req, res) => {
  res.json(customers);
});

app.post("/api/customers", authMiddleware, (req, res) => {
  const customer = { id: `c${Date.now()}`, ...req.body };
  customers.push(customer);
  res.status(201).json(customer);
});

app.put("/api/customers/:id", authMiddleware, (req, res) => {
  const idx = customers.findIndex(c => c.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Não encontrado" });
  customers[idx] = { ...customers[idx], ...req.body };
  res.json(customers[idx]);
});

app.delete("/api/customers/:id", authMiddleware, (req, res) => {
  customers = customers.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});

// ===== ROTAS DE VENDAS =====
let sales = [];

app.get("/api/sales", authMiddleware, (req, res) => {
  res.json(sales);
});

app.post("/api/sales", authMiddleware, (req, res) => {
  const sale = { id: `s${Date.now()}`, date: new Date().toISOString(), ...req.body };
  sales.push(sale);
  res.status(201).json(sale);
});

app.delete("/api/sales/:id", authMiddleware, (req, res) => {
  sales = sales.filter(s => s.id !== req.params.id);
  res.json({ success: true });
});

// ===== ROTAS DE RELATÓRIOS =====
app.get("/api/reports/sales", authMiddleware, (req, res) => {
  const { startDate, endDate } = req.query;
  const filtered = sales.filter(s => s.date >= startDate && s.date <= endDate);
  const total = filtered.reduce((sum, s) => sum + s.total, 0);
  res.json({ count: filtered.length, total, sales: filtered });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
*/

// ===== INSTRIÇÕES PARA USAR COM BACKEND =====

/*
1. INSTALAR DEPENDÊNCIAS:
   npm install express cors body-parser

2. CRIAR ARQUIVO backend-express.js COM O CÓDIGO ACIMA

3. INICIAR SERVIDOR:
   node backend-express.js

4. MODIFICAR app.js PARA USAR A API:

   // Substituir loadData() por:
   async function loadData() {
     try {
       const headers = {
         "Authorization": "Bearer demo-token",
         "Content-Type": "application/json"
       };
       
       const [products, customers, sales] = await Promise.all([
         fetch("http://localhost:3001/api/products", { headers }).then(r => r.json()),
         fetch("http://localhost:3001/api/customers", { headers }).then(r => r.json()),
         fetch("http://localhost:3001/api/sales", { headers }).then(r => r.json())
       ]);
       
       state.products = products;
       state.customers = customers;
       state.sales = sales;
     } catch (err) {
       console.error("Erro ao carregar dados:", err);
       // Fallback para localStorage
       const saved = localStorage.getItem(STORAGE_KEY);
       if (saved) {
         const data = JSON.parse(saved);
         Object.assign(state, data);
       }
     }
   }

   // Substituir saveData() por:
   async function saveData() {
     try {
       const headers = {
         "Authorization": "Bearer demo-token",
         "Content-Type": "application/json"
       };
       
       await Promise.all([
         fetch("http://localhost:3001/api/products", {
           method: "POST",
           headers,
           body: JSON.stringify(state.products)
         }),
         fetch("http://localhost:3001/api/customers", {
           method: "POST",
           headers,
           body: JSON.stringify(state.customers)
         })
       ]);
     } catch (err) {
       console.error("Erro ao salvar dados:", err);
     }
     
     // Sempre salvar em localStorage como backup
     localStorage.setItem(STORAGE_KEY, JSON.stringify({
       products: state.products,
       customers: state.customers,
       sales: state.sales
     }));
   }
*/

// ===== INTEGRAÇÃO COM BANCO DE DADOS =====

/*
EXEMPLO COM MONGODB:

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  sku: String,
  quantity: Number,
  price: Number,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);

// Usar no lugar de array em memória:
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});
*/

console.log("Este arquivo contém exemplos de como criar um backend robusto.");
console.log("Descomente o código para usar com Express.js e MongoDB.");
