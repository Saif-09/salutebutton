import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SaluteButton - Salute the Greats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF8E1",
          position: "relative",
        }}
      >
        {/* Scattered emojis background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.12,
            fontSize: 60,
            gap: 40,
            padding: 40,
          }}
        >
          {"🫡🎖️⭐🏅👏🙌🫡🎖️⭐🏅👏🙌🫡🎖️⭐🏅👏🙌🫡🎖️⭐🏅"
            .split("")
            .filter((c) => c.trim())
            .map((emoji, i) => (
              <span key={i}>{emoji}</span>
            ))}
        </div>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            zIndex: 1,
          }}
        >
          {/* Salute emoji as logo */}
          <div style={{ fontSize: 100, display: "flex" }}>🫡</div>

          {/* Site name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#F43F5E",
              letterSpacing: "-2px",
              display: "flex",
            }}
          >
            SaluteButton
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 30,
              color: "#555",
              maxWidth: 700,
              textAlign: "center",
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            Salute the greatest celebrities and historical figures
          </div>

          {/* CTA pill */}
          <div
            style={{
              marginTop: 20,
              backgroundColor: "#F43F5E",
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
              padding: "14px 40px",
              borderRadius: 50,
              display: "flex",
            }}
          >
            Cast your vote now
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
