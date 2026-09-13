# Desafio Técnico QA Pleno - NEXDOM

Projeto de testes automatizados em Cypress para validar cenários de front-end do site NEXDOM e o ciclo de vida de repositórios na API do GitHub.

---

## 📋 Requisitos

- Node.js 20 ou superior
- npm
- Internet para acessar o site NEXDOM
- Token do GitHub (somente para testes de API)

---

## 📥 Download e Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/willianosaida/Desafio-NEXDOM.git
cd Desafio-NEXDOM
```

> **Nota:** Use aspas para funcionar em qualquer terminal (Bash, PowerShell, CMD)

### 2. Instalar dependências

```bash
npm install
```

---

## ⚙️ Configuração

### Para testes de Front-End

Nenhuma configuração adicional é necessária. Os testes acessam o site público da NEXDOM.

### Para testes da API do GitHub

Crie um arquivo `cypress.env.json` na raiz do projeto com suas credenciais:

```json
{
  "githubToken": "seu_token_github",
  "githubUser": "seu_usuario_github"
}
```

**Importante:**
- O arquivo `cypress.env.json` está no `.gitignore` — nunca será versionado
- O token deve ter permissões para criar, deletar repositórios e criar issues
- Nunca compartilhe seu token

---

## 🚀 Como Executar os Testes

### Testes de Front-End (Cypress GUI)

```bash
npm run cy:open
```

Abre a interface do Cypress. Selecione os testes `contato.cy.js` ou `home.cy.js` para executar.

### Testes de Front-End (Headless)

```bash
npm run test:ui
```

Executa todos os testes da UI em modo headless.

### Testes da API do GitHub

```bash
npx cypress run --spec cypress/e2e/api/github.cy.js
```

Executa os testes de API que validam:
- Criar repositório
- Consultar repositório
- Criar issue
- Deletar repositório

---

## 📁 Estrutura do Projeto

```
cypress/
  ├── e2e/
  │   ├── api/github.cy.js          # Testes da API GitHub
  │   └── ui/
  │       ├── home.cy.js            # Testes da página Home
  │       └── contato.cy.js         # Testes do formulário de Contato
  └── pageObjects/
      ├── elements/el.js            # Seletores dos elementos
      ├── pages.js                  # Ações simples de cada página
      └── modulos.js                # Fluxos completos
features/
  └── desafio.feature               # Cenários em Gherkin
cypress.config.js                   # Configuração do Cypress
```

---

## Desafios encontrados

O maior desafio foi validar o formulário de contato sem gerar um envio real: como o site está em produção, o teste precisou bloquear o evento de submit no próprio navegador (via `addEventListener` e `preventDefault()`), garantindo que o fluxo de preenchimento e validação fosse testado sem poluir a caixa de entrada da empresa com dados de teste.

Outro ponto foi a navegação até as Soluções: não existe uma rota única `/solucoes/` — é um menu com várias páginas específicas. Foi preciso mapear o caminho real (menu → "Gestão de Planos de Saúde") em vez de testar uma página que não existe.

No teste de API, o desafio foi garantir que o fluxo completo (criar, consultar, criar issue, consultar issue, excluir) rodasse de forma independente a cada execução, sem colidir com repositórios de execuções anteriores — resolvido gerando um nome de repositório único com timestamp a cada rodada — e sem versionar o token de acesso, que fica isolado em `cypress.env.json`, fora do controle de versão.

---

## ✅ Detalhes Técnicos

- **Page Objects**: Estrutura baseada em `elements/el.js` (seletores) → `pages.js` (ações) → `modulos.js` (fluxos)
- **Formulário de Contato**: O envio é bloqueado via `preventDefault()` para evitar poluição da caixa de entrada real da NEXDOM
- **Navegação de Soluções**: Acessa a página real via menu, sem rota agregadora `/solucoes/`


