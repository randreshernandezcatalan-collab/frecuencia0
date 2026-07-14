// galeria.jsx — Página de galería con bento gallery interactivo (drag + modal).
// Adaptado al stack vanilla del proyecto (React UMD, sin Tailwind/framer-motion).
// Para agregar fotos reales: rellená `url` en cada item de GALLERY_ITEMS.
const { useState, useEffect, useRef, useCallback } = React;

/* ===========================================================
   Datos de la galería
   ===========================================================
   Cada ítem ocupa una celda del bento. `span` controla el tamaño:
     ""           → 1 col x 1 fila
     "tall"       → 1 col x 2 filas
     "wide"       → 2 col x 1 fila
     "wide-tall"  → 2 col x 2 filas
   Cuando tengas la foto, reemplazá `url: null` por la ruta real.
*/
const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Sunset City Bar",
    desc: "Show · 01.05 — backstage",
    tag: "PH-01",
    url: "uploads/galeria1.png",
    span: "wide-tall",
  },
  {
    id: 2,
    title: "Estudio · Sesión 01",
    desc: "Pre-producción",
    tag: "PH-02",
    url: "uploads/galeria2.png",
    span: "",
  },
  {
    id: 3,
    title: "Backstage",
    desc: "Antes del show",
    tag: "PH-03",
    url: "uploads/galeria3.png",
    span: "",
  },
  {
    id: 4,
    title: "En la ruta",
    desc: "Camino al show",
    tag: "PH-04",
    url: "uploads/galeria4.png",
    span: "tall",
  },
  {
    id: 5,
    title: "Ensayo abierto",
    desc: "Sala de ensayo",
    tag: "PH-05",
    url: "uploads/galeria5.png",
    span: "",
  },
  {
    id: 6,
    title: "Prensa · Edit 04",
    desc: "Recortes y notas",
    tag: "PH-06",
    url: "uploads/galeria6.png",
    span: "wide",
  },
  {
    id: 7,
    title: "Forestani",
    desc: "Show · 29.05",
    tag: "PH-07",
    url: "uploads/galeria7.png",
    span: "",
  },
  {
    id: 8,
    title: "Patio Viejo",
    desc: "Show · 20.06",
    tag: "PH-08",
    url: "uploads/galeria8.png",
    span: "tall",
  },
  {
    id: 9,
    title: "Sintonía Local",
    desc: "Vivo · Feelingmusic",
    tag: "PH-09",
    url: "uploads/galeria9.png",
    span: "",
  },
  {
    id: 10,
    title: "Señal Análoga",
    desc: "Detalle de sintetizadores",
    tag: "PH-10",
    url: "uploads/galeria10.png",
    span: "wide",
  },
  {
    id: 11,
    title: "Sesión Acústica",
    desc: "Feelingmusic en vivo",
    tag: "PH-11",
    url: "uploads/galeria11.png",
    span: "wide-tall",
  },
  {
    id: 12,
    title: "Detrás de Escena",
    desc: "Preparando sintetizadores",
    tag: "PH-12",
    url: "uploads/galeria12.png",
    span: "",
  },
  {
    id: 13,
    title: "Sintonizadores",
    desc: "Show · 17.07",
    tag: "PH-13",
    url: "uploads/galeria13.png",
    span: "",
  },
  {
    id: 14,
    title: "Luces y Sombra",
    desc: "Iluminación de escenario",
    tag: "PH-14",
    url: "uploads/galeria14.png",
    span: "tall",
  },
  {
    id: 15,
    title: "Próximo Ruido",
    desc: "Encuentro con fans",
    tag: "PH-15",
    url: "uploads/galeria15.png",
    span: "",
  },
  {
    id: 16,
    title: "Señal Cero",
    desc: "Post-producción en vivo",
    tag: "PH-16",
    url: "uploads/galeria16.png",
    span: "wide",
  },
  {
    id: 17,
    title: "Riff Distorsionado",
    desc: "Show · Forestani",
    tag: "PH-17",
    url: "uploads/galeria17.png",
    span: "",
  },
  {
    id: 18,
    title: "Groove analógico",
    desc: "Prueba de sonido",
    tag: "PH-18",
    url: "uploads/galeria18.png",
    span: "tall",
  },
  {
    id: 19,
    title: "Señal de Radio",
    desc: "Transmisión en directo",
    tag: "PH-19",
    url: "uploads/galeria19.png",
    span: "",
  },
  {
    id: 20,
    title: "Final de Transmisión",
    desc: "Show · Patio Viejo",
    tag: "PH-20",
    url: "uploads/galeria20.png",
    span: "wide",
  },
];

