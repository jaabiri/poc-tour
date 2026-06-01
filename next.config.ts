import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Masque l'indicateur de dev Next.js (badge flottant en bas à gauche en
  // `next dev`). Il n'apparaît jamais en build de production, mais on le coupe
  // explicitement pour que les démos lancées en mode dev restent propres.
  devIndicators: false,
};

export default withPayload(nextConfig);
