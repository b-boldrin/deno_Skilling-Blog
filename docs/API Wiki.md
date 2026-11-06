# API WIKI

Caso prefira a visualização via Postman, temos a nossa exportação da API para ele [Postman Collections](./API/postman-docs.json)

> OBS: É recomendado não levar o postman como fonte da verdade, a wiki mais atual é a [API Wiki](./API%20Wiki.md), o postman é apenas um facilitador

No geral temos as seguintes rotas no servidor: 

#### Autenticação (`/login`)

| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/login` | Autentica o usuário e retorna um token JWT (expira em 15m). | Não |

#### Usuários (`/users`)

| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/users` | Cadastra um novo usuário e cria automaticamente sua primeira skill pública (*"My First Skill"*). | Não |
| `GET` | `/users` | Lista os usernames cadastrados (paginado). | Sim |
| `PATCH` | `/users` | Atualiza a senha do usuário autenticado (exige senha atual e nova senha diferente). | Sim |
| `DELETE` | `/users` | Exclui a conta do usuário autenticado e remove todas as suas skills em cascata (transação). | Sim |

#### Skills (`/skills`)

| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/skills/public` | Lista todas as skills públicas com paginação (`?page=1`). | Não |
| `GET` | `/skills` | Lista as skills do usuário autenticado (`?page=1`) ou busca uma skill específica (`?skillId=<ObjectId>`). Skills privadas só são retornadas ao próprio autor. | Sim |
| `POST` | `/skills` | Cria uma nova skill vinculada ao usuário autenticado. | Sim |
| `PATCH` | `/skills` | Atualiza título, conteúdo, tags ou visibilidade (`isPublic`) de uma skill do autor. | Sim |
| `DELETE` | `/skills` | Remove uma skill pertencente ao usuário autenticado. | Sim |

---



### Collections

Nossa API é dividida entre Users e Skills schemas/modelos que atuam como `Collections`, para facilitar a visualização foi divido entre 2 arquivos suas implementações

#### [Users Collections](./API/Users%20Collections.md)

#### [Skills Collections](./API/Skills%20Collections%20copy.md)

> Relembrando o Token JWT é adquirido pela autenticação do usuário (Users Collection)