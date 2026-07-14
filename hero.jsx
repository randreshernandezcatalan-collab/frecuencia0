// hero.jsx — Frecuencia Cero, editorial brutalist hero
const { useState, useEffect, useRef, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "stage",
  "accent": "#ff2d2d",
  "invert": true,
  "showGrid": false,
  "ticker": true,
  "displayScale": 1,
  "shader": true,
  "shaderIntensity": 1
}/*EDITMODE-END*/;

const NAV = ["Integrantes", "Shows", "Música", "Galería"];

const BAND_MEMBERS = [
  { idx: "01", name: "Fer",    role: "Voz",      image: "uploads/fer.png",      imagePos: "center 20%",  imageSize: "auto 160%" },
  { idx: "02", name: "Richi",  role: "Teclado",  image: "uploads/richi.png",    imagePos: "center 20%",  imageSize: "auto 160%" },
  { idx: "03", name: "Vic",    role: "Bajo",     image: "uploads/vic.png",      imagePos: "center top",  imageSize: "cover" },
  { idx: "04", name: "Patito", role: "Guitarra", image: "uploads/patito.png",   imagePos: "center 25%",  imageSize: "auto 160%" },
  { idx: "05", name: "Bruno",  role: "Batería",  image: "uploads/bruno.png",    imagePos: "center top",  imageSize: "cover" },
];

// Fuente única de fechas — banners del hero y sección Tour 2026 leen de aquí.
const SHOWS = [
  {
    date: "17.07", day: "Viernes", longDate: "17 de julio",
    venue: "Barro Viejo Restaurante",
    eyebrow: "Próxima fecha",
    ticketUrl: "https://www.instagram.com/barrovivorestaurant/",
    past: false,
  },
  {
    date: "01.05", day: "Viernes", longDate: "01 de mayo",
    venue: "Sunset City Bar",
    eyebrow: "Nueva fecha confirmada en gira",
    ticketUrl: "https://www.instagram.com/sunsetcitybar/",
    past: true,
  },
  {
    date: "29.05", day: "Viernes", longDate: "29 de mayo",
    venue: "Forestani",
    eyebrow: "Próxima fecha",
    ticketUrl: "https://www.instagram.com/forestani.restaurant/",
    past: true,
  },
  {
    date: "20.06", day: "Sábado", longDate: "20 de junio",
    venue: "Patio Viejo",
    eyebrow: "Próxima fecha",
    ticketUrl: "https://www.instagram.com/patioviejo/",
    past: true,
  },
];

