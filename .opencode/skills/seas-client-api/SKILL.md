---
name: seas-client-api
description: Публичный клиентский API /api/v1/client из static/client.js: динамическое подключение через window.ASSETS.client, сущности и методы аккаунта, авторизации, профиля, доступности и событий. Use when adding or debugging client-side API calls, client.getProfile, ClientApiError, or template scripts that load client data.
---

# Клиентский API `/api/v1/client`

Навык описывает публичный браузерный API из `static/client.js`. Глобального `window.client` нет: модуль динамически импортируется в скриптах, которым нужны данные клиента.

## Подключение

```js
const { client } = await import(window.ASSETS.client)

const profile = await client.getProfile()
```

Что важно:

- `window.ASSETS` инжектится инлайн в `<head>` сервером из `src/templates/assets.js` (`src/templates/injectAssets.js`).
- Мапа нужна, чтобы позже заменить пути на результат сборки с хэшами, не спотыкаясь о кэш браузера.
- `window.ASSETS.client` сейчас равен `/static/client.js`.
- Запросы идут same-origin с `credentials: 'same-origin'`.
- Cookie `client_token` отправляется браузером автоматически.
- Заголовок `x-site-uuid` подставляется из `window.__SITE_SETTINGS.siteUuid`, если он есть.

## Низкоуровневый `request`

```js
const data = await client.request('/profile', {
  method: 'GET',
  headers: {},
  signal: controller.signal,
})
```

```js
export async function request(path, {
  method = 'GET',
  body,
  headers = {},
  signal,
} = {}) {}
```

Поведение:

- `body` сериализуется в JSON; `FormData` отправляется как есть.
- `204 No Content` возвращает `null`.
- JSON-ответ парсится, иначе возвращается текст.
- На `!response.ok` бросается `ClientApiError`.
- Сетевые ошибки также оборачиваются в `ClientApiError`.

```js
const { client, ClientApiError } = await import(window.ASSETS.client)

try {
  await client.getProfile()
} catch (error) {
  if (error instanceof ClientApiError) {
    console.error(error.status, error.data)
  }
}
```

`ClientApiError` содержит:

- `status` — HTTP-статус или `0` для сетевой ошибки;
- `data` — распарсенный ответ;
- `response` — исходный `Response` или `null`.

## Сущности и методы

### Аккаунт

| Метод | HTTP | Путь | Аргументы | Результат | Auth |
|---|---|---|---|---|---|
| `getAccount()` | GET | `/api/v1/client` | — | `ClientResponse` | ClientAuth |
| `updateAccount(data)` | PATCH | `/api/v1/client` | `PatchClientRequest` | `ClientResponse` | ClientAuth |
| `deleteAccount()` | DELETE | `/api/v1/client` | — | `StatusResponse` | ClientAuth |

### Авторизация

| Метод | HTTP | Путь | Аргументы | Результат | Auth |
|---|---|---|---|---|---|
| `login(data)` | POST | `/api/v1/client/login` | `LoginClientRequest` | `ClientResponse` | публичный |
| `logout()` | POST | `/api/v1/client/logout` | — | `StatusResponse` | ClientAuth |
| `register(data)` | POST | `/api/v1/client/register` | `RegisterClientRequest` | `ClientResponse` | публичный |
| `resendVerification()` | POST | `/api/v1/client/resend-verification` | — | `SimpleMessageResponse` | ClientAuth |
| `verifyEmail(token)` | POST | `/api/v1/client/verify-email` | `{ token }` | `SimpleMessageResponse` | публичный |
| `changePassword(data)` | PATCH | `/api/v1/client/password` | `ChangeClientPasswordRequest` | `StatusResponse` | ClientAuth |

`resendVerification()` не принимает e-mail: бэкенд отправляет письмо на e-mail текущего авторизованного клиента.

`login` и `register` устанавливают cookie `client_token` (7 дней). `logout` очищает её.

### Профиль

| Метод | HTTP | Путь | Аргументы | Результат | Auth |
|---|---|---|---|---|---|
| `getProfile()` | GET | `/api/v1/client/profile` | — | `ProfileResponse` | ClientAuth |
| `createProfile(data)` | POST | `/api/v1/client/profile` | `UpsertProfileRequest` | `ProfileResponse` | ClientAuth |
| `updateProfile(data)` | PATCH | `/api/v1/client/profile` | `PatchProfileRequest` | `ProfileResponse` | ClientAuth |
| `replaceProfile(data)` | PUT | `/api/v1/client/profile` | `UpsertProfileRequest` | `ProfileResponse` | ClientAuth |

### Доступность

| Метод | HTTP | Путь | Аргументы | Результат | Auth |
|---|---|---|---|---|---|
| `getAvailability(params)` | GET | `/api/v1/client/availability` | `{ start_from, start_to, calendar_uuid? }` | `AvailabilityCalendar[]` | ClientAuth |

