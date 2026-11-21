# Node.js Learning Journey — Dan.it Education

<https://ci-cd-hw-15-9qx9.vercel.app>

<https://ci-cd-hw-15.vercel.app/health>

<https://ci-cd-hw-15.vercel.app/api/newsposts>

---

## HW16 — Мікросервіси: UserService + LoggingService

Два незалежні мікросервіси на Express. Дані зберігаються в Redis, і спілкуються сервіси теж через Redis (Pub/Sub).

```
Клієнт ──POST /users/create──▶ UserService ──SET user:<id>──▶ Redis
                                    │
                                    └──PUBLISH user:created──▶ Redis ──▶ LoggingService ──▶ logs/users.log
```

- **UserService** (порт `3001`) створює юзерів і віддає їх за id. Після створення публікує повідомлення в канал `user:created`.
- **LoggingService** (порт `3002`) підписаний на `user:created` і дописує кожне повідомлення у файл `server/logs/users.log`. Також приймає довільні логи через `POST /logs`.

Сервіси не знають один про одного й не викликають один одного напряму. Кожен запускається окремим процесом.

### Файли цього завдання

| Файл                                                               | Що робить                                                  |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `server/users-service.ts`                                          | UserService: Express-сервер, роути `/users`                |
| `server/logging-service.ts`                                        | LoggingService: Express-сервер, `/logs`, підписка на Redis |
| `server/src/redis.ts`                                              | Redis-клієнт і назва каналу `user:created`                 |
| `server/config.ts`                                                 | порти сервісів і `REDIS_URL`                               |
| `server/src/error/errorHandler.ts`                                 | `NotFoundError` і спільний `errorMiddleware`               |
| `server/src/validation/validation.ts`                              | `validateRedisUser` (ajv)                                  |
| `server/src/interfaces/interfaces.ts`, `server/src/types/types.ts` | `RedisUserSchema` і типи запитів                           |

Інший код у репозиторії (новини, TypeORM, auth, client) залишився з попередніх домашніх завдань, і ці сервіси його не використовують.

### Запуск

1. Запустити Redis:
   ```bash
   docker run -d --name redis -p 6379:6379 redis:7
   ```
2. Встановити залежності та створити `server/.env` за зразком `server/.env.example`:
   ```
   PORT=3000
   USERS_PORT=3001
   LOGGER_PORT=3002
   REDIS_URL=redis://localhost:6379
   ```
   ```bash
   npm install
   ```
3. Запустити кожен сервіс в окремому терміналі:
   ```bash
   npm run start:users
   npm run start:logger
   ```

### API

**UserService** — `http://localhost:3001`

| Метод  | Шлях            | Опис                                                                                            |
| ------ | --------------- | ----------------------------------------------------------------------------------------------- |
| `POST` | `/users/create` | Створює юзера. Body: `{ "name": string, "email": string }`. Відповідь `201` зі створеним юзером |
| `GET`  | `/users/:id`    | Повертає юзера за id, або `404`, якщо його немає                                                |

**LoggingService** — `http://localhost:3002`

| Метод  | Шлях    | Опис                                                             |
| ------ | ------- | ---------------------------------------------------------------- |
| `POST` | `/logs` | Записує передані дані у `logs/users.log`. Порожнє body дає `400` |

### Перевірка

```bash
curl -X POST localhost:3001/users/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Nastia","email":"n@test.com"}'

curl localhost:3001/users/1
```

Після створення юзера в `server/logs/users.log` з'являється рядок:

```
2026-11-16T20:26:47.289Z {"event":"user created","user":{"id":1,"name":"Nastia","email":"n@test.com","createDate":"2026-11-16T20:26:47.287Z"}}
```

### Як це влаштовано

- **Зберігання:** юзер лежить у Redis під ключем `user:<id>` як JSON-рядок. Id видає `INCR users:lastId`. Команда атомарна, тому два одночасні запити не отримають однаковий id.
- **Pub/Sub:** UserService виконує `PUBLISH`, LoggingService виконує `SUBSCRIBE`. Клієнт у режимі підписки не може виконувати інші команди, тому LoggingService підписується через окреме підключення `redis.duplicate()`.
- **Помилки:** валідація через ajv, власні класи помилок (`ValidationError` → 400, `NotFoundError` → 404) і один глобальний `errorMiddleware`, без try/catch у роутах (Express 5 сам передає помилки з async-обробників).

Документація API: http://localhost:8000/api-docs

---

## HW19 — API tests

API-тести (supertest) лежать у `server/src/tests/` і працюють з окремою тестовою базою. Перед кожним тестом база очищається (`TRUNCATE ... RESTART IDENTITY CASCADE`), після всіх тестів лишається порожньою.

### Тестова база

1. Створити базу в Postgres (назва обов'язково закінчується на `_test`, інакше тести не запустяться):
   ```sql
   CREATE DATABASE news_test;
   ```
2. Створити файл `server/.env.test` (він у `.gitignore`):
   ```
   DATABASE_URL=postgres://<user>:<password>@localhost:5432/news_test
   JWT_SECRET=test-secret
   PORT=3000
   ```

Таблиці створювати не треба: під час підключення TypeORM сам виконає міграції.

### Запуск

```bash
npm test                    # усі тести: юніт + API (потрібен запущений Postgres)
npm test -- src/services    # лише юніт-тести, без бази
```

У GitHub Actions Postgres піднімається як service container, тож API-тести працюють і в CI.