const FZ_CSS = `
  @keyframes fz-eq {
    0% { height: 20%; }
    100% { height: 100%; }
  }
  @keyframes fz-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }
  @keyframes fz-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @keyframes fz-rise {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fz-rise { animation: fz-rise 0.9s cubic-bezier(0.2,0.8,0.2,1) both; }
  .fz-rise.d1 { animation-delay: 0.05s; }
  .fz-rise.d2 { animation-delay: 0.18s; }
  .fz-rise.d3 { animation-delay: 0.36s; }
  .fz-rise.d4 { animation-delay: 0.55s; }
  .fz-rise.d5 { animation-delay: 0.75s; }

  .fz-headline { display: inline-block; position: relative; }
  .fz-headline::before, .fz-headline::after {
    content: attr(data-text);
    position: absolute; left: 0; top: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .fz-headline:hover::before {
    color: var(--accent);
    transform: translate(-3px, 1px);
    opacity: 0.85;
    clip-path: polygon(0 0, 100% 0, 100% 38%, 0 38%);
  }
  .fz-headline:hover::after {
    color: #ffffff;
    transform: translate(3px, -1px);
    opacity: 0.7;
    clip-path: polygon(0 62%, 100% 62%, 100% 100%, 0 100%);
  }

  .fz-link { color: var(--ink); text-decoration: none; position: relative; }
  .fz-link::after {
    content: ""; position: absolute; left: 0; bottom: -3px;
    height: 1.5px; width: 0; background: var(--accent);
    transition: width 0.25s;
  }
  .fz-link:hover::after { width: 100%; }

  .fz-cta {
    display: inline-flex; align-items: center; gap: 14px;
    padding: 16px 22px;
    font-family: var(--mono); font-size: 12px;
    letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
    text-decoration: none; cursor: pointer; border: 0;
    transition: 0.2s; white-space: nowrap;
  }
  .fz-cta-primary { background: var(--ink); color: var(--bg); }
  .fz-cta-primary:hover { background: var(--accent); color: var(--ink); }
  .fz-cta-ghost { background: transparent; color: var(--ink); border: 1px solid var(--ink); }
  .fz-cta-ghost:hover { background: var(--ink); color: var(--bg); }
  .fz-cta .arrow { transition: transform 0.2s; }
  .fz-cta:hover .arrow { transform: translateX(4px); }

  /* Stage layout — el "poster de gira" sobre el shader */
  .fz-stage-shadow {
    text-shadow: 0 2px 24px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.6);
  }
  .fz-vignette {
    position: fixed; inset: 0; z-index: 1; pointer-events: none;
    background:
      radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.7) 100%);
  }
  .fz-scanlines {
    position: fixed; inset: 0; z-index: 2; pointer-events: none;
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0.025) 0 1px,
      transparent 1px 3px
    );
    mix-blend-mode: overlay;
    opacity: 0.6;
  }
  .fz-show-row {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 16px;
    align-items: baseline;
    padding: 14px 0;
    border-bottom: 1px solid var(--rule);
    transition: padding 0.25s, color 0.2s;
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .fz-show-row:hover {
    padding-left: 12px;
    color: var(--accent);
  }
  .fz-member-card {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--rule-strong);
    padding: 24px 20px;
    min-height: 280px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    transition: border-color 0.3s, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.3s;
    background: rgba(10, 10, 10, 0.45);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
  }
  .fz-member-card:hover {
    border-color: var(--accent);
    transform: translateY(-4px);
  }

  /* Interactive tour portfolio list */
  .project-list {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
    z-index: 5;
  }
  .project-item {
    display: grid;
    grid-template-columns: 80px 2fr 1fr 1fr 1fr;
    gap: 20px;
    align-items: center;
    padding: 22px 16px;
    border-bottom: 1px solid var(--rule);
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: padding-left 0.3s ease, background 0.3s ease;
    cursor: pointer;
    position: relative;
  }
  .project-item:hover, .project-item.active {
    padding-left: 28px;
    color: var(--accent);
    background: rgba(255,255,255,0.03);
  }
  body[data-invert="0"] .project-item:hover, body[data-invert="0"] .project-item.active {
    background: rgba(10,10,10,0.03);
  }
  .project-data {
    transition: color 0.2s;
  }
  .project-data.artist {
    font-weight: 700;
    color: var(--accent);
  }
  .project-item.active .project-data.artist {
    color: var(--accent);
  }
  .project-data.label {
    text-align: right;
    opacity: 0.85;
  }
  .project-data.year {
    opacity: 0.6;
  }
  .background-image {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1.12);
    width: 88vw;
    height: 84vh;
    background-size: cover;
    background-position: center;
    pointer-events: none;
    z-index: 4; /* Render above vignettes (z-index: 1) and scanlines (z-index: 2), but below text (z-index: 5) */
    opacity: 0;
    filter: grayscale(0%) contrast(105%) brightness(0.1) blur(15px);
    border: 1px solid var(--rule-strong);
    transition: opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  @media (max-width: 768px) {
    .project-item {
      grid-template-columns: 70px 1fr 1fr;
      font-size: 11px;
      gap: 10px;
    }
    .project-data.label, .project-data.year {
      display: none;
    }
  }

  /* Responsive layout for ScrollExpandMedia children */
  .scroll-expand-content {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 64px;
    padding: 48px 0;
    font-family: var(--mono);
    color: var(--ink);
  }
  .scroll-expand-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-left: 1px solid var(--rule-strong);
    padding-left: 48px;
  }
  @media (max-width: 768px) {
    .scroll-expand-content {
      grid-template-columns: 1fr;
      gap: 32px;
      padding: 24px 0;
    }
    .scroll-expand-right {
      border-left: 0;
      padding-left: 0;
      margin-top: 16px;
    }
  }

  @media (max-width: 768px) {
    header {
      display: grid !important;
      grid-template-columns: 1fr auto !important;
      grid-template-rows: auto auto !important;
      gap: 10px 16px !important;
      padding: 12px 16px !important;
      height: auto !important;
    }
    header > div:first-child {
      grid-column: 1 !important;
      grid-row: 1 !important;
    }
    header > div:first-child > span:last-child {
      display: none !important;
    }
    header > nav {
      grid-column: span 2 !important;
      grid-row: 2 !important;
      justify-self: center !important;
      width: 100% !important;
      border-top: 1px solid var(--rule) !important;
      padding-top: 10px !important;
      gap: 16px !important;
      justify-content: center !important;
    }
    header > div:last-child {
      grid-column: 2 !important;
      grid-row: 1 !important;
      justify-self: end !important;
    }
    header > div:last-child > span:first-child {
      display: none !important;
    }
  }
`;

// ── ZeroMark ───────────────────────────────────────────────────
function ZeroMark({ size = 22 }) {
  const stroke = Math.max(2, size * 0.11);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        border: `${stroke}px solid currentColor`,
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute",
        left: -size * 0.12, right: -size * 0.12,
        top: "50%",
        height: Math.max(2, size * 0.09),
        background: "var(--accent)",
        transform: "translateY(-50%) rotate(-32deg)",
      }} />
    </div>
  );
}

// ── Topbar ─────────────────────────────────────────────────────
function Topbar({ isPlaying }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  const t = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "center",
      gap: 24,
      padding: "16px 32px",
      background: "color-mix(in oklab, var(--bg) 86%, transparent)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--rule)",
      fontFamily: "var(--mono)",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ color: "var(--ink)" }}><ZeroMark size={20} /></div>
        <span style={{ fontWeight: 600 }}>Frecuencia Cero</span>
        <span style={{ opacity: 0.45 }}>EST. MMXXII</span>
      </div>

      <nav style={{ justifySelf: "center", display: "flex", gap: 28 }}>
        {NAV.map((item, i) => {
          let href;
          if (item === "Galería") href = "galeria.html";
          else if (item === "Integrantes") href = "integrantes.html";
          else href = `#${item.toLowerCase()}`;
          return (
            <a key={item} href={href} className="fz-link" style={{
              display: "inline-flex", gap: 6, alignItems: "baseline", fontWeight: 500,
            }}>
              <span style={{ opacity: 0.45 }}>0{i + 1}</span>
              <span>{item}</span>
            </a>
          );
        })}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ opacity: 0.45 }}>MEL · {t}</span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 10px", border: "1px solid var(--ink)", borderRadius: 999,
        }}>
          {isPlaying ? (
            <span style={{ display: "inline-flex", gap: 2, alignItems: "flex-end", height: 8, width: 8, marginRight: 2 }}>
              <span style={{ width: 1.5, background: "var(--accent)", height: "60%", animation: "fz-eq 0.8s ease-in-out infinite alternate" }} />
              <span style={{ width: 1.5, background: "var(--accent)", height: "100%", animation: "fz-eq 0.5s ease-in-out infinite alternate 0.15s" }} />
              <span style={{ width: 1.5, background: "var(--accent)", height: "40%", animation: "fz-eq 0.7s ease-in-out infinite alternate 0.3s" }} />
            </span>
          ) : (
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)",
              animation: "fz-pulse 1.6s ease-in-out infinite",
            }} />
          )}
          {isPlaying ? "Reproduciendo" : "On Air"}
        </span>
      </div>
    </header>
  );
}