`start_from` и `start_to` обязательны, период не более 14 дней. `calendar_uuid` необязателен.

### События

| Метод | HTTP | Путь | Аргументы | Результат | Auth |
|---|---|---|---|---|---|
| `getEvents(params)` | GET | `/api/v1/client/events` | `{ start_from, start_to }` | `EventResponse[]` | ClientAuth |
| `getEvent(uuid)` | GET | `/api/v1/client/event/{uuid}` | `uuid` | `EventResponse` | ClientAuth |
| `book(data)` | POST | `/api/v1/client/book` | `BookEventRequest` | `EventResponse` | ClientAuth |

Для `getEvents` период ограничен 14 днями.

## DTO

### `LoginClientRequest`

- `email` — обязателен;
- `password` — обязателен;
- `altcha` — необязательное ALTCHA-решение (base64 JSON).

### `RegisterClientRequest`

- `email`;
- `name`, 1–100 символов;
- `password`, минимум 6 символов;
- `altcha` — необязательно.

### `PatchClientRequest`

- `email`;
- `name`;
- `phone`;
- `settings`.

### `ChangeClientPasswordRequest`

- `current_password`;
- `new_password`, минимум 6 символов.

### `ClientResponse`

- `uuid`;
- `email`;
- `email_verified`;
- `name`;
- `phone`;
- `settings`;
- `token`.

### `ProfileResponse`

- `full_name`;
- `birth_date`;
- `emergency_contact`;
- `family_status`;
- `health_notes`;
- `medication_info`;
- `occupation`;
- `previous_therapy_experience`;
- `primary_request`;
- `agreement_signed`;
- `created_at`;
- `updated_at`.

### `PatchProfileRequest`

Поля как у `ProfileResponse` без `created_at`/`updated_at`, плюс `tags: string[]`.

### `UpsertProfileRequest`

Поля как у `ProfileResponse` без `created_at`/`updated_at` и без `tags`.

### `AvailabilityCalendar`

- `calendar_uuid`;
- `name`;
- `category`;
- `settings`;
- `intervals: { start_time, end_time }[]`.

### `EventResponse`

- `uuid`;
- `site_uuid`;
- `client_uuid`;
- `calendar_uuid`;
- `title`;
- `description`;
- `start_time`;
- `end_time`;
- `location`;
- `tags`;
- `rrule`;
- `is_all_day`;
- `settings`;
- `external_id`.

### `BookEventRequest`

- `calendar_uuid` — обязателен;
- `start_time` — обязателен;
- `end_time` — обязателен;
- `title`;
- `description`;
- `location`;
- `tags`;
- `settings`.

### Служебные ответы

- `SimpleMessageResponse`: `{ message }`;
- `StatusResponse`: `{ status }`;
- `ErrorResponse`: `{ error }`.

## Примеры

### Профиль с обработкой ошибки

```js
const { client, ClientApiError } = await import(window.ASSETS.client)

try {
  const profile = await client.getProfile()
  console.log(profile.full_name)
} catch (error) {
  if (error instanceof ClientApiError && error.status === 401) {
    console.warn('Требуется вход клиента')
  }
}
```

### Вход

```js
const { client } = await import(window.ASSETS.client)

await client.login({
  email,
  password,
  altcha,
})
```

### Доступность и бронирование

```js
const { client } = await import(window.ASSETS.client)

const calendars = await client.getAvailability({
  start_from: '2026-11-04T00:00:00Z',
  start_to: '2026-11-11T00:00:00Z',
})

await client.book({
  calendar_uuid: calendars[0].calendar_uuid,
  start_time: '2026-11-05T10:00:00Z',
  end_time: '2026-11-05T11:00:00Z',
  title: 'Консультация',
})
```

### Повторная отправка подтверждения e-mail

```js
const { client } = await import(window.ASSETS.client)

await client.resendVerification()
```

### Смена пароля

```js
const { client } = await import(window.ASSETS.client)

await client.changePassword({
  current_password: 'old-password',
  new_password: 'new-password',
})
```

## Конвенции

- Использовать `client` из динамического импорта, не создавать `window.client`.
- Не добавлять в `static/client.js` админские методы (`register-by-user`, clinical-card, профиль по UUID) — это другой контур авторизации.
- Для нестандартного публичного запроса использовать `client.request`.
- Не дублировать URL в шаблонах: добавлять доменный метод в `static/client.js`.
- При добавлении метода обновлять таблицу сущностей в этом навыке.
- Пустые query-параметры (`undefined`, `null`, `''`) в `getAvailability`/`getEvents` отбрасываются автоматически.

## Связанные файлы

- `static/client.js` — реализация API;
- `src/templates/assets.js` — карта клиентских модулей;
- `src/templates/injectAssets.js` — инлайн-инъекция `window.ASSETS`;
- `src/routes/mainHandler.js` — добавление `siteUuid` в `window.__SITE_SETTINGS`;
- `AGENTS.md` — общие конвенции проекта.
