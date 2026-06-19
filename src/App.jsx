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

/* ── Interactive, cursor-reactive smart-grid background ─────────────────── */
function GridCanvas({ density = 0.00009, opacity = 1, interactive = true }) {
  const ref = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colors = ["#27D17C", "#38BDF8", "#7C83FF"];
    let w = 0, h = 0, dpr = 1, nodes = [], edges = [], pulses = [], raf = 0;

    const newPulse = () => {
      const e = edges[Math.floor(Math.random() * edges.length)];
      return { e, t: Math.random(), speed: 0.0025 + Math.random() * 0.004 };
    };
    const computeEdges = () => {
      edges = [];
      const maxD = Math.min(w, h) < 640 ? 120 : 165;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < maxD) edges.push({ a: i, b: j, d });
        }
      }
    };
    const build = () => {
      const count = Math.max(16, Math.min(72, Math.floor(w * h * density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.11, vy: (Math.random() - 0.5) * 0.11,
        r: Math.random() * 1.5 + 1, c: colors[Math.floor(Math.random() * colors.length)],
        tw: Math.random() * Math.PI * 2,
      }));
      computeEdges();
      pulses = [];
      const pc = reduce ? 0 : Math.min(18, Math.floor(edges.length * 0.22));
      for (let i = 0; i < pc; i++) pulses.push(newPulse());
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const m = mouse.current;
      const R = 150; // cursor influence radius
      if (!reduce) {
        for (const n of nodes) {
          // gentle attraction toward the cursor
          if (interactive && m.active) {
            const dx = m.x - n.x, dy = m.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < R && d > 0.5) {
              const f = (1 - d / R) * 0.16;
              n.vx += (dx / d) * f;
              n.vy += (dy / d) * f;
            }
          }
          n.vx *= 0.96; n.vy *= 0.96; // damping so it settles
          n.x += n.vx; n.y += n.vy; n.tw += 0.02;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
        computeEdges();
      }
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const alpha = Math.max(0, (1 - e.d / 175)) * 0.32;
        ctx.strokeStyle = `rgba(124,131,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // glow links from cursor to nearby nodes
      if (interactive && m.active && !reduce) {
        for (const n of nodes) {
          const d = Math.hypot(m.x - n.x, m.y - n.y);
          if (d < R) {
            const alpha = (1 - d / R) * 0.5;
            ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          }
        }
      }
      for (const p of pulses) {
        if (!p.e || !nodes[p.e.a] || !nodes[p.e.b]) { Object.assign(p, newPulse()); continue; }
        const a = nodes[p.e.a], b = nodes[p.e.b];
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5.5);
        g.addColorStop(0, a.c); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
        p.t += p.speed;
        if (p.t > 1) Object.assign(p, newPulse());
      }
      for (const n of nodes) {
        const tw = reduce ? 1 : 0.6 + 0.4 * Math.sin(n.tw);
        ctx.fillStyle = n.c;
        ctx.globalAlpha = 0.85 * tw;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.16 * tw;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3.4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
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
  }, [density, interactive]);

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
      <GridCanvas density={0.00011} />
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
      <GridCanvas density={0.00006} opacity={0.5} />
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