const GALLERY_NAV = ["Integrantes", "Shows", "Música", "Galería"];

/* ===========================================================
   CSS local
   =========================================================== */

const G_CSS = `
  @keyframes g-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }
  @keyframes g-rise {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes g-pop {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes g-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .g-rise { animation: g-rise 0.9s cubic-bezier(0.2,0.8,0.2,1) both; }
  .g-rise.d1 { animation-delay: 0.05s; }
  .g-rise.d2 { animation-delay: 0.18s; }
  .g-rise.d3 { animation-delay: 0.36s; }
  .g-rise.d4 { animation-delay: 0.55s; }

  .g-link { color: #f1ede6; text-decoration: none; position: relative; }
  .g-link::after {
    content: ""; position: absolute; left: 0; bottom: -3px;
    height: 1.5px; width: 0; background: var(--accent);
    transition: width 0.25s;
  }
  .g-link:hover::after { width: 100%; }

  .g-cta {
    display: inline-flex; align-items: center; gap: 14px;
    padding: 16px 22px;
    font-family: var(--mono); font-size: 12px;
    letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
    text-decoration: none; cursor: pointer; border: 0;
    transition: 0.2s; white-space: nowrap;
    background: #f1ede6; color: #0a0a0a;
  }
  .g-cta:hover { background: var(--accent); color: #0a0a0a; }
  .g-cta .arrow { transition: transform 0.2s; }
  .g-cta:hover .arrow { transform: translateX(4px); }

  .g-vignette {
    position: fixed; inset: 0; z-index: 1; pointer-events: none;
    background: radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.7) 100%);
  }
  .g-scanlines {
    position: fixed; inset: 0; z-index: 2; pointer-events: none;
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0.025) 0 1px,
      transparent 1px 3px
    );
    mix-blend-mode: overlay; opacity: 0.6;
  }

  /* === Bento gallery === */
  .g-bento-wrap {
    position: relative;
    width: 100%;
    overflow: hidden;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    padding: 4px 0;
  }
  .g-bento-wrap.dragging { cursor: grabbing; }
  .g-bento-wrap.dragging .g-bento-track { transition: none; }

  .g-bento-track {
    display: inline-flex;
    will-change: transform;
    transition: transform 0.4s cubic-bezier(0.2,0.8,0.2,1);
  }

  .g-bento-grid {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(2, 220px);
    grid-auto-columns: 240px;
    gap: 14px;
    padding: 0 4px;
  }

  .g-bento-item {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(241,237,230,0.18);
    background: #18181b;
    cursor: pointer;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    animation: g-pop 0.7s cubic-bezier(0.2,0.8,0.2,1) forwards;
    transition: transform 0.35s cubic-bezier(0.2,0.8,0.2,1), border-color 0.25s;
    outline: none;
  }
  .g-bento-item:hover {
    border-color: var(--accent);
    transform: translateY(-2px) scale(1.01);
  }
  .g-bento-item:focus-visible {
    box-shadow: 0 0 0 2px var(--accent), 0 0 0 4px rgba(255,45,45,0.25);
  }
  .g-bento-item.span-tall      { grid-row: span 2; }
  .g-bento-item.span-wide      { grid-column: span 2; }
  .g-bento-item.span-wide-tall { grid-row: span 2; grid-column: span 2; }

  .g-bento-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.55s cubic-bezier(0.2,0.8,0.2,1);
  }
  .g-bento-item:hover .g-bento-img { transform: scale(1.06); }

  .g-bento-overlay {
    position: absolute; inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.85) 100%);
    opacity: 0;
    transition: opacity 0.45s;
  }
  .g-bento-item:hover .g-bento-overlay { opacity: 1; }

  .g-bento-tag {
    position: absolute; top: 12px; left: 12px;
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: rgba(241,237,230,0.7);
    background: rgba(10,10,10,0.55);
    border: 1px dashed rgba(241,237,230,0.35);
    padding: 4px 8px;
    z-index: 2;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
  }

  .g-bento-meta {
    position: absolute; left: 16px; right: 16px; bottom: 16px;
    color: #f1ede6;
    transform: translateY(14px);
    opacity: 0;
    transition: transform 0.45s cubic-bezier(0.2,0.8,0.2,1), opacity 0.45s;
    z-index: 2;
  }
  .g-bento-item:hover .g-bento-meta { transform: translateY(0); opacity: 1; }
  .g-bento-title {
    font-family: var(--display);
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 1.1;
    text-shadow: 0 2px 14px rgba(0,0,0,0.6);
  }
  .g-bento-desc {
    margin-top: 4px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(241,237,230,0.85);
  }

  /* Placeholder “sin foto aún” */
  .g-bento-placeholder {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background:
      radial-gradient(ellipse at 25% 20%, rgba(255,45,45,0.32), transparent 60%),
      radial-gradient(ellipse at 75% 85%, rgba(255,45,45,0.16), transparent 65%),
      linear-gradient(135deg, #1a0a14 0%, #0a0a0a 60%, #150514 100%);
  }
  .g-bento-placeholder::before {
    content: "";
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255,45,45,0.05) 0 2px,
      transparent 2px 8px
    );
  }
  .g-bento-placeholder .glyph {
    position: relative;
    font-family: var(--display);
    font-size: clamp(48px, 8vw, 120px);
    color: rgba(241,237,230,0.07);
    letter-spacing: -0.06em;
    text-transform: uppercase;
    line-height: 1;
    pointer-events: none;
  }

  /* Indicador “arrastrar” */
  .g-bento-hint {
    margin-top: 16px;
    display: flex; align-items: center; gap: 10px;
    font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(241,237,230,0.55);
  }
  .g-bento-hint .dash {
    width: 36px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,45,45,0.6), transparent);
  }

  /* === Modal === */
  .g-modal-backdrop {
    position: fixed; inset: 0; z-index: 60;
    background: rgba(0,0,0,0.82);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: g-fade-in 0.25s ease both;
  }
  .g-modal-card {
    position: relative;
    max-width: 1100px; width: 100%;
    max-height: 90vh;
    display: flex; align-items: center; justify-content: center;
    animation: g-pop 0.35s cubic-bezier(0.2,0.8,0.2,1) both;
  }
  .g-modal-img {
    max-width: 100%; max-height: 88vh;
    width: auto; height: auto;
    object-fit: contain;
    border: 1px solid rgba(241,237,230,0.25);
    box-shadow: 0 30px 80px rgba(0,0,0,0.6);
  }
  .g-modal-placeholder {
    width: 100%;
    aspect-ratio: 4 / 3;
    max-height: 88vh;
    display: flex; align-items: center; justify-content: center;
    background:
      radial-gradient(ellipse at 30% 25%, rgba(255,45,45,0.4), transparent 60%),
      radial-gradient(ellipse at 75% 85%, rgba(255,45,45,0.18), transparent 65%),
      linear-gradient(135deg, #1a0a14 0%, #0a0a0a 60%, #150514 100%);
    border: 1px solid rgba(241,237,230,0.25);
    color: rgba(241,237,230,0.45);
    font-family: var(--mono); font-size: 12px;
    letter-spacing: 0.22em; text-transform: uppercase;
  }
  .g-modal-info {
    position: absolute; left: 0; right: 0; bottom: -52px;
    display: flex; justify-content: space-between; align-items: center;
    color: #f1ede6;
    font-family: var(--mono); font-size: 11px;
    letter-spacing: 0.18em; text-transform: uppercase;
    opacity: 0.85;
  }
  .g-modal-close {
    position: absolute; top: 24px; right: 24px;
    width: 44px; height: 44px;
    border-radius: 999px;
    border: 1px solid rgba(241,237,230,0.4);
    background: rgba(10,10,10,0.55);
    color: #f1ede6;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: 0.2s;
  }
  .g-modal-close:hover {
    background: var(--accent);
    color: #0a0a0a;
    border-color: var(--accent);
  }

  @media (max-width: 720px) {
    .g-bento-grid {
      grid-template-rows: repeat(2, 180px);
      grid-auto-columns: 200px;
      gap: 10px;
    }
    .g-bento-item.span-wide,
    .g-bento-item.span-wide-tall { grid-column: span 2; }
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
   Helpers UI
   =========================================================== */

function GZeroMark({ size = 20 }) {
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

function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function GTopbar() {
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
          <div style={{ color: "#f1ede6" }}><GZeroMark size={20} /></div>
          <span style={{ fontWeight: 600 }}>Frecuencia Cero</span>
        </a>
        <span style={{ opacity: 0.55, color: "#f1ede6" }}>EST. MMXXII</span>
      </div>

      <nav style={{ justifySelf: "center", display: "flex", gap: 28 }}>
        {GALLERY_NAV.map((item, i) => {
          const isHere = item === "Galería";
          let href;
          if (item === "Galería") href = "galeria.html";
          else if (item === "Integrantes") href = "integrantes.html";
          else href = `index.html#${item.toLowerCase()}`;
          return (
            <a key={item} href={href} className="g-link" style={{
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
            animation: "g-pulse 1.6s ease-in-out infinite",
          }} />
          On Air
        </span>
      </div>
    </header>
  );
}

