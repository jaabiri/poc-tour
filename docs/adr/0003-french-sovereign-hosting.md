# French sovereign hosting (Lot 2), not Vercel

The CCTP (Lot 2) makes a **European host obligatory and a French host preferred**, requires data sovereignty ("souveraineté des données", certificates on demand), CD37 ownership and restitution of data, 99% uptime 24/7, incremental backups, monitoring, and a cyber assurance plan (OWASP/ANSSI). We host the Next.js+Payload app on **French sovereign IaaS (OVHcloud or Scaleway)**, explicitly **not** Vercel.

Topology: a single Node app (Next.js with Payload embedded) + managed **PostgreSQL** + **S3-compatible object storage** for media, in a French region. **Matomo stays self-hosted on CD37's own infrastructure** (per the CCTP). TLS for `touraine.fr` is provided by CD37 and integrated by us.

## Considered Options

- **French sovereign IaaS — OVHcloud / Scaleway (chosen)** — satisfies sovereignty and "français privilégié"; we operate the runtime (more ops, but full control + certificates).
- **Vercel** — the obvious, lowest-friction Next.js host, but **US-based** → fails the European/sovereignty requirement. Rejected despite DX.
- **Other EU clouds (e.g. Hetzner/IONOS)** — European-compliant fallback if a French region is unavailable, but "français privilégié" makes OVH/Scaleway the default.

## Consequences

- We own runtime ops (deploys, scaling, patching, monitoring, backups) — folded into Lot 2 MCO and the maintien-en-condition-de-sécurité commitments.
- Single-app topology (Payload-in-Next) keeps this to **one runtime + one database + object storage**, minimizing the sovereign-ops surface.
