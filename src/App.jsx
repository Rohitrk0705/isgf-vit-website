import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { stagger, utils, createTimeline } from "animejs";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
import {
  Zap, Network, Wifi, CircuitBoard, SlidersHorizontal, Sparkles,
  Menu, X, Mail, ArrowRight, ArrowUpRight, Check,
  Trophy, Rocket, Users, ChevronDown, ChevronLeft, ChevronRight, Target, Instagram,
} from "lucide-react";
import "./styles.css";
import HeroGridBackground from "./HeroGridBackground";
import Loader from "./components/Loader";

/* ────────────────────────────────────────────────────────────────────────
   ISGF — India Smart Grid Forum · VIT Vellore Student Chapter
   Interactive single-page React site. Default export <App/>.
   Drop a real group photo URL into TEAM_PHOTO_URL below.
   ──────────────────────────────────────────────────────────────────────── */

const TEAM_PHOTO_URL = ""; // ← paste your team photo URL here to replace the placeholder

const NAV = [
  { id: "about", label: "About" },
  { id: "events", label: "Events" },
  { id: "team", label: "Team" },
  { id: "sponsors", label: "Sponsors" },
  { id: "contact", label: "Contact" },
];

const DOMAINS = [
  { icon: Network, title: "Smart Grids & Energy Systems", desc: "Modern grids that sense, balance and self-heal — the backbone of sustainable power." },
  { icon: Wifi, title: "Internet of Things", desc: "Connecting sensors, devices and systems so the physical world speaks data." },
  { icon: CircuitBoard, title: "Embedded Systems", desc: "Designing on the metal — firmware and hardware that make smart things tick." },
  { icon: SlidersHorizontal, title: "Automation & Control", desc: "Closed-loop systems that monitor, decide and act without a hand on the dial." },
  { icon: Sparkles, title: "AI & Data-Driven Solutions", desc: "Turning raw signals into insight, prediction and intelligent action." },
];

const EVENTS = [
  {
    type: "image",
    image: "events/event1.jpeg",
    tag: "Interactive Industry Session",
    name: "Entrepreneurship Beyond Hype",
    motto: "Building Sustainable Ventures Beyond Trends",
    accent: "#7C83FF",
    desc: "An interactive industry session with Keerthana Vayyasi, CEO of Sail Analytics and VIT alumna, on building ventures that outlast the hype cycle. The conversation went deep on the rise of AI across the electrical engineering domain — where it's reshaping the field, and how students should actually approach learning and applying it. Beyond startup theory, attendees walked away with grounded insight on turning emerging tech into durable, real-world ventures.",
    chips: ["Entrepreneurship", "AI in Electrical", "Sustainable Ventures", "Industry Talk", "Alumna Speaker"],
  },
  {
    type: "image",
    image: "events/event2.jpeg",
    tag: "Industry Academia Conclave · IAC '26",
    name: "Industry Academia Conclave",
    motto: "Crafting The Future With Technology",
    accent: "#38BDF8",
    desc: "IAC '26, hosted by VIT's School of Electrical Engineering, brought students, researchers and industry leaders together to explore the future of electrical engineering. Across six technical tracks — AI & ML, E-Mobility & Smart Grid, Drone Tech, Healthcare, Industry 4.0 and Quantum Computing — the two-day conclave ran expert sessions, product showcases and panel discussions, powered by Bosch, British Council, Fluke and Edutech.",
    chips: ["AI & ML", "Smart Grid", "Quantum Computing", "Industry 4.0", "Expert Sessions"],
  },
  {
    type: "image",
    image: "events/event3.jpeg",
    tag: "Interactive Session",
    name: "Powering A Sustainable Future",
    motto: "The Energy Efficiency Perspective",
    accent: "#27D17C",
    desc: "An interactive guest lecture by Dr. Palanisamy K, Deputy Director of Electrical Maintenance & New Projects at VIT Vellore, on building a sustainable campus. The session introduced the core principles of sustainable campus development, with a focus on energy auditing, energy efficiency and smart resource management — connecting smart-grid thinking directly to how a real campus is powered and run.",
    chips: ["Energy Efficiency", "Energy Auditing", "Sustainable Campus", "Resource Management", "Guest Lecture"],
  },
  {
    type: "image",
    image: "events/event4.jpeg",
    tag: "Challenge Event",
    name: "Electro Escape Room",
    motto: "Decode · Solve · Escape",
    accent: "#22F58B",
    desc: "A fully online challenge event from ISGF VIT Vellore that turns electrical and logic puzzles into a race against the clock. Teams worked through Morse code, binary, QR hunts, circuit breaches and hidden clues — decoding, solving and escaping before time ran out. A fast, high-energy test of problem-solving, pattern recognition and engineering instinct, run entirely through an interactive online setup.",
    chips: ["Puzzles", "Morse & Binary", "Cryptography", "QR Hunt", "Online"],
  },
  {
    type: "icon",
    icon: Trophy,
    tag: "Electronics & IoT",
    name: "Hunt Verse",
    motto: "Explore · Innovate · Conquer",
    accent: "#27D17C",
    desc: "An immersive electronics and IoT competition that drops students into the world of connected systems through hands-on innovation and competitive gameplay. Teams explore wireless communication, embedded development and smart systems while solving challenges that reward creativity and engineering thinking.",
    chips: ["Electronics", "IoT", "Embedded", "Wireless", "Team-based"],
    upcoming: true,
  },
  {
    type: "icon",
    icon: Rocket,
    tag: "AI Hackathon · graVITas '26",
    name: "Operation: Doomsday",
    motto: "Assemble · Code · Defy Doom",
    accent: "#38BDF8",
    desc: "A one-day AI engineering hackathon set in a multiversal crisis. Participants combat an AI-powered threat across missions spanning competitive coding, AI literacy, deepfake detection, modern AI tooling and agentic AI — building solutions for real-world sustainability across smart grids, renewable energy, electric mobility and smart cities.",
    chips: ["AI / ML", "Agentic AI", "Deepfake Detection", "Sustainability", "Hackathon"],
    upcoming: true,
  },
];

