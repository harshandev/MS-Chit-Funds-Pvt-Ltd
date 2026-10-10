"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Info, Pause, Play } from "lucide-react";
import { computeBreakdown } from "@/lib/chit";
import { formatBps, formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useRef } from "react";
import { ILLUSTRATIVE_DISCOUNT_BPS, showcaseScheme } from "../constants";
import { Money } from "./Money";
import { RangeSlider } from "./RangeSlider";

type NodeId = "pot" | "net" | "discount" | "commission" | "pool" | "back";
const stepOrder: { title: string; node: NodeId }[] = [
  { title: "The pot", node: "pot" },
  { title: "The discount", node: "discount" },
  { title: "The commission", node: "commission" },
  { title: "The dividend", node: "pool" },
  { title: "The payout", node: "net" },
];

const VB_W = 1000, VB_H = 410, NW = 16, SCALE_H = 250, TOP = 52;

function ribbon(x0: number, y0: number, h0: number, x1: number, y1: number, h1: number) {
  const xm = (x0 + x1) / 2;
  return `M${x0},${y0} C${xm},${y0} ${xm},${y1} ${x1},${y1} L${x1},${y1 + h1} C${xm},${y1 + h1} ${xm},${y0 + h0} ${x0},${y0 + h0} Z`;
}

