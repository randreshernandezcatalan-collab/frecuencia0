// integrantes.jsx — Página de integrantes con selector interactivo de fotos.
// Adaptado al stack de Frecuencia Cero (React UMD + Babel standalone, sin Tailwind).
// Las imágenes son placeholders; cuando se carguen las fotos reales sólo
// hay que rellenar `image` en cada miembro de BAND_MEMBERS.
const { useState, useEffect } = React;

/* ===========================================================
   Datos
   =========================================================== */

const BAND_MEMBERS = [
  {
    idx: "01",
    name: "Fer",
    role: "Voz",
    quote: "Frente del escenario · voz líder",
    image: "uploads/voz.png",
  },
  {
    idx: "02",
    name: "Richi",
    role: "Teclado",
    quote: "Pads, sintes y armonía",
    image: "uploads/piano.png",
  },
  {
    idx: "03",
    name: "Vic",
    role: "Bajo",
    quote: "Bajo y groove · low-end",
    image: "uploads/bajo.png",
  },
  {
    idx: "04",
    name: "Patito",
    role: "Guitarra",
    quote: "Riffs y texturas",
    image: "uploads/guitarra.png",
  },
  {
    idx: "05",
    name: "Bruno",
    role: "Batería",
    quote: "Tempo y pulso · backbeat",
    image: "uploads/bateria.png",
  },
];

const NAV_ITEMS = ["Integrantes", "Shows", "Música", "Galería"];

/* ===========================================================
   Estilos locales
   =========================================================== */

