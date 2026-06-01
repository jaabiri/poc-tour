interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Centered page-width wrapper (max 1200px) with horizontal padding. */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-page px-6 ${className}`}>
      {children}
    </div>
  );
}