/** "Follow the money" for one illustrative month: interactive sankey + stepper. */
export function TransparencyFlow() {
  const r = showcaseScheme.rules;
  const reduce = useReducedMotion();
  const [bps, setBps] = useState(ILLUSTRATIVE_DISCOUNT_BPS);
  const [active, setActive] = useState<NodeId>("pot");
  const [paused, setPaused] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "-20% 0px" });
  const b = useMemo(() => computeBreakdown(r, bps), [r, bps]);
  const playing = inView && !paused && !reduce;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setActive((a) => { const i = stepOrder.findIndex((s) => s.node === a || (a === "back" && s.node === "pool")); return stepOrder[(i + 1) % stepOrder.length].node; }), 3600);
    return () => clearInterval(id);
  }, [playing]);

  const stepIdx = Math.max(0, stepOrder.findIndex((s) => s.node === active || (active === "back" && s.node === "pool")));
  const go = (d: number) => { setPaused(true); setActive(stepOrder[(stepIdx + d + stepOrder.length) % stepOrder.length].node); };

  const comm = Math.min(b.commission, b.discount);
  const g = b.gross || 1;
  const k = SCALE_H / g;
  const hNet = b.netChit * k, hDisc = b.discount * k, hComm = comm * k, hPool = b.distributable * k;
  const gap = 18;
  const cols = [0, 270, 540, 790];
  const nodes: Record<NodeId, { x: number; y: number; h: number; color: string; label: string }> = {
    pot: { x: cols[0], y: TOP, h: SCALE_H, color: "var(--emerald)", label: "Monthly pot" },
    net: { x: cols[1], y: TOP, h: hNet, color: "var(--emerald-700)", label: "Net chit to winner" },
    discount: { x: cols[1], y: TOP + hNet + gap, h: hDisc, color: "var(--gold-antique)", label: "Auction discount" },
    commission: { x: cols[2], y: TOP + hNet + gap, h: hComm, color: "var(--gold)", label: "Commission" },
    pool: { x: cols[2], y: TOP + hNet + gap + hComm + (hComm > 0 && hPool > 0 ? 38 : 0), h: hPool, color: "var(--navy)", label: "Dividend pool" },
    back: { x: cols[3], y: TOP + hNet + gap + hComm + (hComm > 0 && hPool > 0 ? 38 : 0), h: hPool, color: "var(--navy)", label: "Back to members" },
  };
  const links: { from: NodeId; to: NodeId; fy?: number; fh: number; ty?: number; color: string }[] = [
    { from: "pot", to: "net", fy: 0, fh: hNet, color: "var(--emerald)" },
    { from: "pot", to: "discount", fy: hNet, fh: hDisc, color: "var(--gold)" },
    { from: "discount", to: "commission", fy: 0, fh: hComm, color: "var(--gold)" },
    { from: "discount", to: "pool", fy: hComm, fh: hPool, color: "var(--navy)" },
    { from: "pool", to: "back", fy: 0, fh: hPool, color: "var(--navy)" },
  ];
  const touches = (l: { from: NodeId; to: NodeId }) => l.from === active || l.to === active;

  const info: Record<NodeId, { title: string; paise: number; formula: string; note: string }> = {
    pot: { title: "Monthly pot (gross chit)", paise: b.gross, formula: `${r.tickets} tickets × ${formatINR(r.instalment)} = ${formatINR(b.gross)}`, note: "Every ticket pays its instalment; together they make the pot for the month." },
    discount: { title: "Auction discount", paise: b.discount, formula: `${formatINR(b.gross)} × ${formatBps(bps)} = ${formatINR(b.discount)}`, note: "What the winning bidder agrees to give up. Here a sample percentage — not a real auction result." },
    net: { title: "Paid to the winning ticket", paise: b.netChit, formula: `${formatINR(b.gross)} − ${formatINR(b.discount)} = ${formatINR(b.netChit)}`, note: "The net chit amount, subject to the payout conditions in the approved agreement." },
    commission: { title: "Foreman commission", paise: b.commission, formula: `${formatINR(b.gross)} × ${formatBps(r.commissionBps)} = ${formatINR(b.commission)}`, note: "Configured per scheme and taken from the discount. Sample value shown." },
    pool: { title: "Dividend pool", paise: b.distributable, formula: `${formatINR(b.discount)} − ${formatINR(b.commission)} = ${formatINR(b.distributable)}`, note: b.distributable === 0 ? "At this discount the commission uses up the whole discount, so nothing is left to distribute." : "Discount minus commission: the part shared back with members." },
    back: { title: "Back to members as dividend", paise: b.dividendPerTicket, formula: `${formatINR(b.distributable)} ÷ ${r.tickets} tickets = ${formatINR(b.dividendPerTicket)} each (rounded down)`, note: `Per ticket. A non-winning ticket then pays ${formatINR(b.payableNonWinner)} (instalment minus dividend).` },
  };
  const cur = info[active];

  return (
    <div ref={box} className="rounded-3xl bg-white p-4 shadow-[var(--shadow-3)] ring-1 ring-line/70 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-antique">Follow the money · one illustrative month</p>
          <p className="mt-1 text-sm text-muted">Sample {formatINR(r.grossChit)} scheme, {r.tickets} tickets. Select any block, or step through.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous step" className="grid h-10 w-10 place-items-center rounded-full border border-line text-emerald transition hover:border-gold-antique active:scale-90"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => setPaused((p) => !p)} aria-label={playing ? "Pause automatic stepping" : "Play automatic stepping"} aria-pressed={playing} className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald px-4 text-sm font-bold text-ivory transition hover:bg-emerald-700 active:scale-95">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? "Pause" : "Play"}</button>
          <button type="button" onClick={() => go(1)} aria-label="Next step" className="grid h-10 w-10 place-items-center rounded-full border border-line text-emerald transition hover:border-gold-antique active:scale-90"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Steps">
        {stepOrder.map((s, i) => (
          <li key={s.title}>
            <button type="button" onClick={() => { setPaused(true); setActive(s.node); }} aria-current={i === stepIdx ? "step" : undefined} className="group block w-full text-left">
              <span className="block h-1.5 overflow-hidden rounded-full bg-line"><motion.span initial={false} animate={{ scaleX: i <= stepIdx ? 1 : 0 }} transition={{ duration: 0.4 }} className="block h-full origin-left rounded-full bg-gold" /></span>
              <span className={cn("mt-1.5 block text-[11px] font-bold uppercase tracking-wide transition-colors sm:text-xs", i === stepIdx ? "text-emerald" : "text-muted group-hover:text-ink")}><span className="font-serif italic text-gold-antique">{i + 1}</span><span className="hidden sm:inline"> · {s.title}</span></span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-5 overflow-x-auto rounded-2xl bg-ivory p-2 [scrollbar-width:thin]">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-auto w-full min-w-[640px]" role="group" aria-label="Sankey-style flow of one chit month. Each block is selectable.">
          {links.map((l) => {
            const a = nodes[l.from], t = nodes[l.to];
            if (l.fh <= 0.5) return null;
            const hot = touches(l);
            return <motion.path key={`${l.from}-${l.to}`} initial={false} animate={{ d: ribbon(a.x + NW, a.y + (l.fy ?? 0), l.fh, t.x, t.y, l.fh), opacity: hot ? 0.55 : 0.2 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }} fill={l.color} />;
          })}
          {(Object.keys(nodes) as NodeId[]).map((id) => {
            const n = nodes[id];
            const on = id === active;
            const above = id === "pot";
            const below = id === "discount" || id === "pool";
            const off = id === "pool" ? 24 : 54;
            const ox = above || below ? n.x : n.x + NW + 10;
            const half = Math.max(n.h, 2) / 2;
            const y1 = above ? -half - 24 : below ? half + off : -4;
            const y2 = above ? -half - 7 : below ? half + off + 17 : 15;
            const show = n.h > 0.5;
            if (!show) return null;
            return (
              <g key={id} role="button" tabIndex={0} aria-pressed={on} aria-label={`${info[id].title}: ${formatINR(info[id].paise)}`} className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[3px]" onClick={() => { setPaused(true); setActive(id); }} onMouseEnter={() => { setPaused(true); setActive(id); }} onFocus={() => setActive(id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPaused(true); setActive(id); } }}>
                <motion.g initial={false} animate={{ y: n.y }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}>
                  <motion.rect initial={false} animate={{ height: Math.max(n.h, 2) }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }} x={n.x} y={0} width={NW} rx={4} fill={n.color} stroke={on ? "var(--gold)" : "transparent"} strokeWidth={on ? 3 : 0} />
                  <motion.g initial={false} animate={{ y: Math.max(n.h, 2) / 2 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}>
                    <text x={ox} textAnchor="start" y={y1} className="fill-ink" style={{ fontSize: 15, fontWeight: on ? 800 : 600 }}>{n.label}</text>
                    <text x={ox} textAnchor="start" y={y2} className="fill-muted" style={{ fontSize: 14 }}>{formatINR(info[id].paise)}</text>
                  </motion.g>
                  <rect x={n.x - 4} y={-4} width={NW + 8} height={Math.max(n.h, 2) + 8} fill="transparent" />
                </motion.g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div aria-live="polite" className="min-h-[9.5rem] rounded-2xl border border-gold/40 bg-gold/10 p-5">
          <AnimatePresence mode="wait">
            <motion.div key={active + bps} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <p className="text-xs font-bold uppercase tracking-wider text-gold-antique">How this number is calculated</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3 text-xl font-extrabold text-emerald"><span>{cur.title}</span><Money paise={cur.paise} className="font-serif text-3xl font-normal text-emerald" /></p>
              <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-sm font-semibold tabular-nums text-ink">{cur.formula}</p>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted"><Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-antique" aria-hidden />{cur.note}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="rounded-2xl border border-line p-5">
          <RangeSlider label="Sample discount" value={bps} min={0} max={r.maxDiscountBps} step={50} onChange={(v) => { setPaused(true); setBps(v); }} display={formatBps(bps)} tone="gold" hint="Drag to see the flow re-balance. Sample only." />
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">Illustrative demo figures from a sample scheme — not a real auction, quote or promise of any outcome.</p>
    </div>
  );
}
