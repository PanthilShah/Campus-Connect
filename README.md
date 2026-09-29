# 🎓 Campus Connect

[![CI/CD Pipeline](https://github.com/PanthilShah/Campus-Connect/actions/workflows/ci.yml/badge.svg)](https://github.com/PanthilShah/Campus-Connect/actions)
[![Docker](https://img.shields.io/badge/Docker-Containers-blue.svg?logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5.svg?logo=kubernetes)](https://kubernetes.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C.svg?logo=prometheus)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Visualization-F46800.svg?logo=grafana)](https://grafana.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Campus Connect** is a cloud-native, microservices-based academic and student resource management platform designed for modern higher-education institutions. Built as part of the **Web Services & Service-Oriented Architecture (WS-SOA)** curriculum at **Dhirubhai Ambani University (DA-IICT)**, the system demonstrates end-to-end service-oriented architecture principles—spanning full-stack client applications, decomposed microservices, containerization, API Gateway reverse proxying, Kubernetes orchestration, automated CI/CD pipelines, and real-time observability.

---

## 🌟 Main Features

- **🌐 Single Entry Point (API Gateway)**: Unified client-facing entry point with reverse proxying, centralized request logging, request duration tracking, and standardized error translation (502/503).
- **🧩 Decomposed Microservices**:
  - **User Service (`/users`)**: Manages student identities, profiles, and departmental assignments.
  - **Product Service (`/products`)**: Manages academic courses, credits, faculty allocations, and seat capacity.
  - **Order Service (`/orders`)**: Orchestrates course enrollments with real-time inter-service validation across the Docker/Kubernetes network.
- **🔍 Configuration-Based & Dynamic Service Discovery**: Zero hard-coded endpoints; services dynamically discover each other via environment variables and Kubernetes internal DNS (`*.svc.cluster.local`).
- **☸️ Kubernetes Orchestration**: Production-grade manifests for Deployments, ClusterIP & NodePort Services, ConfigMaps, Secrets, health probes (`livenessProbe`, `readinessProbe`), and resource quotas.
- **📈 Self-Healing & Horizontal Scaling**: Seamless auto-recovery from pod failures and on-demand replica scaling (`kubectl scale`).
- **📊 Real-Time Observability**: Built-in Prometheus metrics exporter (`GET /metrics`) capturing request throughput, latency summaries, in-flight requests, and status code distributions visualized in a custom 7-panel Grafana dashboard.
- **🔄 Automated CI/CD Pipeline**: GitHub Actions workflow running automated integration tests, validating Kubernetes YAML schemas, and building versioned Docker images.
- **💻 Multi-Platform Client Support**:
  - **CampusConnect Web Portal**: Responsive dashboard with timetable, course catalog, profile management, and interactive widgets.
  - **React SPA**: Single-page application built with React and Vite.
  - **Android Native Client**: Native Android application (Kotlin/Retrofit) for mobile student access.

---

## 🛠️ Technologies & Frameworks

| Layer | Technologies |
|---|---|
| **Frontend & Clients** | HTML5, Modern CSS (Glassmorphism, Flexbox/Grid), JavaScript (ES6+), React 18, Vite, Android SDK (Kotlin, Retrofit2, Coroutines) |
| **Backend & Microservices** | Node.js (Express), Java 17 (Spring Boot 3, Spring Web, Spring Data JPA) |
| **Databases & Storage** | MongoDB Atlas (Cloud Managed NoSQL), In-Memory Microservice Stores |
| **Containerization & Orchestration** | Docker, Docker Compose, Kubernetes (`kubectl`, Deployments, Services, ConfigMaps, Secrets) |
| **CI/CD & DevOps** | GitHub Actions (`actions/checkout@v4`, `actions/setup-node@v4`, Docker Multi-Build) |
| **Observability & Monitoring** | Prometheus (Scraping & PromQL), Grafana (Time-Series Dashboards) |
| **Cloud Deployment** | Render.com Infrastructure-as-Code (`render.yaml`), Railway, Fly.io |

---

## 📁 Project Structure

```
Campus-Connect/
├── .github/workflows/ci.yml         # GitHub Actions CI/CD Pipeline
├── CampusConnect/                   # CampusConnect Core Web Application
│   ├── css/style.css                # Custom Responsive Theme & Design System
│   ├── js/api.js                    # API Client Integration
│   ├── js/script.js                 # UI Interactivity & Dynamic Components
│   └── index.html                   # Student Portal Dashboard
├── microservices/                   # Microservices Architecture
│   ├── api-gateway/                 # API Gateway (Router, Logging, Metrics)
│   ├── user-service/                # User / Student Management Microservice
│   ├── product-service/             # Course / Product Catalog Microservice
│   ├── order-service/               # Course Enrollment Microservice
│   ├── metrics.js                   # Shared Prometheus Metrics Collector
│   ├── generate-traffic.js          # Traffic Simulation Script for Monitoring
│   ├── test-microservices.js        # Lab 7 Automated Microservice Tests (43/43)
│   └── test-lab8.js                 # Lab 8 K8s & Monitoring Verification (54/54)
├── k8s/                             # Kubernetes Manifests
│   ├── namespace.yaml               # 'lab8' Environment Namespace
│   ├── configmap.yaml               # Non-sensitive DNS URLs & Environment
│   ├── secret.yaml                  # Sensitive DB/JWT Secret Templates
│   ├── gateway-deployment.yaml      # API Gateway Deployment & Health Probes
│   ├── gateway-service.yaml         # External NodePort Service (Port: 30080)
│   ├── user-deployment.yaml         # User Service Deployment (Scalable 1..3)
│   ├── user-service.yaml            # User Service ClusterIP Service
│   ├── product-deployment.yaml      # Product Service Deployment
│   ├── product-service.yaml         # Product Service ClusterIP Service
│   ├── order-deployment.yaml        # Order Service Deployment
│   ├── order-service.yaml           # Order Service ClusterIP Service
│   └── monitoring/                  # Prometheus & Grafana K8s Manifests
│       ├── prometheus-configmap.yaml
│       ├── prometheus-deployment.yaml
│       ├── grafana-deployment.yaml
│       └── grafana-dashboard.json
├── student-api/                     # Full-Stack Student REST API (Node & Spring Boot)
├── student-client/                  # React + Vite Student Client Application
├── student-android-client/          # Native Android Kotlin Client Application
├── compose.microservices.yaml       # Multi-Container Microservices Docker Stack
├── compose.monitoring.yaml          # Local Prometheus & Grafana Monitoring Stack
├── render.yaml                      # Render.com Cloud Infrastructure Blueprint
├── prometheus.yml                   # Prometheus Local Scrape Configuration
└── README.md                        # Project Documentation
```

---

## ⚙️ Environment Variables Configuration

To run the project securely without exposing sensitive secrets, environment variables are managed via `.env` files (locally) or Kubernetes `ConfigMap`/`Secret` objects (in production).

### Required Environment Variables

| Variable | Description | Sample Default / Placeholder |
|---|---|---|
| `PORT` | Listening port for the service | `3000` (Gateway), `3001` (Users), `3002` (Products), `3003` (Orders) |
| `NODE_ENV` | Runtime environment mode | `development` / `production` |
| `USER_SERVICE_URL` | Endpoint to reach User Service | `http://user-service:3001` or `http://localhost:3001` |
| `PRODUCT_SERVICE_URL` | Endpoint to reach Product Service | `http://product-service:3002` or `http://localhost:3002` |
| `ORDER_SERVICE_URL` | Endpoint to reach Order Service | `http://order-service:3003` or `http://localhost:3003` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/campusconnect` |
| `JWT_SECRET` | Secret key for signing tokens | `your-secure-jwt-secret-token` |

---

## 🚀 Setup & Local Execution

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20 LTS)
- [Docker & Docker Desktop](https://www.docker.com/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (optional, for K8s deployment)

---

### Option 1: Running with Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PanthilShah/Campus-Connect.git
   cd Campus-Connect
   ```

2. **Start the Microservices Stack**:
   ```bash
   docker compose -f compose.microservices.yaml up -d --build
   ```

3. **Verify running containers**:
   ```bash
   docker compose -f compose.microservices.yaml ps
   ```

4. **Access the Application**:
   - **API Gateway**: `http://localhost:3001`
   - **Gateway Health**: `http://localhost:3001/health`
   - **Service Discovery Registry**: `http://localhost:3001/services`
   - **Prometheus Metrics**: `http://localhost:3001/metrics`
   - **Users API**: `http://localhost:3001/users`
   - **Courses/Products API**: `http://localhost:3001/products`
   - **Enrollments/Orders API**: `http://localhost:3001/orders`

---

### Option 2: Running in Kubernetes (`k8s/`)

1. **Create Namespace and apply configurations**:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml -n lab8
   kubectl apply -f k8s/secret.yaml -n lab8
   ```

2. **Deploy Microservices and Gateway**:
   ```bash
   kubectl apply -f k8s/ -n lab8
   ```

3. **Check status of Pods & Services**:
   ```bash
   kubectl get pods -n lab8
   kubectl get services -n lab8
   ```

4. **Scale User Service to 3 Replicas**:
   ```bash
   kubectl scale deployment user-service --replicas=3 -n lab8
   ```

---

### Option 3: Running Standalone Node.js Services

```bash
# 1. Install dependencies
cd microservices/api-gateway && npm install
cd ../user-service && npm install
cd ../product-service && npm install
cd ../order-service && npm install
cd ../..

# 2. Run all integration and microservice tests
node microservices/test-microservices.js
node microservices/test-lab8.js
```

---

## 📊 Monitoring & Observability

### 1. Generating Traffic
Run the automated traffic simulator to send requests and simulate successes, lookups, and error scenarios:
```bash
node microservices/generate-traffic.js
```

### 2. Launching Prometheus & Grafana
```bash
docker compose -f compose.monitoring.yaml up -d
```
- **Prometheus UI**: `http://localhost:9090`
- **Grafana Dashboard**: `http://localhost:3005` (Login: `admin` / `admin`)
  - Import the pre-configured dashboard JSON from [`k8s/monitoring/grafana-dashboard.json`](./k8s/monitoring/grafana-dashboard.json)

---

## 🧪 Testing & Validation

```bash
# Run Microservices & API Gateway Test Suite (43 Tests)
node microservices/test-microservices.js

# Run Kubernetes, CI/CD & Metrics Test Suite (54 Tests)
node microservices/test-lab8.js
```

---

## 👨‍💻 Author

**Panthil Shah**  
M.Sc. Information Technology  
*Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar, Gujarat, India*  
GitHub: [@PanthilShah](https://github.com/PanthilShah)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
