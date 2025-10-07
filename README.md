# Sistema de Análise de Plantas - GrandValle

Este é um projeto feito em **Next.js 15** que permite acompanhar visitas, doenças e pragas por centro de custo e data. Ele utiliza rotas dinâmicas, SSG e exportação estática para facilitar o deploy, inclusive no Vercel.

---

## Tecnologias

- [Next.js](https://nextjs.org) (App Router)
- React
- TypeScript
- Node.js
- Vercel para deploy

---

## Estrutura de Rotas

O sistema utiliza rotas dinâmicas:

- `/centro-de-custo/[centro]` → lista de visitas por centro de custo
- `/centro-de-custo/[centro]/[data]` → visitas de um centro em uma data específica
- `/centro-de-custo/[centro]/[data]/[analise]` → análise detalhada de uma doença/praga

> **Observação:** Para deploy estático no Apache, utilize `slugify` para nomes de análises com acentos ou espaços. No Vercel, as rotas dinâmicas funcionam nativamente.

---

## Getting Started - Desenvolvimento Local

1. Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_PROJETO>

```
2. Instale as dependências:

```bash

npm install


```

3. Rode o servidor de desenvolvimento:

```bash

npm run dev