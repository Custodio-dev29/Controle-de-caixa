// ==================== CONFIGURAÇÕES ====================
const STORAGE_KEY = "gestaoInteligente";
const MIN_PASSWORD_LENGTH = 6;

// ==================== ESTADO ====================
const state = {
  isLoggedIn: false,
  currentUser: null,
  products: [],
  customers: [],
  sales: [],
};

// ==================== DOM CACHE ====================
const dom = {
  loginScreen: document.getElementById("loginScreen"),
  appScreen: document.getElementById("appScreen"),
  loginForm: document.getElementById("loginForm"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  emailError: document.getElementById("emailError"),
  passwordError: document.getElementById("passwordError"),
  userDisplay: document.getElementById("userDisplay"),
  logoutBtn: document.getElementById("logoutBtn"),
  tabButtons: document.querySelectorAll(".tab-button"),
  inventorySearch: document.getElementById("inventorySearch"),
  customerSearch: document.getElementById("customerSearch"),
  newProductBtn: document.getElementById("newProductBtn"),
  newCustomerBtn: document.getElementById("newCustomerBtn"),
  newSaleBtn: document.getElementById("newSaleBtn"),
  generateReportBtn: document.getElementById("generateReportBtn"),
  inventoryTableBody: document.getElementById("inventoryTableBody"),
  customersTableBody: document.getElementById("customersTableBody"),
  salesTableBody: document.getElementById("salesTableBody"),
  reportsContent: document.getElementById("reportsContent"),
  reportStartDate: document.getElementById("reportStartDate"),
  reportEndDate: document.getElementById("reportEndDate"),
  productCount: document.getElementById("productCount"),
  customerCount: document.getElementById("customerCount"),
  monthlySales: document.getElementById("monthlySales"),
  lowStockCount: document.getElementById("lowStockCount"),
  modalOverlay: document.getElementById("modalOverlay"),
  modalTitle: document.getElementById("modalTitle"),
  recordForm: document.getElementById("recordForm"),
  recordType: document.getElementById("recordType"),
  recordId: document.getElementById("recordId"),
  fieldName: document.getElementById("fieldName"),
  fieldSecond: document.getElementById("fieldSecond"),
  fieldThird: document.getElementById("fieldThird"),
  fieldFourth: document.getElementById("fieldFourth"),
  fieldFifth: document.getElementById("fieldFifth"),
  nameLabel: document.getElementById("nameLabel"),
  secondLabel: document.getElementById("secondLabel"),
  thirdLabel: document.getElementById("thirdLabel"),
  fourthLabel: document.getElementById("fourthLabel"),
  fifthLabel: document.getElementById("fifthLabel"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
};

// ==================== AUTENTICAÇÃO ====================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

function clearLoginErrors() {
  dom.emailError.textContent = "";
  dom.passwordError.textContent = "";
}

function handleLogin(e) {
  e.preventDefault();
  clearLoginErrors();

  const email = dom.loginEmail.value.trim();
  const password = dom.loginPassword.value;

  if (!validateEmail(email)) {
    dom.emailError.textContent = "Email inválido";
    return;
  }

  if (!validatePassword(password)) {
    dom.passwordError.textContent = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`;
    return;
  }

  state.currentUser = { email, name: email.split("@")[0] };
  localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(state.currentUser));
  showApp();
  loadData();
  render();
  dom.loginForm.reset();
}

function handleLogout() {
  if (confirm("Deseja sair?")) {
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    state.isLoggedIn = false;
    state.currentUser = null;
    showLogin();
  }
}

function showLogin() {
  dom.loginScreen.classList.remove("hidden");
  dom.appScreen.classList.add("hidden");
}

function showApp() {
  dom.loginScreen.classList.add("hidden");
  dom.appScreen.classList.remove("hidden");
  dom.userDisplay.textContent = state.currentUser.name;
}

// ==================== PERSISTÊNCIA ====================
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    state.products = data.products || [];
    state.customers = data.customers || [];
    state.sales = data.sales || [];
  } else {
    state.products = [
      { id: "p1", name: "Camiseta básica", sku: "SKU-001", quantity: 38, price: 49.90, category: "Vestuário" },
      { id: "p2", name: "Calculadora financeira", sku: "SKU-002", quantity: 14, price: 129.90, category: "Eletrônicos" },
      { id: "p3", name: "Caderno A4", sku: "SKU-003", quantity: 120, price: 8.50, category: "Papelaria" },
    ];
    state.customers = [
      { id: "c1", name: "Ana Souza", email: "ana.souza@mail.com", phone: "(11) 91234-5678", city: "São Paulo", status: "Ativo" },
      { id: "c2", name: "Carlos Lima", email: "carlos.lima@mail.com", phone: "(21) 99876-5432", city: "Rio de Janeiro", status: "Ativo" },
    ];
    state.sales = [];
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    products: state.products,
    customers: state.customers,
    sales: state.sales,
  }));
}

// ==================== UTILITÁRIOS ====================
function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

const validators = {
  product: {
    name: (v) => v.length >= 3 ? "" : "Mínimo 3 caracteres",
    sku: (v) => v.length >= 3 ? "" : "Mínimo 3 caracteres",
    quantity: (v) => Number(v) >= 0 ? "" : "Deve ser positivo",
    price: (v) => Number(v) > 0 ? "" : "Deve ser maior que 0",
    category: (v) => v.length >= 2 ? "" : "Mínimo 2 caracteres",
  },
  customer: {
    name: (v) => v.length >= 3 ? "" : "Mínimo 3 caracteres",
    email: (v) => validateEmail(v) ? "" : "Email inválido",
    phone: (v) => v.replace(/\D/g, "").length >= 10 ? "" : "Mínimo 10 dígitos",
    city: (v) => v.length >= 2 ? "" : "Mínimo 2 caracteres",
  },
};

function validateField(type, field, value) {
  const validator = validators[type]?.[field];
  return validator ? validator(value) : "";
}

// ==================== RENDERIZAÇÃO ====================
function updateSummary() {
  dom.productCount.textContent = state.products.length;
  dom.customerCount.textContent = state.customers.length;
  dom.lowStockCount.textContent = state.products.filter(p => p.quantity < 10).length;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const salesValue = state.sales
    .filter(s => new Date(s.date) >= thisMonth)
    .reduce((sum, s) => sum + s.total, 0);
  dom.monthlySales.textContent = formatCurrency(salesValue);
}

function renderInventory() {
  dom.inventoryTableBody.innerHTML = "";
  const filter = dom.inventorySearch.value.toLowerCase();
  
  const filtered = state.products.filter(p =>
    p.name.toLowerCase().includes(filter) ||
    p.sku.toLowerCase().includes(filter)
  );

  if (!filtered.length) {
    dom.inventoryTableBody.innerHTML = "<tr><td colspan='7'>Nenhum produto encontrado</td></tr>";
    return;
  }

  filtered.forEach(product => {
    const status = product.quantity < 10 ? "Baixo" : "OK";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${product.name}</strong></td>
      <td>${product.sku}</td>
      <td>${product.quantity}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${product.category}</td>
      <td><span class="status-chip ${product.quantity < 10 ? "low-stock" : ""}">${status}</span></td>
      <td>
        <button class="ghost-btn" onclick="openModal('product', '${product.id}')">Editar</button>
        <button class="ghost-btn" onclick="deleteRecord('product', '${product.id}')">Remover</button>
      </td>
    `;
    dom.inventoryTableBody.appendChild(row);
  });
}

function renderCustomers() {
  dom.customersTableBody.innerHTML = "";
  const filter = dom.customerSearch.value.toLowerCase();
  
  const filtered = state.customers.filter(c =>
    c.name.toLowerCase().includes(filter) ||
    c.email.toLowerCase().includes(filter)
  );

  if (!filtered.length) {
    dom.customersTableBody.innerHTML = "<tr><td colspan='6'>Nenhum cliente encontrado</td></tr>";
    return;
  }

  filtered.forEach(customer => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${customer.name}</strong></td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td>${customer.city}</td>
      <td><span class="status-chip">${customer.status}</span></td>
      <td>
        <button class="ghost-btn" onclick="openModal('customer', '${customer.id}')">Editar</button>
        <button class="ghost-btn" onclick="deleteRecord('customer', '${customer.id}')">Remover</button>
      </td>
    `;
    dom.customersTableBody.appendChild(row);
  });
}

function renderSales() {
  dom.salesTableBody.innerHTML = "";
  
  if (!state.sales.length) {
    dom.salesTableBody.innerHTML = "<tr><td colspan='7'>Nenhuma venda registrada</td></tr>";
    return;
  }

  state.sales.slice().reverse().forEach(sale => {
    const customer = state.customers.find(c => c.id === sale.customerId);
    const product = state.products.find(p => p.id === sale.productId);
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(sale.date)}</td>
      <td>${customer?.name || "?"}</td>
      <td>${product?.name || "?"}</td>
      <td>${sale.quantity}</td>
      <td>${formatCurrency(sale.total)}</td>
      <td>${sale.type === "sale" ? "Venda" : "Movimentação"}</td>
      <td>
        <button class="ghost-btn" onclick="deleteRecord('sale', '${sale.id}')">Remover</button>
      </td>
    `;
    dom.salesTableBody.appendChild(row);
  });
}

