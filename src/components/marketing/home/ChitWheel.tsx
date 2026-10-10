/** Decorative 'chit wheel': a ring of ticket dots. Pure SVG, server-renderable; rotation is applied by the parent. */
const r2 = (n: number) => Math.round(n * 100) / 100;
export function ChitWheel({ className }: { className?: string }) {
  const dots = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    return { x: r2(300 + Math.cos(a) * 262), y: r2(300 + Math.sin(a) * 262), big: i % 6 === 0, i };
  });
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const r1 = 222, rr2 = i % 6 === 0 ? 208 : 215;
    return { x1: r2(300 + Math.cos(a) * r1), y1: r2(300 + Math.sin(a) * r1), x2: r2(300 + Math.cos(a) * rr2), y2: r2(300 + Math.sin(a) * rr2) };
  });
  return (
    <svg viewBox="0 0 600 600" aria-hidden className={className} style={{ width: "100%", height: "auto", color: "var(--gold)" }}>
      <g fill="none" stroke="currentColor">
        <circle cx="300" cy="300" r="286" strokeWidth="1" opacity="0.5" />
        <circle cx="300" cy="300" r="240" strokeWidth="1.5" strokeDasharray="2 9" opacity="0.7" />
        <circle cx="300" cy="300" r="180" strokeWidth="1" opacity="0.4" />
        <circle cx="300" cy="300" r="120" strokeWidth="1" strokeDasharray="1 6" opacity="0.5" />
        <circle cx="300" cy="300" r="62" strokeWidth="2" opacity="0.5" />
        {ticks.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth="1" opacity="0.45" />)}
      </g>
      {dots.map((d) => (
        <circle key={d.i} cx={d.x} cy={d.y} r={d.big ? 7 : 3.5} fill="currentColor" opacity={d.big ? 0.95 : 0.55} />
      ))}
      <g fill="none" stroke="currentColor" opacity="0.3"><path d="M300 14 V586 M14 300 H586" strokeWidth="0.6" /></g>
      <circle cx="300" cy="300" r="6" fill="currentColor" />
    </svg>
  );
}
