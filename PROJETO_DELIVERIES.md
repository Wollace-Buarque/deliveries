# Projeto Deliveries - Documentação Técnica

## Visão Geral

O projeto Deliveries é uma aplicação completa de gerenciamento de entregas, desenvolvida como um monolito utilizando Turborepo para orquestração. A arquitetura combina um frontend em Next.js com um backend em Node.js utilizando Fastify, proporcionando uma solução robusta e escalável para o mercado de entregas.

## Arquitetura Proposta

### Visão Geral da Arquitetura

O projeto adota uma **arquitetura de monolito modular** utilizando Turborepo, que permite manter a simplicidade de um monolito enquanto prepara o terreno para uma possível migração futura para microserviços. A arquitetura é baseada em **Domain-Driven Design (DDD)** com separação clara de responsabilidades.

### Decisões Arquiteturais

#### 1. **Monolito Modular com Turborepo**
- **Justificativa**: Facilita desenvolvimento inicial, compartilhamento de código e deploy simplificado
- **Benefícios**: 
  - Código compartilhado entre frontend e backend
  - Build otimizado com cache inteligente
  - Deploy independente de cada aplicação
  - Preparação para migração futura para microserviços

#### 2. **Frontend: Next.js com App Router**
- **Arquitetura**: Server-Side Rendering (SSR) + Client-Side Rendering (CSR)
- **Padrão**: Component-based architecture com custom hooks
- **Roteamento**: App Router do Next.js 15+ para melhor performance

#### 3. **Backend: Node.js + Fastify**
- **Arquitetura**: Layered Architecture (Controller → Service → Repository)
- **Padrão**: Clean Architecture com separação de responsabilidades
- **Performance**: Fastify oferece 2x mais performance que Express
- **Validação**: Schema-first com Zod para type safety

### Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend          │  Mobile App (Futuro)          │
│  - React Components        │  - React Native               │
│  - Custom Hooks           │  - Shared Components          │
│  - State Management       │  - Native Features            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Fastify Server                                            │
│  - Authentication Middleware                               │
│  - Request Validation                                      │
│  - Response Transformation                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Controllers               │  Services                      │
│  - HTTP Request Handling   │  - Business Logic              │
│  - Input Validation        │  - Domain Rules                │
│  - Response Formatting     │  - External API Integration    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Domain Models             │  Domain Services               │
│  - Entities                │  - Business Rules              │
│  - Value Objects           │  - Domain Events               │
│  - Aggregates              │  - Domain Exceptions           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)     │  External Services             │
│  - Prisma ORM              │  - Payment Gateway             │
│  - Migrations              │  - Maps API                    │
│  - Queries                 │  - Notification Service        │
│                            │  - File Storage                │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura do Monolito

```
deliveries/
├── apps/
│   ├── web/                    # Frontend Next.js
│   └── api/                   # Backend Node.js + Fastify
│
├── packages/
│   └── shared/               # Código compartilhado
│
├── turbo.json               # Configuração do Turborepo
├── package.json            # Root package.json
└── README.md
```

### Padrões Arquiteturais Implementados

#### 1. **Repository Pattern**
```typescript
interface DeliveryRepository {
  create(delivery: CreateDeliveryDto): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
  findByStatus(status: DeliveryStatus): Promise<Delivery[]>;
  update(id: string, data: Partial<Delivery>): Promise<Delivery>;
}
```

#### 2. **Service Layer Pattern**
```typescript
class DeliveryService {
  constructor(
    private deliveryRepository: DeliveryRepository,
    private notificationService: NotificationService,
    private mapsService: MapsService
  ) {}

  async createDelivery(data: CreateDeliveryDto): Promise<Delivery> {
    // Business logic here
  }
}
```

#### 3. **Dependency Injection**
- Uso de containers de DI para gerenciar dependências
- Facilita testes unitários e manutenção
- Permite inversão de controle

#### 4. **Event-Driven Architecture**
```typescript
// Domain Events
class DeliveryAcceptedEvent {
  constructor(
    public deliveryId: string,
    public deliveryPersonId: string,
    public timestamp: Date
  ) {}
}

// Event Handlers
class DeliveryAcceptedHandler {
  async handle(event: DeliveryAcceptedEvent): Promise<void> {
    // Send notification to client
    // Update delivery status
    // Log activity
  }
}
```

### Comunicação Entre Camadas