const BENEFITS = [
  "Event partnership recognition + media coverage in the event recap",
  "Brand logo placement on the event website",
  "Brand logo on posters, certificates & event merchandise",
  "Social media promotions & campaign features",
  "Dedicated sponsor appreciation posts",
  "Brand mention during event announcements",
  "Sponsor booth / interactive stall at the venue",
  "Networking with student innovators",
  "Product demonstration opportunity",
  "Keynote / industry talk opportunity",
  "Brand presence on event stage screens",
  "Judge / panel member opportunity",
];

/* Hero hub-and-spoke: central ISGF substation → the 5 focus domains as load nodes */
const HUB = { x: 0.5, y: 0.45 };
const HUB_NODES = [
  { key: "grid", label: "Smart Grids", icon: Network, color: "#27D17C", x: 0.155, y: 0.24 },
  { key: "iot", label: "IoT", icon: Wifi, color: "#38BDF8", x: 0.845, y: 0.24 },
  { key: "embedded", label: "Embedded", icon: CircuitBoard, color: "#5EEAD4", x: 0.095, y: 0.66 },
  { key: "automation", label: "Automation", icon: SlidersHorizontal, color: "#38BDF8", x: 0.905, y: 0.66 },
  { key: "ai", label: "AI / Data", icon: Sparkles, color: "#27D17C", x: 0.5, y: 0.92 },
];

/* ── Custom cursor glow ─────────────────────────────────────────────────── */
function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch
    const el = ref.current;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      if (el) el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); };
  }, []);
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

/* ── Scroll progress bar ────────────────────────────────────────────────── */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return <div className="scroll-progress" style={{ width: `${p}%` }} aria-hidden="true" />;
}

/* ── Scroll reveal wrapper ──────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "", style = {} }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => { if (e.isIntersecting) { setShown(true); io.unobserve(el); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/* ── Hero intro — cinematic timeline on page load ───────────────────────────
   Badge drops in from above, title words stagger up, lede and CTA fade in,
   hub rises last. All driven by a single createTimeline sequence so each
   element starts at a precise absolute offset (ms from page load).
   ──────────────────────────────────────────────────────────────────────────── */
