import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
          color: "white",
          fontSize: 110,
          fontWeight: 700,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        T
      </div>
    ),
    { ...size },
  );
}
