from typing import Any

import httpx
from fastapi import APIRouter, Query

from ..settings import settings

router = APIRouter()

FALLBACK_APOD = {
    "title": "Cosmic Reef",
    "date": "2020-04-24",
    "media_type": "image",
    "url": "https://apod.nasa.gov/apod/image/2004/STScI-H-p2016a-m-2000x1374.png",
    "hdurl": "https://apod.nasa.gov/apod/image/2004/STScI-H-p2016a-m-2000x1374.png",
    "explanation": "A fallback astronomy image is shown when the live NASA request is unavailable.",
}


@router.get("/apod")
async def get_apod(
    date: str | None = Query(default=None),
    random: bool = Query(default=False),
) -> dict[str, Any]:
    params: dict[str, str] = {
        "api_key": settings.nasa_api_key,
        "thumbs": "true",
    }

    if random:
        params["count"] = "1"
    elif date:
        params["date"] = date

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{settings.nasa_base_url}/planetary/apod", params=params)
            response.raise_for_status()
            data = response.json()
            return data[0] if isinstance(data, list) else data
    except Exception:
        return FALLBACK_APOD