#### Frontend ↔ Backend
- **Protocolo**: HTTP/HTTPS com REST API
- **Formato**: JSON
- **Autenticação**: JWT Bearer Token

#### Backend ↔ Database
- **ORM**: Prisma para type safety
- **Connection Pool**: Para otimização de conexões
- **Migrations**: Versionamento do schema
- **Transactions**: Para operações atômicas

### Considerações de Escalabilidade

#### 1. **Vertical Scaling**
- Otimização de queries com índices
- Futuro Cache Redis para dados frequentes

#### 2. **Microserviços Futuros**
- Domínios bem definidos facilitam separação
- Event-driven architecture prepara para async communication
- API Gateway pode ser facilmente implementado

### Tecnologias Utilizadas

#### Frontend (Next.js)
- **Framework**: Next.js 15+ com App Router
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **Formulários**: React Hook Form + Zod

#### Backend (Node.js + Fastify)
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod
- **Documentação**: Swagger/Scalar/OpenAPI

#### Infraestrutura
- **Monorepo**: Turborepo
- **Containerização**: Docker
- **Monitoramento**: Sentry

## Backlog Priorizado

### 🚀 Sprint 1 - Fundação (2 semanas)
**Prioridade: CRÍTICA**

#### 1.1 Configuração do Projeto
- [x] Configurar Turborepo
- [x] Configurar Next.js com TypeScript
- [x] Configurar Fastify com TypeScript
- [x] Configurar banco PostgreSQL
- [x] Configurar Prisma ORM
- [x] Configurar Docker
- [x] Configurar ESLint, Prettier e Husky

#### 1.2 Autenticação e Autorização
- [ ] Implementar sistema de registro/login
- [ ] Implementar JWT authentication
- [ ] Criar middleware de autenticação
- [ ] Implementar roles (Cliente, Entregador, Admin)
- [ ] Criar páginas de login/registro no frontend

### 🎯 Sprint 2 - Core Features (3 semanas)
**Prioridade: ALTA**

#### 2.1 Gestão de Usuários
- [ ] CRUD de clientes
- [ ] CRUD de entregadores
- [ ] Perfil de usuário
- [ ] Upload de foto de perfil
- [ ] Validação de documentos

#### 2.2 Gestão de Entregas
- [ ] Criar nova entrega
- [ ] Listar entregas por status
- [ ] Detalhes da entrega
- [ ] Atualizar status da entrega
- [ ] Histórico de entregas

#### 2.3 Sistema de Localização
- [ ] Integração com Google Maps
- [ ] Seleção de origem e destino
- [ ] Cálculo de distância e tempo
- [ ] Rastreamento em tempo real
- [ ] Geocoding de endereços

### 📱 Sprint 3 - Interface e UX (2 semanas)
**Prioridade: ALTA**

#### 3.1 Dashboard Principal
- [ ] Dashboard

#### 3.2 Interface de Entregas
- [ ] Formulário de criação de entrega
- [ ] Lista de entregas disponíveis
- [ ] Interface de aceitar entrega
- [ ] Confirmação de entrega

### 🔔 Sprint 4 - Notificações e Comunicação (2 semanas)
**Prioridade: MÉDIA**

#### 4.1 Sistema de Notificações
- [ ] Notificações por email

### 🔧 Sprint 5 - Melhorias e Otimizações (2 semanas)
**Prioridade: BAIXA**

#### 5.1 Performance
- [ ] Otimização de queries
- [ ] Cache de dados
- [ ] Lazy loading

## APIs Principais

### Autenticação
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout

### Entregas
- `GET /deliveries` - Listar entregas
- `POST /deliveries` - Criar entrega
- `GET /deliveries/:id` - Detalhes da entrega
- `PUT /deliveries/:id/status` - Atualizar status
- `POST /deliveries/:id/accept` - Aceitar entrega

### Usuários
- `GET /users/profile` - Perfil do usuário
- `PUT /users/profile` - Atualizar perfil
- `POST /users/upload-avatar` - Upload de avatar

## Considerações Técnicas

### Performance
- Implementar cache Redis para consultas frequentes
- Otimizar queries do banco de dados
- Implementar paginação em todas as listas
- Usar lazy loading para componentes pesados

### Segurança
- Implementar rate limiting
- Validar todas as entradas com Zod
- Usar HTTPS em produção
- Implementar CORS adequadamente
- Sanitizar dados de entrada

### Monitoramento
- Integrar Sentry para error tracking
