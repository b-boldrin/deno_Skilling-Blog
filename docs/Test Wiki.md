### Cenários Cobertos

**Como rodar os testes?**

Execute o comando:

```bash
deno task test
```



### Cenários Cobertos

Aqui está uma lista dos cenários cobertos ao realizar o comando de teste
 
**AuthController**
* `POST /login` — Autenticação com sucesso e retorno do token JWT (`200`).
* `POST /login` — Rejeição por ausência de e-mail (`400`).
* `POST /login` — Rejeição por ausência de senha (`400`).
* `POST /login` — Rejeição por e-mail não cadastrado (`401`).
* `POST /login` — Rejeição por senha incorreta (`401`).

---

**SkillPublicController**
* `GET /skills/public` — Listagem de skills públicas (`200`).
* `GET /skills/public` — Rejeição de paginação não numérica (`?page=abc`) (`400`).
* `GET /skills/public` — Rejeição de página menor que 1 (`?page=0`) (`400`).

---

**SkillController**
* `GET /skills` — Listagem das skills do usuário autenticado (`200`).
* `GET /skills` — Rejeição de paginação inválida (`?page=0`) (`400`).
* `GET /skills` — Encaminhamento via `next('route')` quando `skillId` não é informado.
* `GET /skills` — Rejeição de `skillId` com formato inválido (`404`).
* `GET /skills` — Rejeição de `skillId` inexistente no banco (`404`).
* `GET /skills` — Retorno direto de skill pública por ID (`200`).
* `GET /skills` — Armazenamento de skill privada em `res.locals.targetSkill` e encaminhamento via `next('route')`.
* `GET /skills` — Retorno de skill privada quando o usuário autenticado é o autor (`200`).
* `GET /skills` — Bloqueio de acesso a skill privada de outro usuário (`401`).
* `POST /skills` — Criação de skill com sucesso (`201`).
* `POST /skills` — Rejeição por ausência de `title`, `content`, `tags` ou `tags: []` (`400`).
* `PATCH /skills` — Atualização de skill com sucesso (`200`).
* `PATCH /skills` — Rejeição por `_id` inválido (`404`).
* `PATCH /skills` — Rejeição por skill inexistente (`404`).
* `DELETE /skills` — Exclusão de skill com sucesso (`200`).
* `DELETE /skills` — Rejeição por `_id` inválido (`400`).
* `DELETE /skills` — Rejeição por skill inexistente (`404`).
* `GET /users` — Listagem de usuários (`200`).
* `POST /users` — Criação de usuário e geração automática da skill inicial (`201`).
* `POST /users` — Rejeição por usuário duplicado no repositório (`409`).
* `POST /users` — Rejeição por erro de chave duplicada `11000` do MongoDB (`409`).
* `DELETE /users` — Exclusão do próprio usuário e remoção de suas skills em cascata (`200`).
* `DELETE /users` — Rejeição ao tentar excluir usuário inexistente (`404`).
* `PATCH /users` — Atualização de senha com sucesso (`200`).
* `PATCH /users` — Rejeição por campos obrigatórios ausentes (`400`).
* `PATCH /users` — Rejeição por nova senha igual à senha atual (`400`).
* `PATCH /users` — Rejeição por senha antiga incorreta (`400`).
* `PATCH /users` — Rejeição por usuário inexistente (`404`).