# TG Drive - Fullstack Cloud Storage

A modern cloud storage application using Telegram as the backend storage layer.

## Features
- **File System**: Browse, Create Folders, Nested structures.
- **Operations**: Upload (Drag & Drop), Download, Delete, Rename.
- **Authentication**: Secure login via Backend (Email/Password + Telegram Bot Token).
- **UI**: Modern React + TypeScript + TailwindCSS + Material UI.

## Setup

1.  **Backend**
    - Ensure MongoDB is running.
    - Setup `.env` in `server/` (see `server/.env.example`).
    - Run `npm run dev` in `server/`.

2.  **Frontend**
    - Navigate to `client/`.
    - Run `npm install`.
    - Run `npm run dev`.

## Environment Variables (.env)

Create a `.env` in `client/`:
```
VITE_API_URL=http://localhost:3000
```

## Tech Stack
- Frontend: React, Vite, TypeScript, Zustand, TailwindCSS, MUI.
- Backend: Express, Mongoose, Telegram Bot API.
mn
