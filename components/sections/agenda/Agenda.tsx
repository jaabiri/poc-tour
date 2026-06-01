import { Container, SectionLabel } from "@/components/ui";
import { AgendaCard } from "./AgendaCard";
import agenda from "@/data/agenda.json";
import type { AgendaContent } from "@/types/content";

const data = agenda as AgendaContent;

export function Agenda() {
  return (
    <Container className="pb-16">
      <SectionLabel>{data.label}</SectionLabel>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
        {data.items.map((item) => (
          <AgendaCard key={item.title} item={item} />
        ))}
      </div>
    </Container>
  );
}
