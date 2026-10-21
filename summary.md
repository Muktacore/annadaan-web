# Project Summary (annadaan-web)

This project is a **React + Vite** starter template with Capacitor integration for native mobile support. The repository contains configuration files, source code, and a small Android placeholder. Below is a concise overview of the main files and directories.

## File Listing

- **`.env.example`** – Environment variable template.
- **`.env.local`** – Local environment overrides (ignored by Git).
- **`.gitignore`** – Git ignore rules.
- **`README.md`** – Project documentation.
- **`android/`** – Capacitor/Android native project folder (currently empty).
- **`capacitor.config.json`** – Capacitor configuration.
- **`components.json`** – UI component metadata (used by design tools).
- **`eslint.config.js`** – ESLint config for the project.
- **`index.html`** – Vite entry HTML file.
- **`jsconfig.json`** – JavaScript project settings.
- **`package-lock.json`** – NPM lock file.
- **`package.json`** – NPM package list & scripts.
- **`public/`** – Static assets (e.g., favicon, images).
- **`src/`** – Source code:
  - **`main.jsx`** – Application bootstrap.
  - **`App.jsx`** – Routing configuration.
  - **`index.css`** – Global styles.
  - **`layouts/`** – Layout components (AppShell, MainLayout).
  - **`components/`** – Reusable React components.
  - **`pages/`** – Page components (Home, Login, etc.).
  - **`context/`** – React context providers.
  - **`hooks/`** – Custom React hooks.
  - **`lib/`** – Utility functions.
- **`vite.config.js`** – Vite build configuration.

## Quick Notes

- The app uses **React Router v6** for navigation.
- **ProtectedRoute** component guards routes that require authentication.
- The app includes a **Map** page showing available donations.
- Capacitor is configured but the native Android folder is empty until a build is performed.
- Linting is enabled via ESLint with a React‑friendly rule set.
- Vite handles hot‑module replacement for rapid development.

Feel free to explore the `src/` folder for the component hierarchy and routing logic.
