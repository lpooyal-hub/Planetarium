# Celestial Atlas Planetarium

React frontend + Python FastAPI backend portfolio project for an interactive planetarium.

## Features

- React-based multilingual UI: English and Korean
- Animated canvas planetarium with planets, stars, zodiac lines, and shooting stars
- NASA APOD API through the Python backend
- Real NASA planet imagery in the planet cards and tracking panel
- Browser geolocation plus backend visibility calculation for zodiac constellations
- Client-side fallback if the backend is temporarily unavailable

## Structure

```text
backend/
  app/
    main.py
    routers/
      apod.py
      sky.py
    services/
      observability.py
src/
  App.jsx
  main.jsx
  api/
  astro/
  data/
  scene/
  styles.css
```

## Frontend

```bash
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend health check:

```text
http://127.0.0.1:8000/api/health
```

## Environment

Frontend `.env`:

```text
VITE_API_BASE_URL=
VITE_NASA_API_KEY=DEMO_KEY
```

Backend `backend/.env`:

```text
NASA_API_KEY=DEMO_KEY
NASA_BASE_URL=https://api.nasa.gov
FRONTEND_ORIGIN=http://127.0.0.1:5173
```

When running with Vite, `/api` is proxied to `http://127.0.0.1:8000`.

## Notes

The current location-based sky feature estimates visible zodiac constellations from latitude, longitude, local sidereal time, and approximate constellation center coordinates. It is meant as a portfolio-grade observing guide, not a precision ephemeris.

NASA sources:

- https://api.nasa.gov
- https://science.nasa.gov/solar-system/planets/
