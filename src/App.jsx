import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Network, Wifi, CircuitBoard, SlidersHorizontal, Sparkles,
  Menu, X, Mail, Phone, Instagram, ArrowRight, ArrowUpRight, Check,
  Trophy, Rocket, Users, ChevronDown, Target,
} from "lucide-react";
import "./styles.css";

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
    tag: "Flagship Competition",
    name: "Hunt Verse",
    motto: "Explore · Innovate · Conquer",
    accent: "#27D17C",
    desc: "An immersive electronics and IoT competition that drops students into the world of connected systems through hands-on innovation and competitive gameplay. Teams explore wireless communication, embedded development and smart systems while solving challenges that reward creativity and engineering thinking.",
    chips: ["Electronics", "IoT", "Embedded", "Wireless", "Team-based"],
    icon: Trophy,
  },
  {
    tag: "AI Hackathon · graVITas '26",
    name: "Operation: Doomsday",
    motto: "Assemble · Code · Defy Doom",
    accent: "#38BDF8",
    desc: "A one-day AI engineering hackathon set in a multiversal crisis. Participants combat an AI-powered threat across missions spanning competitive coding, AI literacy, deepfake detection, modern AI tooling and agentic AI — building solutions for real-world sustainability across smart grids, renewable energy, electric mobility and smart cities.",
    chips: ["AI / ML", "Agentic AI", "Deepfake Detection", "Sustainability", "Hackathon"],
    icon: Rocket,
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

const CONTACTS = [
  { name: "Santhoshraja", phone: "8870257778" },
  { name: "Riya Jasmine", phone: "7094729817" },
];

const STATS = [
  { value: 5, suffix: "", label: "Focus domains" },
  { value: 2, suffix: "", label: "Flagship events" },
  { value: 20, suffix: "+", label: "Student innovators" },
];

/* ── Smart-grid power-distribution background ────────────────────────────────
   An orthogonal power network (PCB / city-grid style). Energy packets travel
   along the lines and *route* turn-by-turn through substations — when current
   passes, the trace lights up and the substation flashes, then both fade. The
   cursor acts as an energy injector: the nearest substation energises and fires
   fresh current down its lines. This reads as power flowing through a grid,
   not a generic particle constellation.
   ──────────────────────────────────────────────────────────────────────────── */
function GridCanvas({ opacity = 1, interactive = true, spacing = 116 }) {
  const ref = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLORS = ["#27D17C", "#38BDF8", "#7C83FF"];
    let w = 0, h = 0, dpr = 1, raf = 0;
    let nodes = [], edges = [], adj = [], packets = [];

    const rgba = (hex, a) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    };

    // Spawn an energy packet at a node, heading down one of its lines.
    const spawnFrom = (ni, color) => {
      const links = adj[ni];
      if (!links || !links.length) return;
      const lk = links[(Math.random() * links.length) | 0];
      packets.push({
        edge: lk.edge, from: ni, to: lk.other, t: 0,
        speed: 0.012 + Math.random() * 0.014, life: 5 + (Math.random() * 4 | 0),
        color: color || COLORS[(Math.random() * COLORS.length) | 0],
      });
    };

    const build = () => {
      const sp = Math.max(78, Math.min(spacing, Math.min(w, h) < 620 ? 84 : spacing));
      const cols = Math.max(3, Math.round(w / sp) + 1);
      const rows = Math.max(3, Math.round(h / sp) + 1);
      const ox = (w - (cols - 1) * sp) / 2;
      const oy = (h - (rows - 1) * sp) / 2;
      nodes = []; edges = []; adj = []; packets = [];

      const idx = (c, r) => r * cols + c;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const j = sp * 0.18;
          nodes.push({
            x: ox + c * sp + (Math.random() - 0.5) * j,
            y: oy + r * sp + (Math.random() - 0.5) * j,
            hub: Math.random() < 0.12,          // a few bigger substations
            energy: 0, phase: Math.random() * Math.PI * 2,
            c: COLORS[(Math.random() * COLORS.length) | 0],
          });
        }
      }
      adj = nodes.map(() => []);
      const addEdge = (a, b) => {
        if (Math.random() < 0.26) return;       // drop some lines → irregular grid
        const ei = edges.length;
        edges.push({ a, b, energy: 0 });
        adj[a].push({ edge: ei, other: b });
        adj[b].push({ edge: ei, other: a });
      };
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c < cols - 1) addEdge(idx(c, r), idx(c + 1, r)); // horizontal line
          if (r < rows - 1) addEdge(idx(c, r), idx(c, r + 1)); // vertical line
        }
      }
      const seed = reduce ? 0 : Math.max(6, Math.min(26, Math.round(edges.length * 0.08)));
      for (let i = 0; i < seed; i++) spawnFrom((Math.random() * nodes.length) | 0);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    let inject = 0; // throttle cursor injections
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const m = mouse.current;

      // cursor energises the nearest substation and fires current from it
      if (interactive && m.active && !reduce) {
        let best = -1, bd = 130 * 130;
        for (let i = 0; i < nodes.length; i++) {
          const dx = nodes[i].x - m.x, dy = nodes[i].y - m.y;
          const d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = i; }
        }
        if (best >= 0) {
          nodes[best].energy = 1;
          if (--inject <= 0) { spawnFrom(best, nodes[best].c); inject = 8; }
        }
      }

      // base traces + energised glow
      ctx.lineCap = "round";
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        ctx.strokeStyle = rgba("#7C83FF", 0.10);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        if (e.energy > 0.01) {
          ctx.strokeStyle = rgba("#38BDF8", e.energy * 0.55);
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          e.energy *= 0.94;
        }
      }

      // energy packets routing through the grid
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        const e = edges[p.edge];
        if (!e) { packets.splice(i, 1); continue; }
        const a = nodes[p.from], b = nodes[p.to];
        e.energy = 1;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        if (!reduce) p.t += p.speed;

        // glowing current head
        const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, p.color); g.addColorStop(1, rgba(p.color, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x, y, 1.7, 0, Math.PI * 2); ctx.fill();

        if (p.t >= 1) {
          // arrived at a substation → flash it, then route onward
          nodes[p.to].energy = 1;
          if (--p.life <= 0) { packets.splice(i, 1); continue; }
          const links = adj[p.to].filter((l) => l.other !== p.from);
          const pick = (links.length ? links : adj[p.to])[
            (Math.random() * (links.length ? links.length : adj[p.to].length)) | 0
          ];
          if (!pick) { packets.splice(i, 1); continue; }
          p.from = p.to; p.to = pick.other; p.edge = pick.edge; p.t = 0;
        }
      }

      // keep a steady population of current flowing
      if (!reduce && packets.length < Math.max(6, edges.length * 0.05) && Math.random() < 0.08) {
        spawnFrom((Math.random() * nodes.length) | 0);
      }

      // substations
      for (const n of nodes) {
        n.phase += 0.02;
        const idle = reduce ? 0.5 : 0.4 + 0.25 * Math.sin(n.phase);
        const lvl = Math.max(idle * 0.5, n.energy);
        const base = n.hub ? 2.4 : 1.5;
        if (n.energy > 0.02) {
          ctx.fillStyle = rgba(n.c, n.energy * 0.22);
          ctx.beginPath(); ctx.arc(n.x, n.y, base + 9 * n.energy, 0, Math.PI * 2); ctx.fill();
          n.energy *= 0.93;
        }
        // hubs drawn as small squares (substations), others as dots
        ctx.fillStyle = rgba(n.c, 0.55 + 0.45 * lvl);
        if (n.hub) {
          const s = base;
          ctx.fillRect(n.x - s, n.y - s, s * 2, s * 2);
          ctx.strokeStyle = rgba(n.c, 0.5 * lvl + 0.2);
          ctx.lineWidth = 1;
          ctx.strokeRect(n.x - s - 2.5, n.y - s - 2.5, (s + 2.5) * 2, (s + 2.5) * 2);
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, base, 0, Math.PI * 2); ctx.fill();
        }
      }

      if (!reduce) raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const onLeave = () => { mouse.current.active = false; };

    resize();
    frame();
    window.addEventListener("resize", resize);
    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [interactive, spacing]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }} />;
}

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

