
"use client";

export default function GlobalError({
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
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f8f5",
          fontFamily: "Arial, sans-serif",
          padding: "24px",
        }}
      >
        <main
          style={{
            maxWidth: "520px",
            width: "100%",
            padding: "40px 28px",
            background: "#ffffff",
            border: "1px solid #e5ebe5",
            borderRadius: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#17251d", fontSize: "30px" }}>
            MentorLagbe
          </h1>

          <h2 style={{ color: "#b42318" }}>
            Application Error
          </h2>

          <p style={{ color: "#66736a", lineHeight: 1.8 }}>
            Something unexpected happened. Please try again
            or return to the homepage.
          </p>

          <button
            onClick={reset}
            style={{
              marginTop: "20px",
              padding: "14px 24px",
              border: 0,
              borderRadius: "12px",
              background: "#075c3d",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>

          <div style={{ marginTop: "16px" }}>
            <a
              href="/"
              style={{
                color: "#075c3d",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Back to Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
