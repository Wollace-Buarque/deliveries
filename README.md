# Deliveries Project

Este é um projeto monorepo para gerenciamento de entregas, composto por:

- **API**: Backend construído com Fastify, Prisma e outras bibliotecas modernas.
- **Web**: Frontend em Next.js com Tailwind CSS.
- **Shared**: Pacote compartilhado de tipos, constantes e utilitários.

## Como rodar o projeto

1. Instale as dependências na pasta raiz do projeto:
```sh
npm install
```
2. Configure as variáveis de ambiente conforme o arquivo `.env` na pasta `apps/api` e pasta raiz do projeto.
3.  Na pasta `apps/api`:
```sh
docker compose up -d
npx prisma generate
npx prisma migrate dev
```
4. Renomeie o arquivo `.env.example` para `.env` na pasta `web` e adicione sua chave api key do googgle ([Documentação do Google para gerar a API KEY](https://developers.google.com/maps/documentation/javascript/get-api-key?setupProd=enable))
5. Inicie o projeto na pasta raiz:
```sh
npm run dev
```
6. Acesso o front-end na url: http://localhost:3000

## Postman

Utilize os arquivos separados dentro da pasta `apps/api/postman` para importar as rotas da aplicações e realizar testes no backend via Postman.

## Estrutura

- `apps/api` — API REST para gerenciamento de usuários e entregas
- `apps/web` — Aplicação web para interação com o sistema
- `packages/shared` — Código compartilhado entre API e Web

## Tecnologias principais

- Fastify
- Prisma
- Next.js
- Tailwind CSS
