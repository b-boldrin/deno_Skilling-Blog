## Skills Collection

Collection para gerenciamento de skills agênticas de usuários. Permite criar, consultar, atualizar e excluir skills, além de listar skills públicas disponíveis para todos.

---

## Autenticação

A maioria dos endpoints exige autenticação via **Bearer Token**. O token é obtido após o login e deve ser armazenado na variável ou enviado no header `Authorization`.

| Endpoint      | Path                  | Method  | Autenticação                          |
| ------------- | --------------------- | ------- | ------------------------------------- |
| List Public   | `/skills/public`      | GET     | Não requerida                         |
| List Own      | `/skills`             | GET     | Bearer Token                          |
| Find By Id    | `/skills?skillId=$id` | GET     | Opcional (Obrigatória se for privada) |
| Create        | `/skills`             | POST    | Bearer Token                          |
| Update        | `/skills`             | PATCH   | Bearer Token                          |
| Delete        | `/skills`             | DELETE  | Bearer Token                          |

---

## Endpoints — Skills

### `GET /skills/public` — List Public Skills

Retorna todas as skills públicas da plataforma, paginadas. Não requer autenticação.

**Query Parameters:**

| Parâmetro | Tipo   | Obrigatório | Descrição                      |
| --------- | ------ | ----------- | ------------------------------ |
| `page`    | number | Não         | Número da página (padrão: `1`) |

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Skills Encontradas:",
  "data": [
    {
      "_id": "6aec6fff9ccc05ebced5ee1c",
      "title": "My First Skill",
      "tags": ["dev"],
      "author": {
        "_id": "6aeb6d83ee98859ad87bf216",
        "username": "b-boldrin"
      },
      "isPublic": true,
      "updatedAt": "2026-11-05T12:01:03.717Z"
    }
  ]
}
```

---

### `GET /skills` — List Own Skills

Retorna as skills do usuário autenticado. Aceita paginação e um filtro opcional por ID.

**Query Parameters:**

| Parâmetro | Tipo   | Obrigatório | Descrição                          |
| --------- | ------ | ----------- | ---------------------------------- |
| `page`    | number | Não         | Número da página (padrão: `1`)     |
| `skillId` | string | Não         | Filtra o resultado por ID da skill |

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Skills Encontradas:",
  "data": [
    {
      "_id": "6aec6fff9ccc05ebced5ee1c",
      "title": "My First Skill",
      "tags": ["dev"],
      "author": "6aeb6d83ee98859ad87bf216",
      "isPublic": true,
      "updatedAt": "2026-11-05T12:01:03.717Z"
    }
  ]
}
```

**Resposta 401:** `401 Unauthorized`

```json
{
  "success": false,
  "code": 401,
  "status": "UNAUTHORIZED",
  "message": "Token expirado"
}
```

---

### `GET /skills?skillId=$id` — Find Skill By Id

Busca uma skill específica pelo seu ID, usando o parâmetro `skillId`.

**Query Parameters:**

