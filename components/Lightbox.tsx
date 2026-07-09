"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* A single, app-wide "click to expand" overlay. Any image on the site opens it
   through the `useLightbox().open(...)` hook (see ImagePlaceholder), so there is
   exactly one enlarged view — with backdrop-click and Escape to close — no
   matter how many images are on the page. */

export type LightboxImage = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
};

type LightboxCtx = { open: (img: LightboxImage) => void };

const Ctx = createContext<LightboxCtx>({ open: () => {} });

export const useLightbox = () => useContext(Ctx);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [img, setImg] = useState<LightboxImage | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const open = useCallback((next: LightboxImage) => setImg(next), []);
  const close = useCallback(() => setImg(null), []);

  // While open: Escape closes it and the page behind it can't scroll.
  useEffect(() => {
    if (!img) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [img, close]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {img && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm sm:p-8"
                onClick={close}
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.18 }}
                role="dialog"
                aria-modal="true"
                aria-label={img.title ? `Enlarged image: ${img.title}` : "Enlarged image"}
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close enlarged image"
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 bg-ink/60 text-2xl leading-none text-cream transition-colors hover:bg-copper hover:text-ink"
                >
                  ×
                </button>

                <motion.figure
                  className="flex max-h-full max-w-5xl flex-col items-center"
                  onClick={(e) => e.stopPropagation()}
                  initial={reduced ? { scale: 1, opacity: 1 } : { scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={reduced ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-plate"
                  />
                  {(img.title || img.caption) && (
                    <figcaption className="mt-4 max-w-2xl text-center">
                      {img.title && (
                        <p className="font-display text-lg text-cream">{img.title}</p>
                      )}
                      {img.caption && (
                        <p className="mt-1 break-words text-xs italic text-cream-dim">
                          {img.caption}
                        </p>
                      )}
                    </figcaption>
                  )}
                </motion.figure>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </Ctx.Provider>
  );
}
