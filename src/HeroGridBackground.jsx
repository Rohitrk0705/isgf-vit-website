import { useEffect, useRef } from "react";

/* ── HeroGridBackground — cinematic "Enter the Grid" canvas ───────────────────
   Self-contained HTML5 canvas (no dependencies). Renders, back-to-front:
     1. Pure black → deep navy (--ink) vertical fade.
     2. Dozens of thin vertical light beams (mostly cyan, some green, rare
        amber) with soft glow + travelling data packets that stream downward,
        staggered, seamless-looping, brightest where they meet the floor.
     3. A reflective perspective floor grid in the bottom third receding to a
        centre horizon (Tron avenue), glowing cyan, with flicker, scanline
        jitter and a slow ripple so it reads as signal-disturbed.
     4. Strong bloom concentrated at bottom-centre where beams land.
   Fills its parent (object-fit:cover behaviour), DPR-scaled, resize-aware, and
   honours prefers-reduced-motion by painting a single static frame.
   ──────────────────────────────────────────────────────────────────────────── */

const hexToRgb = (hex) => {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h || "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgba = (rgb, a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
const lighten = (rgb, amt) => rgb.map((c) => Math.round(c + (255 - c) * amt));

export default function HeroGridBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // palette from the site's CSS variables (with safe fallbacks)
    const css = getComputedStyle(document.documentElement);
    const ink = (css.getPropertyValue("--ink") || "#040A16").trim() || "#040A16";
    const cyan = hexToRgb(css.getPropertyValue("--cyan") || "#38BDF8");
    const green = hexToRgb(css.getPropertyValue("--green") || "#27D17C");
    const amber = [255, 178, 62];

    let W = 0, H = 0, dpr = 1, raf = 0, beams = [];

    const pickColor = () => {
      const r = Math.random();
      if (r < 0.78) return cyan;
      if (r < 0.95) return green;
      return amber;
    };

    const buildBeams = () => {
      const count = Math.max(30, Math.min(64, Math.round(W / 26)));
      beams = Array.from({ length: count }, (_, i) => {
        const rgb = pickColor();
        return {
          x: (i + 0.5) / count + (Math.random() - 0.5) * (0.6 / count),
          w: 0.6 + Math.random() * 1.4,
          rgb,
          head: lighten(rgb, 0.45),
          baseAlpha: 0.04 + Math.random() * 0.08,
          speed: 0.05 + Math.random() * 0.13,           // cycles / second
          tailFrac: 0.16 + Math.random() * 0.26,
          packets: Array.from({ length: 2 + (Math.random() < 0.5 ? 1 : 0) },
            () => Math.random()),                        // phase offsets 0..1
          glitchUntil: 0,
          nextGlitch: Math.random() * 6,
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildBeams();
    };

    const drawBackground = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#000000");
      g.addColorStop(0.55, "#01060f");
      g.addColorStop(1, ink);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    const drawBeams = (t) => {
      ctx.lineCap = "round";
      for (const b of beams) {
        const x = b.x * W;

        // faint full-height "wire", brighter toward the floor
        const wire = ctx.createLinearGradient(0, 0, 0, H);
        wire.addColorStop(0, rgba(b.rgb, 0));
        wire.addColorStop(0.5, rgba(b.rgb, b.baseAlpha * 0.5));
        wire.addColorStop(1, rgba(b.rgb, b.baseAlpha * 1.5));
        ctx.strokeStyle = wire;
        ctx.lineWidth = b.w;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();

        // occasional pulse/glitch
        if (!reduce && t > b.nextGlitch) {
          b.glitchUntil = t + 0.12 + Math.random() * 0.18;
          b.nextGlitch = t + 3 + Math.random() * 7;
        }
        const flick = t < b.glitchUntil ? (Math.random() < 0.5 ? 0.25 : 1.7) : 1;

        // travelling data packets streaming downward, looping seamlessly
        const tailLen = b.tailFrac * H;
        for (const phase of b.packets) {
          const cyc = (t * b.speed + phase) % 1;
          const headY = cyc * H;
          const bottomBoost = 0.32 + 0.68 * (headY / H);   // brightest near floor
          const a = Math.min(1, 0.55 * bottomBoost * flick);

          // soft glow tail
          const gg = ctx.createLinearGradient(x, headY - tailLen, x, headY);
          gg.addColorStop(0, rgba(b.rgb, 0));
          gg.addColorStop(1, rgba(b.rgb, a * 0.5));
          ctx.strokeStyle = gg;
          ctx.lineWidth = b.w * 4;
          ctx.beginPath();
          ctx.moveTo(x, headY - tailLen);
          ctx.lineTo(x, headY);
          ctx.stroke();

          // bright core tail
          const cg = ctx.createLinearGradient(x, headY - tailLen * 0.6, x, headY);
          cg.addColorStop(0, rgba(b.head, 0));
          cg.addColorStop(1, rgba(b.head, a));
          ctx.strokeStyle = cg;
          ctx.lineWidth = b.w;
          ctx.beginPath();
          ctx.moveTo(x, headY - tailLen * 0.6);
          ctx.lineTo(x, headY);
          ctx.stroke();

          // glowing head
          const r = b.w * 3.5;
          const hg = ctx.createRadialGradient(x, headY, 0, x, headY, r);
          hg.addColorStop(0, rgba(lighten(b.rgb, 0.7), a));
          hg.addColorStop(1, rgba(b.rgb, 0));
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(x, headY, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawFloor = (t) => {
      const horizonY = H * 0.6;
      const floorH = H - horizonY;
      const vpX = W / 2;

      // receding horizontal lines (perspective + ripple + flicker + jitter)
      const rows = 18;
      for (let i = 1; i <= rows; i++) {
        const f = i / rows;
        const ripple = Math.sin(t * 1.1 + i * 0.55) * (1.5 + f * 6);
        const y = horizonY + floorH * Math.pow(f, 1.9) + ripple;
        const jitter = Math.random() < 0.05 ? (Math.random() - 0.5) * 6 : 0;
        const a = (0.05 + 0.24 * f) * (0.72 + 0.28 * Math.sin(t * 7 + i));
        ctx.strokeStyle = rgba(cyan, a);
        ctx.lineWidth = 0.5 + f * 1.3;
        ctx.beginPath();
        ctx.moveTo(0, y + jitter);
        ctx.lineTo(W, y + jitter);
        ctx.stroke();
      }

      // converging vertical lines fanning out from the centre horizon
      const cols = 18;
      for (let i = -cols; i <= cols; i++) {
        const xb = vpX + (i / cols) * (W * 0.95);
        const edge = 1 - Math.abs(i) / cols;
        const a = (0.04 + 0.13 * edge) * (0.72 + 0.28 * Math.sin(t * 5 + i));
        ctx.strokeStyle = rgba(cyan, a);
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(xb, H);
        ctx.stroke();
      }

      // glowing horizon line
      const hl = ctx.createLinearGradient(0, horizonY, W, horizonY);
      hl.addColorStop(0, rgba(cyan, 0));
      hl.addColorStop(0.5, rgba(lighten(cyan, 0.5), 0.5));
      hl.addColorStop(1, rgba(cyan, 0));
      ctx.strokeStyle = hl;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(W, horizonY);
      ctx.stroke();
    };

    const drawBloom = (t) => {
      const cx = W / 2;
      const cy = H * 0.93;
      const pulse = 0.85 + 0.15 * Math.sin(t * 2.2);
      const R = Math.min(W, H) * 0.55 * pulse;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, rgba(cyan, 0.45 * pulse));
      g.addColorStop(0.25, rgba(green, 0.16 * pulse));
      g.addColorStop(0.6, rgba(cyan, 0.05));
      g.addColorStop(1, rgba(cyan, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // tight white-hot core
      const cr = Math.min(W, H) * 0.13 * pulse;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      core.addColorStop(0, "rgba(224,250,255,0.5)");
      core.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, W, H);
    };

    const render = (t) => {
      drawBackground();
      ctx.globalCompositeOperation = "lighter";
      drawBeams(t);
      drawFloor(t);
      drawBloom(t);
      ctx.globalCompositeOperation = "source-over";
    };

    resize();

    if (reduce) {
      render(2.4); // single representative static frame
    } else {
      const start = performance.now();
      const loop = (now) => {
        render((now - start) / 1000);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) render(2.4);
    });
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-grid-canvas" aria-hidden="true" />;
}
