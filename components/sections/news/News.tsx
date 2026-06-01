import { Container, SectionLabel, ArrowLink } from "@/components/ui";
import { NewsCard } from "./NewsCard";
import news from "@/data/news.json";
import type { NewsContent } from "@/types/content";

const data = news as NewsContent;

export function News() {
  return (
    <Container className="py-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>{data.label}</SectionLabel>
          {data.title && (
            <h2 className="font-display text-brand-primary-dark mt-2.5 text-3xl font-bold leading-tight sm:text-4xl">
              {data.title}
            </h2>
          )}
        </div>
        <ArrowLink href={data.cta.href} groupTriggered={false}>
          {data.cta.label}
        </ArrowLink>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(17rem,1fr))] gap-5">
        {data.items.map((item) => (
          <NewsCard key={item.title} item={item} />
        ))}
      </div>
    </Container>
  );
}