/* ── Count-up number (animates when scrolled into view) ─────────────────── */
function CountUp({ value, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, started = false;
    const run = () => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(eased * value));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting && !started) { started = true; run(); io.unobserve(el); } });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [value, duration]);
  return <b ref={ref}>{String(n).padStart(2, "0")}{suffix}</b>;
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

/* ── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="top" className="hero">
      <GridCanvas spacing={108} />
      <div className="hero-veil" />
      <div className="hero-inner">
        <Reveal className="hero-badge">Powered by the India Smart Grid Forum · VIT Vellore</Reveal>
        <Reveal delay={80}>
          <h1 className="hero-title">
            We build the <span className="grad-text">grid that thinks.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="hero-lede">
            A student-led technical community turning ideas in smart energy, IoT, embedded
            systems and AI into things you can actually build, break and ship.
          </p>
        </Reveal>
        <Reveal delay={240} className="hero-cta">
          <Magnetic><a href="#contact" className="btn-primary">Join the chapter <ArrowRight size={17} /></a></Magnetic>
          <Magnetic><a href="#events" className="btn-ghost">Explore events <ArrowUpRight size={16} /></a></Magnetic>
        </Reveal>
        <Reveal delay={340} className="hero-stats">
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="hs-div" />}
              <div>
                <CountUp value={s.value} suffix={s.suffix} />
                <span>{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </Reveal>
      </div>
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

        <div className="domain-grid">
          {DOMAINS.map((d, i) => {
            const Icon = d.icon;
            return (
              <Reveal key={d.title} delay={i * 70}>
                <TiltCard className="domain-card">
                  <div className="domain-ico"><Icon size={22} strokeWidth={1.9} /></div>
                  <h3>{d.title}</h3>
                  <p>{d.desc}</p>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Events (interactive switcher) ──────────────────────────────────────── */
