# ChemSpace

ChemSpace is a full-stack chemistry workspace built with React + Vite on the frontend, FastAPI on the backend, and SQLite for persistence.

## Features

- Modern landing page and auth flow
- Secure login and registration
- Dashboard, molecule search, periodic table, calculator, reaction guidance, lab notes, and profile management
- REST APIs with SQLite-backed storage
- Responsive UI for desktop and mobile

## Project structure

- frontend: React + Vite app in the src folder
- backend: FastAPI API in backend/main.py
- database: SQLite file created automatically at backend/chemspace.db

## Setup

1. Install frontend dependencies
   - npm install
2. Install Python dependencies
   - python -m pip install -r backend/requirements.txt

## Run locally

Start the FastAPI backend:
- python -m uvicorn backend.main:app --reload --port 8000

In a second terminal, start the Vite frontend:
- npm run dev

The frontend is configured to proxy requests to the backend through /api.

## Demo accounts

You can create a new account from the Register page. The app stores users, profile details, and notes in SQLite.
