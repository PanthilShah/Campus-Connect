# CampusConnect — Lab 8: Kubernetes Orchestration, CI/CD & Monitoring
**Course**: Web Services & Service-Oriented Architecture (IT644)  
**Institution**: Dhirubhai Ambani University (formerly DA-IICT)  
**Student**: Panthil Shah (M.Sc. IT — `MScIT-25-001`)  
**Stack**: Kubernetes (`kubectl`) · GitHub Actions (`.github/workflows/ci.yml`) · Prometheus · Grafana

---

## 1. Lab Objective & Scope

Lab 8 transitions the **CampusConnect** microservices system (built across Labs 5, 6, and 7) into a fully automated, production-grade DevOps workflow:
1. **Kubernetes Orchestration**: Container orchestration using Pods, Deployments, ClusterIP & NodePort Services, ConfigMaps, and Secrets in the `lab8` namespace.
2. **Dynamic Service Discovery**: Internal DNS name resolution (`user-service.lab8.svc.cluster.local:3001`, `product-service.lab8.svc.cluster.local:3002`, `order-service.lab8.svc.cluster.local:3003`).
3. **Resilience, Scaling & Self-Healing**: Dynamic horizontal scaling (`kubectl scale`) and automated pod replacement upon failure/deletion.
4. **Automated CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`) triggering on `push` and `pull_request` to run tests and build multi-service Docker images.
5. **Observability & Monitoring**: Prometheus scraping `GET /metrics` across all microservices and Grafana visualization dashboard answering traffic, latency, uptime, and error rate metrics.

---

## 2. End-to-End System Architecture

```
[ Client / Postman / Web Client ]
               │
               ▼
   [ NodePort / LoadBalancer ] (Port 30080 / 3001)
               │
   ┌───────────▼─────────────────────────────────────────────────┐
   │                  KUBERNETES CLUSTER (namespace: lab8)       │
   │                                                             │
   │   ┌─────────────────────────────────────────────────────┐   │
   │   │        API Gateway Service (ClusterIP / NodePort)   │   │
   │   │        Deployment: api-gateway (Replicas: 1)         │   │
   │   └───────┬─────────────────┬─────────────────┬─────────┘   │
   │           │                 │                 │             │
   │  DNS: http://user-service   │  DNS: http://order-service    │
   │           │                 │                 │             │
   │   ┌───────▼───────────┐ ┌───▼───────────────┐ ┌▼──────────┐ │
   │   │   User Service    │ │  Product Service  │ │   Order    │ │
   │   │  (Replicas: 1..3) │ │   (Replicas: 1)   │ │  Service   │ │
   │   │   (Port: 3001)    │ │   (Port: 3002)    │ │(Port: 3003)│ │
   │   └─────────┬─────────┘ └─────────┬─────────┘ └─────┬──────┘ │
   │             │                     │                 │        │
   │             └─────────────────────┼─────────────────┘        │
   │                                   ▼                          │
   │                      [ MongoDB Atlas (Managed DB) ]          │
   │                                                              │
   │   ┌──────────────────────────────────────────────────────┐   │
   │   │                OBSERVABILITY STACK                   │   │
   │   │   Prometheus (Scrapes /metrics on 3000, 3001, 3002, 3003)│
   │   │   Grafana Dashboard (Availability, Traffic, Errors, P95) │
   │   └──────────────────────────────────────────────────────┘   │
   └──────────────────────────────────────────────────────────────┘
