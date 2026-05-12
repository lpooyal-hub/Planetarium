from pydantic import BaseModel, Field
from fastapi import APIRouter

from ..services.observability import calculate_visible_zodiac

router = APIRouter()


class SignInput(BaseModel):
    id: str
    raHours: float = Field(ge=0, le=24)
    decDegrees: float = Field(ge=-90, le=90)


class VisibleSkyRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    signs: list[SignInput]


@router.post("/visible")
async def visible_zodiac(payload: VisibleSkyRequest):
    return calculate_visible_zodiac(
        latitude=payload.latitude,
        longitude=payload.longitude,
        signs=[sign.model_dump() for sign in payload.signs],
    )