// ── Grid guides ────────────────────────────────────────────────
function GridGuides({ visible }) {
  if (!visible) return null;
  return (
    <div aria-hidden style={{
      position: "absolute", inset: 0,
      pointerEvents: "none", zIndex: 1,
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gap: 24, padding: "0 32px",
    }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          borderLeft: i === 0 ? "1px dashed var(--rule)" : "none",
          borderRight: "1px dashed var(--rule)",
          opacity: 0.7,
        }} />
      ))}
    </div>
  );
}

// ── Crosshair (printer marks) ──────────────────────────────────
function Crosshair({ pos }) {
  return (
    <div aria-hidden style={{
      position: "absolute", width: 14, height: 14, ...pos, zIndex: 2,
    }}>
      <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: "var(--ink)", opacity: 0.4 }} />
      <div style={{ position: "absolute", top: 6, left: 0, right: 0, height: 1, background: "var(--ink)", opacity: 0.4 }} />
    </div>
  );
}

// ── Marquee ────────────────────────────────────────────────────
function Marquee({ items }) {
  const content = items.join("  ✦  ");
  return (
    <div style={{
      borderTop: "1px solid #0a0a0a",
      borderBottom: "1px solid #0a0a0a",
      background: "#0a0a0a", color: "#ffffff",
      overflow: "hidden", padding: "12px 0",
    }}>
      <div style={{
        display: "flex", gap: 48, whiteSpace: "nowrap",
        animation: "fz-scroll 38s linear infinite",
        fontFamily: "var(--mono)", fontSize: 13,
        letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500,
      }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} style={{ paddingLeft: 48, display: "inline-flex", gap: 48, alignItems: "center" }}>
            {content}
            <span style={{
              display: "inline-block", width: 8, height: 8,
              background: "var(--accent)", transform: "rotate(45deg)",
            }} />
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Masthead — the big lockup ──────────────────────────────────
function Masthead({ scale = 1, big = false }) {
  const f1 = (big ? 12 : 10) * scale;
  const f2 = (big ? 18 : 15) * scale;
  return (
    <div style={{
      fontFamily: "var(--display)",
      lineHeight: 0.82,
      letterSpacing: "-0.04em",
      textTransform: "uppercase",
      fontWeight: 900,
    }}>
      <div className="fz-rise d2 fz-headline" data-text="Frecuencia"
           style={{ fontSize: `${f1}vw`, display: "inline-block" }}>
        Frecuencia
      </div>
      <div className="fz-rise d3" style={{
        display: "flex", alignItems: "center",
        gap: "0.12em", marginTop: "0.04em",
      }}>
        <span className="fz-headline" data-text="Cer" style={{
          fontSize: `${f2}vw`, color: "var(--accent)", display: "inline-block",
        }}>Cer</span>
        <span className="fz-headline" data-text="O" style={{
          fontSize: `${f2}vw`, color: "var(--ink)",
          position: "relative", display: "inline-block",
        }}>
          <span style={{ position: "relative", zIndex: 2 }}>O</span>
          <span aria-hidden style={{
            position: "absolute",
            left: "-8%", right: "-8%", top: "50%",
            height: "0.09em",
            background: "var(--accent)",
            transform: "translateY(-50%) rotate(-22deg)",
            zIndex: 1,
          }} />
        </span>
      </div>
    </div>
  );
}

// ── Meta block ─────────────────────────────────────────────────
function MetaBlock({ idx, label, value, accent }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 6,
      paddingTop: 10,
      borderTop: "1px solid var(--rule-strong)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: "var(--mono)", fontSize: 10,
        textTransform: "uppercase", letterSpacing: "0.14em",
        opacity: 0.55,
      }}>
        <span>{idx}</span><span>{label}</span>
      </div>
      <div style={{
        fontFamily: "var(--sans)", fontSize: 16, fontWeight: 600,
        lineHeight: 1.25,
        color: accent ? "var(--accent)" : "var(--ink)",
      }}>{value}</div>
    </div>
  );
}

// ── CTAs ───────────────────────────────────────────────────────
function CTAs({ center = false, isPlaying, onTogglePlay }) {
  return (
    <div className="fz-rise d4" style={{
      display: "flex", gap: 12, flexWrap: "wrap",
      justifyContent: center ? "center" : "flex-start",
    }}>
      <a href="#escuchar" className="fz-cta fz-cta-primary" onClick={(e) => { e.preventDefault(); onTogglePlay(); }}>
        <span>{isPlaying ? "⏸ Pausar " : "▶ Escuchar "}</span>
        <span className="arrow">→</span>
      </a>
      <a href="#shows" className="fz-cta fz-cta-ghost">
        <span>Ver shows</span>
        <span className="arrow">→</span>
      </a>
    </div>
  );
}

// ── Eyebrow row ────────────────────────────────────────────────
function Eyebrow() {
  return (
    <div className="fz-rise d1" style={{
      fontFamily: "var(--mono)", fontSize: 11,
      textTransform: "uppercase", letterSpacing: "0.18em",
      display: "flex", gap: 18, color: "var(--ink-2)", flexWrap: "wrap",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--accent)",
          animation: "fz-pulse 1.6s ease-in-out infinite",
        }} />
        EN VIVO
      </span>
      <span>N°01 · 2026</span>
      <span>MELIPILLA — CHILE</span>
    </div>
  );
}