```

---

## 3. Kubernetes Manifest Structure (`k8s/`)

| File | Resource Kind | Namespace | Purpose |
|---|---|---|---|
| [`k8s/namespace.yaml`](./k8s/namespace.yaml) | `Namespace` | `lab8` | Isolated environment namespace for Lab 8 resources |
| [`k8s/configmap.yaml`](./k8s/configmap.yaml) | `ConfigMap` | `lab8` | Non-sensitive configurations: internal DNS URLs, ports, environment |
| [`k8s/secret.yaml`](./k8s/secret.yaml) | `Secret` | `lab8` | Sensitive credentials: MongoDB Atlas connection URI, JWT secrets |
| [`k8s/gateway-deployment.yaml`](./k8s/gateway-deployment.yaml) | `Deployment` | `lab8` | API Gateway Pods (1 replica), health probes, resource limits |
| [`k8s/gateway-service.yaml`](./k8s/gateway-service.yaml) | `Service` (`NodePort`) | `lab8` | External entry point routing to port 3000 (NodePort `30080`) |
| [`k8s/user-deployment.yaml`](./k8s/user-deployment.yaml) | `Deployment` | `lab8` | User Service Pods (1 to 3 replicas with horizontal scaling) |
| [`k8s/user-service.yaml`](./k8s/user-service.yaml) | `Service` (`ClusterIP`) | `lab8` | Internal stable DNS entry point on port `3001` |
| [`k8s/product-deployment.yaml`](./k8s/product-deployment.yaml) | `Deployment` | `lab8` | Product Service Pods, health probes, resource limits |
| [`k8s/product-service.yaml`](./k8s/product-service.yaml) | `Service` (`ClusterIP`) | `lab8` | Internal stable DNS entry point on port `3002` |
| [`k8s/order-deployment.yaml`](./k8s/order-deployment.yaml) | `Deployment` | `lab8` | Order Service Pods with inter-service orchestration |
| [`k8s/order-service.yaml`](./k8s/order-service.yaml) | `Service` (`ClusterIP`) | `lab8` | Internal stable DNS entry point on port `3003` |
| [`k8s/monitoring/prometheus-deployment.yaml`](./k8s/monitoring/prometheus-deployment.yaml) | `Deployment` + `Service` | `lab8` | Prometheus server (NodePort `30090`) |
| [`k8s/monitoring/grafana-deployment.yaml`](./k8s/monitoring/grafana-deployment.yaml) | `Deployment` + `Service` | `lab8` | Grafana visualizer (NodePort `30030`) |

---

## 4. Kubernetes Deployment & Verification Guide

### 4.1 Cluster Verification & Namespace Creation
```bash
# Verify active Kubernetes context and nodes
kubectl config current-context
kubectl get nodes

# Create the Lab 8 namespace
kubectl apply -f k8s/namespace.yaml
# Or: kubectl create namespace lab8
```

### 4.2 Applying Application Manifests
```bash
# Apply configuration and secrets first
kubectl apply -f k8s/configmap.yaml -n lab8
kubectl apply -f k8s/secret.yaml -n lab8

# Apply all microservice Deployments and Services
kubectl apply -f k8s/ -n lab8

# Verify all Deployments, Pods, and Services
kubectl get deployments -n lab8
kubectl get pods -n lab8
kubectl get services -n lab8
```

### 4.3 Scaling Demonstration (Part A.7)
```bash
# Scale User Service from 1 replica to 3 replicas
kubectl scale deployment user-service --replicas=3 -n lab8

# Verify 3 healthy pods are running
kubectl get pods -n lab8 -l app=user-service
```

### 4.4 Self-Healing Demonstration (Part A.8)
```bash
# List active pods
kubectl get pods -n lab8

# Intentionally delete one running User Service pod
kubectl delete pod <user-service-pod-name> -n lab8

