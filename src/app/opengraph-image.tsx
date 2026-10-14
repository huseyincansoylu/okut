import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { dict } from "@/lib/dictionary";

// Link preview for every page (LinkedIn, WhatsApp, Slack...).
export const size = { width: 1200, height: 630 };
const TEA = "#8C2413";
const TINT = "#F6E8DF";
const INK = "#2A1610";

export const alt = dict.meta.imageAlt;
export const contentType = "image/png";

// Read once at module load (as in the Next.js docs), not per request.
const font = (name: string) => readFile(join(process.cwd(), "assets/fonts", name));
const fonts = [
  { name: "Bricolage", data: await font("bricolage-grotesque-latin-500.woff"), weight: 500 as const },
  { name: "Bricolage", data: await font("bricolage-grotesque-latin-ext-500.woff"), weight: 500 as const },
  { name: "Bricolage", data: await font("bricolage-grotesque-latin-800.woff"), weight: 800 as const },
  { name: "Bricolage", data: await font("bricolage-grotesque-latin-ext-800.woff"), weight: 800 as const },
];

/** The QR finder mark, drawn with boxes since the renderer has no SVG paths here. */
function Mark({ px, color, hole }: { px: number; color: string; hole: string }) {
  const u = px / 70;
  return (
    <div style={{ display: "flex", width: px, height: px, borderRadius: 16 * u, background: color, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", width: 50 * u, height: 50 * u, borderRadius: 9 * u, background: hole, alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28 * u, height: 28 * u, borderRadius: 6 * u, background: color }} />
      </div>
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: TINT,
          color: INK,
          fontFamily: "Bricolage",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", fontSize: 120, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
          <div style={{ display: "flex", marginRight: 6, marginBottom: 6 }}>
            <Mark px={86} color={TEA} hole={TINT} />
          </div>
          kut
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, maxWidth: 960 }}>
            {dict.meta.tagline}
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, opacity: 0.75, maxWidth: 900 }}>{dict.landing.footerTagline}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 26, fontWeight: 500 }}>
          <div style={{ display: "flex", padding: "12px 22px", borderRadius: 999, background: TEA, color: "#fff" }}>
            okut.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