// ── Hero layouts ───────────────────────────────────────────────
function HeroAsymmetric({ tweaks, isPlaying, onTogglePlay }) {
  const nextShow = SHOWS.find(s => !s.past) || SHOWS[0];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 280px",
      gap: 48, alignItems: "end", width: "100%",
    }}>
      <div>
        <Eyebrow />
        <div style={{ marginTop: 32 }}>
          <Masthead scale={tweaks.displayScale} />
        </div>
        <p className="fz-rise d4" style={{
          marginTop: 36, maxWidth: 480,
          fontSize: 17, lineHeight: 1.45,
          color: "var(--ink-2)",
          textWrap: "pretty",
        }}>
          Una señal que aparece desde el silencio. Cinco músicos, cuatro discos,
          una frecuencia que no se sintoniza — <em style={{
            color: "var(--accent)", fontStyle: "normal", fontWeight: 600,
          }}>se encuentra</em>.
        </p>
        <div style={{ marginTop: 36 }}><CTAs isPlaying={isPlaying} onTogglePlay={onTogglePlay} /></div>
      </div>

      <div className="fz-rise d5" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <MetaBlock idx="01" label="Próximo show" value={`${nextShow.venue} · ${nextShow.date}`} accent />
        <MetaBlock idx="02" label="LP reciente" value='"Ruido común" · 2026' />
        <MetaBlock idx="03" label="Integrantes" value="5 / cinco voces" />
        <MetaBlock idx="04" label="Frecuencia" value="00.00 MHz" />
      </div>
    </div>
  );
}

function HeroCentered({ tweaks, isPlaying, onTogglePlay }) {
  return (
    <div style={{
      textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
    }}>
      <div className="fz-rise d1" style={{
        fontFamily: "var(--mono)", fontSize: 11,
        textTransform: "uppercase", letterSpacing: "0.2em",
        opacity: 0.7,
      }}>
        ◉ EN VIVO · NUEVO LP "RUIDO COMÚN" · 26.05
      </div>
      <Masthead scale={tweaks.displayScale} big />
      <p className="fz-rise d4" style={{
        maxWidth: 540, fontSize: 18, lineHeight: 1.45,
        color: "var(--ink-2)", textWrap: "pretty",
      }}>
        Una señal que aparece desde el silencio. Cinco músicos, cuatro discos,
        una frecuencia que no se sintoniza — <em style={{
          color: "var(--accent)", fontStyle: "normal", fontWeight: 600,
        }}>se encuentra</em>.
      </p>
      <CTAs center isPlaying={isPlaying} onTogglePlay={onTogglePlay} />
    </div>
  );
}

function HeroFullbleed({ tweaks, isPlaying, onTogglePlay }) {
  return (
    <div style={{ width: "100%" }}>
      <div className="fz-rise d1" style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: "var(--mono)", fontSize: 11,
        textTransform: "uppercase", letterSpacing: "0.18em",
        opacity: 0.7, marginBottom: 24,
      }}>
        <span>↳ Editorial 01 / 2026</span>
        <span>Side · A</span>
      </div>
      <div className="fz-rise d2" style={{
        fontFamily: "var(--display)",
        fontSize: `${24 * tweaks.displayScale}vw`,
        lineHeight: 0.78,
        letterSpacing: "-0.05em",
        textTransform: "uppercase",
        fontWeight: 900,
        textAlign: "left",
        whiteSpace: "nowrap",
      }}>
        <div className="fz-headline" data-text="Frecuencia" style={{ display: "inline-block" }}>Frecuencia</div>
        <div style={{
          color: "var(--accent)",
          display: "flex", alignItems: "center",
          gap: "0.04em", justifyContent: "space-between",
        }}>
          <span className="fz-headline" data-text="Cer" style={{ display: "inline-block" }}>Cer</span>
          <span style={{ color: "var(--ink)", position: "relative", display: "inline-block" }}>
            <span style={{ position: "relative", zIndex: 2 }}>O</span>
            <span aria-hidden style={{
              position: "absolute", left: "-12%", right: "-12%", top: "50%",
              height: "0.08em", background: "var(--accent)",
              transform: "translateY(-50%) rotate(-22deg)", zIndex: 1,
            }} />
          </span>
        </div>
      </div>
      <div className="fz-rise d4" style={{
        marginTop: 32,
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-end", gap: 24, flexWrap: "wrap",
      }}>
        <div style={{
          maxWidth: 420, fontSize: 16, lineHeight: 1.45,
          color: "var(--ink-2)", textWrap: "pretty",
        }}>
          Una señal que aparece desde el silencio. Cinco músicos, cuatro discos,
          una frecuencia que no se sintoniza — se encuentra.
        </div>
        <CTAs isPlaying={isPlaying} onTogglePlay={onTogglePlay} />
      </div>
    </div>
  );
}

