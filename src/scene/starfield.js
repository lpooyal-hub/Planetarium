export class PlanetariumScene {
  constructor(canvas, { planets, zodiacSigns }) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.planets = planets;
    this.zodiacSigns = zodiacSigns;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.focusedPlanet = planets[2];
    this.focusedZodiac = zodiacSigns[4];
    this.paused = false;
    this.time = 0;
    this.stars = [];
    this.meteors = [];
    this.nextMeteorAt = 60;
    this.animationId = null;
  }

  start() {
    this.resize();
    this.handleResize = () => this.resize();
    window.addEventListener("resize", this.handleResize);
    this.animate();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.handleResize) {
      window.removeEventListener("resize", this.handleResize);
    }
  }

  setFocusedPlanet(planetName) {
    const match = this.planets.find((planet) => planet.name === planetName);
    if (match) {
      this.focusedPlanet = match;
    }
  }

  setFocusedZodiac(signId) {
    const match = this.zodiacSigns.find((sign) => sign.id === signId);
    if (match) {
      this.focusedZodiac = match;
    }
  }

  setPaused(paused) {
    this.paused = paused;
  }

  resize() {
    const { innerWidth, innerHeight } = window;
    this.canvas.width = Math.floor(innerWidth * this.pixelRatio);
    this.canvas.height = Math.floor(innerHeight * this.pixelRatio);
    this.canvas.style.width = `${innerWidth}px`;
    this.canvas.style.height = `${innerHeight}px`;
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.stars = this.createStars(innerWidth, innerHeight);
  }

  createStars(width, height) {
    const count = Math.floor((width * height) / 3200);
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.7 + 0.2,
      alpha: Math.random() * 0.7 + 0.25,
      drift: Math.random() * 0.18 + 0.03
    }));
  }

  animate = () => {
    if (!this.paused) {
      this.time += 0.7;
    }

    this.draw();
    this.animationId = requestAnimationFrame(this.animate);
  };

  draw() {
    const ctx = this.context;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const center = {
      x: width * (width > 900 ? 0.48 : 0.5),
      y: height * (width > 900 ? 0.53 : 0.42)
    };
    const scale = Math.min(width, height) / 900;

    ctx.clearRect(0, 0, width, height);
    this.drawSpace(ctx, width, height);
    this.drawStars(ctx, width, height);
    this.drawZodiac(ctx, width, height);
    this.drawMeteors(ctx, width, height);
    this.drawOrbits(ctx, center, scale);
    this.drawSun(ctx, center, scale);
    this.drawPlanets(ctx, center, scale);
  }

  drawSpace(ctx, width, height) {
    const gradient = ctx.createRadialGradient(width * 0.45, height * 0.45, 80, width * 0.5, height * 0.5, width);
    gradient.addColorStop(0, "#243b55");
    gradient.addColorStop(0.45, "#101a2b");
    gradient.addColorStop(1, "#05070d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  drawStars(ctx, width, height) {
    this.stars.forEach((star) => {
      const shimmer = 0.55 + Math.sin(this.time * star.drift + star.x) * 0.45;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * shimmer})`;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      star.x = (star.x + star.drift * 0.08) % width;
      if (star.y > height) {
        star.y = 0;
      }
    });
  }

  drawZodiac(ctx, width, height) {
    if (!this.focusedZodiac) {
      return;
    }

    const sign = this.focusedZodiac;
    const box = this.getZodiacBox(width, height);
    const points = sign.points.map(([px, py]) => ({
      x: box.x + px * box.width,
      y: box.y + py * box.height
    }));
    const pulse = 0.65 + Math.sin(this.time * 0.025) * 0.2;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(114, 219, 199, ${pulse})`;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = "rgba(114, 219, 199, 0.65)";
    ctx.shadowBlur = 16;

    sign.lines.forEach(([from, to]) => {
      ctx.beginPath();
      ctx.moveTo(points[from].x, points[from].y);
      ctx.lineTo(points[to].x, points[to].y);
      ctx.stroke();
    });

    points.forEach((point, index) => {
      const radius = index === 0 ? 3.4 : 2.3;
      ctx.beginPath();
      ctx.fillStyle = index === 0 ? "rgba(255, 207, 112, 0.95)" : "rgba(246, 248, 251, 0.9)";
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  getZodiacBox(width, height) {
    const size = Math.min(width * 0.42, height * 0.36, 420);
    return {
      x: width > 900 ? width * 0.56 : width * 0.12,
      y: width > 900 ? height * 0.16 : height * 0.1,
      width: width > 900 ? size : width * 0.76,
      height: width > 900 ? size * 0.68 : Math.min(260, height * 0.26)
    };
  }

  drawMeteors(ctx, width, height) {
    if (!this.paused && this.time >= this.nextMeteorAt) {
      this.spawnMeteor(width, height);
      this.nextMeteorAt = this.time + 120 + Math.random() * 180;
    }

    ctx.save();
    ctx.lineCap = "round";

    this.meteors = this.meteors.filter((meteor) => meteor.life > 0);
    this.meteors.forEach((meteor) => {
      if (!this.paused) {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= 1;
      }

      const alpha = Math.max(meteor.life / meteor.maxLife, 0);
      const gradient = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 12, meteor.y - meteor.vy * 12);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      gradient.addColorStop(0.35, `rgba(114, 219, 199, ${alpha * 0.75})`);
      gradient.addColorStop(1, "rgba(114, 219, 199, 0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = meteor.width;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(meteor.x - meteor.vx * 14, meteor.y - meteor.vy * 14);
      ctx.stroke();
    });

    ctx.restore();
  }

  spawnMeteor(width, height) {
    const fromLeft = Math.random() > 0.45;
    this.meteors.push({
      x: fromLeft ? Math.random() * width * 0.45 : width * (0.55 + Math.random() * 0.35),
      y: Math.random() * height * 0.32,
      vx: fromLeft ? 9 + Math.random() * 4 : -(8 + Math.random() * 4),
      vy: 5 + Math.random() * 3,
      width: 1.4 + Math.random() * 1.4,
      life: 54,
      maxLife: 54
    });
  }

  drawOrbits(ctx, center, scale) {
    ctx.save();
    ctx.strokeStyle = "rgba(210, 226, 255, 0.13)";
    ctx.lineWidth = 1;
    this.planets.forEach((planet) => {
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, planet.orbit * scale, planet.orbit * 0.42 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  drawSun(ctx, center, scale) {
    const radius = 32 * scale;
    const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius * 4.5);
    glow.addColorStop(0, "rgba(255, 225, 128, 0.96)");
    glow.addColorStop(0.3, "rgba(255, 160, 76, 0.4)");
    glow.addColorStop(1, "rgba(255, 160, 76, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd26f";
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlanets(ctx, center, scale) {
    this.planets.forEach((planet, index) => {
      const angle = this.time * planet.speed + index * 0.75;
      const x = center.x + Math.cos(angle) * planet.orbit * scale;
      const y = center.y + Math.sin(angle) * planet.orbit * 0.42 * scale;
      const isFocused = planet.name === this.focusedPlanet.name;
      const radius = planet.radius * scale * (isFocused ? 1.25 : 1);

      ctx.save();
      ctx.shadowColor = planet.color;
      ctx.shadowBlur = isFocused ? 24 : 10;
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (planet.name === "Saturn") {
        ctx.strokeStyle = "rgba(239, 221, 165, 0.72)";
        ctx.lineWidth = Math.max(1, 3 * scale);
        ctx.beginPath();
        ctx.ellipse(x, y, radius * 1.9, radius * 0.62, -0.32, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (isFocused) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius + 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }
}
