"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#F1EBDA",
          color: "#241F19",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>HarvestIQ hit a problem</h1>
          <p style={{ fontSize: 14, color: "#5B5544", lineHeight: 1.5, marginBottom: 20 }}>
            {error?.message?.trim() ||
              "The app failed to load. Please try again. Your browser-saved data is usually still available after a refresh."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#1F2E1A",
              color: "#F1EBDA",
              border: "none",
              borderRadius: 7,
              padding: "11px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload app
          </button>
        </div>
      </body>
    </html>
  );
}
