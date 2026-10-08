# Text Summary API

A REST API that summarizes text using a locally hosted LLM. Users upload a `.txt`, `.pdf`, or `.docx` file (or send raw text). The API extracts the content, gets a summary from **Llama 3.1 (8B)** running on **Ollama**, and saves both to **Firebase Firestore**. Authentication and role-based access control use **Firebase Auth**.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Authentication & Roles](#authentication--roles)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [CI/CD](#cicd)

## Architecture

```
┌────────┐   HTTP + Bearer token   ┌──────────────────────┐   POST /summarize   ┌───────────────────┐   chat   ┌──────────────────┐
│ Client │ ──────────────────────► │ Node.js / Express API│ ──────────────────► │ Python / FastAPI  │ ───────► │ Ollama           │
└────────┘                         │ (port 3000)          │ ◄────────────────── │ LLM service       │ ◄─────── │ llama3.1:8b      │
                                   └──────────┬───────────┘      summary        │ (port 5001)       │          │ (port 11434)     │
                                              │                                 └───────────────────┘          └──────────────────┘
                                              ▼
                                   ┌──────────────────────┐
                                   │ Firebase Auth +      │
                                   │ Firestore ("items")  │
                                   └──────────────────────┘
```

1. The **Express API** verifies the Firebase ID token and checks the caller's role.
2. Multer accepts the uploaded file in memory, and the text is extracted from it (`pdf-parse` for PDF, `mammoth` for DOCX).
3. The text goes to the **FastAPI service**. It normalizes whitespace and asks Ollama for a summary.
4. The original text, the summary, and the file metadata are saved to Firestore.

## Tech Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| API server     | Node.js, Express 5, TypeScript                          |
| Validation     | Joi                                                     |
| File uploads   | Multer, pdf-parse, mammoth                              |
| Auth & DB      | Firebase Admin SDK (Auth + Firestore)                   |
| Security       | Helmet, CORS                                            |
| LLM service    | Python, FastAPI, Uvicorn, Pydantic, pandas              |
| LLM runtime    | Ollama with `llama3.1:8b`                               |
| Docs           | swagger-jsdoc, Swagger UI, Redocly                      |
| Testing        | Jest, ts-jest, Supertest                                |

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── firebaseConfig.ts        # Firebase Admin initialization
│   ├── src/
│   │   ├── app.ts                   # Express app, middleware, and route setup
│   │   ├── server.ts                # Entry point; loads backend/.env
│   │   ├── config/                  # CORS, Helmet, and Swagger config
│   │   ├── constants/               # HTTP status constants
│   │   └── api/v1/
│   │       ├── controllers/         # Request handlers
│   │       ├── services/            # Business logic
│   │       ├── repositories/        # Firestore data access
│   │       ├── routes/              # Route definitions + OpenAPI annotations
│   │       ├── middleware/          # authenticate, authorize, upload, validate, errorHandler
│   │       ├── validation/          # Joi schemas
│   │       ├── models/              # TypeScript interfaces
│   │       ├── utils/               # File extraction, LLM client
│   │       └── scripts/             # OpenAPI spec generator
│   ├── python-service/              # FastAPI LLM summarization service
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/summarize.py
│   │   ├── services/llm_service.py
│   │   └── models/schemas.py
│   └── test/                        # Jest test suites
├── docs/                            # Generated Redoc HTML docs
├── openapi.json                     # Generated OpenAPI spec
├── requirements.txt                 # Python dependencies
└── package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later, and npm
- [Python](https://www.python.org/) 3.10 or later
- [Ollama](https://ollama.com/download)
- A [Firebase](https://console.firebase.google.com/) project with **Authentication** and **Firestore** turned on, plus a service account key

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/sudepolar/Text-Summary-API.git
cd Text-Summary-API

# 2. Install Node dependencies
npm install

# 3. Create a Python virtual environment and install dependencies
cd backend/python-service
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r ../../requirements.txt
cd ../..

# 4. Pull the LLM model
ollama pull llama3.1:8b
```

> **Note:** `requirements.txt` was exported from a Windows environment and includes some packages the service does not use (for example `pywin32-ctypes` and `PySide6`). If installation fails on Linux or macOS, install only what the service needs:
>
> ```bash
> pip install fastapi uvicorn pydantic ollama pandas python-dotenv
> ```

## Configuration

### Node API: `backend/.env`

```env
PORT=3000
NODE_ENV=development

# Firebase service account credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# URL of the Python LLM service
LLM_SERVICE_URL=http://localhost:5001

# Comma-separated list of allowed origins (used when NODE_ENV is not "development")
ALLOWED_ORIGINS=http://localhost:5173
```

| Variable                | Required | Default                 | Description                                                  |
| ----------------------- | -------- | ----------------------- | ------------------------------------------------------------ |
| `PORT`                  | No       | `3000`                  | Port for the Express server                                  |
| `NODE_ENV`              | No       | —                       | Set to `development` to allow all CORS origins               |
| `FIREBASE_PROJECT_ID`   | Yes      | —                       | Firebase project ID                                          |
| `FIREBASE_CLIENT_EMAIL` | Yes      | —                       | Service account client email                                 |
| `FIREBASE_PRIVATE_KEY`  | Yes      | —                       | Service account private key (escaped `\n` sequences are fine) |
| `LLM_SERVICE_URL`       | No       | `http://localhost:5001` | Base URL of the FastAPI service                              |
| `ALLOWED_ORIGINS`       | No       | —                       | Comma-separated CORS allowlist for production                |

### Python service: `backend/python-service/.env` (optional)

```env
ROOT_PROMPT=Summarize the following report clearly and concisely.
```

| Variable      | Default                                                  | Description                         |
| ------------- | -------------------------------------------------------- | ----------------------------------- |
| `ROOT_PROMPT` | `Summarize the following report clearly and concisely.`  | System prompt sent to the LLM       |

> Never commit `.env` files or service account JSON files. `.gitignore` already excludes them.

## Running Locally

You need three processes running at once:

**1. Ollama** (if it isn't already running as a background service)

```bash
ollama serve
```

**2. Python LLM service**

```bash
cd backend/python-service
source venv/bin/activate          # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 5001
```

**3. Node API**

```bash
npm start
```

The API is now at `http://localhost:3000`. To check it:

```bash
curl http://localhost:3000/api/v1/health
```

## API Reference

The base path is `/api/v1`. Every endpoint except `/health` needs an `Authorization: Bearer <Firebase ID token>` header.

### Health

| Method | Endpoint  | Auth | Description                       |
| ------ | --------- | ---- | --------------------------------- |
| GET    | `/health` | —    | Server status, uptime, and version |

### Text Summaries

| Method | Endpoint             | Allowed roles           | Description                                |
| ------ | -------------------- | ----------------------- | ------------------------------------------ |
| GET    | `/text-summary`      | `admin`                 | List all text summaries                    |
| POST   | `/text-summary`      | `admin`, `user`         | Upload a file (or send text) and summarize |
| GET    | `/text-summary/:id`  | `admin`, or the same user | Get one summary by ID                    |
| PUT    | `/text-summary/:id`  | `admin`, `user`         | Update a summary                           |
| DELETE | `/text-summary/:id`  | `admin`                 | Delete a summary                           |

### Users & Admin

| Method | Endpoint                 | Allowed roles           | Description                       |
| ------ | ------------------------ | ----------------------- | --------------------------------- |
| GET    | `/users/:id`             | `admin`, or the same user | Get user details                |
| POST   | `/admin/setCustomClaims` | Authenticated           | Assign a role (`user` or `admin`) to a user |

### Examples

**Create a summary from a file upload**

```bash
curl -X POST http://localhost:3000/api/v1/text-summary \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@report.pdf" \
  -F "subject=Quarterly Report"
```

- Supported file types: `.txt`, `.pdf`, `.docx`
- Maximum file size: **5 MB**
- With no file attached, the `textContent` form field is summarized instead.

Response (`201 Created`):

```json
{
  "message": "Text summary created",
  "data": {
    "id": "abc123",
    "subject": "Quarterly Report",
    "textContent": "…original extracted text…",
    "summary": "…LLM-generated summary…",
    "file": {
      "originalName": "report.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 48213,
      "uploadedAt": "2026-10-08T12:00:00.000Z"
    },
    "createdAt": "2026-10-08T12:00:00.000Z"
  }
}
```

**Update a summary**

```bash
curl -X PUT http://localhost:3000/api/v1/text-summary/abc123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"summary": "An edited summary."}'
```

**Assign a role**

```bash
curl -X POST http://localhost:3000/api/v1/admin/setCustomClaims \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"uid": "user_abc123", "role": "admin"}'
```

## Authentication & Roles

- Clients sign in with Firebase Authentication and send the resulting **ID token** as a Bearer token.
- The `authenticate` middleware verifies the token and stores the user's `uid` and `role` (a custom claim) in `res.locals`.
- The `authorize` middleware checks the role against each route's allowed roles. If `allowSameUser` is set, users can also reach resources whose `:id` matches their own `uid`.
- Roles are set as Firebase custom claims through `POST /api/v1/admin/setCustomClaims`. A user must sign in again (or refresh their token) before a new role takes effect.

## Testing

```bash
npm test            # run all tests
npm run test:watch  # watch mode
npx jest --coverage # with a coverage report (written to coverage/)
```

The tests mock Firebase and the LLM client, so they don't need live services.

## API Documentation

- **Swagger UI** (interactive, available while the server is running): `http://localhost:3000/api-docs`
- **Redoc static docs:** to regenerate `openapi.json` and `docs/index.html`, run:

  ```bash
  npm run generate-docs
  ```

The **Deploy Documentation** workflow publishes the static docs to GitHub Pages; it only runs when triggered manually.

## CI/CD

GitHub Actions workflows live in `.github/workflows/`:

| Workflow              | Trigger                         | Purpose                                        |
| --------------------- | ------------------------------- | ---------------------------------------------- |
| `ci.yml`              | Push / PR to `main`             | Install dependencies and run the Jest suite    |
| `linting.yml`         | PR to `main`                    | ESLint with Reviewdog PR annotations           |
| `shai-hulud-check.yml`| Push / PR to `main`, `development` | Supply-chain security scan                  |
| `deploy-docs.yml`     | Manual                          | Build and deploy API docs to GitHub Pages      |
