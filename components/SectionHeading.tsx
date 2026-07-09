import Rich from "./Rich";
import RichHtml from "./RichHtml";

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  richLead = false,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  /* When true, the lead keeps its inline formatting (bold key terms). Only the
     Concepts section opts in; every other section renders the lead as plain text. */
  richLead?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl text-cream md:text-4xl">{title}</h2>
      <hr className="divider-botanical my-5" />
      {lead ? (
        richLead ? (
          <RichHtml as="p" html={lead} className="on-dark text-cream-dim leading-relaxed" />
        ) : (
          <Rich as="p" html={lead} className="on-dark text-cream-dim leading-relaxed" />
        )
      ) : null}
    </div>
  );
}
