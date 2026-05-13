from datetime import datetime, timezone
from math import cos, radians, sin

from astropy import units as u
from astropy.coordinates import AltAz, EarthLocation, SkyCoord
from astropy.time import Time
from astropy.utils import iers

from ..data.bright_stars import BRIGHT_STARS, CONSTELLATION_LINES

iers.conf.auto_download = False

DEFAULT_LIMITING_MAGNITUDE = 2.5
SCENE_RADIUS = 10.0


def build_star_scene(latitude: float, longitude: float, observed_at: str | None, limiting_magnitude: float):
    timestamp = _parse_observed_at(observed_at)
    location = EarthLocation(lat=latitude * u.deg, lon=longitude * u.deg)
    frame = AltAz(obstime=timestamp, location=location)

    filtered = [star for star in BRIGHT_STARS if star["magnitude"] <= limiting_magnitude]
    coords = SkyCoord(
        ra=[star["ra_hours"] for star in filtered] * u.hourangle,
        dec=[star["dec_degrees"] for star in filtered] * u.deg,
        frame="icrs",
    ).transform_to(frame)

    stars = []
    visible_ids = set()

    for star, transformed in zip(filtered, coords):
        altitude = float(transformed.alt.degree)
        azimuth = float(transformed.az.degree)
        x, y, z = _to_cartesian(altitude, azimuth)
        visible = bool(altitude > 0)
        star_payload = {
            "id": star["id"],
            "name": star["name"],
            "constellation": star["constellation"],
            "magnitude": star["magnitude"],
            "color": star["color"],
            "altitude": round(altitude, 2),
            "azimuth": round(azimuth, 2),
            "visible": visible,
            "x": round(x, 4),
            "y": round(y, 4),
            "z": round(z, 4),
            "size": round(max(0.18, 0.72 - star["magnitude"] * 0.09), 3),
        }
        stars.append(star_payload)

        if visible:
            visible_ids.add(star["id"])

    lines = [
        {"from": from_id, "to": to_id}
        for from_id, to_id in CONSTELLATION_LINES
        if from_id in visible_ids and to_id in visible_ids
    ]

    visible_constellations = sorted({star["constellation"] for star in stars if star["visible"]})

    return {
        "observer": {
            "latitude": latitude,
            "longitude": longitude,
            "observedAt": timestamp.isot,
            "limitingMagnitude": limiting_magnitude,
        },
        "summary": {
            "visibleStars": len([star for star in stars if star["visible"]]),
            "visibleConstellations": visible_constellations,
        },
        "stars": stars,
        "lines": lines,
    }


def _parse_observed_at(observed_at: str | None) -> Time:
    if observed_at:
        return Time(observed_at)

    return Time(datetime.now(timezone.utc))


def _to_cartesian(altitude: float, azimuth: float) -> tuple[float, float, float]:
    alt = radians(altitude)
    az = radians(azimuth)
    x = SCENE_RADIUS * sin(az) * cos(alt)
    y = SCENE_RADIUS * sin(alt)
    z = -SCENE_RADIUS * cos(az) * cos(alt)
    return x, y, z
