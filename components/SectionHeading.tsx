/* Renders just the section title and a botanical divider. The eyebrow and lead
   props are accepted (so existing call sites keep compiling) but no longer
   shown, keeping each section clean. */
export default function SectionHeading({
  title,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  richLead?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="font-display text-3xl text-cream md:text-4xl">{title}</h2>
      <hr className="divider-botanical mt-5" />
    </div>
  );
}
