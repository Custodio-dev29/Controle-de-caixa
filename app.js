// ==================== CONFIGURAÇÕES ====================
const STORAGE_KEY = "gestaoInteligente";
const MIN_PASSWORD_LENGTH = 6;
const API_BASE = window.location.protocol.startsWith("http")
  ? `${window.location.origin}/api`
  : "http://localhost:3000/api";

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
  googleLoginBtn: document.getElementById("googleLoginBtn"),
  cloudBackupBtn: document.getElementById("cloudBackupBtn"),
  syncBtn: document.getElementById("syncBtn"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  syncStatus: document.getElementById("syncStatus"),
  statusMessage: document.getElementById("statusMessage"),
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
  salesChart: document.getElementById("salesChart"),
  stockChart: document.getElementById("stockChart"),
};

const state = {
  currentUser: null,
  authToken: localStorage.getItem(`${STORAGE_KEY}_token`) || null,
  products: [],
  customers: [],
  sales: [],
  syncStatus: "offline",
  apiAvailable: Boolean(API_BASE),
  lastSync: null,
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
  // Os dados são carregados a partir do backend em storage.json.
  state.products = [];
  state.customers = [];
  state.sales = [];
}

function saveData() {
  // Os dados são salvos apenas no backend em storage.json.
  console.warn("saveData() não grava no localStorage; use o backend para persistência.");
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
    name: (v) => (v.length >= 3 ? "" : "Mínimo 3 caracteres"),
    sku: (v) => (v.length >= 3 ? "" : "Mínimo 3 caracteres"),
    quantity: (v) => (Number(v) >= 0 ? "" : "Deve ser positivo"),
    price: (v) => (Number(v) > 0 ? "" : "Deve ser maior que 0"),
    category: (v) => (v.length >= 2 ? "" : "Mínimo 2 caracteres"),
  },
  customer: {
    name: (v) => (v.length >= 3 ? "" : "Mínimo 3 caracteres"),
    email: (v) => (validateEmail(v) ? "" : "Email inválido"),
    phone: (v) => (v.replace(/\D/g, "").length >= 10 ? "" : "Mínimo 10 dígitos"),
    city: (v) => (v.length >= 2 ? "" : "Mínimo 2 caracteres"),
  },
};

function validateField(type, field, value) {
  const validator = validators[type]?.[field];
  return validator ? validator(value) : "";
}

function generateId(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

let notificationTimeout;
function showNotification(message, type = "info") {
  console.log(`${type.toUpperCase()}: ${message}`);
  if (!dom.statusMessage) return;
  dom.statusMessage.textContent = message;
  dom.statusMessage.className = `status-message ${type}`;
  dom.statusMessage.classList.remove("hidden");
  clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => {
    dom.statusMessage.classList.add("hidden");
  }, 3000);
}

// ==================== BACKEND / API ====================
function apiRequest(path, options = {}) {
  if (!state.apiAvailable) {
    return Promise.reject(new Error("API não disponível. Execute o servidor Node para usar integração backend."));
  }

  const { method = "GET", body } = options;
  const headers = { "Content-Type": "application/json" };
  if (state.authToken) {
    headers.Authorization = `Bearer ${state.authToken}`;
  }

  return fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (response) => {
    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : {};
    if (!response.ok) {
      throw new Error(data.error || `Erro ${response.status}`);
    }
    return data;
  });
}

async function checkApiHealth() {
  if (!state.apiAvailable) {
    setSyncStatus(false);
    return;
  }

  try {
    await apiRequest("/health");
    setSyncStatus(true);
  } catch (error) {
    setSyncStatus(false);
  }
}

function setSyncStatus(online) {
  state.syncStatus = online ? "online" : "offline";
  dom.syncStatus.textContent = online ? "Conectado" : "Offline";
  dom.syncStatus.classList.toggle("status-online", online);
  dom.cloudBackupBtn.disabled = !online;
  dom.syncBtn.disabled = !online;
  if (!online) {
    showNotification("Sem conexão com o backend.", "warning");
  }
}

function authenticateBackend(email, password) {
  return apiRequest("/auth", { method: "POST", body: { email, password } });
}

function authenticateOAuth() {
  return apiRequest("/oauth/google", { method: "POST" });
}

async function syncData() {
  if (!state.apiAvailable) {
    showNotification("Sincronização não disponível em modo offline.", "warning");
    return;
  }

  try {
    const remote = await apiRequest("/sync");
    state.products = remote.products || [];
    state.customers = remote.customers || [];
    state.sales = remote.sales || [];
    state.lastSync = new Date();
    render();
    showNotification("Sincronização concluída.", "success");
  } catch (error) {
    showNotification(`Falha na sincronização`, "error");
    setSyncStatus(false);
  }
}

