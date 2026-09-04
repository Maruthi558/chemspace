# AGENTS.md

## Project context
- This repo is a React + Vite frontend with a FastAPI backend.
- The actual application root is `chemspace/chemspace`, not the outer workspace folder.
- Frontend source lives in `src/`; backend code lives in `backend/`.

## Important behavior
- The frontend proxies API calls under `/api` to the FastAPI backend.
- Backend persistence is SQLite in `backend/chemspace.db`.
- There are no dedicated test suites in the repository today.

## Primary commands
- Install frontend dependencies: `npm install`
- Run frontend dev server: `npm run dev`
- Build frontend: `npm run build`
- Lint JS/JSX: `npm run lint`
- Install Python backend dependencies: `python -m pip install -r backend/requirements.txt`
- Run backend server: `python -m uvicorn backend.main:app --reload --port 8000`

## Code organization
- `src/App.jsx` and `src/main.jsx` assemble the frontend app and routing.
- `src/pages/` contains page-level React views.
- `src/components/` contains reusable UI and 3D visualization components.
- `src/data/` contains static chemistry datasets.
- `src/services/api.js` contains frontend API helper logic.
- `backend/main.py` is the FastAPI backend entrypoint.

## Conventions and guidance
- Keep UI work inside `src/` and backend API work inside `backend/`.
- Use React function components and JSX as the existing code does.
- Avoid editing generated or third-party files in `dist/` and `node_modules/`.

## Useful references
- `README.md` for setup and feature overview.
- `package.json` for frontend dependencies and available npm scripts.
- `backend/requirements.txt` for backend dependencies.
