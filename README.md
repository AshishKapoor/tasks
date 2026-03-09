# Task Manager — Full-Stack Application

A complete end-to-end task management application with three services:

1. **Microservice** — Serverless Express API managing tasks (SQLite database)
2. **Backend** — Express proxy service that forwards requests to the microservice
3. **Frontend** — React UI for adding, listing, and deleting tasks

## Architecture

```
┌────────────┐      ┌────────────┐      ┌──────────────────┐
│  Frontend   │─────▶│  Backend    │─────▶│  Microservice    │
│  React/Vite │      │  Express    │      │  Serverless/     │
│  :5173      │      │  :3000      │      │  Express  :3001  │
└────────────┘      └────────────┘      └──────────────────┘
   (Browser)          (Proxy)             (SQLite store)
```

- **Frontend** runs in the browser and calls the backend at `http://0.0.0.0:3000`
- **Backend** proxies API requests to the microservice at `http://microservice:3001/dev` (Docker) or `http://0.0.0.0:3001/dev` (local)
- **Microservice** is a serverless-style Express app running via `serverless-offline`, stores tasks in a SQLite database (`tasks.db`)

## Project Structure

```
project/
  microservice/          # Serverless task API (Part 1)
    app.js               # Express app + serverless handler
    store.js             # SQLite task store
    routes/tasks.js      # Task CRUD routes
    tests/tasks.test.js  # Jest test suite
    serverless.yml       # Serverless Framework config
    Dockerfile
    package.json
  backend/               # Backend proxy (Part 2)
    server.js            # Express proxy server
    Dockerfile
    package.json
  frontend/              # React frontend (Part 3)
    src/App.tsx          # Main React component
    src/main.tsx         # Entry point
    vite.config.ts       # Vite configuration
    Dockerfile
    package.json
  docker-compose.yml     # Orchestrates all 3 services
  postman_collection.json
  README.md
```

## How to Run

### Using Docker Compose (recommended)

```bash
docker compose up --build
```

All three services start automatically:

| Service      | URL                     |
| ------------ | ----------------------- |
| Frontend     | http://0.0.0.0:5173     |
| Backend      | http://0.0.0.0:3000     |
| Microservice | http://0.0.0.0:3001/dev |

### Running Locally (without Docker)

**1. Microservice** (requires: `npm install -g serverless`)

```bash
cd microservice
npm install
npx sls offline --httpPort 3001
```

**2. Backend**

```bash
cd backend
npm install
MICROSERVICE_URL=http://0.0.0.0:3001/dev node server.js
```

**3. Frontend**

```bash
cd frontend
npm install
VITE_API_URL=http://0.0.0.0:3000 npm run dev
```

## How to Test

### Unit Tests (Jest)

```bash
cd microservice
npm install
npm test
```

Test coverage:

```bash
npm run test:coverage
```

### Test Output

The test suite covers:

- **Create task** — valid creation, default status, missing/invalid fields, invalid status
- **Get tasks** — list all, empty list, get by ID, not found
- **Delete task** — successful deletion, not found
- **Invalid requests** — unknown routes, malformed JSON

## How to Call APIs

### Microservice (direct) — `http://0.0.0.0:3001/dev`

**Create a task:**

```bash
curl -X POST http://0.0.0.0:3001/dev/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries"}'
```

**Create a task with status:**

```bash
curl -X POST http://0.0.0.0:3001/dev/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Completed task", "status": "done"}'
```

**List all tasks:**

```bash
curl http://0.0.0.0:3001/dev/tasks
```

**Get task by ID:**

```bash
curl http://0.0.0.0:3001/dev/tasks/<task-id>
```

**Delete a task:**

```bash
curl -X DELETE http://0.0.0.0:3001/dev/tasks/<task-id>
```

### Backend API — `http://0.0.0.0:3000`

**Add a task:**

```bash
curl -X POST http://0.0.0.0:3000/api/add-task \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries"}'
```

**List all tasks:**

```bash
curl http://0.0.0.0:3000/api/tasks
```

**Delete a task:**

```bash
curl -X DELETE http://0.0.0.0:3000/api/task/<task-id>
```

### Postman

Import `postman_collection.json` into Postman to test all endpoints.

## Task Object

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries",
  "status": "pending",
  "createdAt": "2026-03-09T12:00:00.000Z"
}
```

- `id` — UUID, auto-generated
- `title` — string, required
- `status` — `"pending"` (default) or `"done"`
- `createdAt` — ISO 8601 timestamp, auto-generated

## HTTP Status Codes

| Code | Meaning                            |
| ---- | ---------------------------------- |
| 200  | Success                            |
| 201  | Task created                       |
| 204  | Task deleted (no content)          |
| 400  | Validation error / invalid input   |
| 404  | Task or route not found            |
| 502  | Microservice unavailable (backend) |
