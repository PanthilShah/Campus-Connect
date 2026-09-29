# Lab 4: Full-Stack Client & Database Integration
## Web Services & SOA Laboratory
### Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar
**Student**: Panthil Shah (`MScIT-25-0XX`) &bull; **Program**: M.Sc. Information Technology (Semester 3)

---

## 1. Full-Stack Multi-Client SOA Architecture

This laboratory demonstrates the central principle of **Service-Oriented Architecture (SOA)**: exposing a single, reusable backend REST service backed by persistent storage (**MongoDB Atlas**), consumed independently by multiple heterogeneous client applications (**React Web Client** and **Android Mobile Client**) without tight coupling.

```
                    ┌─────────────────────────────────────────┐
                    │     React Web Client (Vite + React)     │
                    │   • Full CRUD (List, Add, Edit, Del)    │
                    │   • Port: http://localhost:5173         │
                    └────────────────────┬────────────────────┘
                                         │  HTTP / JSON
                                         ▼  (CORS Enabled)
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CampusConnect Student REST API (Express.js)                  │
│       GET /students | GET /students/:id | POST /students | PUT | DELETE     │
│       • Validation Middleware (400) • Global Error Handling (500)          │
│       • Interactive OpenAPI 3.0 / Swagger UI at /api-docs                   │
│       • Port: http://localhost:3000                                         │
└───────────────────────┬─────────────────────────────▲───────────────────────┘
                        │ Mongoose ODM                │ HTTP / JSON
                        │ (SRV Protocol)              │ (10.0.2.2:3000)
                        ▼                             │
┌───────────────────────────────────┐    ┌────────────┴────────────────────────┐
│     MongoDB Atlas (Cloud M0)      │    │        Android Mobile Client        │
│   • Collection: students          │    │      (Retrofit 2 + Coroutines)      │
│   • Unique Email & ID Constraints │    │    • List Students & Add Student    │
│   • Persistent Cloud Storage      │    │    • Android Emulator (10.0.2.2)    │
└───────────────────────────────────┘    └─────────────────────────────────────┘
```

---

## 2. Architectural Reflection: Why REST and NOT Direct Database Access?

### Question:
> *Why should React and Android access the REST service rather than connect directly to MongoDB?*

### Analysis:
1. **Security & Credential Isolation**:
   Direct database connections require embedding database credentials (username, password, Atlas SRV connection string) within client bundles. Any user could extract credentials from React bundle JS or decompiled Android APKs and compromise the entire database. With REST, credentials reside securely on the backend server behind environment variables (`.env`).
2. **Centralized Business Logic & Validation**:
   Validation rules (e.g. valid university email regex, non-empty names, semester limits 1–8) are enforced uniformly in one place at the API gateway layer. Direct DB access would force each client to replicate validation independently, introducing inconsistency and data corruption vulnerabilities.
3. **Decoupling & Technology Agility**:
   The database technology can be migrated (e.g., from MongoDB to PostgreSQL or DynamoDB) without changing a single line of client code, because the HTTP/JSON contract remains identical.
4. **Network & Connection Scalability**:
   MongoDB connections are persistent TCP sockets. Having thousands of mobile devices open direct DB connections would quickly exhaust database connection pools. REST APIs utilize stateless HTTP requests that scale horizontally behind load balancers.

---

## 3. Database Integrity & Constraints

### Chosen Database Constraint:
* **Unique Email Index**: `studentSchema.index({ email: 1 }, { unique: true })`
* **Unique Roll ID Index**: `studentSchema.index({ id: 1 }, { unique: true })`

### Reasoning:
In academic university administration at **Dhirubhai Ambani University**, each student is assigned an official institutional email address (`@dau.ac.in`) and a unique roll number (`MScIT-25-0XX`). Enforcing this at the database engine level guarantees data integrity even during concurrent create operations, preventing duplicate registration records.

---

## 4. REST API Contract & HTTP Error Handling

| Scenario | HTTP Status | React Web Client Reaction | Android Mobile Client Reaction |
|---|---|---|---|
| **Invalid Form Submission** (empty name, bad email) | `400 Bad Request` | Displays inline field errors and red alert banner with server validation list | Displays `Toast` with detailed validation error message |
| **Student ID Not Found** (`/students/999`) | `404 Not Found` | Displays *"Student Not Found"* banner with retry action | Displays `Toast: "Resource not found (404)"` |
| **Valid Student Created** (`POST /students`) | `201 Created` | Closes modal, refreshes table, and triggers green success Toast | Closes activity, returns to list, and shows `Toast: "Student Created (201)"` |
| **Server / Network Failure** | `500 / Network Error` | Renders error state: *"Unable to load data. Please try again."* | Shows `Toast: "Network Error: Something went wrong"` |

---

## 5. Running the Projects

### A. Backend REST API (`student-api/`)
```bash
cd student-api
npm install
npm start
```
* **API Base URL**: `http://localhost:3000`
* **Swagger UI Documentation**: `http://localhost:3000/api-docs`

---

### B. React Web Client (`student-client/`)
```bash
cd student-client
npm install
npm run dev
```
* **Web Client URL**: `http://localhost:5173`
* Features: Complete CRUD table, live search filter, semester filter, registration modal with client-side & server-side validation, dark/light mode toggle.

---

### C. Android Mobile Client (`student-android-client/`)
1. Open Android Studio.
2. Select **Open** &rarr; navigate to `student-android-client`.
3. Sync Gradle and run on Android Emulator (Pixel 7 / API 34).
4. *Note: Uses `http://10.0.2.2:3000/` as `API_BASE_URL` to route traffic to your local development machine.*

---

## 6. Web vs. Mobile Client Consumption Reflection

| Aspect | Web Client (React) | Mobile Client (Android) |
|---|---|---|
| **What Stayed the Same** | Both consume the exact same JSON schema (`id`, `name`, `email`, `course`, `semester`), rely on the same HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), and respect identical status codes (`200`, `201`, `400`, `404`). |
| **What Changed** | **CORS**: Required `cors()` on backend for browser security.<br>**State**: Managed via React hooks (`useState`, `useEffect`).<br>**UI**: Rendered via DOM HTML/CSS table. | **CORS**: Not applicable to native apps.<br>**Network**: Asynchronous Kotlin Coroutines + Retrofit 2.<br>**UI**: Native Material Design (`RecyclerView`, `TextInputLayout`, `Toast`).<br>**Host IP**: Requires `10.0.2.2` alias for Android Emulator loopback. |