// ── Hero Stage (estilo poster de gira sobre el shader) ────────
function HeroStage({ tweaks, isPlaying, onTogglePlay }) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 56 }}>
      {/* Línea editorial superior */}
      <div className="fz-rise d1" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "var(--mono)", fontSize: 11,
        textTransform: "uppercase", letterSpacing: "0.18em",
        color: "var(--ink)", flexWrap: "wrap", gap: 16,
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent)",
            animation: "fz-pulse 1.6s ease-in-out infinite",
            boxShadow: "0 0 12px var(--accent)",
          }} />
          Transmitiendo · Sesión 04
        </span>
        <span style={{ opacity: 0.7 }}>Gira ondas perdidas · 2026</span>
        <span style={{ opacity: 0.7 }}>Side · A</span>
      </div>

      {/* Bloque tipográfico hero */}
      <div className="fz-stage-shadow">
        <Masthead scale={tweaks.displayScale} big />
      </div>

      {/* Subtítulo + CTAs */}
      <div className="fz-rise d4" style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: 48,
        alignItems: "end",
      }}>
        <p style={{
          fontSize: 19, lineHeight: 1.45,
          color: "var(--ink-2)", textWrap: "pretty",
          maxWidth: 520,
        }}>
           <em style={{
            color: "var(--accent)", fontStyle: "normal", fontWeight: 600,
          }}>Desde Feelingmusic</em>. Únete a la revolución musical!
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <CTAs isPlaying={isPlaying} onTogglePlay={onTogglePlay} />
        </div>
      </div>

      {/* Banners de fechas destacadas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SHOWS.map((b, i) => (
          <div key={b.venue + b.date} className="fz-rise d5" style={{
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
            padding: "28px 24px",
            border: "1px solid var(--rule-strong)",
            background: b.past ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animationDelay: `${0.75 + i * 0.08}s`,
            opacity: b.past ? 0.6 : 1,
            transition: "opacity 0.3s",
          }}>
            {b.past && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
                display: "flex", alignItems: "center"
              }}>
                <svg
                  viewBox="0 0 1000 100"
                  preserveAspectRatio="none"
                  style={{ width: "100%", height: "80px", opacity: 0.85 }}
                >
                  <path
                    d="M 0,50 C 150,5 250,95 400,50 C 550,5 650,95 800,50 C 900,20 950,80 1000,50"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M 0,50 C 100,85 300,15 450,50 C 600,85 750,15 900,50 T 1000,50"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            )}
            <div style={{
              fontFamily: "var(--mono)", fontSize: 11,
              letterSpacing: "0.22em", textTransform: "uppercase",
              opacity: 0.7, marginBottom: 12,
            }}>
              ✦ {b.past ? "Fecha Realizada" : b.eyebrow} ✦
            </div>
            <div style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(28px, 4vw, 56px)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textTransform: "uppercase",
            }}>
              {b.venue} · {b.day} {b.longDate}
            </div>
            <div style={{
              marginTop: 16,
              display: "inline-flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
              fontFamily: "var(--mono)", fontSize: 11,
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}>
              {b.past ? (
                <span className="fz-cta fz-cta-ghost" style={{ borderColor: "var(--rule-strong)", color: "var(--ink-2)", cursor: "default", opacity: 0.7 }}>
                  Show Realizado
                </span>
              ) : (
                <>
                  <a href={b.ticketUrl} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-primary">
                    <span>Reservar entradas</span>
                    <span className="arrow">→</span>
                  </a>
                  <a href="#shows" className="fz-cta fz-cta-ghost">
                    <span>Ver todas las fechas</span>
                    <span className="arrow">→</span>
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sección integrantes ───────────────────────────────────────
function MembersSection() {
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  return (
    <section id="integrantes" style={{
      position: "relative", zIndex: 5,
      padding: "120px 32px 80px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        gap: 24, flexWrap: "wrap",
        borderBottom: "1px solid var(--rule-strong)",
        paddingBottom: 14, marginBottom: 32,
      }}>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 11,
          letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.65,
        }}>↳ N°01 — La banda</div>
        <h2 style={{
          fontFamily: "var(--display)",
          fontSize: "clamp(32px, 5vw, 64px)",
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
          lineHeight: 0.95,
        }}>
          Cinco voces, <span style={{ color: "var(--accent)" }}>una frecuencia</span>
        </h2>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
      }}>
        {BAND_MEMBERS.map((m, index) => (
          <div 
            key={m.idx} 
            className="fz-member-card"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(-1)}
          >
            {/* Background image layer */}
            <div style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              backgroundImage: `url(${m.image})`,
              backgroundSize: m.imageSize || "cover",
              backgroundPosition: m.imagePos || "center top",
              opacity: hoveredIndex === index ? 1 : 0,
              transition: "opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
              transform: hoveredIndex === index ? "scale(1.08)" : "scale(1.0)",
              pointerEvents: "none"
            }} />
            
            {/* Dark gradient overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(10,10,10,0.9) 100%)",
              opacity: hoveredIndex === index ? 1 : 0,
              transition: "opacity 0.4s ease",
              pointerEvents: "none"
            }} />

            {/* Content Container */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 10,
                letterSpacing: "0.18em", textTransform: "uppercase",
                opacity: 0.6, marginBottom: 10,
                color: "var(--ink)",
                transition: "color 0.3s"
              }}>
                {m.idx}
              </div>
              <div style={{
                fontFamily: "var(--display)",
                fontSize: 28, letterSpacing: "-0.02em",
                textTransform: "uppercase", lineHeight: 1,
                color: hoveredIndex === index ? "var(--accent)" : "var(--ink)",
                transition: "color 0.3s"
              }}>{m.name}</div>
              <div style={{
                marginTop: 8,
                fontSize: 13, 
                opacity: 0.8, 
                fontWeight: 500,
                color: "var(--ink)"
              }}>{m.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Register GSAP plugin
if (window.gsap && window.ScrambleTextPlugin) {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// Project Item Component
function ProjectItem({ project, index, onMouseEnter, onMouseLeave, isActive, isIdle }) {
  const itemRef = useRef(null);
  const textRefs = {
    artist: useRef(null),
    album: useRef(null),
    category: useRef(null),
    label: useRef(null),
    year: useRef(null),
  };

  useEffect(() => {
    if (window.ScrambleTextPlugin && window.gsap) {
      if (isActive) {
        // Animate text scramble on hover
        Object.entries(textRefs).forEach(([key, ref]) => {
          if (ref.current) {
            gsap.killTweensOf(ref.current);
            gsap.to(ref.current, {
              duration: 0.8,
              scrambleText: {
                text: project[key],
                chars: "qwerty1337h@ck3r",
                revealDelay: 0.3,
                speed: 0.4
              }
            });
          }
        });
      } else {
        // Reset text
        Object.entries(textRefs).forEach(([key, ref]) => {
          if (ref.current) {
            gsap.killTweensOf(ref.current);
            ref.current.textContent = project[key];
          }
        });
      }
    }
  }, [isActive, project]);

  return (
    <li 
      ref={itemRef}
      className={`project-item ${isActive ? 'active' : ''} ${isIdle ? 'idle' : ''}`}
      onMouseEnter={() => onMouseEnter(index, project.image)}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        if (!project.past && project.ticketUrl) {
          window.open(project.ticketUrl, "_blank");
        }
      }}
      style={project.past ? { opacity: 0.5 } : {}}
      data-image={project.image}
    >
      {project.past && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
          display: "flex", alignItems: "center"
        }}>
          <svg
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "40px", opacity: 0.7 }}
          >
            <path
              d="M 0,50 C 150,20 250,80 400,50 C 550,20 650,80 800,50 C 900,30 950,70 1000,50"
              stroke="var(--accent)"
              strokeWidth="2.5"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
      <span ref={textRefs.artist} className="project-data artist hover-text">
        {project.artist}
      </span>
      <span ref={textRefs.album} className="project-data album hover-text" style={project.past ? { textDecoration: "line-through" } : {}}>
        {project.album}
      </span>
      <span ref={textRefs.category} className="project-data category hover-text">
        {project.category}
      </span>
      <span ref={textRefs.label} className="project-data label hover-text">
        {project.label}
      </span>
      <span ref={textRefs.year} className="project-data year hover-text">
        {project.year}
      </span>
    </li>
  );
}

