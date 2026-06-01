import { Container, SectionLabel } from "@/components/ui";
import { DedicatedSpaceCard } from "./DedicatedSpaceCard";
import dedicatedSpaces from "@/data/dedicated-spaces.json";
import type { DedicatedSpacesContent } from "@/types/content";

const data = dedicatedSpaces as DedicatedSpacesContent;

export function DedicatedSpaces() {
  return (
    <Container className="py-16">
      <SectionLabel>{data.label}</SectionLabel>
      <h2 className="font-display text-brand-primary-dark mb-7 mt-2.5 text-3xl font-bold leading-tight sm:text-4xl">
        {data.title}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-5">
        {data.items.map((item, i) => (
          <DedicatedSpaceCard
            key={item.title}
            item={item}
            variant={i === 0 ? "dark" : "light"}
          />
        ))}
      </div>
    </Container>
  );
}
