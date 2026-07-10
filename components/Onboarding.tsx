"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* A guided, first-visit walkthrough of the site. It dims the page, frames the
   section it's describing with a copper "spotlight", and anchors an on-brand
   parchment tooltip beside it. The tour auto-opens once per visitor (remembered
   in localStorage) and can be replayed anytime from the floating Tour button. */

const SEEN_KEY = "algonquin-tour-v1";

type Step = {
  /* CSS selector for the element to spotlight; omit for a centered card. */
  selector?: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    title: "Welcome to the Algonquin Key",
    body: "This is an interactive dichotomous key for identifying organisms of Ontario's Great Lakes–St. Lawrence forest. Here's a quick 30-second tour of how it all fits together.",
  },
  {
    selector: "header",
    title: "Jump anywhere",
    body: "Use the top navigation to hop between sections. It highlights where you are as you scroll, so you never lose your place.",
  },
  {
    selector: "#tree",
    title: "The interactive key tree",
    body: "The centerpiece. Click the a / b choices to light up a route down the branches to a single species, or hover (tap on mobile) any node to enlarge it and read its full detail.",
  },
  {
    selector: "#table",
    title: "The full key table",
    body: "Prefer a classic reference? Here's every couplet as a numbered table — colour-coded by the branch of life it sorts, with choice a and choice b and where each one leads.",
  },
  {
    selector: "#gallery",
    title: "Species gallery",
    body: "Specimen plates for every organism, grouped by kingdom. Each shows the common and scientific name, key traits, an image, and an APA citation.",
  },
  {
    selector: "#concepts",
    title: "Biology concepts",
    body: "Short write-ups connecting the key to core biology ideas, with key terms bolded and in-text citations to the reference list.",
  },
  {
    selector: "#references",
    title: "References",
    body: "The full APA reference list that backs the key and its images — everything is properly cited.",
  },
  {
    title: "You're all set",
    body: "Start at the tree and follow a path, or explore any section freely. You can replay this tour anytime from the compass button in the corner.",
  },
];

type Box = { top: number; left: number; width: number; height: number };

