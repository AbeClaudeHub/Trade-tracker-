import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Niyyah OS — Understand why you keep sabotaging yourself.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social share card, rendered with next/og (satori-safe styling). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#F4F1EA",
          position: "relative",
        }}
      >
        {/* decorative rings */}
        <div style={{ position: "absolute", top: -220, right: -160, width: 620, height: 620, borderRadius: 999, border: "2px solid rgba(46,74,64,0.12)" }} />
        <div style={{ position: "absolute", top: -120, right: -60, width: 420, height: 420, borderRadius: 999, border: "2px solid rgba(156,124,77,0.16)" }} />

        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 999,
              border: "2px solid #2E4A40",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 13, height: 13, borderRadius: 999, backgroundColor: "#2E4A40" }} />
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#1B1A16" }}>
            Niyyah&nbsp;<span style={{ color: "#9A958A" }}>OS</span>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 25, color: "#9C7C4D", letterSpacing: 4 }}>
            A BEHAVIORAL DIAGNOSIS FOR TRADERS
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 78, lineHeight: 1.02, color: "#1B1A16", maxWidth: 940, letterSpacing: -2 }}>
            Understand why you keep sabotaging yourself.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 27, color: "#6C685F", maxWidth: 1000 }}>
          Your archetype · your blind spots · the nafs beneath your mistakes · a 30-day plan.
        </div>
      </div>
    ),
    { ...size },
  );
}
