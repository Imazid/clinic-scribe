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
          background: "linear-gradient(160deg, #1F1A14 0%, #3A2E22 100%)",
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
              background: "#E4EEF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 14v9a7 7 0 0 0 14 0v-9"
                stroke="#2F5A7A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M26 30v4a8 8 0 0 0 8 8h0a6 6 0 0 0 6-6v-2.5"
                stroke="#1F1A14"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="40" cy="33.5" r="3.5" fill="#1F1A14" />
              <circle cx="19" cy="14" r="1.8" fill="#2F5A7A" />
              <circle cx="33" cy="14" r="1.8" fill="#2F5A7A" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#FCF9F4",
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
            color: "#6FA1C2",
            marginBottom: "24px",
          }}
        >
          Clinical Workflow Copilot
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "rgba(252,249,244,0.85)",
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
            color: "rgba(252,249,244,0.5)",
          }}
        >
          miraahealth.com
        </div>
      </div>
    ),
    { ...size }
  );
}