function renderReports() {
  const start = dom.reportStartDate.value;
  const end = dom.reportEndDate.value;

  if (!start || !end) {
    dom.reportsContent.innerHTML = "<p>Selecione o período para gerar o relatório.</p>";
    return;
  }

  const periodSales = state.sales.filter(s => {
    const d = new Date(s.date).toISOString().split("T")[0];
    return d >= start && d <= end;
  });

  const total = periodSales.reduce((sum, s) => sum + s.total, 0);
  const qty = periodSales.reduce((sum, s) => sum + s.quantity, 0);

  let html = `
    <div class="report-content">
      <h4>Período: ${formatDate(start)} até ${formatDate(end)}</h4>
      <p><strong>Total de Vendas:</strong> ${periodSales.length}</p>
      <p><strong>Receita:</strong> ${formatCurrency(total)}</p>
      <p><strong>Itens:</strong> ${qty}</p>
      <ul>
  `;

  periodSales.forEach(s => {
    const c = state.customers.find(x => x.id === s.customerId);
    const p = state.products.find(x => x.id === s.productId);
    html += `<li>${formatDate(s.date)} - ${c?.name}: ${s.quantity}x ${p?.name} = ${formatCurrency(s.total)}</li>`;
  });

  html += "</ul></div>";
  dom.reportsContent.innerHTML = html;
}

