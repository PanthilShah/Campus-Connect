# Lab 5: Docker & Containerization
## Web Services & SOA Laboratory
### Dhirubhai Ambani University (formerly DA-IICT), Gandhinagar
**Student**: Panthil Shah (`MScIT-25-0XX`) &bull; **Program**: M.Sc. Information Technology (Semester 3)

---

## 1. Objective

Containerize the **Student REST API** and its **MongoDB Database** using **Docker** and **Docker Compose**. This lab establishes production-grade containerization practices:
1. Writing optimized **Dockerfiles** with layer caching and minimal base images (`node:20-alpine`).
2. Building, tagging, and running standalone Docker images (`student-api:v1`).
3. Configuring multi-container communication across a dedicated Docker bridge network (`student-network`).
4. Establishing data persistence across container restarts using a named Docker volume (`student-mongo-data`).
5. Orchestrating the entire full-stack application with **Docker Compose** (`compose.yaml`).

---

## 2. Container Architecture & Networking

```
                             Host Machine / Browser / Postman
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ Port 3000:3000      │ Port 8080:80  │
                        ▼                     ▼               ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                 Docker Bridge Network:                      │
        │                    student-network                          │
        │                                                             │
        │   ┌───────────────────────────┐  ┌──────────────────────┐   │
        │   │       student-api         │  │    student-client    │   │
        │   │      (Node.js/Express)    │  │     (React/Nginx)    │   │
        │   │   Environment:            │  │   Port: 80           │   │
        │   │   PORT=3000               │  └──────────────────────┘   │
        │   │   MONGO_URI=mongodb://    │                             │
        │   │     mongodb:27017/cc      │                             │
        │   └─────────────┬─────────────┘                             │
        │                 │ Hostname: mongodb                         │
        │                 │ Port: 27017                               │
        │                 ▼                                           │
        │   ┌───────────────────────────┐                             │
        │   │         mongodb           │                             │
        │   │    (Official Mongo Image) │                             │
        │   │    Data Dir: /data/db     │                             │
        │   └─────────────┬─────────────┘                             │
        └─────────────────┼───────────────────────────────────────────┘
                          │ Volume Mount
                          ▼
            ┌───────────────────────────┐
            │    student-mongo-data     │
            │   (Docker Named Volume)   │
            │  Persistent on Host Disk  │
            └───────────────────────────┘
```

> **Important Networking Rule**: Inside the container network, containers resolve each other using their service/container name (`mongodb`) rather than `localhost`. Thus, `MONGO_URI` is set to `mongodb://mongodb:27017/campusconnect`.

---

## 3. Step-by-Step Practical Execution Guide

### Step 1: Verify Pre-Docker Baseline
Confirm the Student REST API runs locally and passes all automated tests:
```bash
cd student-api
npm test
```
*Expected: 23/23 tests passing.*

---

### Step 2: Build the Student API Docker Image
```bash
cd student-api
docker build -t student-api:v1 .
```
Verify the built image:
```bash
docker images
```

---

### Step 3: Run the Standalone API Container
```bash
docker run -d --name student-api -p 3000:3000 student-api:v1
```
Verify running container:
```bash
docker ps
```
Test via curl / Postman:
```bash
curl http://localhost:3000/students
```

---

### Step 4: Multi-Container Setup with Docker Network
1. Create a dedicated bridge network:
   ```bash
   docker network create student-network
   ```
2. Create persistent volume for MongoDB:
   ```bash
   docker volume create student-mongo-data
   ```
3. Run MongoDB container attached to the network and volume:
   ```bash
   docker run -d --name mongodb --network student-network -v student-mongo-data:/data/db mongo:latest
   ```
4. Run Student API container with `MONGODB_URI` pointing to `mongodb`:
   ```bash
   docker run -d --name student-api --network student-network -p 3000:3000 -e PORT=3000 -e MONGODB_URI=mongodb://mongodb:27017/campusconnect student-api:v1
   ```

---

### Step 5: Data Persistence Verification Test
To prove data survives container destruction:
1. **Insert a Student** via Postman or curl:
   ```bash
   curl -X POST http://localhost:3000/students \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"Panthil Shah\",\"email\":\"panthil.shah@dau.ac.in\",\"course\":\"M.Sc. Information Technology\",\"semester\":3}"
   ```
2. **Stop and Remove the MongoDB container**:
   ```bash
   docker stop mongodb
   docker rm mongodb
   ```
3. **Launch a Brand New MongoDB container** using the SAME volume:
   ```bash
   docker run -d --name mongodb --network student-network -v student-mongo-data:/data/db mongo:latest
   ```
4. **Retrieve Students**:
   ```bash
   curl http://localhost:3000/students
   ```
   *Result: Panthil Shah record is intact because data was preserved on disk inside `student-mongo-data` volume.*

---

### Step 6: Orchestration with Docker Compose

To launch the complete multi-tier stack (API + MongoDB + Client) in a single command:
```bash
docker compose up -d
```

Check running services:
```bash
docker compose ps
```

View aggregated logs:
```bash
docker compose logs -f
```

Stop the stack (preserving persistent volumes):
```bash
docker compose down
```

---

## 4. Docker Commands Quick Reference

| Command | Description |
|---|---|
| `docker --version` | Verify Docker Engine & CLI installation |
| `docker build -t student-api:v1 .` | Build Docker image from Dockerfile |
| `docker images` | List local Docker images |
| `docker run -d --name <name> -p <host>:<container> <image>` | Run container in background |
| `docker ps` | List active containers |
| `docker logs <container>` | Inspect runtime container logs |
| `docker network create <net>` | Create bridge network |
| `docker volume create <vol>` | Create persistent named volume |
| `docker compose up -d` | Build and start multi-container stack |
| `docker compose down` | Stop and remove Compose resources |

---

## 5. Summary of Files Created

1. `student-api/Dockerfile` &mdash; Production multi-stage Alpine Docker image configuration.
2. `student-api/.dockerignore` &mdash; Excludes `node_modules`, `.git`, and `.env` from build context.
3. `student-client/Dockerfile` &mdash; Production React + Nginx static server image.
4. `student-client/.dockerignore` &mdash; Excludes build artifacts from client image.
5. `compose.yaml` / `docker-compose.yml` &mdash; Multi-service composition file.
6. `LAB5_README.md` &mdash; Full documentation of containerization and persistence verification.
