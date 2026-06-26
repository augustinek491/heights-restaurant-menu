// Skyline silhouette SVGs, ported verbatim (path data) from site/index.html
// (cover hero) and site/js/menu.js's DIVIDER_SVG (section divider reprise).

export function CoverSkyline() {
  return (
    <svg
      className="skyline"
      viewBox="0 0 600 160"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <path
        className="skyline-path"
        d="M0,150 L40,150 L40,120 L60,120 L60,150 L95,150 L95,100 L110,90 L125,100 L125,150 L160,150 L160,70 L172,70 L172,40 L184,40 L184,70 L196,70 L196,150 L240,150 L240,110 L260,90 L280,110 L280,150 L320,150 L320,60 L335,55 L350,60 L350,150 L395,150 L395,95 L410,80 L425,95 L425,150 L470,150 L470,30 L482,30 L482,150 L520,150 L520,115 L540,100 L560,115 L560,150 L600,150"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
      <line
        className="skyline-glass"
        x1={482}
        y1={30}
        x2={482}
        y2={150}
        stroke="currentColor"
        strokeWidth={3}
      />
    </svg>
  );
}

export function SectionDivider() {
  return (
    <div className="section-divider">
      <svg viewBox="0 0 140 28" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <path
          d="M0,26 L10,26 L10,18 L16,18 L16,26 L26,26 L26,12 L31,9 L36,12 L36,26 L48,26 L48,6 L51,6 L51,26 L62,26 L62,16 L68,11 L74,16 L74,26 L88,26 L88,3 L92,3 L92,26 L104,26 L104,18 L110,14 L116,18 L116,26 L140,26"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}