function HeroIntro({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const badge = el.querySelector(".hero-badge");
    const words = el.querySelectorAll(".hero-word");
    const lede  = el.querySelector(".hero-lede");
    const cta   = el.querySelector(".hero-cta");
    const hub   = el.querySelector(".hero-hub-wrap");

    utils.set(badge, { opacity: 0, translateY: -28 });
    utils.set(words, { opacity: 0, translateY: 60 });
    utils.set(lede,  { opacity: 0, translateY: 28 });
    utils.set(cta,   { opacity: 0, translateY: 26 });
    utils.set(hub,   { opacity: 0, translateY: 52, scale: 0.96 });

    const tl = createTimeline();
    tl
      .add(badge, { opacity: [0, 1], translateY: [-28, 0], duration: 640, ease: "out(4)" }, 0)
      .add(words, { opacity: [0, 1], translateY: [60, 0],  duration: 860, delay: stagger(115), ease: "out(4)" }, 180)
      .add(lede,  { opacity: [0, 1], translateY: [28, 0],  duration: 740, ease: "out(3)" }, 580)
      .add(cta,   { opacity: [0, 1], translateY: [26, 0],  duration: 720, ease: "out(3)" }, 760)
      .add(hub,   { opacity: [0, 1], translateY: [52, 0], scale: [0.96, 1], duration: 1020, ease: "out(3)" }, 940);
  }, []);

  return <div ref={ref} className="hero-inner">{children}</div>;
}

/* ── Staggered reveal — GSAP ScrollTrigger ──────────────────────────────────
   Renders a container and, the first time it scrolls into view, animates its
   direct children in with a rippling stagger driven by ScrollTrigger (so it
   stays in sync with Lenis smooth scroll). Keeps the original ms-based API
   (y/step/duration). Fully skipped for prefers-reduced-motion, where children
   are simply left visible. The gsap.context is reverted on unmount.
   ──────────────────────────────────────────────────────────────────────────── */
function AnimeStagger({ children, className = "", y = 26, step = 70, duration = 720, threshold = 0.15 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = Array.from(el.children);
    if (!targets.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: duration / 1000,
        ease: "power3.out",
        stagger: step / 1000,
        scrollTrigger: { trigger: el, start: `top ${100 - threshold * 100}%`, once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

/* ── Parallax — subtle scrubbed drift as the element passes through view ─────
   Wraps content and translates it on the Y axis as it scrolls through the
   viewport (scrubbed to scroll position) for layered depth. Skipped for
   prefers-reduced-motion.
   ──────────────────────────────────────────────────────────────────────────── */
function Parallax({ children, className = "", amount = 60, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { y: amount }, {
        y: -amount, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, [amount]);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}

/* ── Tilt + spotlight card (3D hover) ───────────────────────────────────── */
function TiltCard({ children, className = "", style = {}, max = 8 }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
  }, [max]);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);
  return (
    <article
      ref={ref}
      className={`card tilt ${className}`}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="tilt-spot" aria-hidden="true" />
      <div className="tilt-inner">{children}</div>
    </article>
  );
}

/* ── Magnetic button wrapper ────────────────────────────────────────────── */
function Magnetic({ children, strength = 0.32 }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0)";
  }, []);
  return (
    <span ref={ref} className="magnetic" onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  );
}

/* ── Hero hub-and-spoke graphic ──────────────────────────────────────────────
   A central ISGF "substation" wired by glowing conduits to the five focus
   domains. Light packets flow along the conduits (inbound + outbound); hovering
   a domain node super-charges its line. Canvas draws the conduits + current and
   the hub glow; the chip and domain cards are real DOM (crisp icons + a11y).
   ──────────────────────────────────────────────────────────────────────────── */
