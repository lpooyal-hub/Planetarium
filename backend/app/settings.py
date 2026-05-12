import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    nasa_api_key: str = os.getenv("NASA_API_KEY", "DEMO_KEY")
    nasa_base_url: str = os.getenv("NASA_BASE_URL", "https://api.nasa.gov")
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:5173")


settings = Settings()
