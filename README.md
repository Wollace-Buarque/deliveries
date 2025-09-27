# Deliveries Project

Este é um projeto monorepo para gerenciamento de entregas, composto por:

- **API**: Backend construído com Fastify, Prisma e outras bibliotecas modernas.
- **Web**: Frontend em Next.js com Tailwind CSS.
- **Shared**: Pacote compartilhado de tipos, constantes e utilitários.

## Como rodar o projeto

1. Instale as dependências na pasta raiz:
   ```sh
   npm install
   ```
2. Configure as variáveis de ambiente conforme o arquivo `env.example` na pasta api.
3. Suba o container docker:
   ```sh
   docker compose up -d
   ```
4. Inicie o projeto na pasta raiz:
   ```sh
   npm run dev
   ```
5. Acesso o front-end na url: http://localhost:3000

## Postman

Utilize os arquivos separados dentro da pasta `postman` para importar as rotas da aplicações e realizar testes no backend via Postman.

## Estrutura

- `apps/api` — API REST para gerenciamento de usuários e entregas
- `apps/web` — Aplicação web para interação com o sistema
- `packages/shared` — Código compartilhado entre API e Web

## Tecnologias principais

- Fastify
- Prisma
- Next.js
- Tailwind CSS
