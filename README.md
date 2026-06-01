# 📦 Gestão Inteligente - Sistema de Estoque e Clientes

Um sistema web moderno para gerenciamento de estoque, clientes e vendas com interface responsiva e validações avançadas.

## 🎯 Funcionalidades

### ✅ Implementadas
- **Autenticação com Login** - Validação de email e senha com feedback visual
- **Gerenciamento de Estoque** - Cadastrar, editar e remover produtos com alertas de estoque baixo
- **Gerenciamento de Clientes** - Controle completo de informações de clientes
- **Registro de Vendas** - Rastreamento de vendas e movimentações de estoque
- **Relatórios por Período** - Análises de vendas com filtro por data
- **Validação Avançada** - Validações em tempo real para todos os formulários
- **Persistência Local** - Dados salvos em localStorage
- **Design Responsivo** - Interface adaptável para mobile, tablet e desktop
- **Dashboard com Métricas** - Painel de resumo com KPIs importantes

## 🚀 Como Usar

### 1. **Abrir a Aplicação**
Abra `index.html` em um navegador web moderno (Chrome, Firefox, Safari, Edge).

### 2. **Fazer Login**
- **Email Demo:** `admin@demo.com`
- **Senha Demo:** `123456`
- Qualquer email válido com senha com mínimo 6 caracteres funciona

### 3. **Painéis Disponíveis**

#### 📦 **Estoque**
- Ver todos os produtos
- Cadastrar novos produtos
- Editar informações
- Remover produtos
- Buscar por nome, SKU ou categoria
- Indicador visual de estoque baixo (< 10 unidades)

#### 👥 **Clientes**
- Gerenciar informações de clientes
- Cadastrar novos clientes
- Editar dados
- Remover clientes
- Busca por nome, email ou cidade

#### 💳 **Vendas e Movimentações**
- Registrar vendas de produtos
- Controlar quantidade vendida
- Rastrear histórico de transações
- Atualização automática de estoque

#### 📊 **Relatórios**
- Filtrar vendas por período
- Ver receita total
- Quantidade de itens vendidos
- Detalhamento de cada transação

## 📋 Validações Implementadas

### Produtos
- ✓ Nome: mínimo 3 caracteres
- ✓ SKU: mínimo 3 caracteres
- ✓ Quantidade: valor positivo
- ✓ Preço: maior que 0
- ✓ Categoria: mínimo 2 caracteres

### Clientes
- ✓ Nome: mínimo 3 caracteres
- ✓ Email: formato válido
- ✓ Telefone: mínimo 10 dígitos
- ✓ Cidade: mínimo 2 caracteres

### Login
- ✓ Email: formato válido
- ✓ Senha: mínimo 6 caracteres

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Storage**: localStorage (sem necessidade de backend)
- **Design**: Responsivo com Flexbox e Grid
- **Compatibilidade**: Todos os navegadores modernos

## 📁 Estrutura de Arquivos

```
Controle de caixa/
├── index.html          # Estrutura HTML da aplicação
├── styles.css          # Estilos e layout responsivo
├── app.js              # Lógica e interatividade
├── server.js           # Servidor Node.js (opcional)
└── README.md           # Este arquivo
```

## 🔧 Configuração Avançada (Opcional)

### Usar com Node.js Server

Se desejar servir a aplicação via servidor Node.js:

```bash
# 1. Instale Node.js (se não tiver)
# https://nodejs.org

# 2. Navegue até a pasta do projeto
cd "Controle de caixa"

# 3. Inicie o servidor
node server.js

# 4. Abra no navegador
# http://localhost:3000
```

## 💾 Dados

- Todos os dados são salvos em **localStorage** do navegador
- Dados persistem entre sessões
- Limite: ~5-10MB por domínio (suficiente para milhares de registros)

### Recuperar dados dos dados de exemplo:
1. Clique em "Limpar dados" (se tiver acesso)
2. Ou limpe o localStorage: `localStorage.clear()`

## 📱 Responsividade

- **Desktop**: Layout completo com 4 abas visíveis
- **Tablet**: Layout adaptado com 2 colunas
- **Mobile**: Layout em coluna única, otimizado para toque

## 🎨 Temas

O sistema usa um design moderno com:
- Cores profissionais (azul primário #2563eb)
- Tipografia limpa e legível
- Espaçamento consistente
- Ícones em emojis para rápida identificação

## ⚠️ Limitações Conhecidas

- Sem sincronização entre abas/janelas
- Sem backup automático online
- Sem suporte a múltiplos usuários simultâneos
- Sem criptografia de dados (armazenamento local)

## 🚀 Próximas Melhorias

- [ ] Integração com API backend real
- [ ] Autenticação OAuth
- [ ] Backup na nuvem
- [ ] Gráficos e dashboards
- [ ] Exportação de relatórios em PDF
- [ ] App mobile nativa
- [ ] Sincronização em tempo real

## 📞 Suporte

Para issues ou sugestões, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0  
**Data**: Junho 2026  
**Desenvolvido com ❤️ por um programador senior**