async function backupToCloud() {
  if (!state.apiAvailable) {
    showNotification("Backup não disponível em modo offline.", "warning");
    return;
  }

  try {
    await apiRequest("/backup", {
      method: "POST",
      body: { products: state.products, customers: state.customers, sales: state.sales },
    });
    showNotification("Backup enviado para a nuvem com sucesso.");
  } catch (error) {
    showNotification(`Falha no backup: ${error.message}`, "error");
  }
}

async function fetchRemoteState() {
  if (!state.apiAvailable) {
    showNotification("Backend indisponível. Não é possível carregar dados.", "error");
    return;
  }

  try {
    const remote = await apiRequest("/sync");
    state.products = remote.products || [];
    state.customers = remote.customers || [];
    state.sales = remote.sales || [];
    state.lastSync = new Date();
    render();
    showNotification("Dados carregados do backend remoto.");
  } catch (error) {
    console.warn("Falha ao carregar dados remotos:", error);
    showNotification("Erro ao carregar dados do backend.", "error");
  }
}

// ==================== RENDERIZAÇÃO ====================
function updateSummary() {
  dom.productCount.textContent = state.products.length;
  dom.customerCount.textContent = state.customers.length;
  dom.lowStockCount.textContent = state.products.filter((p) => p.quantity < 10).length;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const salesValue = state.sales
    .filter((s) => new Date(s.date) >= thisMonth)
    .reduce((sum, s) => sum + s.total, 0);
  dom.monthlySales.textContent = formatCurrency(salesValue);
}

