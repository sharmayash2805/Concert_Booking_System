# Stubline Frontend

React 18, TypeScript, and Vite frontend. Server data is managed with TanStack Query, API requests use Axios, and forms use React Hook Form with Zod validation.

## Local development

```sh
npm install
npm run dev
```

Vite serves the app at `http://localhost:8080` and proxies `/api` to `http://localhost:8081`. Set `API_PROXY_TARGET` to override the local backend address or `VITE_API_URL` to use a different API base URL.

## Checks

```sh
npm run lint
npx tsc --noEmit
npm run build
```