function render() {
  updateSummary();
  renderInventory();
  renderCustomers();
  renderSales();
}

// ==================== MODAL ====================
function openModal(type, id = "") {
  const isEdit = !!id;
  dom.modalOverlay.classList.remove("hidden");
  dom.recordType.value = type;
  dom.recordId.value = id;

  if (type === "product") {
    dom.modalTitle.textContent = isEdit ? "Editar Produto" : "Novo Produto";
    dom.nameLabel.textContent = "Produto";
    dom.secondLabel.textContent = "SKU";
    dom.thirdLabel.textContent = "Quantidade";
    dom.fourthLabel.textContent = "Preço";
    dom.fifthLabel.textContent = "Categoria";

    if (isEdit) {
      const p = state.products.find(x => x.id === id);
      if (p) {
        dom.fieldName.value = p.name;
        dom.fieldSecond.value = p.sku;
        dom.fieldThird.value = p.quantity;
        dom.fieldFourth.value = p.price;
        dom.fieldFifth.value = p.category;
      }
    } else {
      dom.recordForm.reset();
    }
  } else {
    dom.modalTitle.textContent = isEdit ? "Editar Cliente" : "Novo Cliente";
    dom.nameLabel.textContent = "Nome";
    dom.secondLabel.textContent = "Email";
    dom.thirdLabel.textContent = "Telefone";
    dom.fourthLabel.textContent = "Cidade";
    dom.fifthLabel.textContent = "Status";

    if (isEdit) {
      const c = state.customers.find(x => x.id === id);
      if (c) {
        dom.fieldName.value = c.name;
        dom.fieldSecond.value = c.email;
        dom.fieldThird.value = c.phone;
        dom.fieldFourth.value = c.city;
        dom.fieldFifth.value = c.status;
      }
    } else {
      dom.recordForm.reset();
    }
  }
}

function closeModal() {
  dom.modalOverlay.classList.add("hidden");
  dom.recordForm.reset();
}

