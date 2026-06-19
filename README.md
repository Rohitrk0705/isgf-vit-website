# ISGF · VIT Vellore Student Chapter

An interactive single-page website for the **India Smart Grid Forum (ISGF)** student chapter at VIT Vellore — a student-led technical community working across smart grids, IoT, embedded systems, automation and AI.

Built with **React + Vite**.

## Interactive features

- Cursor-reactive animated smart-grid background (nodes drift toward the pointer and link up with glowing edges)
- Soft custom cursor glow that trails the mouse
- Scroll progress bar across the top
- 3D tilt + spotlight hover on domain and sponsor cards
- Magnetic buttons that lean toward the cursor
- Animated count-up hero stats
- Interactive event switcher (tabbed flagship-event panel)
- Active-section highlighting in the navbar
- Scroll-reveal animations throughout
- Fully responsive, with full `prefers-reduced-motion` support

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into /dist
npm run preview  # preview the production build
```

## Customising

- **Team photo** — set `TEAM_PHOTO_URL` near the top of `src/App.jsx`.
- **Content** — events, domains, sponsor benefits and contacts live in the data arrays at the top of `src/App.jsx`.
- **Theme** — colours and design tokens are CSS variables under `.isgf-root` in `src/styles.css`.
