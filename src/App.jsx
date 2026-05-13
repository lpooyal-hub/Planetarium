import { useEffect, useMemo, useRef, useState } from "react";
import { getAstronomyPicture, getVisibleZodiac } from "./api/backend.js";
import { getInitialLanguage, translations } from "./data/i18n.js";
import { planets } from "./data/planets.js";
import { zodiacSigns } from "./data/zodiac.js";
import { PlanetariumScene } from "./scene/starfield.js";

const glyphs = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpius: "♏",
  sagittarius: "♐",
  capricornus: "♑",
  aquarius: "♒",
  pisces: "♓"
};

export function App() {
  const sceneRef = useRef(null);
  const [language, setLanguage] = useState(getInitialLanguage);
  const [activePlanet, setActivePlanet] = useState(planets[2]);
  const [activeZodiac, setActiveZodiac] = useState(zodiacSigns[4]);
  const [paused, setPaused] = useState(false);
  const [apod, setApod] = useState(null);
  const [apodDate, setApodDate] = useState(new Date().toISOString().slice(0, 10));
  const [observation, setObservation] = useState({
    status: "idle",
    coordinates: null,
    results: []
  });
  const dictionary = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("planetarium-language", language);
  }, [language]);

  useEffect(() => {
    getAstronomyPicture().then(setApod);
  }, []);

  useEffect(() => {
    const canvas = document.querySelector("#sky-canvas");
    sceneRef.current = new PlanetariumScene(canvas, { planets, zodiacSigns });
    sceneRef.current.start();

    return () => {
      sceneRef.current?.stop?.();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.setFocusedPlanet(activePlanet.name);
  }, [activePlanet]);

  useEffect(() => {
    sceneRef.current?.setFocusedZodiac(activeZodiac.id);
  }, [activeZodiac]);

  useEffect(() => {
    sceneRef.current?.setPaused(paused);
  }, [paused]);

  const topObservation = useMemo(() => {
    if (observation.status !== "ready") {
      return [];
    }

    const visible = observation.results.filter((item) => item.visible).slice(0, 4);
    return visible.length > 0 ? visible : observation.results.slice(0, 4);
  }, [observation]);

  async function loadApod(options) {
    setApod(await getAstronomyPicture(options));
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setObservation({ status: "unavailable", coordinates: null, results: [] });
      return;
    }

    setObservation((current) => ({ ...current, status: "loading" }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        const results = await getVisibleZodiac({ ...coordinates, signs: zodiacSigns });

        setObservation({
          status: "ready",
          coordinates,
          results
        });
      },
      () => setObservation({ status: "denied", coordinates: null, results: [] }),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000
      }
    );
  }

  return (
    <>
      <Header dictionary={dictionary} language={language} setLanguage={setLanguage} />
      <main id="top">
        <section className="hero" id="observatory">
          <div className="hero-copy">
            <p className="eyebrow">{dictionary.hero.eyebrow}</p>
            <h1 className={`hero-title hero-title-${language}`}>{dictionary.hero.title}</h1>
            <p className="lede">{dictionary.hero.lede}</p>
            <div className="hero-actions">
              <a className="primary-action" href="#planets">
                {dictionary.hero.planetsAction}
              </a>
              <a className="secondary-action" href="#zodiac">
                {dictionary.hero.zodiacAction}
              </a>
            </div>
          </div>
          <MissionPanel planet={activePlanet} dictionary={dictionary} language={language} />
        </section>

        <section className="control-band" aria-label="Planetarium controls">
          <button
            className="icon-button"
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? dictionary.controls.resume : dictionary.controls.pause}
          </button>
          <label className="date-control">
            <span>{dictionary.controls.dateLabel}</span>
            <input
              type="date"
              min="1995-06-16"
              value={apodDate}
              onChange={(event) => setApodDate(event.target.value)}
            />
          </label>
          <button className="text-button" type="button" onClick={() => loadApod({ date: apodDate })}>
            {dictionary.controls.loadDate}
          </button>
          <button className="text-button" type="button" onClick={() => loadApod({ random: true })}>
            {dictionary.controls.random}
          </button>
        </section>

        <SkySection
          dictionary={dictionary}
          language={language}
          observation={observation}
          results={topObservation}
          requestLocation={requestLocation}
        />

        <ZodiacSection
          dictionary={dictionary}
          language={language}
          activeZodiac={activeZodiac}
          setActiveZodiac={setActiveZodiac}
        />

        <PlanetsSection
          dictionary={dictionary}
          activePlanet={activePlanet}
          setActivePlanet={setActivePlanet}
        />

        <ApodSection apod={apod} dictionary={dictionary} />
      </main>
    </>
  );
}

