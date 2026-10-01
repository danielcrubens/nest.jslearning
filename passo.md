# passo.md — Como testar os endpoints da Forum API

Base URL: `http://localhost:3000`

Autenticação: **JWT Bearer**. Quase tudo exige o header:

```
Authorization: Bearer <access_token>
```

> O token vem do `POST /auth/signin` e vale para o usuário logado.
> Erros de auth: `401 {"message":"Token is required"}` (sem header) ou `401 {"message":"Token is invalid"}` (token ruim/expirado).

---

## 0. Rodar a app

```bash
npm run start:dev
```

O `.env` precisa de `DATABASE_URL` e `SECRET_KEY` (ver `.env.example`). `SECRET_KEY` assina/valida o JWT.

---

## 1. Criar usuário (signup) — sem auth

`POST /user` — body: `email` (único), `name`, `password` (é hasheada com bcrypt aqui).

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{ "email": "joao@test.com", "name": "João", "password": "123456" }'
```

## 2. Login (gerar token) — sem auth

`POST /auth/signin` — body: `email` e `password` do usuário criado acima.

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{ "email": "joao@test.com", "password": "123456" }'
```

Resposta:

```json
{ "access_token": "eyJhbGciOi..." }
```

Salve o token em uma variável para os próximos testes:

```bash
TOKEN=eyJhbGciOi...   # cole o token aqui
```

- Email inexistente → `404 {"message":"User not found"}`
- Senha errada → `401 {"message":"User not found"}`

---

## 3. Users (todas exigem auth)

```bash
# Buscar por id
curl http://localhost:3000/user/1 -H "Authorization: Bearer $TOKEN"

# Atualizar (PATCH, body parcial)
curl -X PATCH http://localhost:3000/user/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "João Silva" }'

# Deletar
curl -X DELETE http://localhost:3000/user/1 -H "Authorization: Bearer $TOKEN"
```

---

## 4. Questions (todas exigem auth)

`POST /questions` — body: `title` e `body`. O `userId` **vem do token**, não do body.

```bash
# Criar
curl -X POST http://localhost:3000/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Como usar NestJS?", "body": "Qual a melhor forma de estruturar módulos?" }'

# Listar todas (inclui o autor)
curl http://localhost:3000/questions -H "Authorization: Bearer $TOKEN"

# Buscar por id
curl http://localhost:3000/questions/1 -H "Authorization: Bearer $TOKEN"

# Atualizar
curl -X PATCH http://localhost:3000/questions/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Novo título" }'

# Deletar
curl -X DELETE http://localhost:3000/questions/1 -H "Authorization: Bearer $TOKEN"
```

---

## 5. Answers

`POST /answers/:questionId` — o `questionId` vai **na URL**; o body só precisa de `body` (texto). O `userId` vem do token.

```bash
# Criar resposta para a question 1 (auth)
curl -X POST http://localhost:3000/answers/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "body": "Use módulos por domínio!" }'

# Listar todas (auth)
curl http://localhost:3000/answers -H "Authorization: Bearer $TOKEN"

# Buscar por id — ATENÇÃO: essa rota está SEM guard no código, não precisa de token
curl http://localhost:3000/answers/1

# Atualizar (auth)
curl -X PATCH http://localhost:3000/answers/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "body": "Resposta corrigida" }'

# Deletar (auth)
curl -X DELETE http://localhost:3000/answers/1 -H "Authorization: Bearer $TOKEN"
```

---

## Tabela resumo

| Método | Rota | Auth | Body |
|---|---|---|---|
| POST | `/user` | ❌ | `{ email, name, password }` |
| POST | `/auth/signin` | ❌ | `{ email, password }` → `{ access_token }` |
| GET | `/user/:id` | ✅ | — |
| PATCH | `/user/:id` | ✅ | campos parciais do user |
| DELETE | `/user/:id` | ✅ | — |
| POST | `/questions` | ✅ | `{ title, body }` |
| GET | `/questions` | ✅ | — |
| GET | `/questions/:id` | ✅ | — |
| PATCH | `/questions/:id` | ✅ | `{ title?, body? }` |
| DELETE | `/questions/:id` | ✅ | — |
| POST | `/answers/:questionId` | ✅ | `{ body }` |
| GET | `/answers` | ✅ | — |
| GET | `/answers/:id` | ❌ (sem guard) | — |
| PATCH | `/answers/:id` | ✅ | `{ body? }` |
| DELETE | `/answers/:id` | ✅ | — |

## Observações

- **Não há ValidationPipe** global nem decorators de validação nos DTOs — os bodies não são validados, então campos faltantes viram erro do Prisma (`500`), não `400`.
- IDs são numéricos (`/questions/1`); usar string causa erro.
- Criar com email duplicado → erro de unique do Prisma (`500`).
