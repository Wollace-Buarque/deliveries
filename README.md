# Deliveries Project

Este é um projeto monorepo para gerenciamento de entregas, composto por:

- **API**: Backend construído com Fastify, Prisma e outras bibliotecas modernas.
- **Web**: Frontend em Next.js com Tailwind CSS.
- **Shared**: Pacote compartilhado de tipos, constantes e utilitários.

## Como rodar o projeto

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Configure as variáveis de ambiente conforme o arquivo `env.example` na pasta api.
3. Inicie o projeto na pasta deliveries:
   ```sh
   npm run dev
   ```

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