function Header({ dictionary, language, setLanguage }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Celestial Atlas home">
        <span className="brand-mark" />
        <span>Celestial Atlas</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#observatory">{dictionary.nav.observatory}</a>
        <a href="#sky">{dictionary.nav.sky}</a>
        <a href="#zodiac">{dictionary.nav.zodiac}</a>
        <a href="#planets">{dictionary.nav.planets}</a>
        <a href="#nasa">{dictionary.nav.nasa}</a>
      </nav>
      <div className="language-switcher" aria-label="Language">
        <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>
          EN
        </button>
        <button type="button" aria-pressed={language === "ko"} onClick={() => setLanguage("ko")}>
          KR
        </button>
      </div>
    </header>
  );
}

function MissionPanel({ planet, dictionary, language }) {
  return (
    <aside className="mission-panel" aria-label="Selected planet">
      <img className="tracked-planet-image" src={planet.imageUrl} alt={dictionary.planetNames[planet.name]} />
      <span className="panel-label">{dictionary.tracking.label}</span>
      <h2>{dictionary.planetNames[planet.name]}</h2>
      <p>{planet.feature[language]}</p>
      <dl>
        <div>
          <dt>{dictionary.tracking.type}</dt>
          <dd>{dictionary.planetTypes[planet.type]}</dd>
        </div>
        <div>
          <dt>{dictionary.tracking.moons}</dt>
          <dd>{planet.moons}</dd>
        </div>
        <div>
          <dt>{dictionary.tracking.day}</dt>
          <dd>{planet.day[language]}</dd>
        </div>
      </dl>
      <a className="source-link" href={planet.sourceUrl} target="_blank" rel="noreferrer">
        {dictionary.tracking.credit}: {planet.imageCredit}
      </a>
    </aside>
  );
}

function SkySection({ dictionary, language, observation, results, requestLocation }) {
  return (
    <section className="sky-section" id="sky">
      <div className="sky-copy">
        <p className="eyebrow">{dictionary.sky.eyebrow}</p>
        <h2>{dictionary.sky.title}</h2>
        <p>{dictionary.sky.body}</p>
        <button className="primary-action location-button" type="button" onClick={requestLocation}>
          {dictionary.sky.button}
        </button>
      </div>
      <article className="sky-results" aria-live="polite">
        <ObservationResults dictionary={dictionary} language={language} observation={observation} results={results} />
      </article>
    </section>
  );
}

