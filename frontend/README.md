# Frontend Service — Learning Platform

React single-page application built with Vite, Axios, and a dark theme design system.

## Tech Stack

| Concern       | Technology                           |
|---------------|--------------------------------------|
| Framework     | React 18 / Vite 6                    |
| Routing       | React Router v6                      |
| HTTP Client   | Axios                                |
| Icons         | Lucide React                         |
| Styling       | Vanilla CSS (Dark Theme Tokens)      |

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                ← Entry point
│   ├── App.jsx                 ← Component sandbox / verification page
│   ├── index.css               ← Dark theme design tokens & animations
│   ├── api/
│   │   └── client.js           ← Axios instance with JWT interceptor & 401 redirect
│   └── components/
│       └── common/             ← Reusable dark UI components
│           ├── Button.jsx      ← CTA button with variants & loading state
│           ├── Input.jsx       ← Form input with label & error states
│           ├── Card.jsx        ← Container with dark glow & hover effects
│           └── LoadingSkeleton.jsx ← Shimmering placeholder component
├── .env                        ← Local environment configuration
├── .env.example                ← Environment template
├── index.html                  ← Application HTML wrapper
├── package.json                ← Dependencies & npm scripts
└── vite.config.js              ← Vite bundler configuration
```

## Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies

From the `frontend` directory:
```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your running backend:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Run development server

```bash
npm run dev
```

The application will start on **http://localhost:5173**.

### 4. Production Build

To test or generate the production bundle:
```bash
npm run build
```
Build output is saved to the `dist/` directory.

## Core Components

| Component | File | Description |
|---|---|---|
| `Button` | `src/components/common/Button.jsx` | Flexible CTA supporting `primary`, `secondary`, `outline`, `danger` variants, sizes, and loading state. |
| `Input` | `src/components/common/Input.jsx` | Form input field with label, validation error feedback, and styled focus states. |
| `Card` | `src/components/common/Card.jsx` | Dark container with subtle borders, elevation shadows, and hover animations. |
| `LoadingSkeleton` | `src/components/common/LoadingSkeleton.jsx` | Shimmer placeholder element for loading states. |
| `client` | `src/api/client.js` | Axios instance auto-attaching `Authorization: Bearer <token>` and redirecting to `/login` on `401`. |
