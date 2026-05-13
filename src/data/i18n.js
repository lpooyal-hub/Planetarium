export const translations = {
  en: {
    languageName: "English",
    nav: {
      observatory: "Observatory",
      sky: "My Sky",
      zodiac: "Zodiac",
      planets: "Planets",
      nasa: "NASA Feed"
    },
    hero: {
      eyebrow: "Interactive planetarium portfolio",
      title: "Explore real planets, zodiac constellations, and tonight's visible sky.",
      lede:
        "A richer astronomy showcase with NASA planet imagery, animated orbital motion, shooting stars, zodiac maps, and location-aware observing guidance.",
      planetsAction: "Explore planets",
      zodiacAction: "View zodiac"
    },
    tracking: {
      label: "Now tracking",
      type: "Type",
      moons: "Moons",
      day: "Day",
      credit: "Image credit"
    },
    controls: {
      pause: "Pause",
      resume: "Resume",
      dateLabel: "APOD date",
      loadDate: "Load date",
      random: "Random image"
    },
    sky: {
      eyebrow: "Location-aware sky",
      title: "Find zodiac constellations visible from your location.",
      body:
        "Allow location access to estimate which zodiac constellations are above your horizon right now. Results use your browser location and local sidereal time, so they are best treated as observing guidance rather than telescope-grade ephemerides.",
      button: "Use my location",
      waiting: "Waiting for location permission.",
      unavailable: "Location is unavailable in this browser.",
      denied: "Location permission was denied.",
      ready: "Visible now near your sky",
      latitude: "Latitude",
      longitude: "Longitude",
      altitude: "Altitude",
      direction: "Direction",
      quality: {
        excellent: "Excellent",
        good: "Good",
        low: "Low",
        below: "Below horizon"
      }
    },
    zodiac: {
      eyebrow: "Zodiac sky map",
      title: "Select a zodiac sign to draw its constellation.",
      body:
        "The constellation layer uses recognizable simplified star patterns, bright-star labels, and approximate sky positions for visibility calculations.",
      realPhoto: "Real night sky photograph",
      imageCredit: "Photo credit",
      imageLicense: "License",
      season: "Sun sign date",
      brightStar: "Bright star"
    },
    planets: {
      eyebrow: "Solar system",
      title: "Choose a planet to focus the sky.",
      source: "NASA source"
    },
    apod: {
      eyebrow: "NASA Astronomy Picture of the Day",
      video: "Open NASA video"
    },
    planetNames: {
      Mercury: "Mercury",
      Venus: "Venus",
      Earth: "Earth",
      Mars: "Mars",
      Jupiter: "Jupiter",
      Saturn: "Saturn",
      Uranus: "Uranus",
      Neptune: "Neptune"
    },
    planetTypes: {
      Terrestrial: "Terrestrial",
      "Gas giant": "Gas giant",
      "Ice giant": "Ice giant"
    }
  },
  ko: {
    languageName: "한국어",
    nav: {
      observatory: "관측실",
      sky: "내 하늘",
      zodiac: "황도 12궁",
      planets: "행성",
      nasa: "NASA 피드"
    },
    hero: {
      eyebrow: "인터랙티브 천문관 포트폴리오",
      title: "실제 행성 이미지, 황도 별자리, 오늘 밤 보이는 하늘을 탐험하세요.",
      lede:
        "NASA 행성 사진, 행성 궤도 애니메이션, 별똥별, 황도 별자리 지도, 위치 기반 관측 가이드를 담은 천문 쇼케이스입니다.",
      planetsAction: "행성 보기",
      zodiacAction: "황도 보기"
    },
    tracking: {
      label: "현재 추적",
      type: "분류",
      moons: "위성",
      day: "하루",
      credit: "이미지 출처"
    },
    controls: {
      pause: "정지",
      resume: "재생",
      dateLabel: "APOD 날짜",
      loadDate: "날짜 불러오기",
      random: "랜덤 이미지"
    },
    sky: {
      eyebrow: "위치 기반 하늘",
      title: "내 위치에서 지금 볼 수 있는 황도 별자리를 찾아보세요.",
      body:
        "위치 권한을 허용하면 현재 브라우저 위치와 지방항성시를 이용해 지평선 위에 떠 있는 황도 별자리를 추정합니다. 망원경급 정밀 천문력보다는 관측 가이드로 봐주세요.",
      button: "내 위치 사용",
      waiting: "위치 권한을 기다리는 중입니다.",
      unavailable: "이 브라우저에서는 위치 기능을 사용할 수 없습니다.",
      denied: "위치 권한이 거부되었습니다.",
      ready: "지금 하늘에서 보기 좋은 별자리",
      latitude: "위도",
      longitude: "경도",
      altitude: "고도",
      direction: "방향",
      quality: {
        excellent: "매우 좋음",
        good: "좋음",
        low: "낮음",
        below: "지평선 아래"
      }
    },
    zodiac: {
      eyebrow: "황도 별자리 지도",
      title: "별자리를 선택하면 하늘에 별자리 패턴이 그려집니다.",
      body:
        "별자리 레이어는 알아보기 쉬운 대표 별 연결선, 밝은 별 이름, 위치 기반 관측 계산을 위한 대략적인 하늘 좌표를 사용합니다.",
      realPhoto: "실제 밤하늘 촬영 사진",
      imageCredit: "사진 출처",
      imageLicense: "라이선스",
      season: "태양궁 기간",
      brightStar: "대표 별"
    },
    planets: {
      eyebrow: "태양계",
      title: "행성을 선택해 하늘의 초점을 바꿔보세요.",
      source: "NASA 원본"
    },
    apod: {
      eyebrow: "NASA 오늘의 천문 사진",
      video: "NASA 비디오 열기"
    },
    planetNames: {
      Mercury: "수성",
      Venus: "금성",
      Earth: "지구",
      Mars: "화성",
      Jupiter: "목성",
      Saturn: "토성",
      Uranus: "천왕성",
      Neptune: "해왕성"
    },
    planetTypes: {
      Terrestrial: "지구형 행성",
      "Gas giant": "가스 행성",
      "Ice giant": "얼음 행성"
    }
  }
};

export function getInitialLanguage() {
  const saved = window.localStorage.getItem("planetarium-language");
  if (saved === "ko" || saved === "en") {
    return saved;
  }

  return navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
}
