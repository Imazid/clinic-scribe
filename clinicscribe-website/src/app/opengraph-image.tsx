import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Miraa — Medical Insights, Record, Automation and Assistance";
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
          background: "linear-gradient(135deg, #001736 0%, #002B5B 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                fill="white"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Miraa
          </span>
        </div>

        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase" as const,
            color: "#a1efff",
            marginBottom: "24px",
          }}
        >
          Clinical Workflow Copilot
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center" as const,
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Prepare the visit. Capture the consult. Verify the note. Close the
          loop.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          miraahealth.com
        </div>
      </div>
    ),
    { ...size }
  );
}