const I_CSS = `
  @keyframes i-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }
  @keyframes i-rise {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes i-slide {
    from { opacity: 0; transform: translateX(-60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .i-rise { animation: i-rise 0.9s cubic-bezier(0.2,0.8,0.2,1) both; }
  .i-rise.d1 { animation-delay: 0.05s; }
  .i-rise.d2 { animation-delay: 0.18s; }
  .i-rise.d3 { animation-delay: 0.36s; }
  .i-rise.d4 { animation-delay: 0.55s; }

  .i-link { color: var(--ink); text-decoration: none; position: relative; }
  .i-link::after {
    content: ""; position: absolute; left: 0; bottom: -3px;
    height: 1.5px; width: 0; background: var(--accent);
    transition: width 0.25s;
  }
  .i-link:hover::after { width: 100%; }

  .i-cta {
    display: inline-flex; align-items: center; gap: 14px;
    padding: 16px 22px;
    font-family: var(--mono); font-size: 12px;
    letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
    text-decoration: none; cursor: pointer; border: 0;
    transition: 0.2s; white-space: nowrap;
    background: var(--ink); color: var(--bg);
  }
  .i-cta:hover { background: var(--accent); color: #0a0a0a; }
  .i-cta .arrow { transition: transform 0.2s; }
  .i-cta:hover .arrow { transform: translateX(4px); }

  .i-vignette {
    position: fixed; inset: 0; z-index: 1; pointer-events: none;
    background: radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.7) 100%);
  }
  .i-scanlines {
    position: fixed; inset: 0; z-index: 2; pointer-events: none;
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0.025) 0 1px,
      transparent 1px 3px
    );
    mix-blend-mode: overlay; opacity: 0.6;
  }

  /* Selector de fotos */
  .i-selector {
    display: flex; width: 100%;
    height: clamp(420px, 60vh, 620px);
    align-items: stretch;
    overflow: hidden;
    border: 1px solid var(--rule-strong);
    background: rgba(0,0,0,0.35);
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
  }

  .i-option {
    position: relative;
    flex: 1 1 0%;
    min-width: 56px;
    cursor: pointer;
    overflow: hidden;
    border-right: 1px solid rgba(241,237,230,0.08);
    transition:
      flex-grow 0.7s cubic-bezier(0.2,0.8,0.2,1),
      box-shadow 0.4s,
      background-size 0.7s;
    background-color: #18181b;
    background-size: auto 120%;
    background-position: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.30);
  }
  .i-option:last-child { border-right: 0; }
  .i-option.active {
    flex-grow: 7;
    background-size: auto 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.55);
  }
  .i-option:hover:not(.active) {
    filter: brightness(1.1);
  }

  .i-option .i-tint {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.85) 100%);
    transition: opacity 0.5s;
    opacity: 0.85;
    pointer-events: none;
  }
  .i-option.active .i-tint { opacity: 1; }

  .i-option .i-side {
    position: absolute;
    top: 0; bottom: 0; left: 0;
    width: 56px;
    display: flex; align-items: center; justify-content: center;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 0.32em; text-transform: uppercase;
    color: var(--bg);
    opacity: 0.55;
    pointer-events: none;
  }

  .i-option .i-meta {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 18px 20px 22px 64px;
    display: flex; align-items: flex-end; gap: 16px;
    color: var(--bg);
    pointer-events: none;
  }
  .i-option .i-num {
    width: 44px; height: 44px;
    border-radius: 999px;
    border: 1.5px solid rgba(241,237,230,0.7);
    background: rgba(10,10,10,0.55);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 11px; font-weight: 600;
    letter-spacing: 0.08em;
    flex-shrink: 0;
    transition: border-color 0.3s, background 0.3s;
  }
  .i-option.active .i-num {
    border-color: var(--accent);
    background: rgba(255,45,45,0.18);
  }
  .i-option .i-info {
    overflow: hidden;
    transition: opacity 0.5s, transform 0.5s;
    opacity: 0;
    transform: translateX(20px);
  }
  .i-option.active .i-info { opacity: 1; transform: translateX(0); }
  .i-option .i-name {
    font-family: var(--display);
    font-size: clamp(28px, 3.6vw, 44px);
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.95;
    text-shadow: 0 2px 18px rgba(0,0,0,0.55);
  }
  .i-option .i-name .dot { color: var(--accent); }
  .i-option .i-role {
    margin-top: 6px;
    font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--accent);
  }
  .i-option .i-quote {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.4;
    color: rgba(241,237,230,0.85);
  }

  /* Placeholder “foto” */
  .i-placeholder {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(255,45,45,0.35), transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(255,45,45,0.18), transparent 65%),
      linear-gradient(135deg, #1a0a14 0%, #0a0a0a 60%, #150514 100%);
    pointer-events: none;
  }
  .i-placeholder::before {
    content: "";
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255,45,45,0.04) 0 2px,
      transparent 2px 8px
    );
  }
  .i-ph-glyph {
    position: relative;
    font-family: var(--display);
    font-size: clamp(80px, 14vw, 220px);
    color: rgba(241,237,230,0.06);
    letter-spacing: -0.06em;
    text-transform: uppercase;
    line-height: 1;
  }
  .i-ph-tag {
    position: absolute;
    top: 18px; right: 18px;
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: rgba(241,237,230,0.4);
    border: 1px dashed rgba(241,237,230,0.3);
    padding: 4px 8px;
  }

  /* Mobile: convertir el selector en stack vertical */
  @media (max-width: 720px) {
    .i-selector { flex-direction: column; height: auto; }
    .i-option {
      flex: 1 1 auto !important;
      min-height: 220px;
      border-right: 0;
      border-bottom: 1px solid rgba(241,237,230,0.08);
    }
    .i-option .i-side { display: none; }
    .i-option .i-info { opacity: 1; transform: none; }
    .i-option .i-meta { padding: 18px 20px 20px; }
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

/* ===========================================================
   Componentes UI
   =========================================================== */

function ICeroMark({ size = 20 }) {
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

function ITopbar() {
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
      background: "rgba(10,10,10,0.86)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(241,237,230,0.18)",
      fontFamily: "var(--mono)",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "#f1ede6",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#f1ede6" }}>
        <a href="index.html" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#f1ede6" }}>
          <div style={{ color: "#f1ede6" }}><ICeroMark size={20} /></div>
          <span style={{ fontWeight: 600 }}>Frecuencia Cero</span>
        </a>
        <span style={{ opacity: 0.55, color: "#f1ede6" }}>EST. MMXXII</span>
      </div>

      <nav style={{ justifySelf: "center", display: "flex", gap: 28 }}>
        {NAV_ITEMS.map((item, i) => {
          const isHere = item === "Integrantes";
          let href;
          if (item === "Integrantes") href = "integrantes.html";
          else if (item === "Galería") href = "galeria.html";
          else href = `index.html#${item.toLowerCase()}`;
          return (
            <a key={item} href={href} className="i-link" style={{
              display: "inline-flex", gap: 6, alignItems: "baseline", fontWeight: 500,
              color: isHere ? "var(--accent)" : "#f1ede6",
            }}>
              <span style={{ opacity: 0.55 }}>0{i + 1}</span>
              <span>{item}</span>
            </a>
          );
        })}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#f1ede6" }}>
        <span style={{ opacity: 0.55 }}>MEL · {t}</span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 10px", border: "1px solid #f1ede6", borderRadius: 999,
          color: "#f1ede6",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent)",
            animation: "i-pulse 1.6s ease-in-out infinite",
          }} />
          On Air
        </span>
      </div>
    </header>
  );
}

/* ===========================================================
   Selector interactivo de integrantes
   =========================================================== */

