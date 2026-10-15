import { ImageResponse } from "next/og";

import { OgLogo } from "@/features/seo/og/components";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home screen icon for iOS, drawn from the logo
const AppleIcon = () => new ImageResponse(<OgLogo size={180} />, size);

export default AppleIcon;
