import { useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { gsap } from "gsap";

/* ── Loader — smart-grid boot-up sequence ────────────────────────────────────
   Full-screen overlay on first mount: a segmented progress ring (green→cyan→
   violet sweep) with a live percentage core, over the hero's navy radial glow.
   GSAP drives the master timeline (counter, ring fill, exit); anime.js v4 drives
   ambient micro-motion (tick stagger-in + shimmer, numeral glow pulse).
   Honours prefers-reduced-motion. Calls onDone() after the fade-out so the
   parent can unmount.
   ──────────────────────────────────────────────────────────────────────────── */

const SEG = 48;                     // ring tick segments
const CX = 120, CY = 120;           // svg centre
const R_IN = 86, R_OUT = 104;       // tick inner/outer radius

// green→cyan→violet, matching the .grad-text feel
const STOPS = [
  [39, 209, 124],   // #27D17C green
  [56, 189, 248],   // #38BDF8 cyan
  [124, 131, 255],  // #7C83FF violet
];
const tickColor = (t) => {
  const seg = t < 0.5 ? 0 : 1;
  const f = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const a = STOPS[seg], b = STOPS[seg + 1];
  const m = a.map((c, i) => Math.round(c + (b[i] - c) * f));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
};

export default function Loader({ onDone }) {
  const rootRef = useRef(null);
  const [pct, setPct] = useState(0);

  const ticks = useMemo(
    () =>
      Array.from({ length: SEG }, (_, i) => {
        const ang = (i / SEG) * Math.PI * 2 - Math.PI / 2;
        const cos = Math.cos(ang), sin = Math.sin(ang);
        return {
          x1: CX + R_IN * cos, y1: CY + R_IN * sin,
          x2: CX + R_OUT * cos, y2: CY + R_OUT * sin,
          color: tickColor(i / (SEG - 1)),
        };
      }),
    []
  );

  const filledCount = Math.round((pct / 100) * SEG);

  // ── Master timeline: counter / ring fill / exit (GSAP) ──────────────────────
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const exit = () =>
      gsap.to(rootRef.current, {
        autoAlpha: 0,
        scale: 1.04,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => onDone && onDone(),
      });

    if (reduce) {
      setPct(100);
      const id = setTimeout(exit, 900);
      return () => clearTimeout(id);
    }

    const counter = { v: 0 };
    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(counter, {
      v: 100,
      duration: 2.2,
      ease: "power1.inOut",
      onUpdate: () => setPct(Math.round(counter.v)),
    });
    tl.to({}, { duration: 0.4 });   // brief hold at 100%
    tl.add(exit);

    return () => tl.kill();
  }, [onDone]);

  // ── Ambient micro-motion (anime.js v4) ─────────────────────────────────────
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const anims = [
      animate(".gl-tick", { opacity: [0, 1], delay: stagger(12), duration: 500, ease: "outQuad" }),
      animate(".gl-rotor", { opacity: [0.86, 1], duration: 1600, loop: true, alternate: true, ease: "inOutSine" }),
      animate(".gl-pct-num", { scale: [1, 1.035, 1], duration: 2200, loop: true, ease: "inOutSine" }),
    ];
    return () => anims.forEach((a) => a && a.pause && a.pause());
  }, []);

  return (
    <div ref={rootRef} className="grid-loader" role="status" aria-live="polite" aria-label={`Loading, ${pct} percent`}>
      <div className="gl-center">
        <span className="gl-badge">Powered by the India Smart Grid Forum · VIT Vellore</span>

        <div className="gl-ring-wrap" aria-hidden="true">
          <svg viewBox="0 0 240 240" className="gl-ring">
            <g className="gl-rotor">
              {ticks.map((t, i) => {
                const on = i < filledCount;
                return (
                  <line
                    key={i}
                    className={`gl-tick ${on ? "is-filled" : ""}`}
                    x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                    stroke={on ? "currentColor" : "rgba(124,131,255,.18)"}
                    strokeWidth="3" strokeLinecap="round"
                    style={on ? { color: t.color } : undefined}
                  />
                );
              })}
            </g>
          </svg>
          <div className="gl-pct">
            <span className="gl-pct-grp">
              <span className="gl-pct-num">{pct}</span>
              <span className="gl-pct-sign">%</span>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .grid-loader{
          --gl-navy:#070B1E; --gl-green:#27D17C; --gl-cyan:#38BDF8; --gl-violet:#7C83FF;
          --gl-text:#EAEDFF; --gl-muted:#8A92C4;
          position:fixed; inset:0; z-index:9999;
          display:grid; place-items:center;
          background:radial-gradient(120% 90% at 50% -10%, #141d52 0%, var(--gl-navy) 60%);
          color:var(--gl-text); overflow:hidden;
        }
        .gl-center{
          display:flex; flex-direction:column; align-items:center;
          gap:30px; width:min(460px, 88vw); padding:24px; text-align:center;
        }
        .gl-badge{
          font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.12em;
          color:var(--gl-cyan); border:1px solid rgba(56,189,248,.24);
          background:rgba(56,189,248,.06); padding:7px 14px; border-radius:100px;
          box-shadow:0 0 22px -6px rgba(56,189,248,.5);
        }
        .gl-ring-wrap{position:relative; width:min(240px,64vw); aspect-ratio:1;}
        .gl-ring{width:100%; height:100%; display:block;}
        .gl-tick.is-filled{filter:drop-shadow(0 0 3px currentColor);}
        .gl-pct{
          position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
          font-family:'Chakra Petch',sans-serif; font-weight:700; line-height:1;
        }
        .gl-pct-grp{display:inline-flex; align-items:baseline;}
        .gl-pct-num,.gl-pct-sign{
          background:linear-gradient(105deg, var(--gl-green), var(--gl-cyan) 55%, var(--gl-violet));
          -webkit-background-clip:text; background-clip:text; color:transparent;
          filter:drop-shadow(0 0 18px rgba(56,189,248,.35));
        }
        .gl-pct-num{font-size:clamp(40px,11vw,58px); letter-spacing:-.02em;}
        .gl-pct-sign{font-size:clamp(18px,4vw,24px); margin-left:3px; opacity:.85;}
      `}</style>
    </div>
  );
}