# Kubernetes Deployment controller automatically detects discrepancy and spins up a replacement
kubectl get pods -n lab8
```

---

## 5. GitHub Actions CI/CD Pipeline (Part B)

Workflow defined in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml):

- **Triggers**: On every `push` and `pull_request` to `main` / `master`.
- **Runner**: `ubuntu-latest`.
- **Workflow Pipeline Stages**:
  1. **Source Checkout**: `actions/checkout@v4`.
  2. **Node.js Setup**: `actions/setup-node@v4` with Node.js 20.
  3. **Dependency Installation**: `npm ci` across all microservice directories.
  4. **Automated Testing**: Runs `node microservices/test-microservices.js` (43 tests covering gateway, discovery, and inter-service communication).
  5. **Kubernetes Manifest Validation**: Dry-run syntax and structure check on all YAML files in `k8s/`.
  6. **Docker Multi-Image Build**: Builds versioned container images for:
     - `campusconnect-api-gateway:${{ github.sha }}`
     - `campusconnect-user-service:${{ github.sha }}`
     - `campusconnect-product-service:${{ github.sha }}`
     - `campusconnect-order-service:${{ github.sha }}`

---

## 6. Monitoring with Prometheus & Grafana (Part C)

### 6.1 Prometheus Metrics Endpoints (`GET /metrics`)
Each microservice and the API Gateway expose standard Prometheus metrics:
- **`up`**: Service availability gauge (`1` = UP, `0` = DOWN).
- **`process_uptime_seconds`**: Lifetime of the service process.
- **`http_requests_total`**: Counter dimensioned by `{service, method, route, status}`.
- **`http_request_duration_seconds`**: Latency summary (sum and count).
- **`http_active_requests`**: Current in-flight request gauge.

### 6.2 Key Prometheus PromQL Queries
| Operational Question | PromQL Query |
|---|---|
| **Are targets reachable?** | `up{environment="k8s-lab8"}` |
| **How much traffic is arriving?** | `sum by (service) (rate(http_requests_total[1m]))` |
| **Are failures (4xx/5xx) increasing?** | `sum by (status) (rate(http_requests_total{status=~"4..|5.."}[1m]))` |
| **What is the average request latency?** | `sum by (service) (http_request_duration_seconds_sum) / sum by (service) (http_request_duration_seconds_count)` |

### 6.3 Grafana Dashboard Definition
Defined in [`k8s/monitoring/grafana-dashboard.json`](./k8s/monitoring/grafana-dashboard.json) with 7 focused panels:
1. **Service Availability (UP/DOWN)** — Green/Red status badge.
2. **Process Uptime** — Live uptime counters for all services.
3. **Active In-Flight Requests** — Gauge tracking real-time load.
4. **Total Requests Processed** — Stat counter of historical throughput.
5. **Traffic / Request Rate (req/sec)** — Time-series graph by service.
6. **Error Rate by Status Code** — Time-series graph highlighting 400, 404, 502, 503 anomalies.
7. **Average Request Latency** — Time-series graph measuring response times in seconds.

---

## 7. Deliverables & Evidence Checklist (Section 7.1)

| No. | Evidence Item | Verification Command / Source | Verified Status |
|---|---|---|---|
| **1** | Lab 7 Baseline | `Invoke-RestMethod http://localhost:3001/health` | ✅ Passed (UP, 200 OK) |
| **2** | Kubernetes Environment | `kubectl config current-context` & `kubectl get nodes` | ✅ Verified (`v1.36.1`) |
| **3** | Manifests | Files in `k8s/` (`gateway`, `user`, `product`, `order`, `configmap`, `secret`) | ✅ Validated (54/54 tests) |
| **4** | Deployment in `lab8` | `kubectl get deployments,pods,services -n lab8` | ✅ Ready & Validated |
| **5** | Gateway Test | `Invoke-RestMethod http://localhost:3001/users` | ✅ 200 OK via Proxy |
| **6** | Scaling | `kubectl scale deployment user-service --replicas=3 -n lab8` | ✅ 3 Replicas Validated |
| **7** | Self-Healing | `kubectl delete pod <pod-name> -n lab8` | ✅ Replacement Verified |
| **8** | Troubleshooting | `kubectl describe pod`, `kubectl logs`, `kubectl get endpoints` | ✅ Documented in Section 8 |
| **9** | GitHub Actions CI | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | ✅ Multi-Service Matrix |
| **10** | Prometheus Metrics | `GET http://localhost:3001/metrics` | ✅ Standard Format Scraped |
| **11** | Grafana Dashboard | [`k8s/monitoring/grafana-dashboard.json`](./k8s/monitoring/grafana-dashboard.json) | ✅ 7 Operational Panels |
| **12** | API Traffic Simulation | `node microservices/generate-traffic.js` | ✅ 50 Requests Generated |
| **13** | Architecture Diagram | Section 2 of this README | ✅ Complete Flow Documented |

---

## 8. Troubleshooting Guide

```bash
# 1. Inspect Pod status and recent Kubernetes events
kubectl describe pod <pod-name> -n lab8

# 2. View live stdout/stderr application logs
kubectl logs <pod-name> -n lab8 -f

# 3. Check service endpoints to confirm pod discovery
kubectl get endpoints -n lab8

# 4. Test internal DNS resolution from within a cluster pod
kubectl exec -it <api-gateway-pod> -n lab8 -- wget -qO- http://user-service:3001/health
```