function ObservationResults({ dictionary, language, observation, results }) {
  if (observation.status === "idle" || observation.status === "loading") {
    return <p className="sky-empty">{dictionary.sky.waiting}</p>;
  }

  if (observation.status === "unavailable") {
    return <p className="sky-empty">{dictionary.sky.unavailable}</p>;
  }

  if (observation.status === "denied") {
    return <p className="sky-empty">{dictionary.sky.denied}</p>;
  }

  return (
    <>
      <div className="sky-meta">
        <span>
          {dictionary.sky.latitude}: {observation.coordinates.latitude.toFixed(2)}
        </span>
        <span>
          {dictionary.sky.longitude}: {observation.coordinates.longitude.toFixed(2)}
        </span>
      </div>
      <h3>{dictionary.sky.ready}</h3>
      <div className="visible-grid">
        {results.map((result) => {
          const sign = zodiacSigns.find((item) => item.id === result.id);

          return (
            <div className={`visible-card ${result.visible ? "" : "is-below"}`} key={result.id}>
              <span className="zodiac-glyph">{glyphs[sign.id]}</span>
              <strong>{sign.name[language]}</strong>
              <small>{dictionary.sky.quality[result.quality]}</small>
              <dl>
                <div>
                  <dt>{dictionary.sky.altitude}</dt>
                  <dd>{result.altitude}°</dd>
                </div>
                <div>
                  <dt>{dictionary.sky.direction}</dt>
                  <dd>{result.direction}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ZodiacSection({ dictionary, language, activeZodiac, setActiveZodiac }) {
  return (
    <section className="zodiac-section" id="zodiac">
      <div className="zodiac-copy">
        <p className="eyebrow">{dictionary.zodiac.eyebrow}</p>
        <h2>{dictionary.zodiac.title}</h2>
        <p>{dictionary.zodiac.body}</p>
      </div>
      <article className="zodiac-feature">
        <figure className="zodiac-photo">
          <img
            src={activeZodiac.photo.imageUrl}
            alt={`${activeZodiac.name[language]} ${dictionary.zodiac.realPhoto}`}
            loading="lazy"
          />
          <figcaption>
            <span>{dictionary.zodiac.realPhoto}</span>
            <a href={activeZodiac.photo.sourceUrl} target="_blank" rel="noreferrer">
              {dictionary.zodiac.imageCredit}: {activeZodiac.photo.credit}
            </a>
          </figcaption>
        </figure>
        <div className="zodiac-feature-copy">
          <span className="zodiac-glyph large">{glyphs[activeZodiac.id]}</span>
          <p className="panel-label">{dictionary.zodiac.season}</p>
          <h3>{activeZodiac.name[language]}</h3>
          <p>{activeZodiac.story[language]}</p>
          <dl>
            <div>
              <dt>{dictionary.zodiac.season}</dt>
              <dd>{activeZodiac.dateRange[language]}</dd>
            </div>
            <div>
              <dt>{dictionary.zodiac.brightStar}</dt>
              <dd>{activeZodiac.brightStar[language]}</dd>
            </div>
          </dl>
          <a className="source-link" href={activeZodiac.photo.sourceUrl} target="_blank" rel="noreferrer">
            {dictionary.zodiac.imageLicense}: {activeZodiac.photo.license}
          </a>
        </div>
      </article>
      <div className="zodiac-grid">
        {zodiacSigns.map((sign) => (
          <button
            className="zodiac-card"
            type="button"
            key={sign.id}
            aria-pressed={activeZodiac.id === sign.id}
            onClick={() => setActiveZodiac(sign)}
          >
            <span className="zodiac-glyph">{glyphs[sign.id]}</span>
            <span>
              <strong>{sign.name[language]}</strong>
              <small>{sign.dateRange[language]}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PlanetsSection({ dictionary, activePlanet, setActivePlanet }) {
  return (
    <section className="content-grid" id="planets">
      <div className="section-heading">
        <p className="eyebrow">{dictionary.planets.eyebrow}</p>
        <h2>{dictionary.planets.title}</h2>
      </div>
      <div className="planet-grid">
        {planets.map((planet) => (
          <button
            className="planet-card"
            type="button"
            key={planet.name}
            aria-pressed={activePlanet.name === planet.name}
            onClick={() => setActivePlanet(planet)}
          >
            <img className="planet-thumb" src={planet.imageUrl} alt="" loading="lazy" />
            <span>
              <strong>{dictionary.planetNames[planet.name]}</strong>
              <small>{dictionary.planetTypes[planet.type]}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ApodSection({ apod, dictionary }) {
  if (!apod) {
    return (
      <section className="nasa-section" id="nasa">
        <article className="apod-card">
          <div className="apod-copy">
            <p className="eyebrow">{dictionary.apod.eyebrow}</p>
            <h2>Loading NASA media...</h2>
          </div>
        </article>
      </section>
    );
  }

  const media =
    apod.media_type === "video" ? (
      <a className="video-link" href={apod.url} target="_blank" rel="noreferrer">
        {dictionary.apod.video}
      </a>
    ) : (
      <img src={apod.hdurl || apod.url} alt={apod.title} loading="lazy" />
    );

  return (
    <section className="nasa-section" id="nasa">
      <article className="apod-card">
        <div className="apod-media">{media}</div>
        <div className="apod-copy">
          <p className="eyebrow">{dictionary.apod.eyebrow}</p>
          <h2>{apod.title}</h2>
          <time dateTime={apod.date}>{apod.date}</time>
          <p>{apod.explanation}</p>
        </div>
      </article>
    </section>
  );
}