function Events() {
  const [sel, setSel] = useState(0);
  const e = EVENTS[sel];
  const Icon = e.icon;
  return (
    <section id="events" className="section section-alt">
      <div className="wrap">
        <Reveal><Eyebrow>What we run</Eyebrow></Reveal>
        <Reveal delay={60}><h2 className="h2">Flagship events</h2></Reveal>
        <Reveal delay={100}>
          <p className="section-lede">Competitions and hackathons built to push how students think, code and engineer.</p>
        </Reveal>

        <Reveal delay={120} className="event-tabs">
          {EVENTS.map((ev, i) => (
            <button
              key={ev.name}
              className={`event-tab ${sel === i ? "is-active" : ""}`}
              style={{ "--accent": ev.accent }}
              onClick={() => setSel(i)}
            >
              <span className="event-tab-dot" />
              {ev.name}
            </button>
          ))}
        </Reveal>

        <Reveal delay={160}>
          <article key={e.name} className="card event-feature" style={{ "--accent": e.accent }}>
            <div className="event-feature-main">
              <div className="event-top">
                <span className="event-tag">{e.tag}</span>
                <Icon size={22} className="event-ico" />
              </div>
              <h3 className="event-name">{e.name}</h3>
              <div className="event-motto">{e.motto}</div>
              <p className="event-desc">{e.desc}</p>
              <div className="chips">{e.chips.map((c) => <span key={c} className="chip">{c}</span>)}</div>
              <Magnetic>
                <a href="#contact" className="btn-primary btn-sm event-cta">Register your interest <ArrowRight size={15} /></a>
              </Magnetic>
            </div>
            <div className="event-feature-side" aria-hidden="true">
              <div className="event-glow"><Icon size={120} strokeWidth={1} /></div>
            </div>
          </article>
        </Reveal>
      </div>
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
            <TiltCard className="sponsor-target" max={6}>
              <Target size={26} />
              <b>Reach + impact</b>
              <p>Website, posters, certificates, merch, stage screens and social — your brand, everywhere the event is.</p>
            </TiltCard>
          </Reveal>
        </div>

        <div className="benefit-grid">
          {BENEFITS.map((b, i) => (
            <Reveal key={b} delay={(i % 4) * 50}>
              <div className="benefit">
                <span className="benefit-check"><Check size={14} strokeWidth={3} /></span>
                <span>{b}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contact ────────────────────────────────────────────────────────────── */
function Contact() {
  return (
    <section id="contact" className="section contact">
      <GridCanvas spacing={140} opacity={0.55} />
      <div className="contact-veil" />
      <div className="wrap contact-inner">
        <Reveal><Eyebrow>Get in touch</Eyebrow></Reveal>
        <Reveal delay={60}><h2 className="h2">Ready to join, collaborate or sponsor?</h2></Reveal>

        <div className="contact-grid">
          <Reveal delay={100} className="contact-col">
            <h4>Call us</h4>
            {CONTACTS.map((c) => (
              <a key={c.phone} href={`tel:+91${c.phone}`} className="contact-line">
                <Phone size={16} /><span>{c.name}<small>+91 {c.phone}</small></span>
              </a>
            ))}
          </Reveal>
          <Reveal delay={160} className="contact-col">
            <h4>Online</h4>
            <a href="mailto:isgf@vit.ac.in" className="contact-line">
              <Mail size={16} /><span>Email<small>isgf@vit.ac.in</small></span>
            </a>
            <a href="https://instagram.com/isgf_vit" target="_blank" rel="noreferrer" className="contact-line">
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
          <a href="https://instagram.com/isgf_vit" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
          <a href="mailto:isgf@vit.ac.in" aria-label="Email"><Mail size={18} /></a>
        </div>
      </div>
      <div className="footer-base">© {new Date().getFullYear()} ISGF — VIT Vellore Student Chapter. Built by students, for students.</div>
    </footer>
  );
}

/* ── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <div className="isgf-root">
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