| Parâmetro | Tipo   | Obrigatório | Descrição        |
| --------- | ------ | ----------- | ---------------- |
| `skillId` | string | Sim         | ID da skill alvo |

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Skill Encontrada:",
  "data": {
    "_id": "6aecc447e2fccab91371bd2c",
    "tags": [
      "dev",
      "joke"
    ],
    "title": "My First Skill",
    "content": "Tell the user a short, clever programming joke. Keep it light and fun",
    "author": "6aecc447e2fccab91371bd2b",
    "isPublic": true,
    "createdAt": "2026-11-05T18:00:39.522Z",
    "updatedAt": "2026-11-05T18:00:39.522Z",
    "__v": 0
  }
}
```

**Resposta 401:** `401 Unauthorized`

```json
{
  "success": false,
  "code": 401,
  "status": "UNAUTHORIZED",
  "message": "Você não tem permissão para acessar essa skill"
}
```

**Resposta 404:** `404 Not Found`

```json
{
  "success": false,
  "code": 404,
  "status": "NOT_FOUND",
  "message": "Id não é valido",
  "errors": {
    "received": "6aedb36690fa734c97b023fa"
  }
}
```

---

### `POST /skills` — Create

Cria uma nova skill para o usuário autenticado.

**Request Body (JSON):**

```json
{
  "title": "Nome da skill",
  "content": "Conteúdo ou descrição da skill",
  "isPublic": true,
  "tags": ["dev"]
}
```

| Campo      | Tipo    | Obrigatório | Descrição                              |
| ---------- | ------- | ----------- | -------------------------------------- |
| `title`    | string  | Sim         | Título da skill                        |
| `content`  | string  | Sim         | Conteúdo/instrução da skill            |
| `isPublic` | boolean | Não         | Define se a skill é pública ou privada |
| `tags`     | array   | Sim         | Lista de tags para categorização       |

**Resposta 201:** `201 Created`

```json
{
  "status": "CREATED",
  "code": 201,
  "success": true,
  "message": "Skill criada com sucesso!",
  "data": {
    "tags": [
      "Dev"
    ],
    "title": "My Best Skill",
    "content": "Tell the user a short, clever programming joke. Keep it light and fun.",
    "author": "6aeb6d83ee98859ad87bf216",
    "isPublic": true,
    "_id": "6aedd631acf43b693f7a5a44",
    "createdAt": "2026-11-06T13:29:21.299Z",
    "updatedAt": "2026-11-06T13:29:21.299Z",
    "__v": 0
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
        "field": "tags",
        "message": "O campo tags é obrigatório"
      }
    ],
    "expected_format": {
      "title": "Titulo da Minha Skill",
      "content": "Conteúdo que será repassado para o agente",
      "isPublic": "true or false",
      "tags": [
        "desenvolvimento"
      ]
    },
    "received": {
      "title": "My Best Skill",
      "content": "Tell the user a short, clever programming joke. Keep it light and fun."
    }
  }
}
```

---

### `PATCH /skills` — Update Skill

Atualiza os dados de uma skill existente. O campo `_id` identifica qual skill será alterada.

**Request Body (JSON):**

```json
{
  "_id": "6aec74934afb1e5805309188",
  "title": "Novo título",
  "content": "Novo conteúdo",
  "isPublic": true,
  "tags": ["dev"]
}
```

| Campo      | Tipo    | Obrigatório | Descrição                    |
| ---------- | ------- | ----------- | ---------------------------- |
| `_id`      | string  | Sim         | ID da skill a ser atualizada |
| `title`    | string  | Não         | Novo título da skill         |
| `content`  | string  | Não         | Novo conteúdo da skill       |
| `isPublic` | boolean | Não         | Visibilidade da skill        |
| `tags`     | array   | Não         | Novas tags                   |

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Skill Editada com sucesso",
  "data": {
    "acknowledged": true,
    "modifiedCount": 1,
    "upsertedId": null,
    "upsertedCount": 0,
    "matchedCount": 1
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
  "errors": [
    {
      "field": "_id",
      "message": "O campo _id é obrigatório"
    }
  ]
}
```

**Resposta 404:** `404 Not Found`

```json
{
  "success": false,
  "code": 404,
  "status": "NOT_FOUND",
  "message": "Id não é valido",
  "errors": {
    "expected_format": {
      "_id": "Id da Skill"
    },
    "received": {
      "_id": "6aedd650acf43dsdsb693f7a5a45",
      "title": "New Title",
      "content": "Tell the user a short, clever programming joke. Keep it light and fun.",
      "isPublic": true,
      "tags": [
        "dev"
      ]
    }
  }
}
```

---

### `DELETE /skills` — Delete Skill

Remove uma skill pelo seu ID.

**Request Body (JSON):**

```json
{
  "_id": "6aec6fff9ccc05ebced5ee1c"
}
```

| Campo | Tipo   | Obrigatório | Descrição                  |
| ----- | ------ | ----------- | -------------------------- |
| `_id` | string | Sim         | ID da skill a ser excluída |

**Resposta 200:** `200 Ok`

```json
{
  "status": "OK",
  "code": 200,
  "success": true,
  "message": "Skill deletada",
  "data": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
```

**Resposta 400:** `400 Bad Request`

```json
{
  "success": false,
  "code": 400,
  "status": "BAD_REQUEST",
  "message": "Id não é valido",
  "errors": {
    "expected_format": {
      "_id": "Id da Skill"
    },
    "received": {
      "_id": "dsda/;gkldfhgdfuhvjcxnjczxnk"
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
  "message": "Skill não encontrada",
  "errors": {
    "expected_format": {
      "_id": "Id da Skill"
    },
    "received": {
      "_id": "6aedd650acf43b693f7a5a45",
      "authorId": "6aeb6d83ee98859ad87bf216"
    }
  }
}
```
