import Image from "next/image";
import { Container, Tag, ArrowLink, SectionLabel } from "@/components/ui";
import featured from "@/data/featured.json";
import type { FeaturedContent } from "@/types/content";

const data = featured as FeaturedContent;

/** "À la une" — large featured story with an overlapping summary card. */
export function Featured() {
  return (
    <section aria-labelledby="featured-title" className="bg-surface-brand">
      <Container className="py-16">
        <div className="grid items-center gap-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* Visual card */}
          <div className="relative z-[2] aspect-[16/10] overflow-hidden rounded-card lg:aspect-[16/11]">
            <Image
              src={data.image}
              alt={data.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="from-brand-primary-dark/90 absolute inset-0 bg-gradient-to-t to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <Tag>{data.tag}</Tag>
              <h2
                id="featured-title"
                className="font-display text-text-inverse mt-3 max-w-[32rem] text-[clamp(1.5rem,3vw,2.125rem)] font-bold leading-tight"
              >
                {data.title}
              </h2>
            </div>
          </div>

          {/* Overlapping summary card */}
          <div className="bg-surface-main shadow-float relative z-[3] -mt-8 mr-4 overflow-hidden rounded-card p-7 lg:mr-0 lg:mt-0 lg:-ml-14">
            <SectionLabel>{data.summaryLabel}</SectionLabel>
            <p className="text-text-primary mt-3 text-base leading-relaxed">
              {data.summary}
            </p>
            <span className="mt-5 inline-block">
              <ArrowLink href={data.cta.href} iconSize={16} groupTriggered={false}>
                {data.cta.label}
              </ArrowLink>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
