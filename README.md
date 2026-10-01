# Forum API

API REST de um fórum (usuários, perguntas e respostas) construída com NestJS, Prisma e SQLite, com autenticação via JWT — projeto de estudo de back-end.

## Objetivo de aprendizado

Praticar os fundamentos do NestJS a partir de um caso real: organização em módulos, injeção de dependência, DTOs com validação, pipes, guards e autenticação JWT, além de persistência com Prisma (relações, joins e tratamento de erros do banco).

## Stack e dependências principais

| Tecnologia | Uso |
|---|---|
| [NestJS 11](https://docs.nestjs.com) | Framework (módulos, controllers, providers, pipes, guards) |
| TypeScript | Linguagem |
| [Prisma 7](https://www.prisma.io/docs) + SQLite | ORM, com adapter `@prisma/adapter-better-sqlite3` (driver adapters) |
| `@nestjs/jwt` | Emissão e verificação de tokens JWT |
| `bcrypt` | Hash de senha |
| `class-validator` + `class-transformer` | Validação e transformação de DTOs |
| `@nestjs/mapped-types` | `PartialType` para gerar DTOs de update |
| `@nestjs/swagger` | Documentação OpenAPI interativa (UI em `/docs`, JSON em `/docs-json`), com plugin do CLI inferindo os schemas dos DTOs |
| Jest + Supertest | Testes unitários e e2e |
| `dotenv` | Leitura do `.env` |

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env
# preencha:
# DATABASE_URL="file:./dev.db"   (SQLite)
# SECRET_KEY=<chave para assinar o JWT>

# 3. Criar o banco e o client Prisma
npx prisma migrate dev
npx prisma generate   # client gerado em src/generated/prisma

# 4. Rodar
npm run start:dev     # modo watch em http://localhost:3000
# Docs interativas (Swagger): http://localhost:3000/docs — JSON em /docs-json

# Testes
npm run test          # unitários
npm run test:e2e      # e2e
npm run test:cov      # com cobertura

# Qualidade
npm run lint
npm run format
```

## Estrutura de pastas

```text
src/
├── main.ts                        # bootstrap: app + ValidationPipe global + porta via env
├── app.module.ts                  # módulo raiz (importa todos os módulos de feature)
├── auth/
│   ├── auth.module.ts             # JwtModule (global), AuthGuard, forwardRef com UserModule
│   ├── auth.controller.ts         # POST /auth/signin
│   ├── auth.service.ts            # valida credenciais (bcrypt) e assina o JWT
│   └── auth.guard.ts              # guard de Bearer token; anexa o payload em request.sub
├── user/
│   ├── user.module.ts
│   ├── user.controller.ts         # CRUD de usuários (signup, get, patch, delete)
│   ├── user.service.ts            # hash de senha, tratamento de e-mail duplicado (P2002)
│   ├── dto/                       # CreateUserDto (class-validator), UpdateUserDto (PartialType)
│   └── entities/user.entity.ts    # espelho do model User do Prisma
├── questions/
│   ├── questions.module.ts
│   ├── questions.controller.ts    # CRUD de perguntas (protegido por AuthGuard)
│   ├── questions.service.ts       # consultas com include (respostas + autor)
│   ├── dto/                       # Create/UpdateQuestionDto
│   └── entities/question.entity.ts
├── answers/
│   ├── answers.module.ts
│   ├── answers.controller.ts      # CRUD de respostas (POST recebe :questionId na rota)
│   ├── answers.service.ts         # criação com connect (relações), 404 no update/delete (P2025)
│   ├── dto/                       # Create/UpdateAnswerDto
│   └── entities/answer.entity.ts
├── database/
│   ├── database.module.ts         # fornece e exporta o PrismaService
│   └── prisma.service.ts          # PrismaClient com adapter Better SQLite3
├── validationSchemas/
│   └── validation.pipe.ts         # ValidationPipe escrito à mão (exercício; não está em uso)
└── generated/prisma/              # client gerado (output customizado, moduleFormat cjs)
prisma/
├── schema.prisma                  # models: User, Questions, Answers
└── migrations/                    # migração inicial
test/
└── app.e2e-spec.ts                # teste e2e (boilerplate do Nest CLI)
```

## O que foi aprendido

| Conceito | O que foi feito | Arquivo(s) |
|---|---|---|
| Módulos | Módulo raiz agregando 5 módulos de feature/domínio | `src/app.module.ts` |
| Dependência circular entre módulos | `AuthModule` ↔ `UserModule` resolvido com `forwardRef()` | `src/auth/auth.module.ts`, `src/user/user.module.ts` |
| Controllers e rotas | Controllers REST com `@Get/@Post/@Patch/@Delete` e prefixo por recurso | `src/*/**.controller.ts` |
| Providers e injeção de dependência | Services injetados nos controllers; `PrismaService` injetado em todos os services | `src/user/user.service.ts`, `src/questions/questions.service.ts`, etc. |
| Módulo de infraestrutura | `DatabaseModule` fornece/exporta o `PrismaService` para os demais módulos | `src/database/database.module.ts` |
| Custom provider (token) | `ValidationPipe` global registrado via token `APP_PIPE` | `src/app.module.ts` |
| DTOs com validação | `class-validator` (`@IsEmail`, `@IsNotEmpty`, `@Length`...) no DTO de criação | `src/user/dto/createUser.dto.ts`, `src/answers/dto/create-answer.dto.ts` |
| DTOs de update | `PartialType` para derivar todos os campos como opcionais | `src/*/dto/update-*.dto.ts` |
| Pipes de transformação | `ParseIntPipe` para converter/validar `:id` numérico | `src/user/user.controller.ts`, `src/questions/questions.controller.ts` |
| ValidationPipe customizado | Pipe escrito à mão com `class-validator` + `plainToInstance`, retornando os erros de validação | `src/validationSchemas/validation.pipe.ts` (não registrado — ver melhorias) |
| Guards | `AuthGuard` implementando `CanActivate`, extração do header `Authorization: Bearer` | `src/auth/auth.guard.ts` |
| Autenticação JWT | `JwtModule` global (`SECRET_KEY`, expiração 86400s), signin com `bcrypt.compare`, payload `{ sub: user.id }` | `src/auth/auth.module.ts`, `src/auth/auth.service.ts` |
| Hash de senha | `bcrypt.hash` com 10 rounds no cadastro | `src/user/user.service.ts` |
| Acesso ao request | `@Request()` para ler o `userId` do payload do token (`req.sub.sub`) | `src/questions/questions.controller.ts`, `src/answers/answers.controller.ts` |
| Controle de status HTTP | `@HttpCode(HttpStatus.OK)` no signin (POST retornando 200) | `src/auth/auth.controller.ts` |
| Prisma: schema e relações | Models `User → Questions → Answers` (1:N) com `@relation` | `prisma/schema.prisma` |
| Prisma: joins | `include` de respostas + `select` parcial do autor nas queries de perguntas | `src/questions/questions.service.ts` |
| Prisma: relações na criação | `connect` para vincular usuário e pergunta ao criar resposta | `src/answers/answers.service.ts` |
| Prisma: tratamento de erros | `P2002` (e-mail único) → 409; `P2025` (registro inexistente) → 404 | `src/user/user.service.ts`, `src/answers/answers.service.ts` |
| Driver adapters | PrismaClient estendido com adapter Better SQLite3 | `src/database/prisma.service.ts` |
| Configuração do Prisma | `prisma.config.ts` com URL do datasource via env; client gerado em pasta customizada | `prisma.config.ts`, `prisma/schema.prisma` |
| Migrações | Migração inicial versionada em `prisma/migrations` | `prisma/migrations/` |
| Entidades | Classes espelhando os models do Prisma para tipar as respostas | `src/*/entities/*.entity.ts` |
| Testes (estrutura) | Specs unitários por controller/service/guard e e2e com Supertest (boilerplate do CLI) | `src/**/*.spec.ts`, `test/app.e2e-spec.ts` |
| Swagger/OpenAPI | `DocumentBuilder` + `SwaggerModule` servindo UI em `/docs` e JSON em `/docs-json`; `@ApiTags` por controller e `@ApiBearerAuth()` nas rotas com guard; plugin do CLI (`nest-cli.json`) inferindo tipos e validators dos DTOs sem `@ApiProperty` manual | `src/main.ts`, `nest-cli.json`, `src/*/**.controller.ts` |

## Endpoints

Base: `http://localhost:3000`. Rotas marcadas com 🔒 exigem o header `Authorization: Bearer <token>` (token obtido no signin).

### Auth

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/signin` | Autentica e retorna o token JWT |

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{ "email": "ana@email.com", "password": "senha123" }'
# 200 { "access_token": "eyJhbGciOi..." }
```

### Users

| Método | Rota | Descrição |
|---|---|---|
| POST | `/user` | Cria usuário (senha hasheada com bcrypt; e-mail duplicado → 409) |
| GET 🔒 | `/user/:id` | Busca usuário por id (sem retornar a senha) |
| PATCH 🔒 | `/user/:id` | Atualização parcial |
| DELETE 🔒 | `/user/:id` | Remove usuário |

```bash
# Cadastro
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{ "email": "ana@email.com", "name": "Ana", "password": "senha123" }'

# Busca (autenticado)
curl http://localhost:3000/user/1 -H "Authorization: Bearer $TOKEN"

# Atualização parcial
curl -X PATCH http://localhost:3000/user/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "name": "Ana Souza" }'
```

### Questions

| Método | Rota | Descrição |
|---|---|---|
| POST 🔒 | `/questions` | Cria pergunta (`userId` vem do token, não do body) |
| GET 🔒 | `/questions` | Lista perguntas com respostas e autor (nome/e-mail) |
| GET 🔒 | `/questions/:id` | Detalhe de uma pergunta |
| PATCH 🔒 | `/questions/:id` | Atualização parcial |
| DELETE 🔒 | `/questions/:id` | Remove pergunta |

```bash
curl -X POST http://localhost:3000/questions \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "title": "Como usar guards no NestJS?", "body": "Qual a diferença entre guard e middleware?" }'
```

### Answers

| Método | Rota | Descrição |
|---|---|---|
| POST 🔒 | `/answers/:questionId` | Cria resposta vinculando usuário e pergunta (via `connect`) |
| GET 🔒 | `/answers` | Lista respostas |
| GET | `/answers/:id` | Busca resposta por id (única rota de leitura sem guard) |
| PATCH 🔒 | `/answers/:id` | Atualização parcial (id inexistente → 404) |
| DELETE 🔒 | `/answers/:id` | Remove resposta (id inexistente → 404) |

```bash
curl -X POST http://localhost:3000/answers/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{ "body": "Guards rodam antes do handler e decidem se a rota executa." }'
```

## Decisões de arquitetura e boas práticas

- **Organização por domínio**: cada recurso (`user`, `questions`, `answers`, `auth`) é um módulo com controller + service + DTOs + entities, seguindo a convenção do NestJS.
- **PrismaService como único ponto de acesso ao banco**: estendido de `PrismaClient` com o adapter Better SQLite3 e exportado por um módulo dedicado, evitando instanciar o client em cada service.
- **Tipagem vinda do Prisma**: services usam os tipos gerados (`Prisma.UserCreateInput`, `Prisma.UserWhereUniqueInput`), mantendo contrato com o schema.
- **`userId` nunca vem do cliente**: em perguntas e respostas, o autor é extraído do payload do JWT no guard, não do body.
- **Erros de banco traduzidos para HTTP**: violação de unique (`P2002`) vira `409 Conflict` e registro inexistente (`P2025`) vira `404`, em vez de vazar erro de infraestrutura.
- **Senha nunca exposta**: hash com bcrypt no cadastro e `select` no Prisma para omitir o campo na consulta de usuário.
- **Validação na borda**: `ValidationPipe` global garante que os DTOs sejam validados antes de chegar ao controller.

## Pontos de melhoria / próximos passos de estudo

- **Consolidar a estratégia de validação**: hoje o `ValidationPipe` é registrado duas vezes (`main.ts` e `APP_PIPE` em `app.module.ts`), o `user.controller.ts` ainda instancia o pipe inline no `@Body`, e o pipe customizado de `src/validationSchemas/` não está registrado em lugar nenhum. Escolher uma abordagem (sugestão: global com `whitelist: true` + `forbidNonWhitelisted: true`) e registrar o pipe customizado como exercício.
- **Validar os DTOs de questions**: `CreateQuestionDto` não tem decorators (`@IsNotEmpty`, `@IsString`), então qualquer payload passa. Além disso, `@IsAlpha()` na senha de `CreateUserDto` rejeita senhas com números/símbolos.
- **Hash de senha também no update**: `updateUser` grava `data` direto no Prisma — um `PATCH` com `password` salvaria a senha em texto puro.
- **Autorização (além de autenticação)**: qualquer usuário autenticado consegue editar/excluir perguntas, respostas e usuários de terceiros. Próximo passo natural: checagem de ownership (ou RBAC com `@Roles()` + `RolesGuard`).
- **Atualizar os testes**: os specs são o boilerplate "should be defined" e o e2e ainda espera `GET /` retornando "Hello World!" (rota que não existe). Cobrir signin, criação de pergunta/resposta e os cenários 404/409.
- **Estudar em seguida**: `@nestjs/config` (hoje as envs são lidas via `process.env` + dotenv direto), exception filters globais, interceptors (ex.: `ClassSerializerInterceptor` para omitir a senha sem `select` manual), autorização com `@Roles()` + `RolesGuard` e paginação nas listagens.
