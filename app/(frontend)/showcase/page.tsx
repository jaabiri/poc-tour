import type { Metadata } from "next";
import { ShowcaseTemplate } from "@/components/templates/showcase/ShowcaseTemplate";

export const metadata: Metadata = {
  title: "Showcase des gabarits — Touraine, le Département",
  description:
    "Présentation des modèles de pages du portail Touraine et de leur couverture des exigences du cahier des charges.",
};

export default function ShowcasePage() {
  return <ShowcaseTemplate />;
}
