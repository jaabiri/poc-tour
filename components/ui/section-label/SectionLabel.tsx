interface SectionLabelProps {
  children: React.ReactNode;
}

/** Small uppercase coral eyebrow label with a leading rainbow dash (26×4px), used above section titles. */
export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <span className="text-action inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wide">
      <span className="bg-rainbow inline-block h-1 w-6 rounded-sm" />
      {children}
    </span>
  );
}
