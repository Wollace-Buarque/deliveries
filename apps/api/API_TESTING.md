# API Testing Guide - Deliveries

Este guia explica como testar a API do sistema de entregas usando o Postman.

## 📁 Arquivos de Teste

- `postman-collection.json` - Collection completa com todas as rotas
- `postman-environment.json` - Ambiente com variáveis configuradas

## 🚀 Como Importar no Postman

### 1. Importar Collection
1. Abra o Postman
2. Clique em "Import"
3. Selecione o arquivo `postman-collection.json`
4. A collection "Deliveries API" será importada

### 2. Importar Environment
1. No Postman, clique em "Environments"
2. Clique em "Import"
3. Selecione o arquivo `postman-environment.json`
4. O ambiente "Deliveries API Environment" será importado
5. Selecione este ambiente no dropdown no canto superior direito

## 🔧 Configuração Inicial

### 1. Iniciar o Servidor
```bash
# No diretório apps/api
npm run dev
```

### 2. Configurar Banco de Dados
```bash
# Se usando Docker
docker-compose up -d postgres

# Executar migrações
npm run db:migrate
```

## 📋 Fluxo de Testes Recomendado

### 1. **Registro de Usuários**
1. **Register User** - Criar um cliente
2. **Register Delivery Person** - Criar um entregador

### 2. **Autenticação**
1. **Login** - Fazer login com um dos usuários criados
   - O token será automaticamente salvo nas variáveis
   - Use o token para as próximas requisições

### 3. **Gestão de Entregas**
1. **Create Delivery** - Criar uma entrega (como cliente)
2. **Get Available Deliveries** - Ver entregas disponíveis (como entregador)
3. **Accept Delivery** - Aceitar uma entrega (como entregador)
4. **Update Delivery Status** - Atualizar status da entrega

### 4. **Consultas**
1. **Get All Deliveries** - Listar todas as entregas
2. **Get Delivery by ID** - Ver detalhes de uma entrega específica
3. **Get User Profile** - Ver perfil do usuário logado

## 🔑 Variáveis Automáticas

A collection está configurada para automaticamente:
- Salvar `accessToken` após login
- Salvar `refreshToken` após login
- Salvar `userId` após login
- Usar os tokens nas requisições autenticadas

## 📊 Status de Entregas

- `PENDING` - Aguardando aceitação
- `ACCEPTED` - Aceita por entregador
- `PICKED_UP` - Coletada
- `IN_TRANSIT` - Em trânsito
- `DELIVERED` - Entregue
- `CANCELLED` - Cancelada

## 👥 Roles de Usuário

- `CLIENT` - Cliente (pode criar entregas)
- `DELIVERY` - Entregador (pode aceitar entregas)
- `ADMIN` - Administrador (acesso total)

## 🧪 Testes Automáticos

A collection inclui testes automáticos que verificam:
- Tempo de resposta < 5 segundos
- Presença do campo `success` na resposta
- Salvamento automático de tokens

## 🔍 Exemplos de Dados

### Cliente
```json
{
  "email": "cliente@exemplo.com",
  "password": "12345678",
  "role": "CLIENT",
  "profile": {
    "name": "João Silva",
    "phone": "(11) 99999-9999",
    "document": "123.456.789-00",
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "coordinates": {
        "lat": -23.5505,
        "lng": -46.6333
      }
    }
  }
}
```

### Entregador
```json
{
  "email": "entregador@exemplo.com",
  "password": "12345678",
  "role": "DELIVERY",
  "profile": {
    "name": "Maria Santos",
    "phone": "(11) 88888-8888",
    "document": "987.654.321-00",
    "address": {
      "street": "Avenida Paulista",
      "number": "1000",
      "complement": "",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310-100",
      "coordinates": {
        "lat": -23.5615,
        "lng": -46.6565
      }
    }
  }
}
```

### Entrega
```json
{
  "origin": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "coordinates": {
      "lat": -23.5505,
      "lng": -46.6333
    }
  },
  "destination": {
    "street": "Avenida Paulista",
    "number": "1000",
    "complement": "",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "coordinates": {
      "lat": -23.5615,
      "lng": -46.6565
    }
  },
  "description": "Entrega de documentos importantes",
  "value": 25.50
}
```

## 🚨 Troubleshooting

### Erro de Conexão
- Verifique se o servidor está rodando na porta 3001
- Confirme se o banco de dados está configurado

### Erro de Autenticação
- Faça login novamente para obter um novo token
- Verifique se o token não expirou (15 minutos)

### Erro de Validação
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme se os tipos de dados estão corretos

## 📚 Documentação da API

Acesse a documentação interativa em:
- **Desenvolvimento**: http://localhost:3001/docs
- **Swagger UI**: http://localhost:3001/docs

## 🔄 Atualizações

Para atualizar a collection:
1. Modifique o arquivo `postman-collection.json`
2. Re-importe no Postman
3. As variáveis serão preservadas