function renderInventory() {
  dom.inventoryTableBody.innerHTML = "";
  const filter = dom.inventorySearch.value.toLowerCase();
  const filtered = state.products.filter(
    (p) =>
      p.name.toLowerCase().includes(filter) ||
      p.sku.toLowerCase().includes(filter) ||
      p.category.toLowerCase().includes(filter)
  );

  if (!filtered.length) {
    dom.inventoryTableBody.innerHTML = "<tr><td colspan='7'>Nenhum produto encontrado</td></tr>";
    return;
  }

  filtered.forEach((product) => {
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
  const filtered = state.customers.filter(
    (c) => c.name.toLowerCase().includes(filter) || c.email.toLowerCase().includes(filter) || c.city.toLowerCase().includes(filter)
  );

  if (!filtered.length) {
    dom.customersTableBody.innerHTML = "<tr><td colspan='6'>Nenhum cliente encontrado</td></tr>";
    return;
  }

  filtered.forEach((customer) => {
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

  state.sales.slice().reverse().forEach((sale) => {
    const customer = state.customers.find((c) => c.id === sale.customerId);
    const product = state.products.find((p) => p.id === sale.productId);
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

function drawBarChart(canvas, labels, values, color = "#2563eb") {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const maxValue = Math.max(...values, 1);
  const barWidth = (width - padding * 2) / Math.max(values.length, 1) - 20;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(0, 0, width, height);

  values.forEach((value, index) => {
    const x = padding + index * (barWidth + 20);
    const barHeight = (value / maxValue) * (height - padding * 2);
    const y = height - padding - barHeight;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#1f2937";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText(labels[index], x, height - padding + 18);
    ctx.fillText(formatCurrency(value), x, y - 10);
  });
}

function renderCharts() {
  const totals = state.sales.reduce((acc, sale) => {
    const product = state.products.find((p) => p.id === sale.productId);
    if (!product) return acc;
    acc[product.name] = (acc[product.name] || 0) + sale.total;
    return acc;
  }, {});

  const labels = Object.keys(totals).slice(0, 6);
  const values = labels.map((label) => totals[label]);
  drawBarChart(dom.salesChart, labels.length ? labels : ["Sem dados"], values.length ? values : [0]);

  const stockLabels = state.products
    .slice()
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6)
    .map((p) => p.name);
  const stockValues = state.products
    .slice()
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6)
    .map((p) => p.quantity);
  drawBarChart(dom.stockChart, stockLabels.length ? stockLabels : ["Sem dados"], stockValues.length ? stockValues : [0], "#10b981");
}

function renderReports() {
  const start = dom.reportStartDate.value;
  const end = dom.reportEndDate.value;

  if (!start || !end) {
    dom.reportsContent.innerHTML = "<p>Selecione o período para gerar o relatório.</p>";
    renderCharts();
    return;
  }

  const periodSales = state.sales.filter((sale) => {
    const dateKey = new Date(sale.date).toISOString().split("T")[0];
    return dateKey >= start && dateKey <= end;
  });

  const total = periodSales.reduce((sum, sale) => sum + sale.total, 0);
  const qty = periodSales.reduce((sum, sale) => sum + sale.quantity, 0);

  let html = `
    <div class="report-content">
      <h4>Período: ${formatDate(start)} até ${formatDate(end)}</h4>
      <p><strong>Total de Vendas:</strong> ${periodSales.length}</p>
      <p><strong>Receita:</strong> ${formatCurrency(total)}</p>
      <p><strong>Itens vendidos:</strong> ${qty}</p>
      <ul>
  `;

  periodSales.forEach((sale) => {
    const customer = state.customers.find((c) => c.id === sale.customerId);
    const product = state.products.find((p) => p.id === sale.productId);
    html += `<li>${formatDate(sale.date)} - ${customer?.name || "?"}: ${sale.quantity}x ${product?.name || "?"} = ${formatCurrency(sale.total)}</li>`;
  });

  html += "</ul></div>";
  dom.reportsContent.innerHTML = html;
  renderCharts();
}

function exportReportAsPdf() {
  const printWindow = window.open("", "_blank");
  const html = `
    <html>
      <head>
        <title>Relatório</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          h1, h2, h3, h4 { color: #1f2937; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <h1>Relatório de Vendas</h1>
        ${dom.reportsContent.innerHTML}
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
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
      const product = state.products.find((x) => x.id === id);
      if (product) {
        dom.fieldName.value = product.name;
        dom.fieldSecond.value = product.sku;
        dom.fieldThird.value = product.quantity;
        dom.fieldFourth.value = product.price;
        dom.fieldFifth.value = product.category;
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
      const customer = state.customers.find((x) => x.id === id);
      if (customer) {
        dom.fieldName.value = customer.name;
        dom.fieldSecond.value = customer.email;
        dom.fieldThird.value = customer.phone;
        dom.fieldFourth.value = customer.city;
        dom.fieldFifth.value = customer.status;
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

async function saveRecord() {
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
    for (const [key, value] of Object.entries(data)) {
      const err = validateField("product", key, value);
      if (err) errs.push(`${key}: ${err}`);
    }

    if (errs.length) {
      showNotification(errs.join(" | "), "error");
      return;
    }

    if (!state.apiAvailable) {
      showNotification("Backend indisponível. Não é possível salvar produto.", "error");
      return;
    }

    if (id) {
      try {
        const updated = await apiRequest(`/products/${id}`, { method: "PUT", body: data });
        state.products = state.products.map((product) => (product.id === id ? updated : product));
      } catch (error) {
        showNotification(`Erro ao atualizar produto: ${error.message}`, "error");
        return;
      }
    } else {
      try {
        const created = await apiRequest("/products", { method: "POST", body: data });
        state.products.push(created);
      } catch (error) {
        showNotification(`Erro ao criar produto: ${error.message}`, "error");
        return;
      }
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
    for (const [key, value] of Object.entries(data)) {
      const err = validateField("customer", key, value);
      if (err) errs.push(`${key}: ${err}`);
    }

    if (errs.length) {
      showNotification(errs.join(" | "), "error");
      return;
    }

    if (!state.apiAvailable) {
      showNotification("Backend indisponível. Não é possível salvar cliente.", "error");
      return;
    }

    if (id) {
      try {
        const updated = await apiRequest(`/customers/${id}`, { method: "PUT", body: data });
        state.customers = state.customers.map((customer) => (customer.id === id ? updated : customer));
      } catch (error) {
        showNotification(`Erro ao atualizar cliente: ${error.message}`, "error");
        return;
      }
    } else {
      try {
        const created = await apiRequest("/customers", { method: "POST", body: data });
        state.customers.push(created);
      } catch (error) {
        showNotification(`Erro ao criar cliente: ${error.message}`, "error");
        return;
      }
    }
  }

  render();
  closeModal();
}

async function deleteRecord(type, id) {
  if (!confirm("Tem certeza?")) return;

  if (!state.apiAvailable) {
    showNotification("Backend indisponível. Não é possível remover o registro.", "error");
    return;
  }

  if (type === "product") {
    try {
      await apiRequest(`/products/${id}`, { method: "DELETE" });
      state.products = state.products.filter((p) => p.id !== id);
    } catch (error) {
      showNotification(`Erro ao remover produto: ${error.message}`, "error");
      return;
    }
  } else if (type === "customer") {
    try {
      await apiRequest(`/customers/${id}`, { method: "DELETE" });
      state.customers = state.customers.filter((c) => c.id !== id);
    } catch (error) {
      showNotification(`Erro ao remover cliente: ${error.message}`, "error");
      return;
    }
  } else if (type === "sale") {
    try {
      await apiRequest(`/sales/${id}`, { method: "DELETE" });
      state.sales = state.sales.filter((s) => s.id !== id);
    } catch (error) {
      showNotification(`Erro ao remover venda: ${error.message}`, "error");
      return;
    }
  }

  render();
}

async function recordSale() {
  if (!state.customers.length || !state.products.length) {
    showNotification("Cadastre clientes e produtos primeiro", "warning");
    return;
  }

  const customerId = prompt("ID do cliente:");
  const productId = prompt("ID do produto:");
  const qty = Number(prompt("Quantidade:"));

  if (!customerId || !productId || !qty) return;

  const customer = state.customers.find((c) => c.id === customerId);
  const product = state.products.find((p) => p.id === productId);

  if (!customer || !product || qty <= 0 || qty > product.quantity) {
    showNotification("Dados inválidos ou estoque insuficiente", "error");
    return;
  }

  const sale = {
    id: generateId("s"),
    date: new Date().toISOString(),
    customerId,
    productId,
    quantity: qty,
    total: product.price * qty,
    type: "sale",
  };

  if (!state.apiAvailable) {
    showNotification("Backend indisponível. Não é possível registrar venda.", "error");
    return;
  }

  try {
    const created = await apiRequest("/sales", { method: "POST", body: sale });
    state.sales.push(created);
  } catch (error) {
    showNotification(`Erro ao registrar venda: ${error.message}`, "error");
    return;
  }

  product.quantity -= qty;
  render();
  showNotification("Venda registrada com sucesso.", "success");
}

function setupEventListeners() {
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.logoutBtn.addEventListener("click", handleLogout);
  dom.googleLoginBtn.addEventListener("click", handleOAuthLogin);
  dom.cloudBackupBtn.addEventListener("click", backupToCloud);
  dom.syncBtn.addEventListener("click", syncData);
  dom.exportPdfBtn.addEventListener("click", exportReportAsPdf);

  dom.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      dom.tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
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
  dom.recordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveRecord();
  });

  window.addEventListener("online", () => setSyncStatus(true));
  window.addEventListener("offline", () => setSyncStatus(false));
}

async function handleLogin(e) {
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

  if (!state.apiAvailable) {
    dom.passwordError.textContent = "Backend indisponível. Conecte-se ao servidor local para continuar.";
    return;
  }

  try {
    const response = await authenticateBackend(email, password);
    state.authToken = response.token;
    state.currentUser = response.user;
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(state.currentUser));
    localStorage.setItem(`${STORAGE_KEY}_token`, response.token);
    showApp();
    await fetchRemoteState();
    dom.loginForm.reset();
  } catch (error) {
    dom.passwordError.textContent = error.message;
  }
}

async function handleOAuthLogin() {
  if (!state.apiAvailable) {
    showNotification("OAuth não disponível em modo offline.", "warning");
    return;
  }

  try {
    const response = await authenticateOAuth();
    state.authToken = response.token;
    state.currentUser = response.user;
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(state.currentUser));
    localStorage.setItem(`${STORAGE_KEY}_token`, response.token);
    showApp();
    await fetchRemoteState();
    render();
  } catch (error) {
    showNotification(`Erro OAuth: ${error.message}`, "error");
  }
}

function handleLogout() {
  state.currentUser = null;
  state.authToken = null;
  localStorage.removeItem(`${STORAGE_KEY}_user`);
  localStorage.removeItem(`${STORAGE_KEY}_token`);
  showLogin();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Service worker não registrado:", error);
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem(STORAGE_KEY)) {
    localStorage.removeItem(STORAGE_KEY);
  }

  const user = localStorage.getItem(`${STORAGE_KEY}_user`);
  if (user) {
    state.currentUser = JSON.parse(user);
  }

  if (state.currentUser) {
    showApp();
  } else {
    showLogin();
  }

  setupEventListeners();
  await checkApiHealth();
  if (state.apiAvailable && state.currentUser) {
    await fetchRemoteState();
  } else if (state.currentUser) {
    showNotification("Backend não disponível. Dados não podem ser carregados.", "warning");
  }
  registerServiceWorker();

  if (state.apiAvailable) {
    setInterval(() => {
      if (navigator.onLine) syncData();
    }, 30000);
  }
});
