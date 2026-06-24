import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 150;
// builds "/frames/frame_001.jpg" ... "/frames/frame_150.jpg"
const frameUrl = (i) =>
  `/frames/frame_${String(i).padStart(3, "0")}.jpg`;

export default function ScrollVideo({ children }) {
  const wrapperRef = useRef(null);   // tall scroll area
  const canvasRef = useRef(null);    // the pinned canvas
  const imagesRef = useRef([]);      // preloaded Image objects
  const frameRef = useRef(0);        // current frame index
  const [loaded, setLoaded] = useState(0);

  // 1) Preload every frame
  useEffect(() => {
    let count = 0;
    const imgs = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      img.onload = () => {
        count++;
        setLoaded(count);
        if (i === 1) draw(0); // show first frame asap
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Draw a frame onto the canvas (object-fit: cover behaviour)
  const draw = (index) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    const cw = canvas.width;
    const ch = canvas.height;
    const ir = img.width / img.height;
    const cr = cw / ch;
    let dw, dh, dx, dy;
    if (ir > cr) {
      dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0;
    } else {
      dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2;
    }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // 3) Size the canvas to the screen (and on resize)
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.getContext("2d").scale(dpr, dpr);
      // re-scale logic: reset transform then redraw
      canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(frameRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4) Map scroll position -> frame index
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const wrapper = wrapperRef.current;
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          const scrollable = rect.height - window.innerHeight;
          // how far we've scrolled through the wrapper, 0 -> 1
          const progress = Math.min(
            Math.max(-rect.top / scrollable, 0),
            1
          );
          const frame = Math.min(
            FRAME_COUNT - 1,
            Math.floor(progress * FRAME_COUNT)
          );
          if (frame !== frameRef.current) {
            frameRef.current = frame;
            draw(frame);
          }
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Tall wrapper: 300vh = you scroll 3 screen-heights to play all frames.
    // Increase for a slower scrub, decrease for faster.
    <div ref={wrapperRef} style={{ height: "300vh", position: "relative" }}>
      {/* Sticky stage stays pinned while you scroll through the wrapper */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
          }}
        />
        {/* Anything you pass as children sits on top of the map */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {children}
        </div>

        {/* Tiny loading indicator until frames are ready */}
        {loaded < FRAME_COUNT && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              color: "#fff",
              font: "14px monospace",
              opacity: 0.7,
            }}
          >
            Loading {loaded}/{FRAME_COUNT}
          </div>
        )}
      </div>
    </div>
  );
}