function HeroHub() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const hoverRef = useRef(-1);
  const [hover, setHover] = useState(-1);
  useEffect(() => { hoverRef.current = hover; }, [hover]);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, t0 = performance.now();
    let conduits = [];

    const rgba = (hex, a) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    };
    const bez = (p, t) => {
      const u = 1 - t;
      return {
        x: u * u * p.x0 + 2 * u * t * p.cx + t * t * p.x1,
        y: u * u * p.y0 + 2 * u * t * p.cy + t * t * p.y1,
      };
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth; h = wrap.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const hub = { x: HUB.x * w, y: HUB.y * h };
      conduits = HUB_NODES.map((n, i) => {
        const x1 = n.x * w, y1 = n.y * h;
        const mx = (hub.x + x1) / 2, my = (hub.y + y1) / 2;
        const dx = x1 - hub.x, dy = y1 - hub.y;
        const len = Math.hypot(dx, dy) || 1;
        const side = i % 2 ? 1 : -1;             // alternate the bow direction
        const bow = Math.min(60, len * 0.16) * side;
        return {
          x0: hub.x, y0: hub.y, x1, y1,
          cx: mx + (-dy / len) * bow, cy: my + (dx / len) * bow,
          color: n.color,
          pulses: Array.from({ length: 3 }, (_, k) => ({
            t: k / 3, speed: 0.0042 + Math.random() * 0.0026, dir: k % 2 ? 1 : -1,
          })),
        };
      });
    };

    const frame = (now) => {
      const tt = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      const hub = { x: HUB.x * w, y: HUB.y * h };
      const hot = hoverRef.current;

      // conduits (glassy tubes)
      for (let i = 0; i < conduits.length; i++) {
        const c = conduits[i];
        const isHot = hot === i;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(c.x0, c.y0); ctx.quadraticCurveTo(c.cx, c.cy, c.x1, c.y1);
        ctx.strokeStyle = rgba(c.color, isHot ? 0.14 : 0.07); ctx.lineWidth = 13; ctx.stroke();
        ctx.strokeStyle = rgba(c.color, isHot ? 0.30 : 0.16); ctx.lineWidth = 5; ctx.stroke();
        ctx.strokeStyle = rgba("#9DE7FF", isHot ? 0.5 : 0.16); ctx.lineWidth = 1.2; ctx.stroke();

        // flowing current
        for (const p of c.pulses) {
          if (!reduce) p.t += p.speed * (isHot ? 2.1 : 1) * p.dir;
          if (p.t > 1) p.t -= 1; if (p.t < 0) p.t += 1;
          const pt = bez(c, p.t);
          const R = isHot ? 9 : 6.5;
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, R);
          g.addColorStop(0, rgba(c.color, 0.95)); g.addColorStop(1, rgba(c.color, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pt.x, pt.y, R, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#EAFBFF"; ctx.beginPath(); ctx.arc(pt.x, pt.y, isHot ? 2 : 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // hub glow
      const pulse = reduce ? 0.6 : 0.5 + 0.18 * Math.sin(tt * 2);
      const hg = ctx.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, 120);
      hg.addColorStop(0, rgba("#27D17C", 0.28 * pulse));
      hg.addColorStop(0.5, rgba("#38BDF8", 0.10 * pulse));
      hg.addColorStop(1, rgba("#38BDF8", 0));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hub.x, hub.y, 120, 0, Math.PI * 2); ctx.fill();

      if (!reduce) raf = requestAnimationFrame(frame);
    };

    build();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="hub" ref={wrapRef}>
      <canvas ref={canvasRef} className="hub-canvas" aria-hidden="true" />
      <div className="hub-core" style={{ left: `${HUB.x * 100}%`, top: `${HUB.y * 100}%` }}>
        <span className="hub-ring" aria-hidden="true" />
        <span className="hub-ring hub-ring-2" aria-hidden="true" />
        <div className="hub-chip"><Zap size={30} strokeWidth={2.4} /></div>
        <span className="hub-core-tag">ISGF&nbsp;CORE</span>
      </div>
      {HUB_NODES.map((n, i) => {
        const Icon = n.icon;
        return (
          <div
            key={n.key}
            className={`hub-node ${hover === i ? "is-hot" : ""}`}
            style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%`, "--c": n.color }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(-1)}
          >
            <div className="hub-node-card"><Icon size={22} strokeWidth={1.9} /></div>
            <span className="hub-node-label">{n.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Wordmark ───────────────────────────────────────────────────────────── */
function Wordmark({ size = 26 }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      <span>IS</span>
      <Zap size={size * 0.82} strokeWidth={2.6} className="wm-bolt" />
      <span>F</span>
    </span>
  );
}

function Eyebrow({ children }) {
  return <div className="eyebrow"><span className="eyebrow-dot" />{children}</div>;
}

/* ── Navbar with active-section highlight ───────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) io.observe(el); });
    return () => { window.removeEventListener("scroll", on); io.disconnect(); };
  }, []);
  return (
    <header className={`nav ${scrolled ? "nav-solid" : ""}`}>
      <div className="nav-inner">
        <a href="#top" className="nav-brand" aria-label="ISGF VIT home">
          <Wordmark size={22} />
          <span className="nav-sub">VIT&nbsp;Vellore Chapter</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? "is-active" : ""}>{n.label}</a>
          ))}
          <Magnetic><a href="#contact" className="btn-primary btn-sm">Join us <ArrowRight size={15} /></a></Magnetic>
        </nav>
        <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="nav-mobile">
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>{n.label}</a>)}
          <a href="#contact" className="btn-primary" onClick={() => setOpen(false)}>Join us <ArrowRight size={16} /></a>
        </div>
      )}
    </header>
  );
}

/* ── Typewriter — a caret "reads through" the text, revealing it char by char ─
   The block caret sits at the leading edge while characters are typed out, then
   switches to a steady blink once the line finishes. Starts after `startDelay`
   so it can be synced to the hero intro timeline. Reduced-motion users get the
   full text immediately with no animation.
   ──────────────────────────────────────────────────────────────────────────── */
function Typewriter({ text, startDelay = 0, speed = 24 }) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [count, setCount] = useState(reduce ? text.length : 0);
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let tick;
    const start = setTimeout(() => {
      tick = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) {
          clearInterval(tick);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearInterval(tick);
    };
  }, [text, startDelay, speed, reduce]);

  return (
    <>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span
        className={`tw-caret${done ? " tw-caret--blink" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const scrub = { trigger: root, start: "top top", end: "bottom top", scrub: true };
      // whole hero content lifts and fades as you scroll past — parallax depth.
      // (Targets .hero-inner, which the anime.js intro never transforms, so the
      //  two animations never fight over the same element.)
      gsap.to(".hero-inner", { yPercent: -16, opacity: 0, ease: "none", scrollTrigger: scrub });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" className="hero" ref={ref}>
      <HeroGridBackground />
      <div className="hero-veil" />
      <HeroIntro>
        <div className="hero-badge">Powered by the India Smart Grid Forum · VIT Vellore</div>
        <h1 className="hero-title">
          <span className="hero-word">We</span>{" "}
          <span className="hero-word">build</span>{" "}
          <span className="hero-word">the</span>{" "}
          <span className="hero-word grad-text">grid&nbsp;that&nbsp;thinks.</span>
        </h1>
        <p
          className="hero-lede"
          aria-label="A student-led technical community turning ideas in smart energy, IoT, embedded systems and AI into things you can actually build, break and ship."
        >
          <Typewriter
            text="A student-led technical community turning ideas in smart energy, IoT, embedded systems and AI into things you can actually build, break and ship."
            startDelay={1300}
          />
        </p>
        <div className="hero-cta">
          <Magnetic><a href="#contact" className="btn-primary">Join the chapter <ArrowRight size={17} /></a></Magnetic>
          <Magnetic><a href="#events" className="btn-ghost">Explore events <ArrowUpRight size={16} /></a></Magnetic>
        </div>
        <div className="hero-hub-wrap"><HeroHub /></div>
      </HeroIntro>
      <a href="#about" className="scroll-cue" aria-label="Scroll to about">
        <ChevronDown size={20} />
      </a>
    </section>
  );
}

/* ── Marquee ────────────────────────────────────────────────────────────── */
function Marquee() {
  const items = ["Smart Grids", "Energy Systems", "Internet of Things", "Embedded", "Automation & Control", "Artificial Intelligence", "Sustainable Engineering"];
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i} className="marquee-item"><Zap size={13} className="mq-bolt" />{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ── About ──────────────────────────────────────────────────────────────── */
function About() {
  return (
    <section id="about" className="section">
      <div className="wrap">
        <Reveal><Eyebrow>Who we are</Eyebrow></Reveal>
        <div className="about-grid">
          <Reveal delay={60}>
            <h2 className="h2">
              Bridging the classroom and the real world of connected energy.
            </h2>
          </Reveal>
          <Reveal delay={120} className="about-body">
            <p>
              The ISGF Student Chapter at VIT Vellore is a student-led technical community under the
              India Smart Grid Forum, advancing smart energy, emerging technologies and sustainable
              engineering. We give students hands-on exposure to industry-relevant tech.
            </p>
            <p>
              Through workshops, innovation-driven projects and collaborative events, we empower
              students to design, build and experiment with the solutions of the future.
            </p>
          </Reveal>
        </div>

        <AnimeStagger className="domain-grid" step={80}>
          {DOMAINS.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.title} className="domain-cell">
                <TiltCard className="domain-card">
                  <div className="domain-ico"><Icon size={22} strokeWidth={1.9} /></div>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                </TiltCard>
              </div>
            );
          })}
        </AnimeStagger>
      </div>
    </section>
  );
}

/* ── Events — horizontal-scroll carousel ────────────────────────────────────
   Six uniform cards stream horizontally with scroll-snap. The card nearest the
   viewport centre is marked .is-active (sharp); neighbours peek in blurred and
   faded. Hovering the carousel reveals glowing prev/next arrows that scroll one
   card at a time (also keyboard-focusable). Tron border glow + reduced-motion
   handling live in CSS.
   ──────────────────────────────────────────────────────────────────────────── */
function Events() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const N = EVENTS.length;
  // Render three back-to-back copies of the set. We keep the viewport parked on
  // the middle copy, so every card — including the first and last — always has a
  // real neighbour peeking on BOTH sides (the last event sits left of the first).
  const loop = [...EVENTS, ...EVENTS, ...EVENTS];

  // Geometry of the middle copy: where its first card centres (Pn) and the pixel
  // width of one full copy (seg). Shifting scrollLeft by ±seg lands on identical
  // content, so the recentre is invisible — the trick behind the endless loop.
  const measure = () => {
    const track = trackRef.current;
    const cards = Array.from(track.querySelectorAll(".event-card"));
    const centerOf = (i) => cards[i].offsetLeft - (track.clientWidth - cards[i].offsetWidth) / 2;
    return { cards, centerOf, Pn: centerOf(N), seg: cards[2 * N].offsetLeft - cards[N].offsetLeft };
  };

  const nearest = (track, cards) => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = N, bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  };

  // Park on the middle copy before first paint so there's no visible jump.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = measure().Pn;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      const { cards, Pn, seg } = measure();
      if (!seg) return;
      // Seamlessly wrap back into the middle copy whenever we drift past an edge.
      if (track.scrollLeft >= Pn + seg) track.scrollLeft -= seg;
      else if (track.scrollLeft < Pn) track.scrollLeft += seg;
      setActive(nearest(track, cards) % N);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const { cards, centerOf } = measure();
    // A real neighbour always exists on both sides, so every step glides — no
    // jarring jump on wrap-around any more.
    const target = nearest(track, cards) + dir;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: centerOf(target), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section id="events" className="section section-grid">
      <div className="wrap">
        <Reveal><Eyebrow>What we run</Eyebrow></Reveal>
        <Reveal delay={60}><h2 className="h2">Events</h2></Reveal>
        <Reveal delay={100}>
          <p className="section-lede">Competitions, hackathons and industry sessions built to push how students think, code and engineer.</p>
        </Reveal>
      </div>

      <Reveal delay={140} className="event-carousel">
        <button
          type="button"
          className="event-arrow event-arrow-prev"
          aria-label="Previous event"
          onClick={() => go(-1)}
        >
          <ChevronLeft size={22} />
        </button>

        <div
          className="event-track"
          ref={trackRef}
          role="group"
          aria-label="Events carousel — scroll horizontally"
          tabIndex={0}
        >
          {loop.map((e, i) => {
            const Icon = e.icon;
            const isActive = i % N === active;
            const isClone = i < N || i >= 2 * N;
            return (
              <article
                key={`${e.name}-${i}`}
                className={`event-card event-card-${e.type} ${isActive ? "is-active" : ""}`}
                style={{ "--accent": e.accent }}
                aria-current={isActive ? "true" : undefined}
                aria-hidden={isClone ? "true" : undefined}
              >
                <div className="event-media">
                  {e.type === "image" ? (
                    <img src={import.meta.env.BASE_URL + e.image} alt={`${e.name} event poster`} className="event-poster" loading="lazy" />
                  ) : (
                    <div className="event-icon-panel" aria-hidden="true"><Icon size={104} strokeWidth={1.1} /></div>
                  )}
                </div>
                <div className="event-body">
                  <span className="event-tag">{e.tag}</span>
                  <h3 className="event-name">{e.name}</h3>
                  <div className="event-motto">{e.motto}</div>
                  <p className="event-desc">{e.desc}</p>
                  <div className="chips">{e.chips.map((c) => <span key={c} className="chip">{c}</span>)}</div>
                  {e.upcoming && (
                    <Magnetic>
                      <a href="#contact" className="btn-primary btn-sm event-cta" tabIndex={isClone ? -1 : undefined}>Register your interest <ArrowRight size={15} /></a>
                    </Magnetic>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="event-arrow event-arrow-next"
          aria-label="Next event"
          onClick={() => go(1)}
        >
          <ChevronRight size={22} />
        </button>
      </Reveal>
    </section>
  );
}

/* ── Team ───────────────────────────────────────────────────────────────── */
function Team() {
  return (
    <section id="team" className="section">
      <div className="wrap">
        <div className="team-grid">
          <div>
            <Reveal><Eyebrow>The people behind the grid</Eyebrow></Reveal>
            <Reveal delay={60}><h2 className="h2">A team that builds together.</h2></Reveal>
            <Reveal delay={120}>
              <p className="section-lede" style={{ maxWidth: 460 }}>
                Designers, coders, makers and organisers — a growing crew of student innovators
                running every workshop, project and event under the ISGF banner.
              </p>
            </Reveal>
            <Reveal delay={180} className="team-roles">
              {["Technical", "Design", "Events", "Management", "Outreach"].map((r) => (
                <span key={r} className="chip"><Users size={13} /> {r}</span>
              ))}
            </Reveal>
          </div>
          <Reveal delay={120} className="team-photo-wrap">
            <Parallax amount={28}>
              {TEAM_PHOTO_URL ? (
                <img src={TEAM_PHOTO_URL} alt="The ISGF VIT student team" className="team-photo" />
              ) : (
                <div className="team-photo team-photo-empty">
                  <Users size={40} strokeWidth={1.4} />
                  <span>Add your team photo</span>
                  <small>set TEAM_PHOTO_URL in the code</small>
                </div>
              )}
              <div className="team-frame" />
            </Parallax>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Sponsors ───────────────────────────────────────────────────────────── */
function Sponsors() {
  return (
    <section id="sponsors" className="section section-alt">
      <div className="wrap">
        <div className="sponsor-head">
          <div>
            <Reveal><Eyebrow>Partner with us</Eyebrow></Reveal>
            <Reveal delay={60}><h2 className="h2">Put your brand in front of builders.</h2></Reveal>
            <Reveal delay={110}>
              <p className="section-lede" style={{ maxWidth: 520 }}>
                Sponsoring ISGF means direct engagement with student innovators, real product
                visibility, and a seat at the table where the next generation of engineers is forming.
              </p>
            </Reveal>
            <Reveal delay={170}>
              <Magnetic>
                <a href="mailto:isgf@vit.ac.in?subject=Sponsorship%20enquiry%20%E2%80%94%20ISGF%20VIT" className="btn-primary" style={{ marginTop: 26 }}>
                  Become a sponsor <ArrowRight size={17} />
                </a>
              </Magnetic>
            </Reveal>
          </div>
          <Reveal delay={120} className="sponsor-target-wrap">
            <Parallax amount={34}>
              <TiltCard className="sponsor-target" max={6}>
                <Target size={26} />
                <b>Reach + impact</b>
                <p>Website, posters, certificates, merch, stage screens and social — your brand, everywhere the event is.</p>
              </TiltCard>
            </Parallax>
          </Reveal>
        </div>

        <AnimeStagger className="benefit-grid" step={45}>
          {BENEFITS.map((b) => (
            <div key={b} className="benefit">
              <span className="benefit-check"><Check size={14} strokeWidth={3} /></span>
              <span>{b}</span>
            </div>
          ))}
        </AnimeStagger>
      </div>
    </section>
  );
}

/* ── Contact ────────────────────────────────────────────────────────────── */
function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="contact-veil" />
      <div className="wrap contact-inner">
        <Reveal><Eyebrow>Get in touch</Eyebrow></Reveal>
        <Reveal delay={60}><h2 className="h2">Ready to join, collaborate or sponsor?</h2></Reveal>

        <div className="contact-grid">
          <Reveal delay={100} className="contact-col">
            <h4>Online</h4>
            <a href="mailto:isgf@vit.ac.in" className="contact-line">
              <Mail size={16} /><span>Email<small>isgf@vit.ac.in</small></span>
            </a>
            <a href="https://www.instagram.com/isgf_vit" className="contact-line" target="_blank" rel="noopener noreferrer">
              <Instagram size={16} /><span>Instagram<small>@isgf_vit</small></span>
            </a>
          </Reveal>
          <Reveal delay={220} className="contact-col">
            <h4>Faculty coordinators</h4>
            <div className="contact-line static"><span>Prabakar Karthikeyan<small>Faculty coordinator</small></span></div>
            <div className="contact-line static"><span>Jacob Raglend<small>Faculty coordinator</small></span></div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div>
          <Wordmark size={24} />
          <p className="footer-tag">India Smart Grid Forum · VIT Vellore Student Branch Chapter</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`}>{n.label}</a>)}
        </nav>
        <div className="footer-social">
          <a href="mailto:isgf@vit.ac.in" aria-label="Email"><Mail size={18} /></a>
          <a href="https://www.instagram.com/isgf_vit" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
        </div>
      </div>
      <div className="footer-base">© {new Date().getFullYear()} ISGF — VIT Vellore Student Chapter. Built by students, for students.</div>
    </footer>
  );
}

/* ── App ────────────────────────────────────────────────────────────────── */
/* ── Stat dashboard strip — GSAP ScrollTrigger ──────────────────────────────
   A row of metric cards that slide up in a left→right stagger the first time
   the strip scrolls into view, while each number counts up from zero. Hover
   lifts a card (GSAP) and intensifies its border/glow (CSS). The GSAP context
   is reverted on unmount so ScrollTriggers are cleaned up. Reduced-motion users
   get the final numbers immediately with no entrance or count-up.
   ──────────────────────────────────────────────────────────────────────────── */
const STATS = [
  { icon: Users,  label: "ACTIVE_MEMBERS",   value: 120, suffix: "+", accent: "var(--green)"   },
  { icon: Rocket, label: "PROJECTS_SHIPPED", value: 35,  suffix: "+", accent: "var(--cyan)"    },
  { icon: Trophy, label: "EVENTS_RUN",       value: 18,  suffix: "",  accent: "var(--teal)"    },
  { icon: Target, label: "FOCUS_DOMAINS",    value: 5,   suffix: "",  accent: "var(--green-2)" },
];

function StatStrip() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nums = root.querySelectorAll(".stat-num");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      nums.forEach((el) => { el.textContent = el.dataset.value + (el.dataset.suffix || ""); });
      return;
    }

    const ctx = gsap.context(() => {
      const trigger = { trigger: root, start: "top 82%", once: true };
      gsap.from(".stat-card", {
        y: 64, opacity: 0, duration: 0.7, ease: "power3.out",
        stagger: 0.12, scrollTrigger: trigger,
      });
      nums.forEach((el) => {
        const end = Number(el.dataset.value);
        const suffix = el.dataset.suffix || "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end, duration: 1.4, ease: "power2.out", scrollTrigger: trigger,
          onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const lift = (e) => gsap.to(e.currentTarget, { y: -8, duration: 0.3, ease: "power2.out", overwrite: "auto" });
  const drop = (e) => gsap.to(e.currentTarget, { y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });

  return (
    <section className="stat-strip" aria-label="Chapter at a glance" ref={ref}>
      <div className="wrap stat-grid">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <article
              key={s.label}
              className="stat-card"
              style={{ "--accent": s.accent }}
              onPointerEnter={lift}
              onPointerLeave={drop}
            >
              <div className="stat-top">
                <span className="stat-ico"><Icon size={18} strokeWidth={2} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
              <div className="stat-num" data-value={s.value} data-suffix={s.suffix}>
                0{s.suffix}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ── Lenis smooth scroll, driven by the GSAP ticker ─────────────────────────
   Lenis takes over wheel/touch scrolling for an inertial feel and pushes every
   frame through gsap.ticker so ScrollTrigger stays perfectly in sync. In-page
   anchor links are routed through lenis.scrollTo (offset for the fixed nav).
   Disabled entirely for prefers-reduced-motion, leaving native scrolling.
   ──────────────────────────────────────────────────────────────────────────── */
function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="isgf-root">
      {loading && <Loader onDone={() => setLoading(false)} />}
      <SmoothScroll />
      <ScrollProgress />
      <CursorGlow />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Events />
        <Team />
        <Sponsors />
        <Contact />
      </main>
      <Footer />
    </div>
    
  );
}
