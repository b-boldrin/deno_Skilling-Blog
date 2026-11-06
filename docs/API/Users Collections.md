## Users Collection

Collection para gerenciamento de usuários. Permite criar, listar, atualizar e excluir perfis.

| Endpoint        | Path     | Method | Autenticação  |
| --------------- | -------- | ------ | ------------- |
| Sign Up         | `/users` | POST   | Não requerida |
| Sign In         | `/login` | POST   | Não requerida |
| List Users      | `/users` | GET    | Não requerida |
| Change Password | `/users` | PATCH  | Bearer Token  |
| Delete Himself  | `/users` | DELETE | Bearer Token  |

---

## Endpoints — Users

### `GET /users` — List Users

Retorna os usernames dos usuários criados na collection.

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Usuários Encontrados:",
  "data": [
    {
      "username": "bbruno-boldrin"
    },
    {
      "username": "bruno-boldrin"
    },
    {
      "username": "b-boldrin"
    }
  ]
}
```

---

### `POST /users` — Sign Up

Cria a conta do usuário na collection.

**Request Body (JSON):**

```json
{
  "username": "b-boldrin",
  "email": "endereco@email.com",
  "password": "passwd"
}
```

| Campo      | Tipo   | Obrigatório | Descrição      |
| ---------- | ------ | ----------- | -------------- |
| `username` | string | Sim         | Nome do Perfil |
| `email`    | string | Sim         | Email          |
| `password` | string | Sim         | Senha          |

**Resposta 201:** `201 Created`

```json
{
  "status": "CREATED",
  "code": 201,
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "_id": "6aede3874ee5f3509cc6e06b",
    "username": "b-boldrin",
    "email": "endereco@email.com"
  }
}
```

**Resposta 400:** `400 Bad Request`

```json
{
  "success": false,
  "code": 400,
  "status": "BAD_REQUEST",
  "message": "Erro de validação",
  "errors": {
    "errors": [
      {
        "field": "email",
        "message": "O campo email é obrigatório"
      },
      {
        "field": "password",
        "message": "O campo password é obrigatório"
      }
    ],
    "expected_format": {
      "username": "seuNickName",
      "email": "endereco@email.com",
      "password": "passwd"
    },
    "received": {
      "username": "b-boldrin"
    }
  }
}
```

**Resposta 409:** `409 Conflict`

```json
{
  "success": false,
  "code": 409,
  "status": "CONFLICT",
  "message": "E-mail ou username já cadastrado",
  "errors": {
    "received": {
      "username": "b-boldrin",
      "email": "endereco@email.com"
    }
  }
}
```

---

### `POST /login` — Sign In

Entra na conta do usuário na collection (Retorna um Token).

**Request Body (JSON):**

```json
{
  "username": "b-boldrin",
  "email": "endereco@email.com",
  "password": "passwd"
}
```

| Campo      | Tipo   | Obrigatório | Descrição      |
| ---------- | ------ | ----------- | -------------- |
| `username` | string | Sim         | Nome do Perfil |
| `email`    | string | Sim         | Email          |
| `password` | string | Sim         | Senha          |

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZWRlMzg3NGVlNWYzNTA5Y2M2ZTA2YiIsImlhdCI6MTc5Mzk3NjYxNCwiZXhwIjoxNzkzOTc3NTE0fQ.BIz-AwuW4sLMLZDz-nCinfXUcBQHran_NhJfsS_y0fo"
  }
}
```

**Resposta 400:** `400 Bad Request`

```json
{
  "success": false,
  "code": 400,
  "status": "BAD_REQUEST",
  "message": "Erro de validação",
  "errors": {
    "errors": [
      {
        "field": "password",
        "message": "O campo password é obrigatório"
      }
    ],
    "expected_format": {
      "username": "seuNickName",
      "email": "endereco@email.com",
      "password": "passwd"
    },
    "received": {
      "username": "b-boldrin",
      "email": "endereco@email.com"
    }
  }
}
```

**Resposta 401:** `401 Unauthorized`

```json
{
  "success": false,
  "code": 401,
  "status": "UNAUTHORIZED",
  "message": "Credenciais inválidas"
}
```

---

### `PATCH /users` — Change Password

Permite atualizar a senha do usuário por uma nova.

**Request Body (JSON):**

```json
{
  "email": "endereco@email.com",
  "password": "senhaAntiga",
  "newPassword": "senhaNova"
}
```

| Campo         | Tipo   | Obrigatório | Descrição        |
| ------------- | ------ | ----------- | ---------------- |
| `email`       | string | Sim         | Email do usuário |
| `password`    | string | Sim         | Senha antiga     |
| `newPassword` | string | Sim         | Senha nova       |

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Senha atualizada com sucesso"
}
```

**Resposta 400:** `400 Bad Request`

```json
{
  "success": false,
  "code": 400,
  "status": "BAD_REQUEST",
  "message": "A senha antiga não confere",
  "errors": {
    "received": {
      "password": "passwd",
      "newPassword": "senhaNova"
    }
  }
}
```

**Resposta 404:** `404 Not Found`

```json
{
  "success": false,
  "code": 404,
  "status": "NOT_FOUND",
  "message": "Usuário não encontrado",
  "errors": {
    "expected_format": {
      "email": "endereco@email.com",
      "password": "senhaAntiga",
      "newPassword": "senhaNova"
    },
    "received": {
      "email": "enderecoNaoExistente@email.com",
      "password": "passwd",
      "newPassword": "senhaNova"
    }
  }
}
```

---

### `DELETE /users` — Delete User Account

Remove a conta do usuário junto com todas as skills atreladas a ele.

**Não requer Request Body (JSON).**

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Usuário deletado com sucesso",
  "data": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
```

**Resposta 404:** `404 Not Found`

```json
{
  "success": false,
  "code": 404,
  "status": "NOT_FOUND",
  "message": "Usuário não encontrado",
  "errors": {
    "received": {
      "_id": "6aede3874ee5f3509cc6e06b"
    },
    "possible_resolution": "Verifique se o Token foi expirado"
  }
}
```