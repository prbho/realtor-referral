import { ImageResponse } from "next/og";

export const alt = "Regal PDC Realtor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #071b38, #0b3264)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: 96,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 42, opacity: 0.8 }}>
          REGAL PDC
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 24 }}>
          Realtor Network
        </div>
        <div style={{ display: "flex", fontSize: 36, marginTop: 28, opacity: 0.9 }}>
          Build your network. Grow your career.
        </div>
      </div>
    ),
    size
  );
}
