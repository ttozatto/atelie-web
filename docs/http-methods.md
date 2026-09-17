# Métodos HTTP disparados pela interface

Cada método HTTP exigido (GET, POST, PUT e DELETE) é disparado por uma tela da
`atelie-web` contra a `atelie-api`. Todas as chamadas passam por um único cliente,
[`src/lib/api.ts`](../src/lib/api.ts), que escolhe a URL da API conforme o código rode no
servidor do Next (`API_INTERNAL_URL`) ou no navegador (`NEXT_PUBLIC_API_URL`).

## Resumo

| Método | Tela | Rota da API | Onde a chamada é feita |
| --- | --- | --- | --- |
| `GET` | `/` — galeria | `GET /api/photos?is_published=true&q=…&category=…` | Servidor do Next |
| `GET` | `/obra/[id]` — página da obra | `GET /api/photos/{id}` | Servidor do Next |
| `GET` | `/cadastro` — ao sair do campo CEP | `GET /api/cep/{cep}` | Navegador |
| `GET` | `/admin` — tabela de obras | `GET /api/photos?limit=100` | Navegador |
| `POST` | `/cadastro` — botão "Enviar cadastro" | `POST /api/customers` | Navegador |
| `POST` | `/admin` — botão "Cadastrar obra" | `POST /api/photos` (multipart) | Navegador |
| `PUT` | `/admin` — "Editar" → "Salvar" na linha | `PUT /api/photos/{id}` (multipart) | Navegador |
| `DELETE` | `/admin` — "Excluir" → confirmar "Excluir" | `DELETE /api/photos/{id}` | Navegador |

## GET

### `/` — galeria

- **Tela:** grade das obras publicadas, com busca por texto e filtro por categoria.
- **Chamada:** `listPhotos()` em [`src/lib/photos.ts`](../src/lib/photos.ts), usada por
  [`src/app/page.tsx`](../src/app/page.tsx).
- **Como disparar:** abrir a galeria, buscar um termo ou clicar numa categoria. A busca é
  um formulário `GET` na própria página (`/?q=serra&category=paisagem`), e cada busca gera
  uma nova chamada à API.

### `/obra/[id]` — página da obra

- **Tela:** foto grande, descrição, formatos e preço em BRL.
- **Chamada:** `getPhoto()` em [`src/lib/photos.ts`](../src/lib/photos.ts), usada por
  [`src/app/obra/[id]/page.tsx`](../src/app/obra/[id]/page.tsx).
- **Como disparar:** clicar em qualquer obra da galeria.

### `/cadastro` — consulta de CEP

- **Tela:** formulário de cliente.
- **Chamada:** `lookupCep()` em [`src/lib/customers.ts`](../src/lib/customers.ts), usada por
  [`src/components/CustomerForm.tsx`](../src/components/CustomerForm.tsx).
- **Como disparar:** digitar um CEP de 8 dígitos e sair do campo (Tab). A tela preenche
  rua, bairro, cidade e UF e leva o foco para "Número". A API consulta o ViaCEP; o
  navegador nunca fala com ele.

### `/admin` — tabela de obras

- **Tela:** painel com a tabela de todas as obras, publicadas ou não.
- **Chamada:** `listPhotos()`, usada por
  [`src/components/AdminPanel.tsx`](../src/components/AdminPanel.tsx).
- **Como disparar:** abrir `/admin`. Não precisa de token.

## POST

### `/cadastro` — cadastro de cliente

- **Chamada:** `createCustomer()` em [`src/lib/customers.ts`](../src/lib/customers.ts), com
  corpo JSON.
- **Como disparar:** preencher o formulário e clicar em **Enviar cadastro**. Um e-mail já
  cadastrado responde `409`, e a tela mostra "Já existe um cadastro com este e-mail".

### `/admin` — nova obra

- **Chamada:** `createPhoto()` em [`src/lib/photos.ts`](../src/lib/photos.ts), com corpo
  `multipart/form-data` (imagem + metadados) e header `X-Admin-Token`. Usada por
  [`src/components/NewPhotoForm.tsx`](../src/components/NewPhotoForm.tsx).
- **Como disparar:** colar o token no topo do painel, escolher a imagem (aparece o preview
  local), preencher os campos e clicar em **Cadastrar obra**.

## PUT

### `/admin` — edição inline

- **Chamada:** `updatePhoto()` em [`src/lib/photos.ts`](../src/lib/photos.ts), com corpo
  `multipart/form-data` e header `X-Admin-Token`. Usada por
  [`src/components/AdminPhotoRow.tsx`](../src/components/AdminPhotoRow.tsx).
- **Como disparar:** com o token informado, clicar em **Editar** numa linha da tabela,
  alterar os campos que abrem na própria linha e clicar em **Salvar**.

## DELETE

### `/admin` — exclusão com confirmação

- **Chamada:** `deletePhoto()` em [`src/lib/photos.ts`](../src/lib/photos.ts), com header
  `X-Admin-Token`. Usada por
  [`src/components/AdminPhotoRow.tsx`](../src/components/AdminPhotoRow.tsx).
- **Como disparar:** com o token informado, clicar em **Excluir** numa linha e confirmar em
  **Excluir** na pergunta "Excluir obra e imagem?". A API apaga o registro e o arquivo.

## Como observar as chamadas

- **Chamadas do navegador** (`/cadastro` e `/admin`): DevTools → aba **Network**, filtro
  **Fetch/XHR**. Aparecem com o método, a URL da API e o status.
- **Chamadas do servidor do Next** (`/` e `/obra/[id]`): não aparecem na aba Network,
  porque saem do contêiner `web` direto para a API pela rede interna do Docker. Aparecem
  no log da API:

  ```bash
  docker compose logs -f api
  ```
