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
- The backend uses OpenAI structured JSON output so the UI can render stable response shapes.
- Nutrition values are estimates and should not be treated as medical advice.
