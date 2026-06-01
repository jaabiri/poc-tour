import { ICONS, type IconName } from "@/lib/icons";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/** Resolves a string icon name (from JSON data) to its icon component. */
export function Icon({ name, size, className }: IconProps) {
  const IconComponent = ICONS[name];
  return <IconComponent size={size} className={className} />;
}
