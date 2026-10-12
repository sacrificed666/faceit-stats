import { serializeJsonLd } from "@/features/seo/model/seo";

interface JsonLdProps {
  data: Record<string, unknown>;
}

// Structured data in a script tag
const JsonLd = ({ data }: JsonLdProps) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
);

export default JsonLd;
