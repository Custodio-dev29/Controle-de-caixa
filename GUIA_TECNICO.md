# 🛠️ Guia Técnico - Gestão Inteligente

Documentação técnica para desenvolvedores que desejam expandir ou integrar a aplicação.

## 📐 Arquitetura

### Estrutura do Estado (State)
```javascript
state = {
  isLoggedIn: boolean,
  currentUser: { email: string, name: string },
  products: Array<Product>,
  customers: Array<Customer>,
  sales: Array<Sale>
}
```

### Modelos de Dados

#### Product
```javascript
{
  id: "p1234567890",        // Gerado com timestamp
  name: string,              // Mínimo 3 caracteres
  sku: string,               // Mínimo 3 caracteres
  quantity: number,          // >= 0
  price: number,             // > 0
  category: string           // Mínimo 2 caracteres
}
```

#### Customer
```javascript
{
  id: "c1234567890",         // Gerado com timestamp
  name: string,              // Mínimo 3 caracteres
  email: string,             // Formato válido
  phone: string,             // Mínimo 10 dígitos
  city: string,              // Mínimo 2 caracteres
  status: string             // "Ativo" ou outro
}
```

#### Sale
```javascript
{
  id: "s1234567890",         // Gerado com timestamp
  date: ISO8601String,       // Data/hora da venda
  customerId: string,        // ID do cliente
  productId: string,         // ID do produto
  quantity: number,          // Quantidade vendida
  total: number,             // Preço total
  type: "sale" | "movement"  // Tipo de transação
}
```

## 🔑 Funções Principais

### Autenticação
```javascript
validateEmail(email)      // Valida formato de email
validatePassword(pwd)     // Verifica comprimento mínimo
handleLogin(event)        // Processa login
handleLogout()           // Faz logout
```

### Persistência
```javascript
loadData()               // Carrega do localStorage
saveData()               // Salva em localStorage
```

### Validação
```javascript
validateField(type, field, value)  // Valida campo específico
// Tipos: "product", "customer", "sale"
```

### CRUD
```javascript
openModal(type, id)      // Abre modal para criar/editar
closeModal()             // Fecha modal
saveRecord()             // Salva novo ou edita registro
deleteRecord(type, id)   // Remove registro
```

### Renderização
```javascript
render()                 // Re-renderiza tudo
renderInventory()        // Renderiza tabela de produtos
renderCustomers()        // Renderiza tabela de clientes
renderSales()            // Renderiza tabela de vendas
renderReports()          // Gera relatório
updateSummary()          // Atualiza KPIs do dashboard
```

### Utilitários
```javascript
formatCurrency(value)    // Formata para moeda BRL
formatDate(date)         // Formata para formato local
recordSale()             // Interface para registrar venda
```

## 🔌 Extensões Possíveis

### 1. Integração com API Backend

Criar arquivo `api.js`:
```javascript
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`http://localhost:3000${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  return response.json();
}

// Usar no lugar de localStorage
async function loadData() {
  state.products = await fetchAPI("/api/products");
  state.customers = await fetchAPI("/api/customers");
  state.sales = await fetchAPI("/api/sales");
}
```

### 2. Adicionar Paginação

```javascript
const PAGE_SIZE = 20;
let currentPage = 1;

function paginate(items) {
  const start = (currentPage - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}
```

### 3. Implementar Busca Avançada

```javascript
function advancedSearch(type, filters) {
  let results = state[type === 'product' ? 'products' : 'customers'];
  
  if (filters.name) {
    results = results.filter(r => 
      r.name.toLowerCase().includes(filters.name.toLowerCase())
    );
  }
  
  if (filters.minPrice && type === 'product') {
    results = results.filter(r => r.price >= filters.minPrice);
  }
  
  return results;
}
```

### 4. Adicionar Filtros de Data Avançados

```javascript
function getSalesInRange(startDate, endDate) {
  const s = new Date(startDate).getTime();
  const e = new Date(endDate).getTime();
  
  return state.sales.filter(sale => {
    const t = new Date(sale.date).getTime();
    return t >= s && t <= e;
  });
}
```

### 5. Exportar para CSV

```javascript
function exportToCSV(data, filename) {
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row => 
      headers.map(h => `"${row[h]}"`).join(",")
    )
  ].join("\n");
  
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
```

### 6. Adicionar Notificações Toast

```javascript
function showNotification(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}
```

## 🧪 Dados de Teste

```javascript
// Gerar dados de teste
function generateTestData() {
  // 100 produtos
  for (let i = 0; i < 100; i++) {
    state.products.push({
      id: `p${i}`,
      name: `Produto ${i}`,
      sku: `SKU-${i.toString().padStart(3, '0')}`,
      quantity: Math.floor(Math.random() * 100),
      price: Math.random() * 1000,
      category: ["A", "B", "C"][i % 3]
    });
  }
  
  // 50 clientes
  for (let i = 0; i < 50; i++) {
    state.customers.push({
      id: `c${i}`,
      name: `Cliente ${i}`,
      email: `cliente${i}@example.com`,
      phone: `(11) 9${Math.random().toString().slice(2, 10)}-${Math.random().toString().slice(2, 6)}`,
      city: ["São Paulo", "Rio de Janeiro", "Belo Horizonte"][i % 3],
      status: "Ativo"
    });
  }
  
  saveData();
}
```

## 📊 KPIs Calculados

O dashboard exibe:
- **Total de Produtos**: `state.products.length`
- **Total de Clientes**: `state.customers.length`
- **Estoque Baixo**: produtos com `quantity < 10`
- **Vendas do Mês**: soma de `sales.total` do mês atual

## 🔐 Segurança

### Considerações Importantes

1. **Dados Sensíveis**: Não armaze senhas em localStorage
2. **Validação**: Sempre valide no frontend E no backend
3. **CORS**: Configure adequadamente quando usar API
4. **Rate Limiting**: Implemente no servidor para proteger contra abuso

### Melhorias de Segurança

```javascript
// Hash de senha (use bcryptjs em produção)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

## 📈 Performance

### Otimizações Implementadas
- ✓ Delegação de eventos
- ✓ Cache de DOM
- ✓ Renderização seletiva
- ✓ Lazy loading de relatórios

### Possíveis Melhorias
- [ ] Paginação de tabelas grandes
- [ ] Virtual scrolling
- [ ] IndexedDB para dados > 5MB
- [ ] Web Workers para processamento pesado

## 🧩 Integração com Serviços

### Exemplo: Enviar Email ao Vender

```javascript
async function sendSaleEmail(sale) {
  await fetchAPI("/api/send-email", {
    method: "POST",
    body: JSON.stringify({
      to: sale.customerEmail,
      subject: "Confirmação de Venda",
      message: `Você comprou ${sale.quantity}x ${sale.productName}`
    })
  });
}
```

### Exemplo: Sincronizar com Planilha Google

```javascript
async function syncToGoogleSheets(data) {
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/...", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Authorization": "Bearer " + googleToken
    }
  });
  return response.json();
}
```

## 📚 Referências

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Última atualização**: Junho 2026