/* ===========================================================
   Bento Gallery
   =========================================================== */

function BentoItem({ item, index, onSelect }) {
  return (
    <div
      className={`g-bento-item ${item.span ? `span-${item.span}` : ""}`}
      style={{ animationDelay: `${0.08 * index}s` }}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(item); } }}
      tabIndex={0}
      role="button"
      aria-label={`Ver ${item.title}`}
    >
      {item.url ? (
        <img className="g-bento-img" src={item.url} alt={item.title} draggable="false" />
      ) : (
        <div className="g-bento-placeholder">
          <span className="glyph">{(item.title || "FZ").slice(0, 2)}</span>
        </div>
      )}
      <span className="g-bento-tag">{item.tag}</span>
      <div className="g-bento-overlay" />
      <div className="g-bento-meta">
        <div className="g-bento-title">{item.title}</div>
        <div className="g-bento-desc">{item.desc}</div>
      </div>
    </div>
  );
}

function BentoGallery({ items, onSelect }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const gridRef = useRef(null);

  const [maxNeg, setMaxNeg] = useState(0);
  const [offset, setOffset] = useState(0);
  const dragRef = useRef({ dragging: false, startX: 0, startOffset: 0, moved: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Calcular constraint de drag
  const recalc = useCallback(() => {
    if (!wrapRef.current || !gridRef.current) return;
    const wrapW = wrapRef.current.offsetWidth;
    const gridW = gridRef.current.scrollWidth;
    const minOffset = Math.min(0, wrapW - gridW - 32);
    setMaxNeg(minOffset);
    setOffset((prev) => Math.max(minOffset, Math.min(0, prev)));
  }, []);

  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [recalc, items]);

  // Drag handlers (mouse + touch via pointer)
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startOffset: offset,
      moved: 0,
    };
    setIsDragging(true);
    if (e.target.setPointerCapture) {
      try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
    }
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const delta = e.clientX - dragRef.current.startX;
    dragRef.current.moved = Math.abs(delta);
    let next = dragRef.current.startOffset + delta;
    // Resistencia elástica fuera de límites
    if (next > 0) next = next * 0.25;
    if (next < maxNeg) next = maxNeg + (next - maxNeg) * 0.25;
    setOffset(next);
  };

  const onPointerUp = () => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    setIsDragging(false);
    setOffset((prev) => Math.max(maxNeg, Math.min(0, prev)));
  };

  // Wheel horizontal scroll → drag offset
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    e.preventDefault();
    setOffset((prev) => {
      const next = prev - e.deltaX;
      return Math.max(maxNeg, Math.min(0, next));
    });
  };

  const handleSelect = (item) => {
    // Si veníamos arrastrando, no abrir modal
    if (dragRef.current.moved > 6) return;
    onSelect(item);
  };

  return (
    <div
      ref={wrapRef}
      className={`g-bento-wrap ${isDragging ? "dragging" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      <div
        ref={trackRef}
        className="g-bento-track"
        style={{ transform: `translate3d(${offset}px, 0, 0)` }}
      >
        <div ref={gridRef} className="g-bento-grid">
          {items.map((it, i) => (
            <BentoItem key={it.id} item={it} index={i} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===========================================================
   Modal
   =========================================================== */

function ImageModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="g-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="g-modal-card" onClick={(e) => e.stopPropagation()}>
        {item.url ? (
          <img className="g-modal-img" src={item.url} alt={item.title} />
        ) : (
          <div className="g-modal-placeholder">
            Foto {item.tag} — pronto
          </div>
        )}
        <div className="g-modal-info">
          <span>{item.tag} · {item.title}</span>
          <span style={{ opacity: 0.65 }}>{item.desc}</span>
        </div>
      </div>
      <button className="g-modal-close" onClick={onClose} aria-label="Cerrar">
        <CloseIcon size={18} />
      </button>
    </div>
  );
}

/* ===========================================================
   App
   =========================================================== */

function GalleryApp() {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", "#ff2d2d");
    document.body.dataset.invert = "1";
    document.body.dataset.shader = "1";
  }, []);

  return (
    <>
      <style>{G_CSS}</style>

      <ShaderBackground
        lineColor="#ff2d2d"
        bgColorA="#08000f"
        bgColorB="#1a0524"
        intensity={0.7}
      />
      <div className="g-vignette" />
      <div className="g-scanlines" />

      <GTopbar />

      <main style={{
        position: "relative", zIndex: 5,
        minHeight: "100vh",
        padding: "120px 32px 80px",
        display: "flex", flexDirection: "column",
        maxWidth: 1440, margin: "0 auto", width: "100%",
        color: "#f1ede6",
      }}>
        {/* Encabezado editorial */}
        <div className="g-rise d1" style={{
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
              animation: "g-pulse 1.6s ease-in-out infinite",
              boxShadow: "0 0 12px var(--accent)",
            }} />
            Archivo visual · 2026
          </span>
          <span>↳ N°04 — Galería</span>
          <span>Side · B</span>
        </div>

        {/* Headline */}
        <h1 className="g-rise d2" style={{
          fontFamily: "var(--display)",
          fontSize: "clamp(48px, 10vw, 160px)",
          letterSpacing: "-0.04em",
          lineHeight: 0.85,
          textTransform: "uppercase",
          textShadow: "0 2px 24px rgba(0,0,0,0.45)",
        }}>
          Galería
          <span style={{ color: "var(--accent)" }}>.</span>
        </h1>

        {/* Bajada */}
        <p className="g-rise d3" style={{
          marginTop: 28,
          maxWidth: 620,
          fontSize: 18, lineHeight: 1.45,
          color: "#d8d4cd",
          textWrap: "pretty",
        }}>
          Fotos de ensayo, backstage, recortes de prensa y todo lo que pasa
          alrededor del escenario. Arrastrá lateralmente para explorar y tocá
          una imagen para verla en grande.
        </p>

        {/* Bento gallery */}
        <section className="g-rise d4" style={{ marginTop: 56 }}>
          <BentoGallery items={GALLERY_ITEMS} onSelect={setSelected} />
          <div className="g-bento-hint">
            <span className="dash" />
            <span>← Arrastrar / Drag · Click para abrir</span>
            <span className="dash" />
          </div>
        </section>

        {/* Pie */}
        <div className="g-rise d4" style={{
          marginTop: 80,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 16, flexWrap: "wrap",
          paddingTop: 24,
          borderTop: "1px solid rgba(241,237,230,0.55)",
          fontFamily: "var(--mono)", fontSize: 11,
          letterSpacing: "0.14em", textTransform: "uppercase",
          opacity: 0.85,
        }}>
          <span>FZ — Galería · 0001</span>
          <a href="index.html" className="g-cta">
            <span>← Volver al inicio</span>
            <span className="arrow">→</span>
          </a>
        </div>
      </main>

      {selected && (
        <ImageModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<GalleryApp />);
