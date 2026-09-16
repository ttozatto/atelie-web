# atelie-web

Interface do catalogo de fotografias em print e quadro. Next.js 15 (App Router),
TypeScript e Tailwind. Este repositorio tambem guarda o `docker-compose.yml` que
sobe o sistema inteiro.

## Status

Etapa 1 (infra) concluida: os tres servicos sobem no Compose com healthcheck verde
e a home responde "olá".

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

## Qualidade

```bash
docker compose exec web npm run lint
```
