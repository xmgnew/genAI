# NutriLens

NutriLens is a fullstack hackathon MVP for AI-assisted nutrition decisions.

## Stack

- Frontend: Next.js + Tailwind CSS
- Backend: FastAPI
- AI: OpenAI API

## App routes

- `/`
- `/analyze-food`
- `/compare-meals`
- `/daily-nutrition`

## API routes

- `POST /analyze-food`
- `POST /compare-meals`
- `POST /daily-nutrition`
- `GET /health`

## Environment

Create `.env.local` for the frontend and `.env` for the backend, or export variables in your shell.

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Run the frontend

```bash
npm install
npm run dev:web
```

The frontend runs on `http://localhost:3000` and expects the API on `http://127.0.0.1:8000`.

## Frontend overview

The frontend is a Next.js App Router app with a shared visual shell and three workflow modules:

- Home: landing page with the NutriLens product framing and entry points into each workflow.
- Analyze Food: upload a meal image, preview it, and render structured nutrition analysis output.
- Compare Meals: submit two meal descriptions and render a winner, scorecard, and tradeoffs.
- Daily Monitoring: log meals across a day and generate a summary, gaps, and action plan.

## Frontend UX and theme

The frontend was intentionally redesigned to feel more distinct than a default dashboard. The current UI direction includes:

- A brighter editorial "bio-lab" theme with layered gradients, ambient lighting, and stronger contrast.
- Shared glass panels and dark data surfaces for a clearer hierarchy between input, insight, and raw model output.
- Animated route transitions so moving between modules feels like entering a new workspace instead of a hard page swap.
- Pointer-reactive spotlight effects and click ripples on major controls and cards.
- Active navigation states and reusable metric/status treatments across every page.

## Frontend structure

The main frontend files are:

- `src/app/layout.js`: root shell, background layers, and shared navigation.
- `src/app/template.js`: route transition wrapper for App Router page changes.
- `src/app/globals.css`: theme tokens, global surfaces, button treatments, and animation definitions.
- `src/components/nav-bar.js`: sticky navigation with active route styling.
- `src/components/page-intro.js`: reusable intro block used by each workflow page.
- `src/components/json-panel.js`: raw JSON response viewer.
- `src/components/interaction-effects.js`: delegated click ripple and pointer spotlight behavior.

## Frontend behavior notes

- The UI expects structured JSON responses from the backend and is designed around stable response shapes.
- The visual effects are implemented in shared CSS and one small client-side interaction helper instead of per-page animation code.
- The pages are statically buildable; `npm run build` succeeds with the current frontend changes.

## Run the backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm run dev:api
```

## Notes

- `POST /analyze-food` accepts `multipart/form-data` with `image`, `notes`, and `goal`.
- The backend uses OpenAI structured JSON output so the UI can render stable response shapes.
- Nutrition values are estimates and should not be treated as medical advice.
