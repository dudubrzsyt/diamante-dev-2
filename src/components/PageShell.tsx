import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export function PageShell({ eyebrow, title, description, children }: Props) {
  return (
    <div className="overflow-x-hidden pt-28 sm:pt-32 md:pt-40">
      <section className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mx-auto max-w-3xl animate-slam text-center sm:text-left">
          {eyebrow && (
            <p className="mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-brand-yellow/40 bg-brand-yellow/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow sm:justify-start">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[2rem] font-black leading-[1.02] sm:text-4xl md:text-7xl">{title}</h1>
          {description && (
            <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-relaxed text-muted-foreground sm:mx-0 sm:mt-6 sm:text-base md:text-lg">
              {description}
            </p>
          )}
        </div>
      </section>

      <div className="mt-12 sm:mt-16">{children}</div>
    </div>
  );
}