function saveRecord() {
  const type = dom.recordType.value;
  const id = dom.recordId.value;

  if (type === "product") {
    const data = {
      name: dom.fieldName.value.trim(),
      sku: dom.fieldSecond.value.trim(),
      quantity: Number(dom.fieldThird.value),
      price: Number(dom.fieldFourth.value),
      category: dom.fieldFifth.value.trim(),
    };

    const errs = [];
    for (const [k, v] of Object.entries(data)) {
      const err = validateField("product", k, v);
      if (err) errs.push(k + ": " + err);
    }

    if (errs.length) {
      alert(errs.join("\n"));
      return;
    }

    if (id) {
      const idx = state.products.findIndex(p => p.id === id);
      if (idx >= 0) state.products[idx] = { ...state.products[idx], ...data };
    } else {
      state.products.push({ id: `p${Date.now()}`, ...data });
    }
  } else {
    const data = {
      name: dom.fieldName.value.trim(),
      email: dom.fieldSecond.value.trim(),
      phone: dom.fieldThird.value.trim(),
      city: dom.fieldFourth.value.trim(),
      status: dom.fieldFifth.value.trim() || "Ativo",
    };

    const errs = [];
    for (const [k, v] of Object.entries(data)) {
      const err = validateField("customer", k, v);
      if (err) errs.push(k + ": " + err);
    }

    if (errs.length) {
      alert(errs.join("\n"));
      return;
    }

    if (id) {
      const idx = state.customers.findIndex(c => c.id === id);
      if (idx >= 0) state.customers[idx] = { ...state.customers[idx], ...data };
    } else {
      state.customers.push({ id: `c${Date.now()}`, ...data });
    }
  }

  saveData();
  render();
  closeModal();
}

function deleteRecord(type, id) {
  if (!confirm("Tem certeza?")) return;

  if (type === "product") {
    state.products = state.products.filter(p => p.id !== id);
  } else if (type === "customer") {
    state.customers = state.customers.filter(c => c.id !== id);
  } else if (type === "sale") {
    state.sales = state.sales.filter(s => s.id !== id);
  }

  saveData();
  render();
}

function recordSale() {
  if (!state.customers.length || !state.products.length) {
    alert("Cadastre clientes e produtos primeiro");
    return;
  }

  const customerId = prompt("ID do cliente:");
  const productId = prompt("ID do produto:");
  const qty = Number(prompt("Quantidade:"));

  if (!customerId || !productId || !qty) return;

  const customer = state.customers.find(c => c.id === customerId);
  const product = state.products.find(p => p.id === productId);

  if (!customer || !product || qty <= 0 || qty > product.quantity) {
    alert("Dados inválidos ou estoque insuficiente");
    return;
  }

  state.sales.push({
    id: `s${Date.now()}`,
    date: new Date().toISOString(),
    customerId,
    productId,
    quantity: qty,
    total: product.price * qty,
    type: "sale",
  });

  product.quantity -= qty;
  saveData();
  render();
  alert("Venda registrada: " + formatCurrency(product.price * qty));
}

// ==================== EVENTOS ====================
function setupEventListeners() {
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.logoutBtn.addEventListener("click", handleLogout);

  dom.tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      dom.tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      document.getElementById(btn.dataset.panel).classList.add("active");
    });
  });

  dom.inventorySearch.addEventListener("input", renderInventory);
  dom.customerSearch.addEventListener("input", renderCustomers);

  dom.newProductBtn.addEventListener("click", () => openModal("product"));
  dom.newCustomerBtn.addEventListener("click", () => openModal("customer"));
  dom.newSaleBtn.addEventListener("click", recordSale);
  dom.generateReportBtn.addEventListener("click", renderReports);

  dom.closeModalBtn.addEventListener("click", closeModal);
  dom.cancelBtn.addEventListener("click", closeModal);
  dom.modalOverlay.addEventListener("click", (e) => {
    if (e.target === dom.modalOverlay) closeModal();
  });
  dom.recordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveRecord();
  });
}

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem(`${STORAGE_KEY}_user`);
  if (user) {
    state.currentUser = JSON.parse(user);
    showApp();
    loadData();
    render();
  } else {
    showLogin();
  }
  setupEventListeners();
});
