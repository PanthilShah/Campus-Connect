# Lab 6: Docker & Microservices
## Web Services & SOA Laboratory
### Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar
**Student**: Panthil Shah (`MScIT-25-0XX`) &bull; **Program**: M.Sc. Information Technology (Semester 3)

---

## 1. Microservices Architecture Overview

In Lab 6, the monolithic backend is decomposed into **three independently deployable and runnable microservices** coordinated through a dedicated Docker bridge network (`campus-network`) and accessible through a unified **API Gateway**:

```
                       Client Application / Postman
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │    CampusConnect API Gateway  │
                    │         Port: 3000            │
                    └───────────────┬───────────────┘
                                    │ Internal Docker Routing
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  User Service   │        │ Product Service │        │  Order Service  │
│   Port: 3001    │        │   Port: 3002    │        │   Port: 3003    │
│                 │        │                 │        │                 │
│ • /users        │        │ • /products     │        │ • /orders       │
│ • User DB Store │        │ • Course DB     │        │ • Order DB      │
└────────▲────────┘        └────────▲────────┘        └────────┬────────┘
         │                          │                          │
         └──────────────────────────┴──────────────────────────┘
             Service-to-Service REST Communication (HTTP/JSON)
             Order Service validates User & Product during checkout
```

---

## 2. Service Boundaries & Responsibilities

| Service | Responsibility | Port | Key Endpoints | Independent Data Store |
|---|---|---|---|---|
| **User Service** | Manages student profiles, authentication identity, and academic roles | `3001` | `GET /users`<br>`GET /users/:id`<br>`POST /users`<br>`PUT /users/:id`<br>`DELETE /users/:id` | Dedicated In-Memory / MongoDB User Collection |
| **Product Service** | Manages academic course offerings, syllabus codes, credits, and fees | `3002` | `GET /products`<br>`GET /products/:id`<br>`POST /products`<br>`PUT /products/:id`<br>`DELETE /products/:id` | Dedicated In-Memory / MongoDB Product Collection |
| **Order Service** | Handles course registration, fee invoices, and validates user & course data | `3003` | `GET /orders`<br>`GET /orders/:id`<br>`POST /orders`<br>`DELETE /orders/:id` | Dedicated In-Memory / MongoDB Order Collection |
| **API Gateway** | Unified reverse-proxy entrypoint routing requests to internal microservices | `3000` | `GET /`<br>`/users/*`<br>`/products/*`<br>`/orders/*` | Stateless routing table |

---

## 3. Database-per-Service Principle

In true Service-Oriented Architecture:
* **No service directly accesses another service's database**.
* The **Order Service** never queries the User database or Product database directly.
* When the Order Service needs user profile or course information, it performs a **RESTful HTTP request** (`GET /users/:id` or `GET /products/:id`) through the private Docker network (`campus-network`).

---

## 4. Service-to-Service Communication & Error Handling

### Creation Flow (`POST /orders`):
1. **Client** sends `{ userId: "101", productId: "501", paymentMode: "Online Portal" }` to Order Service.
2. **Order Service** calls `GET http://user-service:3001/users/101`.
   * If User Service returns `404` &rarr; Order Service aborts with `HTTP 404: "User with ID '101' does not exist."`
3. **Order Service** calls `GET http://product-service:3002/products/501`.
   * If Product Service returns `404` &rarr; Order Service aborts with `HTTP 404: "Product with ID '501' does not exist."`
4. **Service Unavailability Handling**:
   * If User or Product Service is unreachable or down &rarr; Order Service fails gracefully with **`HTTP 503 Service Unavailable`** rather than crashing.
5. If both validations succeed &rarr; Order Service commits the record and returns **`HTTP 201 Created`** with verified snapshots.

---

## 5. Environment Variable Configuration

Service URLs are not hardcoded. They are injected through environment variables:
```ini
USER_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
ORDER_SERVICE_PORT=3003
USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003
```

---

## 6. How to Run with Docker Compose

To start all 4 microservice containers in a single command:
```bash
docker compose -f compose.microservices.yaml up -d
```

Check running microservices:
```bash
docker compose -f compose.microservices.yaml ps
```

Run the automated test suite:
```bash
node microservices/test-microservices.js
```
*Executes 20 automated assertions covering all services, inter-service calls, and error fallbacks.*

Stop the microservices stack:
```bash
docker compose -f compose.microservices.yaml down
```

---

## 7. Postman Collection

Import `microservices/postman/Microservices_Lab6.postman_collection.json` into Postman to test:
1. Direct User Service (`:3001/users`)
2. Direct Product Service (`:3002/products`)
3. Inter-service Order creation (`:3003/orders`)
4. Unified API Gateway (`:3000/users`, `:3000/products`, `:3000/orders`)
