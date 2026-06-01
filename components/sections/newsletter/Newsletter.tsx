import { Container } from "@/components/ui";
import newsletter from "@/data/newsletter.json";
import type { NewsletterContent } from "@/types/content";

const data = newsletter as NewsletterContent;

export function Newsletter() {
  return (
    <section
      aria-labelledby="nl-title"
      className="from-brand-primary to-brand-primary-dark text-text-inverse relative overflow-hidden bg-gradient-to-br"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle at 85% 50%, var(--color-action), transparent 45%)",
        }}
      />
      <Container className="relative py-14">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-[29rem]">
            <h2 id="nl-title" className="font-display mb-2 text-3xl font-bold">
              {data.title}
            </h2>
            <p className="text-text-on-brand text-base leading-snug">
              {data.description}
            </p>
          </div>
          <form className="flex max-w-[29rem] flex-1 basis-80 flex-wrap gap-2.5">
            <label htmlFor="nl-email" className="sr-only">
              {data.placeholder}
            </label>
            <input
              id="nl-email"
              type="email"
              placeholder={data.placeholder}
              className="text-text-primary bg-surface-main min-h-touch min-w-0 flex-1 basis-52 rounded-pill border-none px-5 outline-none"
            />
            <button
              type="submit"
              className="bg-action text-text-inverse hover:bg-action-hover ease-brand min-h-touch rounded-pill border-none px-7 font-semibold transition-colors"
            >
              {data.button}
            </button>
          </form>
        </div>
      </Container>
      <div className="filet-rainbow" />
    </section>
  );
}
