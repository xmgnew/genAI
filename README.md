# NutriLens

NutriLens is an agentic AI nutrition copilot that helps Canadians monitor daily nutrition, detect preventive health risks, and take the next best action toward better physical health.

Built for the Sun Life healthcare hack category, NutriLens frames nutrition as a preventive-health signal and an opportunity for timely intervention.

## Product modules

- `Analyze Food`: convert a meal image into a concise nutrition monitoring update
- `Compare Meals`: compare two options and recommend the stronger preventive-health choice
- `Daily Monitoring`: summarize the day, surface the main risk pattern, and suggest the next best intervention

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

## Run the backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm run dev:api
```

The frontend runs on `http://localhost:3000` and expects the API on `http://127.0.0.1:8000`.

## Notes

- `POST /analyze-food` accepts `multipart/form-data` with `image`, `notes`, and `goal`.
- The backend uses OpenAI structured JSON output so the UI can render stable, agent-friendly response shapes.
- The product copy is centered on nutrition monitoring, preventive health, and next best intervention.
- Nutrition values are estimates and should not be treated as medical advice.
