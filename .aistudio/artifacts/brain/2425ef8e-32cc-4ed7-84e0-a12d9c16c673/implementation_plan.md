# Vercel & GitHub Deployment Configuration Plan

Resolve the Vercel deployment error (`No package.json found`) and ensure seamless continuous deployment from GitHub for Unicore CampusConnect.

## User Review & Critical Decisions

> [!IMPORTANT]
> The recommended full-stack architecture has been adopted:
> - **Build & Framework**: Detected as **React 19 + TypeScript** powered by **Vite 8** and **Tailwind CSS v4**.
> - **Vercel Architecture**: Dual-compatible configuration supporting both standard **Vite SPA build (`dist`)** and **Vercel Serverless Function (`api/index.ts`)** for backend endpoints (`/api/auth/*`, `/api/admin/*`, `/api/assistant/*`).
> - **Zero Feature Loss**: All existing themes, Super Admin governance for `manasadevi4077@gmail.com`, timetable, payslips, grievance voting, campus spots, and multilingual voice assistant will remain completely intact.

---

## 1. Overview & Diagnosis

### Root Cause Analysis of "No package.json found" on Vercel:
1. **Repository Structure**: When code is pushed or synced to GitHub from development sandboxes, either the project files reside inside a nested subdirectory (e.g., `applet/` or `unicore/`) while Vercel defaults to the Git root, or `package.json` was not tracked during initial commit.
2. **Missing Vercel Blueprint**: Without a `vercel.json` file, Vercel must auto-detect build scripts and output directories. Adding an explicit `vercel.json` removes all ambiguity by specifying `"framework": "vite"`, `"buildCommand": "npm run build"`, and `"outputDirectory": "dist"`.
3. **Full-Stack Compatibility**: In local development, the app runs `tsx server.ts` for Express API routes and dev middleware. On Vercel, static files are served from `dist`, while API routes are executed via Vercel Serverless Functions (`api/index.ts`).

---

## 2. Technical Architecture & Deployment Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GitHub Repository Root                          │
├────────────────────────────────────────────────────────────────────────┤
│  ├── package.json          (Vite 8, React 19, TypeScript, Express)    │
│  ├── vercel.json           (Build command, dist output, SPA rewrites)  │
│  ├── vite.config.ts        (Vite + Tailwind CSS v4 plugins)           │
│  ├── index.html            (HTML entry point)                          │
│  ├── tsconfig.json         (TypeScript configuration)                  │
│  ├── api/                                                              │
│  │   └── index.ts          (Vercel Serverless Function for Express)    │
│  ├── src/                                                              │
│  │   ├── App.tsx           (Root component & tab router)               │
│  │   ├── main.tsx          (React DOM client entry point)              │
│  │   └── ...               (All existing themes, views & components)   │
│  └── server.ts             (Local dev server & Express middleware)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        ┌───────────────────┐               ┌───────────────────┐
        │   Vite Frontend   │               │ Vercel Serverless │
        │   Build (`dist`)  │               │   API Functions   │
        └───────────────────┘               └───────────────────┘
```

---

## 3. Implementation Steps

### Step 1: Package.json Verification & Hardening
- Audit `package.json` to ensure clean module configuration (`"type": "module"`), production scripts (`"build": "vite build"`, `"start": "tsx server.ts"`, `"preview": "vite preview"`), and exact dependencies.
- Ensure all dependencies (`react`, `react-dom`, `lucide-react`, `motion`, `express`, `@google/genai`, `@tailwindcss/vite`, `vite`, `tsx`, `typescript`) are pinned and error-free.

### Step 2: Vercel Configuration (`vercel.json`)
- Create `vercel.json` in the root directory:
  ```json
  {
    "framework": "vite",
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/index.ts" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### Step 3: Vercel Serverless Entrypoint (`api/index.ts`)
- Export the Express app handler in `api/index.ts` so Vercel can run the backend endpoints (`/api/auth/*`, `/api/admin/*`, `/api/assistant/*`) without needing a long-running Node daemon.

### Step 4: Verification & GitHub Sync Checklist
- Run `npm run build` (`compile_applet`) to ensure clean compilation to `dist/`.
- Provide concise step-by-step GitHub & Vercel deployment instructions (including Root Directory setting in Vercel project settings if files are kept in a subfolder).
