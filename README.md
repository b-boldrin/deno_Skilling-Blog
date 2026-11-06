# 🦕 Deno Backend - Skilling Blog 📖
![Deno](https://img.shields.io/badge/Deno-000000?style=flat&logo=deno&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white)


### Tecnologias Utilizadas

```text
Base:                        Deno
Framework HTTP:              npm:express
Banco de Dados:              MongoDB       + Mongoose
Autenticação:                jsonwebtoken  + (bcrypt)
Validação de Requisições:    request-check + @zarco/isness
Testes Automatizados:        Deno.test     + @std/assert
Retorno das Requisições:     responser     + throwlhos
Logs:                        npm:morgan
```

### Arquitetura do Projeto (Estilo de Camadas)

```text
src/
└── config/           # Conexão com o Banco de Dados
├── controllers/     # Receptador e Orquestrador das Requisições HTTP
├── services/        # Regras de negócio, única camada com acesso aos repositórios
├── repositories/    # Camada de acesso ao banco de dados
├── models/          # Schemas/Models do Mongoose (User, Skill)
├── middleware/      # Validadores e Autenticadores
├── types/           # Alguns tipos importantes
└── tests/           # Testes Unitários + Mocks
└── routes/          # Caminhos de cada requisição
.env                 # Guarda credenciais do Banco de Dados + JWT Salt
.env.test            # Armazena informações do Banco de Teste + JWT Salt
```

### Pré-Requisitos e Instalação

1. Baixe o Deno
2. Prepare seu Banco de Dados MongoDB (local ou Atlas) - [Acesse MongoDB](https://www.mongodb.com/try/download/community)
3. Configure `.env` e `.env.test`

```env
#.env
mongo_connection_url=mongodb://localhost:27017/skills_db
JWT_SECRET=sua_chave_secreta_super_segura
```
```env
#.env.test
mongo_connection_test_url=mongodb://localhost:27017/skills_db
JWT_SECRET=sua_chave_secreta_super_segura
```

4. Inicie o Servidor Backend
```bash
deno task load
```
> Porta Padrão: 8000

### Endpoints da API
---
Autenticação (`/login`)

| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/login` | Autentica o usuário e retorna um token JWT (expira em 15m). | Não |

Usuários (`/users`)

| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/users` | Cadastra um novo usuário e cria automaticamente sua primeira skill pública (*"My First Skill"*). | Não |
| `GET` | `/users` | Lista os usernames cadastrados (paginado). | Sim |
| `PATCH` | `/users` | Atualiza a senha do usuário autenticado (exige senha atual e nova senha diferente). | Sim |
| `DELETE` | `/users` | Exclui a conta do usuário autenticado e remove todas as suas skills em cascata (transação). | Sim |

Skills (`/skills`)

| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/skills/public` | Lista todas as skills públicas com paginação (`?page=1`). | Não |
| `GET` | `/skills` | Lista as skills do usuário autenticado (`?page=1`) ou busca uma skill específica (`?skillId=<ObjectId>`). Skills privadas só são retornadas ao próprio autor. | Sim |
| `POST` | `/skills` | Cria uma nova skill vinculada ao usuário autenticado. | Sim |
| `PATCH` | `/skills` | Atualiza título, conteúdo, tags ou visibilidade (`isPublic`) de uma skill do autor. | Sim |
| `DELETE` | `/skills` | Remove uma skill pertencente ao usuário autenticado. | Sim |

Para mais informações dos endpoints [API Wiki](./docs/Deno%20API.md)

Se preferir, temos o nosso arquivo [Postman Collections](./API/postman-docs.json)

> OBS: É recomendado não levar o postman como fonte da verdade, a wiki mais atual é a [API Wiki](./API%20Wiki.md), o postman é apenas um facilitador

---

### Testes Automatizados

Para mais informações sobre as rotas testadas [Test Wiki](./docs/Test%20Wiki.md)

Para rodar os testes
```bash
deno task test
```



