import {
  Search,
  Menu,
  X,
  Lock,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Baby,
  GraduationCap,
  HeartHandshake,
  Theater,
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Printer,
  CalendarDays,
  BookOpen,
  FileText,
  Accessibility,
  HandHelping,
  Briefcase,
  Landmark,
  Building2,
  Building,
  Eye,
  Newspaper,
  MapPinned,
  HelpCircle,
  Check,
  Info,
  Clock,
  List,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import { Facebook, Instagram, Linkedin, Youtube } from "./brand-icons";

/** Any icon component used in the registry accepts a size and className. */
export type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
}>;

/**
 * Central registry mapping JSON-friendly icon name strings to components.
 * Data files reference icons by name; components resolve them here.
 * Brand icons (facebook…) come from ./brand-icons since lucide dropped them.
 */
export const ICONS = {
  search: Search,
  menu: Menu,
  close: X,
  lock: Lock,
  "map-pin": MapPin,
  phone: Phone,
  mail: Mail,
  "chevron-down": ChevronDown,
  baby: Baby,
  "graduation-cap": GraduationCap,
  "heart-handshake": HeartHandshake,
  theater: Theater,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  "arrow-left": ArrowLeft,
  printer: Printer,
  calendar: CalendarDays,
  "book-open": BookOpen,
  "file-text": FileText,
  accessibility: Accessibility,
  "hand-heart": HandHelping,
  briefcase: Briefcase,
  landmark: Landmark,
  "building-2": Building2,
  building: Building,
  eye: Eye,
  newspaper: Newspaper,
  "map-pinned": MapPinned,
  "help-circle": HelpCircle,
  check: Check,
  info: Info,
  clock: Clock,
  list: List,
  plus: Plus,
  "sliders-horizontal": SlidersHorizontal,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof ICONS;