export default function Onboarding() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [hole, setHole] = useState<Box | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const start = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode / storage disabled — tour simply reappears next visit */
    }
  }, []);

  const next = useCallback(() => {
    setStep((s) => (s >= STEPS.length - 1 ? s : s + 1));
  }, []);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  /* Auto-open on the visitor's first arrival, after a short beat so the page
     has painted and sections exist in the DOM. */
  useEffect(() => {
    setMounted(true);
    let seen = "1";
    try {
      seen = localStorage.getItem(SEEN_KEY) ?? "";
    } catch {
      seen = "1";
    }
    if (!seen) {
      const t = setTimeout(() => start(), 650);
      return () => clearTimeout(t);
    }
  }, [start]);

  /* Scroll the current target into view when the step changes. */
  useEffect(() => {
    if (!active) return;
    const el = current.selector
      ? document.querySelector<HTMLElement>(current.selector)
      : null;
    if (el) {
      el.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "center",
      });
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
    cardRef.current?.focus();
  }, [active, step, current.selector, reduced]);

  /* Keep the spotlight glued to the target every frame while the tour is open,
     so it tracks smooth scrolling, resizes, and layout shifts. */
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      const el = current.selector
        ? document.querySelector<HTMLElement>(current.selector)
        : null;
      if (el) {
        const r = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const pad = 8;
        const top = Math.max(8, r.top - pad);
        const left = Math.max(8, r.left - pad);
        const bottom = Math.min(vh - 8, r.bottom + pad);
        const right = Math.min(vw - 8, r.right + pad);
        const w = right - left;
        const h = bottom - top;
        const box = w > 0 && h > 0 ? { top, left, width: w, height: h } : null;
        setHole((prev) => (sameBox(prev, box) ? prev : box));
      } else {
        setHole((prev) => (prev === null ? prev : null));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, step, current.selector]);

  /* Keyboard: Esc closes, ← / → navigate. */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish, next, back]);

  if (!mounted) return null;

  const cardStyle = tooltipStyle(hole);

  const fade = reduced ? { duration: 0 } : { duration: 0.25 };

  return (
    <>
      {/* Floating replay trigger — always available, hidden during the tour. */}
      {!active && (
        <button
          onClick={start}
          className="fixed bottom-5 right-5 z-[9980] flex items-center gap-2 rounded-full border border-copper/50 bg-ink-2/90 px-4 py-2.5 text-sm font-semibold text-copper-soft shadow-plate backdrop-blur-md transition-colors hover:bg-ink-3 hover:text-copper"
          aria-label="Take a guided tour of this site"
        >
          <span aria-hidden className="text-base">🧭</span>
          Tour
        </button>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            key="tour"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            className="fixed inset-0 z-[9990]"
            aria-hidden={false}
          >
            {/* Click-blocking backdrop. When there's no spotlight target the
                whole screen dims; with a target the hole below darkens around
                it instead so this stays transparent. */}
            <div
              className={`absolute inset-0 ${hole ? "bg-transparent" : "bg-ink/85 backdrop-blur-[2px]"}`}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Spotlight: a framed hole with a giant box-shadow that darkens
                everything outside it. */}
            {hole && (
              <motion.div
                className="pointer-events-none absolute rounded-xl ring-2 ring-copper"
                initial={false}
                animate={{
                  top: hole.top,
                  left: hole.left,
                  width: hole.width,
                  height: hole.height,
                }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
                style={{ boxShadow: "0 0 0 9999px rgba(8,16,15,0.80)" }}
              />
            )}

            {/* The tooltip / step card. */}
            <motion.div
              ref={cardRef}
              key={step}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tour-title"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={fade}
              className="card-parchment fixed z-[9992] p-5 outline-none"
              style={cardStyle}
            >
              <button
                onClick={finish}
                aria-label="Skip the tour"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-bodyink/50 transition-colors hover:bg-black/10 hover:text-bodyink"
              >
                ✕
              </button>

              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-copper-deep">
                Step {step + 1} of {STEPS.length}
              </p>
              <h3 id="tour-title" className="mt-1 font-display text-xl leading-tight text-bodyink">
                {current.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-bodyink/85">{current.body}</p>

              {/* Progress dots. */}
              <div className="mt-4 flex items-center gap-1.5" aria-hidden>
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? "w-5 bg-copper" : "w-1.5 bg-copper-deep/30 hover:bg-copper-deep/50"
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={finish}
                  className="text-sm font-medium text-bodyink/55 underline-offset-2 transition-colors hover:text-bodyink hover:underline"
                >
                  {isLast ? "Close" : "Skip tour"}
                </button>
                <div className="flex items-center gap-2">
                  {!isFirst && (
                    <button
                      onClick={back}
                      className="rounded-md border border-copper-deep/40 bg-white/40 px-3.5 py-2 text-sm font-semibold text-bodyink transition-colors hover:bg-white/70"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={isLast ? finish : next}
                    className="rounded-md bg-copper px-4 py-2 text-sm font-semibold text-ink shadow-plate transition-transform hover:-translate-y-0.5"
                  >
                    {isLast ? "Explore the key" : "Next"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function sameBox(a: Box | null, b: Box | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

/* Position the step card: pinned to the bottom-centre when there's no target
   or the target fills most of the screen, otherwise tucked just below (or
   above, if there's no room) the spotlight and roughly centred on it. */
function tooltipStyle(hole: Box | null): React.CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const cardW = Math.min(380, vw - 24);
  const gap = 14;

  if (!hole || hole.height > vh * 0.62) {
    return {
      width: cardW,
      left: "50%",
      bottom: 24,
      transform: "translateX(-50%)",
    };
  }

  const centerX = hole.left + hole.width / 2;
  const left = clamp(centerX - cardW / 2, 12, vw - cardW - 12);
  const roomBelow = vh - (hole.top + hole.height);
  const placeBelow = roomBelow > 220 || roomBelow >= hole.top;

  if (placeBelow) {
    return { width: cardW, left, top: hole.top + hole.height + gap };
  }
  return {
    width: cardW,
    left,
    top: hole.top - gap,
    transform: "translateY(-100%)",
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
