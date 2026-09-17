# atelie-web

Interface do catalogo de fotografias em print e quadro. Next.js 15 (App Router),
TypeScript e Tailwind. Este repositorio tambem guarda o `docker-compose.yml` que
sobe o sistema inteiro.

## Status

Etapa 5 concluida: galeria, pagina da obra, cadastro de clientes com CEP e painel admin.

## Paginas

| Rota | Tela | Chamada a API |
| --- | --- | --- |
| `/` | Galeria das obras publicadas, com busca por texto e filtro por categoria | `GET /api/photos` |
| `/obra/[id]` | Foto grande, descricao, formatos e preco em BRL | `GET /api/photos/{id}` |
| `/cadastro` | Formulario de cliente com endereco preenchido pelo CEP | `GET /api/cep/{cep}`, `POST /api/customers` |
| `/admin` | Painel: token, nova obra com upload, edicao inline e exclusao | `GET`, `POST`, `PUT`, `DELETE /api/photos` |

A galeria e a pagina da obra sao Server Components: buscam os dados no servidor do Next,
pela rede interna do Docker. A busca e o filtro funcionam sem JavaScript no cliente — o
formulario faz `GET` na propria galeria e o estado fica na URL
(`/?q=serra&category=paisagem`).

`/cadastro` e `/admin` sao Client Components, porque sao interativos: as chamadas saem
do navegador para `NEXT_PUBLIC_API_URL`, liberadas pelo CORS da API.

### Cadastro e CEP

Ao sair do campo CEP com 8 digitos, a tela chama `GET /api/cep/{cep}` — a nossa API,
nunca o ViaCEP direto — e preenche rua, bairro, cidade e UF, levando o foco para o
numero. Os estados tratados sao: buscando, CEP nao encontrado (404) e servico fora do ar
(502/504 ou API inacessivel); nos dois ultimos o endereco pode ser preenchido a mao.
E-mail ja cadastrado (409) aparece como mensagem no formulario.

### Painel e o token

O painel nao tem autenticacao real. O campo no topo recebe o valor de `ADMIN_TOKEN`, que
e enviado no header `X-Admin-Token` das rotas de escrita. O token fica **so em estado de
memoria** do React: nao vai para `localStorage`, cookie nem URL, e some ao recarregar.
E um **placeholder de MVP academico, nao autenticacao** — ver o README da `atelie-api`.

### Imagens

O `next/image` redimensiona as fotos, e quem baixa o arquivo original e o otimizador,
que roda no **servidor** do Next — onde `localhost:8000` nao e a API. Por isso o
`next.config.ts` reescreve `/media/*` para `API_INTERNAL_URL/media/*`, e os componentes
usam o `image_path` relativo que a API devolve (`/media/a1b2.jpg`). O navegador nunca
precisa conhecer o host da API para exibir uma foto.

### Obra inexistente e status HTTP

A pagina da obra tem estado de carregamento (`loading.tsx`), o que faz o Next enviar a
resposta em streaming. Consequencia: uma obra inexistente ou nao publicada mostra a
tela de "nao encontrada" com status `200` e `<meta name="robots" content="noindex">`,
em vez de `404`. Foi uma escolha consciente — sem o `loading.tsx` o status seria `404`,
mas a tela perderia o estado de carregamento.

## Pre-requisitos

Docker e Docker Compose v2. Nada de Node ou Python no host — todo comando de
desenvolvimento roda em contêiner.

## Os dois repositorios lado a lado

Os componentes vivem em repositorios git separados e precisam ser clonados lado a
lado, com esses nomes:

```
./atelie-web/     # este repositorio (contem o docker-compose.yml)
./atelie-api/
```

O servico `api` do compose usa `build.context: ../atelie-api`, porque o codigo da
API nao esta neste repositorio. Se as pastas nao estiverem lado a lado, o build da
API falha.

## Instalacao e execucao

```bash
cp .env.example .env
docker compose up --build
```

- Interface: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/health

Para derrubar tudo, incluindo volumes (banco e imagens):

```bash
docker compose down -v
```

Hot reload nos dois servicos: o codigo vem do host por bind mount.

## Variaveis de ambiente

O `.env` na raiz deste repositorio alimenta os tres servicos do compose. Ele **nao**
e versionado; o modelo versionado e o `.env.example`.

| Variavel | Servico | Descricao |
| --- | --- | --- |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | db | Credenciais do PostgreSQL |
| `DATABASE_URL` | api | Conexao SQLAlchemy (host `db` dentro do compose) |
| `CORS_ORIGINS` | api | Origens liberadas no CORS |
| `ADMIN_TOKEN` | api | Token do header `X-Admin-Token` nas rotas de escrita |
| `API_INTERNAL_URL` | web | URL da API vista pelo **servidor** Next (`http://api:8000`) |
| `NEXT_PUBLIC_API_URL` | web | URL da API vista pelo **navegador** (`http://localhost:8000`) |

### Por que duas URLs para a mesma API

Dentro do Compose, o servidor do Next alcanca a API pelo nome de servico da rede
Docker (`http://api:8000`); o navegador do usuario nao conhece esse nome e precisa da
porta publicada no host (`http://localhost:8000`). As duas variaveis existem por isso,
e a escolha entre elas esta concentrada em [`src/lib/api.ts`](src/lib/api.ts) — nenhum
componente monta URL de API por conta propria.

### Acessando a VM de outra maquina

`NEXT_PUBLIC_API_URL` e o endereco da API **visto pelo navegador**. Com o valor padrao
(`http://localhost:8000`), a interface so funciona num navegador rodando na propria VM.
Se voce abre a interface de outra maquina da rede (ex.: `http://192.168.0.2:3000`),
`localhost` passa a ser a sua maquina, e as telas que chamam a API pelo navegador
(`/cadastro` e `/admin`) nao a alcancam. Nesse caso, no `.env`:

```bash
NEXT_PUBLIC_API_URL=http://192.168.0.2:8000
CORS_ORIGINS=http://localhost:3000,http://192.168.0.2:3000
```

e recrie os servicos com `docker compose up -d`. A galeria e a pagina da obra nao sao
afetadas, porque buscam os dados no servidor pela rede interna (`API_INTERNAL_URL`).

## Qualidade

```bash
docker compose exec web npm run lint
```
