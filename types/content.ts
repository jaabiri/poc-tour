import type { IconName } from "@/lib/icons";

/** A single link (label + href, optionally opening in a new tab). */
export interface NavLink {
  label: string;
  href: string;
  newTab?: boolean;
}

/** A titled column of links inside a méga-menu. */
export interface NavColumn {
  heading?: string;
  links: NavLink[];
}

/**
 * Top navigation entry. `menuType` decides how it renders:
 *  - `direct`   — a plain link (no panel);
 *  - `dropdown` — a flat list of `sub` links (2-col when `wide`);
 *  - `mega`     — several titled `columns` of links.
 */
export interface NavItem {
  label: string;
  href: string;
  newTab?: boolean;
  menuType: "direct" | "dropdown" | "mega";
  /** Dropdown sub-links (used when `menuType === "dropdown"`). */
  sub: NavLink[];
  /** Méga-menu columns (used when `menuType === "mega"`). */
  columns: NavColumn[];
  /** Render the dropdown sub-links over two columns. */
  wide?: boolean;
}

/** Global search box configuration (header global). */
export interface HeaderSearchConfig {
  enabled: boolean;
  placeholder: string;
  action: string;
}

/** Utility top bar (above the main header). */
export interface TopbarContent {
  intro: string;
  links: NavLink[];
  privateSpace: NavLink;
}

/** Everything the header region needs (resolved from the `header` global). */
export interface HeaderContent {
  topbar: TopbarContent;
  nav: NavItem[];
  search: HeaderSearchConfig;
}

/** Hero banner. */
export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  search: {
    label: string;
    placeholder: string;
    button: string;
  };
  quickAccessLabel: string;
}

/** Direct-access card. */
export interface QuickAccessItem {
  icon: IconName;
  title: string;
  href: string;
}

/** Service card. */
export interface ServiceItem {
  icon: IconName;
  title: string;
  description: string;
  href: string;
}

/** "Services" section heading block. */
export interface ServicesContent {
  watermark: string;
  label: string;
  title: string;
  cta: NavLink;
  items: ServiceItem[];
}

/** Featured ("À la une") article. */
export interface FeaturedContent {
  tag: string;
  title: string;
  image: string;
  imageAlt: string;
  summaryLabel: string;
  summary: string;
  cta: NavLink;
}

/** Dedicated-space card (communes, entreprises…). */
export interface DedicatedSpaceItem {
  icon: IconName;
  title: string;
  description: string;
  links: string[];
  href: string;
}

export interface DedicatedSpacesContent {
  label: string;
  title: string;
  items: DedicatedSpaceItem[];
}

/** News card. */
export interface NewsItem {
  tag: string;
  title: string;
  /** Image URL (media) or legacy gradient string; falls back to a brand tint. */
  image: string;
  /** Optional — Payload-driven cards may omit these (only the home enriches them). */
  imageAlt?: string;
  /** ISO date (YYYY-MM-DD) for <time>. */
  date?: string;
  /** Human-readable date label shown on the card. */
  dateLabel?: string;
  excerpt?: string;
  href: string;
}

export interface NewsContent {
  label: string;
  title?: string;
  cta: NavLink;
  items: NewsItem[];
}

/**
 * A by-profile quick-access tile ("Je suis…"). `family` separates the two
 * entry logics — `habitant` (citizen profiles) vs `structure` (organisations) —
 * so the section can group and style them distinctly (data-driven, CMS-mappable).
 */
export interface ProfileItem {
  icon: IconName;
  /** e.g. "Une famille" */
  audience: string;
  /** Short action-oriented summary. */
  description: string;
  href: string;
  /** Which entry logic this profile belongs to. */
  family: "habitant" | "structure";
}

export interface QuickAccessContent {
  label: string;
  title: string;
  intro: string;
  profiles: ProfileItem[];
  /** Direct-access shortcuts (secondary entries). */
  shortcuts: QuickAccessItem[];
}

/** Agenda event. */
export interface AgendaItem {
  day: string;
  month: string;
  title: string;
  place: string;
  category: string;
  href: string;
}

export interface AgendaContent {
  label: string;
  items: AgendaItem[];
}

/** Newsletter band. */
export interface NewsletterContent {
  title: string;
  description: string;
  placeholder: string;
  button: string;
}

/** Footer. */
export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export interface FooterContent {
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  socials: { icon: IconName; label: string; href: string }[];
  columns: FooterColumn[];
  legalLinks: NavLink[];
  copyright: string;
}

/** Global site identity. */
export interface SiteContent {
  name: string;
  tagline: string;
}

/** One Maison départementale de la solidarité (annuaire MDS). */
export interface MdsLocation {
  name: string;
  territory: string;
  address: string;
  phone: string;
  email?: string;
  hours?: string;
  /** External map link (OpenStreetMap) for directions. */
  mapUrl: string;
}

/** Annuaire des Maisons départementales de la solidarité (gabarit T9). */
export interface MdsContent {
  intro: string;
  locations: MdsLocation[];
}

/** One elected councillor (conseiller départemental) — annuaire des élus (T9). */
export interface Elu {
  name: string;
  /** Canton represented. */
  canton: string;
  /** Political group label (drives the group filter). */
  group: string;
  /** Optional executive role (Présidente, Vice-président…) — highlights the élu. */
  role?: string;
  /** Optional delegation / portfolio shown under an executive role. */
  delegation?: string;
  email?: string;
  /** Optional portrait URL; falls back to a branded initials medallion. */
  photo?: string;
}

/** Annuaire des élus du Département — trombinoscope filtrable (gabarit T10). */
export interface ElusContent {
  intro: string;
  /** Full assembly roster; members carrying a `role` are surfaced as the exécutif. */
  members: Elu[];
}

/** One issue of « Touraine, le Mag » in the kiosque (gabarit T11). */
export interface MagazineIssue {
  number: number;
  title: string;
  /** ISO date of publication (YYYY-MM-DD) for <time> + year filter. */
  date: string;
  /** Human label of the covered period, e.g. « Mai – Juin 2026 ». */
  period: string;
  /** Cover image URL; falls back to a branded aplat de charte. */
  cover?: string;
  summary?: string;
  /** PDF download URL. */
  pdfUrl: string;
  /** Optional online flipbook / reader URL. */
  readUrl?: string;
}

/** Kiosque « Touraine le Mag » — archive des numéros (gabarit T11). */
export interface MagazineContent {
  intro: string;
  issues: MagazineIssue[];
}

/** Category of an administrative act (register filter). */
export type ActeType = "deliberation" | "arrete" | "raa" | "budget";

/** One administrative act in the register (gabarit T12). */
export interface ActeItem {
  title: string;
  type: ActeType;
  /** Official reference, e.g. « DEL-2026-042 ». */
  reference: string;
  /** ISO date (YYYY-MM-DD) — drives the <time>, the year filter and the sort. */
  date: string;
  /** Optional session / assembly label, e.g. « Session du 12 juin 2026 ». */
  session?: string;
  /** PDF download URL. */
  pdfUrl: string;
}

/** Registre des actes administratifs — registre filtrable (gabarit T12). */
export interface ActesContent {
  intro: string;
  acts: ActeItem[];
}

/** « Nous contacter » page content (gabarit T6). Coordinates are reused from
 *  FooterContent.contact; this carries the hours, locator map and intro. */
export interface ContactContent {
  intro: string;
  hours: { days: string; time: string }[];
  map: {
    embedUrl: string;
    linkUrl: string;
    label: string;
  };
  transport?: string;
}
