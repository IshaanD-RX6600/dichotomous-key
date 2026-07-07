import Rich from "./Rich";

export default function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl text-cream md:text-4xl">{title}</h2>
      <hr className="divider-botanical my-5" />
      {lead ? (
        <Rich as="p" html={lead} className="on-dark text-cream-dim leading-relaxed" />
      ) : null}
    </div>
  );
}
