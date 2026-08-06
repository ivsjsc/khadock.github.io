# Copilot Instructions for KhaDock Website & AI Backend

## Project Architecture
- The codebase is split into a static website (HTML/CSS/JS in root and `components/`, `js/`, `css/`) and a Node.js/Express backend (for AI and Firebase integration).
- Frontend pages (`*.html`) load shared components from `components/` and use scripts from `js/` for interactivity and API calls.
- Backend exposes REST endpoints (see `README-BACKEND.md`) for AI design generation and Firebase operations.

## Key Workflows
- **Frontend Build/Deploy:** Static files are deployed via Netlify. No build step required for HTML/CSS/JS.
- **Backend Build/Deploy:** Node.js backend is deployed on Render.com. Use `npm run dev` for local development.
- **Environment Variables:** Backend requires `.env` with `GEMINI_API_KEY`, `ALLOWED_ORIGINS`, etc. See `.env.example` and Render dashboard for actual values.
- **Firebase Integration:** Configure via `firebase-service-account.json` and update Firebase config in `js/auth.js`.

## Patterns & Conventions
- **Component Loading:** Header, footer, and FAB are loaded dynamically via JS (`loadComponents.js`).
- **API Calls:** Frontend JS calls backend endpoints using `window.KHADOCK_API_BASE` for dynamic API base URL selection.
- **AI Design:** Main endpoint is `/api/ai-design` (see `ai-design-simple.js`).
- **CORS:** Backend uses `ALLOWED_ORIGINS` env var for allowed domains (see `server.js` example in docs).
- **Styling:** Uses Tailwind CSS via CDN. Custom styles in `css/`.
- **Testing:** Manual via browser and API health checks (`/api/health`).

## Integration Points
- **Firebase:** Used for authentication and storing AI designs. See `FIREBASE-SETUP.md` and `FIREBASE-INTEGRATION-GUIDE.md`.
- **Google Gemini AI:** API key required, used in backend for design generation.
- **External Links:** Some navigation points to other domains (e.g., KhaHome.com).

## Examples
- To add a new API endpoint, follow the pattern in `server.js` and document in `README-BACKEND.md`.
- To update allowed origins, edit `.env` and redeploy backend on Render.
- To add a new frontend page, create an HTML file and reference shared components/scripts.

## References
- `README.md`, `README-BACKEND.md`, `FIREBASE-SETUP.md`, `FIREBASE-INTEGRATION-GUIDE.md`
- Key JS: `ai-design-simple.js`, `app.js`, `loadComponents.js`, `auth.js`
- Backend config: `.env`, `.env.example`, `firebase-service-account.json`

---
If any section is unclear or missing, please provide feedback for improvement.