// ── Sección shows ─────────────────────────────────────────────
function ShowsSection({ onHoverImage, onHoverSection }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isIdle, setIsIdle] = useState(true);
  
  const containerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const idleAnimationRef = useRef(null);
  const debounceRef = useRef(null);
  const projectItemsRef = useRef([]);

  // Map our shows to Projects Data
  const PROJECTS_DATA = SHOWS.map((s, index) => {
    const imagePath = `uploads/${index + 1}.png`;
    return {
      id: index + 1,
      artist: s.date,
      album: s.venue,
      category: s.day,
      label: s.past ? "Realizado" : "Entradas",
      year: s.longDate,
      image: imagePath,
      ticketUrl: s.ticketUrl,
      past: s.past
    };
  });

  const CONFIG = {
    idleDelay: 5000,
    timeUpdateInterval: 1000
  };

  // Preload images
  useEffect(() => {
    PROJECTS_DATA.forEach(project => {
      if (project.image) {
        const img = new Image();
        img.src = project.image;
      }
    });
  }, []);

  // Start idle animation (GSAP fade effects)
  const startIdleAnimation = useCallback(() => {
    if (!window.gsap) return;
    if (idleAnimationRef.current) return;
    
    const timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 2
    });
    
    projectItemsRef.current.forEach((item, index) => {
      if (!item) return;
      
      const hideTime = index * 0.05;
      const showTime = (PROJECTS_DATA.length * 0.05 * 0.5) + index * 0.05;
      
      timeline.to(item, {
        opacity: 0.1,
        duration: 0.1,
        ease: "power2.inOut"
      }, hideTime);
      
      timeline.to(item, {
        opacity: PROJECTS_DATA[index].past ? 0.5 : 1, // preserve past opacity
        duration: 0.1,
        ease: "power2.inOut"
      }, showTime);
    });
    
    idleAnimationRef.current = timeline;
  }, [PROJECTS_DATA]);

  // Stop idle animation
  const stopIdleAnimation = useCallback(() => {
    if (!window.gsap) return;
    if (idleAnimationRef.current) {
      idleAnimationRef.current.kill();
      idleAnimationRef.current = null;
      
      projectItemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.set(item, { opacity: PROJECTS_DATA[index].past ? 0.5 : 1 });
        }
      });
    }
  }, [PROJECTS_DATA]);

  // Start idle timer
  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    idleTimerRef.current = setTimeout(() => {
      if (activeIndex === -1) {
        setIsIdle(true);
        startIdleAnimation();
      }
    }, CONFIG.idleDelay);
  }, [activeIndex, startIdleAnimation]);

  // Stop idle timer
  const stopIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  // Handle mouse enter on project
  const handleProjectMouseEnter = useCallback((index, imageUrl) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    stopIdleAnimation();
    stopIdleTimer();
    setIsIdle(false);
    
    if (activeIndex === index) return;
    
    setActiveIndex(index);
    onHoverImage({
      image: imageUrl,
      position: index === 0 ? "center 10%" : "center" // Shift 1.png down to show the faces at the top
    });
  }, [activeIndex, stopIdleAnimation, stopIdleTimer, onHoverImage]);

  // Handle mouse leave on project
  const handleProjectMouseLeave = useCallback(() => {
    debounceRef.current = setTimeout(() => {
      // Handled inside ProjectItem
    }, 50);
  }, []);

  // Handle container mouse leave
  const handleContainerMouseLeave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    setActiveIndex(-1);
    onHoverImage({ image: "", position: "center" });
    startIdleTimer();
  }, [startIdleTimer, onHoverImage]);

  useEffect(() => {
    startIdleTimer();
    return () => {
      stopIdleTimer();
      stopIdleAnimation();
    };
  }, [startIdleTimer, stopIdleTimer, stopIdleAnimation]);

  return (
    <section 
      id="shows" 
      onMouseEnter={() => onHoverSection && onHoverSection(true)}
      onMouseLeave={() => onHoverSection && onHoverSection(false)}
      style={{
        position: "relative", zIndex: 5,
        padding: "40px 32px 280px", // Increased padding bottom to scroll down more
      }}
    >
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        gap: 24, flexWrap: "wrap",
        borderBottom: "1px solid var(--rule-strong)",
        paddingBottom: 14, marginBottom: 24,
      }}>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 11,
          letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.65,
        }}>↳ N°02 — Próximas fechas</div>
        <h2 style={{
          fontFamily: "var(--display)",
          fontSize: "clamp(32px, 5vw, 64px)",
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
          lineHeight: 0.95,
        }}>
          Tour <span style={{ color: "var(--accent)" }}>2026</span>
        </h2>
      </div>

      <div 
        ref={containerRef}
        className={`portfolio-container ${activeIndex !== -1 ? 'has-active' : ''}`}
        onMouseLeave={handleContainerMouseLeave}
        style={{ position: "relative" }}
      >
        <ul className="project-list" role="list">
          {PROJECTS_DATA.map((project, index) => (
            <ProjectItem
              key={project.id}
              project={project}
              index={index}
              onMouseEnter={handleProjectMouseEnter}
              onMouseLeave={handleProjectMouseLeave}
              isActive={activeIndex === index}
              isIdle={isIdle}
              ref={el => projectItemsRef.current[index] = el}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── ScrollExpandMedia Component ─────────────────────────────────
function ScrollExpandMedia({
  mediaType = 'image',
  mediaSrc = 'uploads/1.png',
  bgImageSrc = 'uploads/fondo.png',
  mediaPosition = 'center 10%',
  title = "Frecuencia Cero",
  date = "Tour 2026",
  scrollToExpand = "Desliza para expandir",
  textBlend = true,
  children
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isMobileState, setIsMobileState] = useState(false);

  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const element = sectionRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Progress starts when the section top enters the viewport bottom (rect.top = viewHeight)
      // and reaches 1.0 when the section top reaches the viewport top (rect.top = 0)
      const start = viewHeight;
      const end = 0;
      
      const distance = start - end;
      const current = start - rect.top;
      const progress = current / distance;
      const clampedProgress = Math.min(Math.max(progress, 0), 1);

      setScrollProgress(clampedProgress);

      if (clampedProgress >= 0.8) {
        setShowContent(true);
      } else {
        setShowContent(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 450 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 50 : 75);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh', // Standard viewport height, scrolls in flow
        width: '100%',
        background: '#0a0a0a',
        zIndex: 10,
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 0,
            height: '100%',
            opacity: 1 - scrollProgress,
            transition: 'opacity 0.15s ease'
          }}
        >
          <img
            src={bgImageSrc}
            alt='Background'
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              width: '100vw',
              height: '100vh'
            }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)' }} />
        </div>

        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', zIndex: 10, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                zIndex: 0,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '16px',
                width: `${mediaWidth}px`,
                height: `${mediaHeight}px`,
                maxWidth: '95vw',
                maxHeight: '85vh',
                boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden',
                border: '1.5px solid var(--rule-strong)'
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={mediaSrc}
                  alt={title || 'Media content'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: mediaPosition }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.55)',
                    opacity: 0.7 - scrollProgress * 0.3,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'none',
                    borderRadius: '16px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'absolute', bottom: '24px', left: 0, right: 0, zIndex: 10 }}>
                {date && (
                  <p
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 'clamp(14px, 2vw, 24px)',
                      color: 'var(--bg)',
                      transform: `translateX(-${textTranslateX}vw)`,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      opacity: 1 - scrollProgress
                    }}
                  >
                    {date}
                  </p>
                )}
                {scrollToExpand && (
                  <p
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 'clamp(12px, 1.5vw, 16px)',
                      color: 'var(--accent)',
                      transform: `translateX(${textTranslateX}vw)`,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      opacity: 1 - scrollProgress,
                      marginTop: '8px'
                    }}
                  >
                    {scrollToExpand}
                  </p>
                )}
              </div>
            </div>

            <div
              className={textBlend ? 'mix-blend-difference' : 'mix-blend-normal'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '16px',
                width: '100%',
                position: 'relative',
                zIndex: 10,
                flexDirection: 'column',
                fontFamily: 'var(--display)',
                textTransform: 'uppercase',
                letterSpacing: '-0.04em',
                color: 'var(--accent)'
              }}
            >
              <h2
                style={{
                  transform: `translateX(-${textTranslateX}vw)`,
                  fontSize: 'clamp(40px, 8vw, 120px)',
                  lineHeight: 0.85,
                  margin: 0
                }}
              >
                {firstWord}
              </h2>
              <h2
                style={{
                  transform: `translateX(${textTranslateX}vw)`,
                  fontSize: 'clamp(40px, 8vw, 120px)',
                  lineHeight: 0.85,
                  margin: 0
                }}
              >
                {restOfTitle}
              </h2>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              padding: '40px 32px',
              opacity: showContent ? 1 : 0,
              transition: 'opacity 0.7s ease',
              pointerEvents: showContent ? 'auto' : 'none',
              position: 'absolute',
              bottom: '10vh',
              left: 0,
              right: 0,
              zIndex: 20
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBg, setActiveBg] = useState({ image: "", position: "center" });
  const [isHoveringShows, setIsHoveringShows] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("uploads/music.mp3");
    const handleEnded = () => setIsPlaying(false);
    audioRef.current.addEventListener("ended", handleEnded);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Audio play failed/blocked:", err);
        });
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
    document.body.dataset.invert = t.invert ? "1" : "0";
    document.body.dataset.shader = (t.shader && t.invert) ? "1" : "0";
  }, [t.accent, t.invert, t.shader]);

  let HeroContent = HeroAsymmetric;
  if (t.layout === "centered") HeroContent = HeroCentered;
  if (t.layout === "fullbleed") HeroContent = HeroFullbleed;
  if (t.layout === "stage")     HeroContent = HeroStage;

  const nextShowForTicker = SHOWS.find(s => !s.past) || SHOWS[0];
  const tickerItems = [
    "Nuevo LP — Ruido Común",
    "Gira otoño 2026",
    `${nextShowForTicker.venue} · ${nextShowForTicker.date}`,
    "Suscribite",
    "Frecuencia · Cero",
    "La señal nunca se apagó",
  ];

  const showShader = t.shader && t.invert;

  return (
    <>
      <style>{FZ_CSS}</style>

      {showShader && (
        <>
          <ShaderBackground
            lineColor={t.accent}
            bgColorA="#08000f"
            bgColorB="#1a0524"
            intensity={t.shaderIntensity}
            opacity={isHoveringShows ? 0 : 1}
          />
          <div className="fz-vignette" />
          <div className="fz-scanlines" />
        </>
      )}

      <div 
        className="background-image" 
        style={{
          backgroundImage: activeBg.image 
            ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("${activeBg.image}")` 
            : "none",
          backgroundPosition: activeBg.position || "center",
          opacity: activeBg.image ? 0.9 : 0, 
          transform: activeBg.image ? "translate(-50%, -50%) scale(1.0)" : "translate(-50%, -50%) scale(1.12)",
          filter: activeBg.image 
            ? "grayscale(0%) contrast(105%) brightness(0.85) blur(0px)" 
            : "grayscale(0%) contrast(105%) brightness(0.3) blur(15px)"
        }}
        role="img" 
        aria-hidden="true"
      />

      <Topbar isPlaying={isPlaying} />

      <main style={{
        position: "relative",
        zIndex: 5,
        minHeight: "100vh",
        paddingTop: 96,
        paddingBottom: 0,
        paddingLeft: 32, paddingRight: 32,
        display: "flex", flexDirection: "column",
      }}>
        <GridGuides visible={t.showGrid} />

        <Crosshair pos={{ top: 86, left: 22 }} />
        <Crosshair pos={{ top: 86, right: 22 }} />
        <Crosshair pos={{ bottom: 80, left: 22 }} />
        <Crosshair pos={{ bottom: 80, right: 22 }} />

        <div style={{
          position: "relative", zIndex: 5,
          flex: 1,
          display: "flex", flexDirection: "column", justifyContent: "center",
          paddingTop: 40, paddingBottom: 48,
        }}>
          <HeroContent tweaks={t} isPlaying={isPlaying} onTogglePlay={togglePlay} />
        </div>

        <div style={{
          position: "relative", zIndex: 5,
          display: "grid", gridTemplateColumns: "auto 1fr auto",
          alignItems: "center", gap: 24,
          paddingTop: 14, paddingBottom: 16,
          borderTop: "1px solid var(--rule-strong)",
          fontFamily: "var(--mono)", fontSize: 11,
          letterSpacing: "0.14em", textTransform: "uppercase",
          opacity: 0.7,
        }}>
          <span>↓ Scroll</span>
          <div style={{ textAlign: "center" }}>
            Editorial 04 · La señal nunca se apagó
          </div>
          <span>FZ — 0001</span>
        </div>
      </main>

      {t.ticker && <Marquee items={tickerItems} />}

      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="uploads/1.png"
        bgImageSrc="uploads/fondo.png"
        mediaPosition="center 10%"
        title="Frecuencia Cero"
        date="Tour 2026"
        scrollToExpand="Desliza para expandir"
        textBlend={true}
      >
        <div className="scroll-expand-content">
          <div>
            <h3 style={{
              fontFamily: "var(--display)",
              fontSize: "clamp(24px, 4vw, 48px)",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              lineHeight: 1,
              marginBottom: 24,
              color: "#ffffff"
            }}>
              La señal nunca se apagó
            </h3>
            <p style={{
              fontSize: 16,
              lineHeight: 1.6,
              opacity: 0.8,
              fontFamily: "var(--sans)"
            }}>
              Frecuencia Cero no es solo música; es una transmisión vibrante y electrizante que nace en Feelingmusic. Conectando teclados, ritmos contagiosos y voces llenas de energía, creamos una experiencia inmersiva y llena de vida en cada presentación en vivo
            </p>
          </div>
          <div className="scroll-expand-right">
            <div style={{ fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.15em", color: "#ffffff" }}>
              // Transmisión Activa
            </div>
            <div style={{ fontSize: 24, fontFamily: "var(--display)", textTransform: "uppercase", marginBottom: 24, lineHeight: 1.1 }}>
              Sintonizá el ruido común en las próximas fechas.
            </div>
            <a href="#shows" className="fz-cta fz-cta-primary" style={{ alignSelf: "flex-start" }}>
              <span>Ver fechas del tour</span>
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </ScrollExpandMedia>

      <MembersSection />
      <ShowsSection onHoverImage={setActiveBg} onHoverSection={setIsHoveringShows} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout" />
        <TweakRadio label="Composición" value={t.layout}
          options={[
            { value: "stage",      label: "Stage" },
            { value: "asymmetric", label: "Asim." },
            { value: "centered",   label: "Centro" },
            { value: "fullbleed",  label: "Full" },
          ]}
          onChange={(v) => setTweak("layout", v)} />
        <TweakSlider label="Tamaño display" value={t.displayScale}
          min={0.7} max={1.4} step={0.05} unit="x"
          onChange={(v) => setTweak("displayScale", v)} />

        <TweakSection label="Color" />
        <TweakColor label="Acento" value={t.accent}
          onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Modo invertido" value={t.invert}
          onChange={(v) => setTweak("invert", v)} />

        <TweakSection label="Fondo shader" />
        <TweakToggle label="Activar shader" value={t.shader}
          onChange={(v) => setTweak("shader", v)} />
        <TweakSlider label="Intensidad" value={t.shaderIntensity}
          min={0.2} max={2.0} step={0.05} unit="x"
          onChange={(v) => setTweak("shaderIntensity", v)} />

        <TweakSection label="Detalles" />
        <TweakToggle label="Grid visible" value={t.showGrid}
          onChange={(v) => setTweak("showGrid", v)} />
        <TweakToggle label="Ticker" value={t.ticker}
          onChange={(v) => setTweak("ticker", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
