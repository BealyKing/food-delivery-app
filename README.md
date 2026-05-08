# Food Delivery App

Учебное приложение доставки еды на **Java 17 + Spring Boot 3** с JWT-аутентификацией и ролевой моделью доступа.

---

## Оглавление

- [1. О проекте](#1-о-проекте)
- [2. Стек технологий](#2-стек-технологий)
- [3. Архитектура](#3-архитектура)
- [4. Роли и права](#4-роли-и-права)
- [5. Как фронтенд общается с бэкендом](#5-как-фронтенд-общается-с-бэкендом)
- [6. Карта API](#6-карта-api)
- [7. Подробно по классам](#7-подробно-по-классам)
- [8. Примеры `curl`](#8-примеры-curl)
- [9. Конфигурация](#9-конфигурация)
- [10. Что улучшить](#10-что-улучшить)

---

## 1. О проекте

`Food Delivery App` демонстрирует полный путь обработки запросов в Spring-приложении:

- регистрация и вход пользователя;
- выдача JWT токена;
- авторизация по ролям (**CUSTOMER**, **COURIER**, **ADMIN**);
- операции с заказами (создание, взятие в работу, смена статуса, просмотр).  

---

## 2. Стек технологий

- **Spring Boot Starter Web** — REST API  
- **Spring Security** — аутентификация/авторизация  
- **Spring Data JPA** — ORM и репозитории  
- **H2 Database** — in-memory БД для dev  
- **JJWT** — генерация/валидация JWT  
- **Lombok** — генерация boilerplate-кода  

---

## 3. Архитектура

```mermaid
flowchart LR
    A[Browser / Static JS] -->|fetch HTTP| B[Controllers]
    B --> C[Services]
    C --> D[Repositories]
    D --> E[(H2 DB)]
    A -->|Authorization: Bearer JWT| F[JwtAuthFilter]
    F --> B

Паттерн слоев:

controller — HTTP-уровень

service — бизнес-логика

repository — доступ к данным

model — JPA сущности

dto — входные данные API

4. Роли и права
ADMIN:

просмотр всех пользователей

удаление пользователя

изменение роли

просмотр всех заказов

COURIER:

просмотр доступных заказов

взять заказ

обновить статус своего заказа

CUSTOMER:

профиль

просмотр своих заказов

создание заказа

5. Как фронтенд общается с бэкендом
На странице логина JS делает:

POST /auth/login с JSON { username, password }.

Бэкенд возвращает JWT (строкой).

JS сохраняет JWT в localStorage.

Каждый защищенный запрос отправляется с заголовком:

Authorization: Bearer <token>.

На бэкенде JwtAuthFilter валидирует токен и кладет пользователя в SecurityContext.

Spring Security + @PreAuthorize проверяют, можно ли вызвать endpoint.

6. Карта API
Auth
POST /auth/register

POST /auth/login

Customer (/api/customer)
GET /profile

GET /orders

POST /orders

Courier (/api/courier)
GET /orders

POST /orders/{id}/take

PUT /orders/{id}/status?status=IN_PROGRESS

Admin (/api/admin)
GET /users

DELETE /users/{id}

PUT /users/{id}/role?role=COURIER

GET /orders

7. Подробно по классам
7.1 AppfoodApplication
Точка входа (main), запускает Spring Boot приложение.

7.2 HomeController
GET / -> редирект на /index.html.

7.3 AuthController
REST-контроллер для регистрации/логина.

Делегирует бизнес-логику в AuthService.

7.4 CustomerController
Endpoint’ы для клиентских действий: профиль, мои заказы, создать заказ.

7.5 CourierController
Endpoint’ы для курьера: доступные заказы, взять заказ, смена статуса.

7.6 AdminController
Endpoint’ы для администратора: пользователи и все заказы.

Включает проверку, чтобы не создать второго ADMIN.

7.7 AuthService
register(...):

создает User,

присваивает роль,

ограничивает число ADMIN,

сохраняет в БД.

login(...):

аутентифицирует через AuthenticationManager,

генерирует JWT через JwtTokenProvider.

7.8 OrderService
Вся логика заказов:

создать заказ,

получить свои заказы,

получить доступные,

взять заказ,

сменить статус,

получить все (admin).

7.9 UserService
Реализация UserDetailsService.

Нужен Spring Security для загрузки пользователя по username.

7.10 SecurityConfig
Описывает правила доступа к URL.

Делает приложение stateless.

Регистрирует JwtAuthFilter.

Определяет AuthenticationManager и PasswordEncoder.

7.11 JwtAuthFilter
На каждом запросе:

читает Authorization,

извлекает JWT,

валидирует токен,

ставит Authentication в контекст.

7.12 JwtTokenProvider
Генерирует JWT (включая claim role).

Извлекает username/claims.

Проверяет срок действия токена.

7.13 User (Entity + UserDetails)
Сущность users.

Поля: id, username, password, role.

Реализует методы UserDetails (authorities и флаги аккаунта).

7.14 Order (Entity)
Сущность orders.

Поля: description, status, price.

Связи:

customer (обязательная),

courier (опциональная).

7.15 Role (enum)
CUSTOMER, COURIER, ADMIN.

7.16 UserRepository
CRUD + findByUsername.

7.17 OrderRepository
CRUD + findByCustomerId, findByCourierId, findByCourierIsNull.

7.18 DTO
LoginRequest — username/password

RegisterRequest — username/password/role

OrderRequest — description/price

8. Примеры curl
Регистрация
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"1234","role":"CUSTOMER"}'
Логин
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"1234"}'
Сохрани ответ (JWT) в переменную:

TOKEN="<jwt_from_login>"
Создать заказ (CUSTOMER)
curl -X POST http://localhost:8080/api/customer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"description":"Pizza + Cola","price":500}'
Получить доступные заказы (COURIER)
curl -X GET http://localhost:8080/api/courier/orders \
  -H "Authorization: Bearer $TOKEN"
Взять заказ (COURIER)
curl -X POST http://localhost:8080/api/courier/orders/1/take \
  -H "Authorization: Bearer $TOKEN"
Изменить статус заказа (COURIER/ADMIN)
curl -X PUT "http://localhost:8080/api/courier/orders/1/status?status=DELIVERED" \
  -H "Authorization: Bearer $TOKEN"
Получить пользователей (ADMIN)
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
9. Конфигурация
application.properties:

H2 DB URL

JPA параметры (ddl-auto=update, SQL лог)

server.port=8080

JWT secret и expiration

10. Что улучшить
Заменить NoOpPasswordEncoder на BCryptPasswordEncoder.

Сделать status заказа enum вместо String.

Добавить валидацию DTO (@Valid, @NotBlank, @NotNull).

Сделать единый JSON-формат ошибок (@ControllerAdvice).

Вынести JWT secret в env-переменные.

Добавить интеграционные тесты API.


