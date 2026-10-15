import type { SVGProps } from "react";

import { icons, type IconName } from "./icons";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  size?: number;
  label?: string;
}

// An outline icon, hidden from screen readers unless it has a label
const Icon = ({ name, size = 18, label, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={label ? undefined : true}
    role={label ? "img" : undefined}
    aria-label={label}
    focusable="false"
    {...props}
  >
    {icons[name].map((path) => (
      <path key={path} d={path} />
    ))}
  </svg>
);

export default Icon;
