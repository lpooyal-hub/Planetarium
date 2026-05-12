import { config } from "../config.js";

const fallbackApod = {
  title: "Cosmic Reef",
  date: "2020-04-24",
  media_type: "image",
  url: "https://apod.nasa.gov/apod/image/2004/STScI-H-p2016a-m-2000x1374.png",
  hdurl: "https://apod.nasa.gov/apod/image/2004/STScI-H-p2016a-m-2000x1374.png",
  explanation:
    "A fallback astronomy image is shown when the live NASA request is unavailable. Configure a NASA API key in .env for higher request limits."
};

export async function getAstronomyPicture({ date, random = false } = {}) {
  const url = new URL(`${config.nasaBaseUrl}/planetary/apod`);
  url.searchParams.set("api_key", config.nasaApiKey);
  url.searchParams.set("thumbs", "true");

  if (random) {
    url.searchParams.set("count", "1");
  } else if (date) {
    url.searchParams.set("date", date);
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NASA API responded with ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.warn("Using fallback APOD data:", error);
    return fallbackApod;
  }
}
