interface TagProps {
  children: React.ReactNode;
}

/** Small uppercase pill used to flag a category on cards (news, agenda, featured). */
export function Tag({ children }: TagProps) {
  return (
    <span className="bg-action text-text-inverse inline-block rounded-pill px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide">
      {children}
    </span>
  );
}
