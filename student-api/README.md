# Lab 3: Building RESTful Web Services
## Web Services & SOA Laboratory
### Institution: Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar
**Student**: Panthil Shah (`MScIT-25-0XX`) &bull; **Program**: M.Sc. Information Technology (Semester 3)

---

## 1. Objective
Build a resource-oriented **Student Management RESTful Web Service** implementing complete CRUD operations, strict input validation, proper HTTP status codes, structured error payloads, and interactive **OpenAPI 3.0 / Swagger UI** documentation. 

This lab demonstrates REST architecture across two major enterprise backend technologies:
1. **Express.js (Node.js)** — Primary complete CRUD implementation
2. **Spring Boot (Java 17)** — Equivalent Controller &rarr; Service &rarr; Repository multi-tier architecture

---

## 2. Resource Schema: `Student`

| Field | Type | Constraint | Description | Example |
|---|---|---|---|---|
| `id` | `String` | Unique, Non-empty | Student Roll Number / Identifier | `"MScIT-25-001"` |
| `name` | `String` | Required, min 2 chars | Full Name of the student | `"Panthil Shah"` |
| `email` | `String` | Required, Valid Email format | University Email | `"panthil.shah@dau.ac.in"` |
| `course` | `String` | Required, Non-empty | Degree / Program | `"M.Sc. Information Technology"` |
| `semester` | `Integer` | Required, 1 &le; sem &le; 8 | Current Academic Semester | `3` |
| `createdAt` | `String (ISO)` | Auto-generated | Timestamp of creation | `"2026-09-29T10:00:00.000Z"` |

---

## 3. REST API Endpoint Specification

| Operation | HTTP Method | Endpoint | Request Body | Success Status | Error Statuses | Description |
|---|---|---|---|---|---|---|
| **List Students** | `GET` | `/students` | *None* | `200 OK` | `500` | Returns array of all registered students |
| **Get Student by ID** | `GET` | `/students/{id}` | *None* | `200 OK` | `404 Not Found`, `500` | Returns a single student record |
| **Create Student** | `POST` | `/students` | `StudentInput` JSON | `201 Created` | `400 Bad Request`, `500` | Validates & saves a new student |
| **Update Student** | `PUT` | `/students/{id}` | `StudentInput` JSON | `200 OK` | `400 Bad Request`, `404`, `500` | Replaces/updates existing student data |
| **Delete Student** | `DELETE` | `/students/{id}` | *None* | `200 OK` | `404 Not Found`, `500` | Removes student record by ID |
| **Swagger UI** | `GET` | `/api-docs` | *None* | `200 OK` | — | Interactive OpenAPI 3.0 testing UI |
| **OpenAPI Spec** | `GET` | `/openapi.json` | *None* | `200 OK` | — | Raw OpenAPI 3.0 JSON specification |

---

## 4. Architectural Comparison: Express.js vs. Spring Boot

| Architectural Concern | Express.js (Node.js) | Spring Boot (Java 17) |
|---|---|---|
| **Routing & Handling** | `router.get('/students', handler)` in `routes/studentRoutes.js` | `@GetMapping("/students")` in `StudentController.java` |
| **Request Validation** | `validateStudent` middleware with custom regex & logic | Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Min`) |
| **Business Logic Layer** | Inline route logic or service helpers | Dedicated `@Service` class (`StudentService.java`) |
| **Data Access Layer** | `data/studentsStore.js` (In-memory store) | `@Repository` class (`StudentRepository.java`) |
| **Error Handling** | Express error middleware `app.use((err, req, res, next))` | `@RestControllerAdvice` (`GlobalExceptionHandler.java`) |
| **API Documentation** | `swagger-ui-express` serving `swagger.json` at `/api-docs` | SpringDoc OpenAPI generating Swagger UI at `/swagger-ui.html` |
| **JSON Serialization** | Built-in `express.json()` (V8 engine) | Jackson `ObjectMapper` |

---

## 5. Input Validation & Error Handling

When an invalid or incomplete request is sent, the API rejects it with **`HTTP 400 Bad Request`** and returns a structured JSON error response:

### Sample Invalid Request:
```json
POST /students
{
  "name": "",
  "email": "invalid-email",
  "course": "M.Sc. IT",
  "semester": -2
}
```

### Response (`HTTP 400 Bad Request`):
```json
{
  "success": false,
  "error": "Validation Failed",
  "status": 400,
  "details": [
    "Name is required and cannot be empty.",
    "Invalid email format. Must be a valid email address (e.g., student@dau.ac.in).",
    "Semester must be an integer between 1 and 8."
  ]
}
```

### Sample 404 Response (`HTTP 404 Not Found`):
```json
GET /students/INVALID-ID-999
{
  "success": false,
  "error": "Not Found",
  "message": "Student with ID 'INVALID-ID-999' was not found in the registry."
}
```

---

## 6. How to Run the Express.js API

### Step 1: Install Dependencies
```bash
cd student-api
npm install
```

### Step 2: Start the Server
```bash
npm start
```
The server will boot on `http://localhost:3000`.

### Step 3: Access Interactive Swagger UI
Open your browser and navigate to:
👉 **`http://localhost:3000/api-docs`**

You can execute queries interactively with the **"Try it out"** button.

### Step 4: Run Automated Test Suite
```bash
npm test
```
*Executes 23 automated assertions covering all CRUD operations, status codes, and error conditions.*

---

## 7. How to Run the Spring Boot API

### Step 1: Navigate to Spring Boot project directory
```bash
cd student-api/spring-boot-student-api
```

### Step 2: Build and Run with Maven
```bash
mvn spring-boot:run
```
The Spring Boot server will boot on `http://localhost:8080`.

### Step 3: Access Spring Boot Swagger UI
👉 **`http://localhost:8080/swagger-ui.html`**

---

## 8. Postman Collection

A complete Postman collection is included in:
📁 `postman/Lab3_Student_REST_API.postman_collection.json`

### Import & Test in Postman:
1. Open Postman &rarr; Click **Import**.
2. Select `postman/Lab3_Student_REST_API.postman_collection.json`.
3. Set environment variable `baseUrl` to `http://localhost:3000`.
4. Run collection requests:
   - `1. GET All Students (200 OK)`
   - `2. GET Student by ID - Panthil Shah (200 OK)`
   - `3. GET Student by Invalid ID (404 Not Found)`
   - `4. POST Create Student (201 Created)`
   - `5. POST Invalid Student Body (400 Bad Request)`
   - `6. PUT Update Student (200 OK)`
   - `7. DELETE Student (200 OK)`
   - `8. GET Swagger UI Documentation (200 OK)`
