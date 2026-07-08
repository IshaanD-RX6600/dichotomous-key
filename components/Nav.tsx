"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { id: "tree", label: "The Tree" },
  { id: "table", label: "Key Table" },
  { id: "gallery", label: "Species" },
  { id: "concepts", label: "Concepts" },
  { id: "references", label: "References" },
];

export default function Nav() {
  const [active, setActive] = useState("tree");

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-teal-line/70 bg-ink/85 backdrop-blur-md">
      <nav className="section-shell flex items-center gap-4 py-3">
        <a href="#tree" className="mr-auto flex items-center gap-2 font-display text-cream">
          <span aria-hidden className="text-copper text-lg">
            ❧
          </span>
          <span className="text-sm font-semibold tracking-wide">Algonquin Key</span>
        </a>
        <ul className="flex flex-wrap items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active === l.id
                    ? "bg-copper/20 text-copper-soft"
                    : "text-cream-dim hover:text-cream"
                }`}
                aria-current={active === l.id ? "true" : undefined}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