function MembersSelector() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState([]);

  useEffect(() => {
    const timers = [];
    BAND_MEMBERS.forEach((_, i) => {
      const t = setTimeout(() => {
        setAnimatedOptions((prev) => (prev.includes(i) ? prev : [...prev, i]));
      }, 180 * i);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="i-selector">
      {BAND_MEMBERS.map((m, index) => {
        const isActive = activeIndex === index;
        const isReady = animatedOptions.includes(index);
        const optionStyle = {
          opacity: isReady ? 1 : 0,
          transform: isReady ? "translateX(0)" : "translateX(-60px)",
          transition:
            "opacity 0.7s ease, transform 0.7s ease, flex-grow 0.7s cubic-bezier(0.2,0.8,0.2,1), background-size 0.7s",
        };
        if (m.image) {
          optionStyle.backgroundImage = `url('${m.image}')`;
        }
        return (
          <div
            key={m.idx}
            className={`i-option ${isActive ? "active" : ""}`}
            style={optionStyle}
            onClick={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
          >
            {!m.image && (
              <div className="i-placeholder">
                <span className="i-ph-tag">FOTO · {m.idx}</span>
                <span className="i-ph-glyph">{m.name[0]}</span>
              </div>
            )}
            <div className="i-tint" />
            <div className="i-side">
              FZ · {m.idx} — {m.role}
            </div>
            <div className="i-meta">
              <div className="i-num">{m.idx}</div>
              <div className="i-info">
                <div className="i-name">
                  {m.name}
                  <span className="dot">.</span>
                </div>
                <div className="i-role">{m.role}</div>
                <div className="i-quote">{m.quote}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===========================================================
   App
   =========================================================== */

function MembersApp() {
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", "#ff2d2d");
    document.body.dataset.invert = "1";
    document.body.dataset.shader = "1";
  }, []);

  return (
    <>
      <style>{I_CSS}</style>

      <ShaderBackground
        lineColor="#ff2d2d"
        bgColorA="#08000f"
        bgColorB="#1a0524"
        intensity={0.7}
      />
      <div className="i-vignette" />
      <div className="i-scanlines" />

      <ITopbar />

      <main style={{
        position: "relative", zIndex: 5,
        minHeight: "100vh",
        padding: "120px 32px 80px",
        display: "flex", flexDirection: "column",
        maxWidth: 1440, margin: "0 auto", width: "100%",
        color: "#f1ede6",
      }}>
        {/* Encabezado editorial */}
        <div className="i-rise d1" style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          gap: 24, flexWrap: "wrap",
          fontFamily: "var(--mono)", fontSize: 11,
          letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7,
          marginBottom: 24,
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent)",
              animation: "i-pulse 1.6s ease-in-out infinite",
              boxShadow: "0 0 12px var(--accent)",
            }} />
            Roster · 2026
          </span>
          <span>↳ N°02 — Integrantes</span>
          <span>Side · A</span>
        </div>

        {/* Headline */}
        <h1 className="i-rise d2" style={{
          fontFamily: "var(--display)",
          fontSize: "clamp(48px, 10vw, 160px)",
          letterSpacing: "-0.04em",
          lineHeight: 0.85,
          textTransform: "uppercase",
          textShadow: "0 2px 24px rgba(0,0,0,0.45)",
        }}>
          Integrantes
          <span style={{ color: "var(--accent)" }}>.</span>
        </h1>

        {/* Bajada */}
        <p className="i-rise d3" style={{
          marginTop: 28,
          maxWidth: 620,
          fontSize: 18, lineHeight: 1.45,
          color: "#d8d4cd",
          textWrap: "pretty",
        }}>
          Cinco voces, un mismo pulso. Pasá el cursor o tocá una foto para
          conocer a cada integrante de <em style={{
            color: "var(--accent)", fontStyle: "normal", fontWeight: 600,
          }}>Frecuencia Cero</em>.
        </p>

        {/* Selector */}
        <section className="i-rise d4" style={{ marginTop: 56 }}>
          <MembersSelector />
        </section>

        {/* Pie */}
        <div className="i-rise d4" style={{
          marginTop: 64,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 16, flexWrap: "wrap",
          paddingTop: 24,
          borderTop: "1px solid var(--rule-strong)",
          fontFamily: "var(--mono)", fontSize: 11,
          letterSpacing: "0.14em", textTransform: "uppercase",
          opacity: 0.85,
        }}>
          <span>FZ — Integrantes · 0001</span>
          <a href="index.html" className="i-cta">
            <span>← Volver al inicio</span>
            <span className="arrow">→</span>
          </a>
        </div>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MembersApp />);
