import { Container, SectionLabel, ArrowLink, Reveal } from "@/components/ui";
import { ServiceCard } from "./ServiceCard";
import services from "@/data/services.json";
import type { ServicesContent } from "@/types/content";

const data = services as ServicesContent;

export function Services() {
  return (
    <Container className="relative pb-16 pt-6">
      {/* Heading with oversized watermark behind (grid stack overlay) */}
      <div className="mb-9 grid">
        <div className="pointer-events-none flex items-center overflow-hidden [grid-area:1/1]">
          <span className="font-display text-brand-primary-dark whitespace-nowrap text-[clamp(4.5rem,13vw,10.5rem)] font-black leading-none tracking-tight opacity-5">
            {data.watermark}
          </span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 self-center [grid-area:1/1]">
          <div>
            <SectionLabel>{data.label}</SectionLabel>
            <h2 className="font-display text-brand-primary-dark mt-2.5 text-3xl font-bold leading-tight sm:text-4xl">
              {data.title}
            </h2>
          </div>
          <ArrowLink href={data.cta.href} groupTriggered={false}>
            {data.cta.label}
          </ArrowLink>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08}>
            <ServiceCard item={item} />
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
