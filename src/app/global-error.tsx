"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 1.5rem", maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>SiteWatch</p>
        <h1 style={{ fontSize: 20, margin: "8px 0" }}>The application hit an unexpected error</h1>
        <p style={{ color: "#4b5563", fontSize: 14 }}>Reload to try again. If the problem persists, contact your administrator.</p>
        {error.digest ? <p style={{ fontFamily: "monospace", fontSize: 12, color: "#9ca3af" }}>ref {error.digest}</p> : null}
        <button
          onClick={() => reset()}
          style={{ marginTop: 16, padding: "8px 14px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
