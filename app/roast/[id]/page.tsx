"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        width: "100%",
        padding: "1rem",
        backgroundColor: "#CCFF00",
        color: "black",
        fontWeight: "bold",
        textTransform: "uppercase",
        border: "none",
        cursor: "pointer",
        fontSize: "1rem",
        marginTop: "1rem",
      }}
    >
      {copied ? "✅ Copied!" : "📋 Copy to Clipboard"}
    </button>
  );
}

function ShareButton({
  worstScore,
  roast,
  id,
}: {
  worstScore: number;
  roast: string;
  id: string;
}) {
  const handleShare = () => {
    const url = `${window.location.origin}/roast/${id}`;
    const hook = roast.split(".")[0].slice(0, 120);
    const text = `I got roasted by AI 💀\nMy LinkedIn score: ${worstScore}/100\n\n"${hook}"\n\nThink yours is better? Try it 👇\n${url}`;
    const encoded = encodeURIComponent(text);
    const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}&summary=${encoded}`;
    const tab = window.open(linkedIn, "_blank");
    if (!tab) {
      navigator.clipboard.writeText(text);
      alert("Post copied — paste on LinkedIn 🚀");
    }
  };
  return (
    <button
      onClick={handleShare}
      style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "transparent",
        color: "#CCFF00",
        border: "2px solid #CCFF00",
        fontWeight: "bold",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      Share on LinkedIn 🚀
    </button>
  );
}

export default function RoastPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!id) return;

    let attempts = 0;
    const maxAttempts = 30;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;

      try {
        const res = await fetch(`/api/v1/roasts/${id}`);

        if (res.status === 404) {
          setError("Roast not found. Go make one.");
          setLoading(false);
          return;
        }

        const json = await res.json();
        const session = json.data;

        if (session.status === "completed") {
          if (!stopped) {
            setData(session);
            setLoading(false);
          }
          return;
        }

        if (session.status === "error") {
          if (!stopped) {
            setError("The AI choked on your cringe. Try again.");
            setLoading(false);
          }
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          if (!stopped) {
            setError(
              "AI is taking too long. Your profile must be really bad. Try again."
            );
            setLoading(false);
          }
          return;
        }

        if (!stopped) {
          setTimeout(poll, 1000);
        }
      } catch {
        if (!stopped) {
          setError("Connection failed. Try again.");
          setLoading(false);
        }
      }
    };

    poll();

    return () => {
      stopped = true;
    };
  }, [id]);

  if (loading)
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Space Mono, monospace",
        }}
      >
        <h1 style={{ color: "#CCFF00", fontSize: "1.5rem" }}>
          Analyzing your cringe{dots}
        </h1>
        <p style={{ color: "#888", marginTop: "1rem", fontSize: "0.875rem" }}>
          This takes 10-20 seconds. Don't close this tab.
        </p>
      </main>
    );

  if (error)
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Space Grotesk, sans-serif",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            color: "#FF2D2D",
            fontSize: "1.5rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          {error}
        </h1>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "1rem 2rem",
            backgroundColor: "#CCFF00",
            color: "black",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Try Again
        </button>
      </main>
    );

  const { scores, roast, rewrite } = data as {
    scores: Record<string, { value: number; label: string; insight: string }>;
    roast: string;
    rewrite: string;
  };

  const worstScore = Math.min(
    scores.recruiterAppeal.value,
    scores.keywordDensity.value,
    scores.authenticity.value,
    100 - scores.cringeFactor.value
  );

  const scoreEntries = [
    { key: "recruiterAppeal", label: "Recruiter Appeal" },
    { key: "keywordDensity", label: "Keyword Density" },
    { key: "authenticity", label: "Authenticity" },
    { key: "cringeFactor", label: "Cringe Factor" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#f5f5f5",
        fontFamily: "Space Grotesk, sans-serif",
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          marginBottom: "2rem",
          borderBottom: "2px solid #f5f5f5",
          paddingBottom: "1rem",
        }}
      >
        <h1
          style={{
            color: "#CCFF00",
            fontFamily: "Space Mono, monospace",
            fontSize: "1.5rem",
            margin: 0,
          }}
        >
          ROAST RESULTS
        </h1>
        <p
          style={{
            color: "#888",
            fontSize: "0.75rem",
            fontFamily: "Space Mono, monospace",
            margin: "0.5rem 0 0",
          }}
        >
          ID: {id}
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontFamily: "Space Mono, monospace",
            textTransform: "uppercase",
            fontSize: "1rem",
            color: "#CCFF00",
            marginBottom: "1rem",
          }}
        >
          YOUR SCORES
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
          }}
        >
          {scoreEntries.map(({ key, label }) => {
            const s = scores[key];
            return (
              <div
                key={key}
                style={{
                  border: "2px solid #f5f5f5",
                  padding: "1rem",
                  backgroundColor: "#0a0a0a",
                }}
              >
                <p
                  style={{
                    fontFamily: "Space Mono, monospace",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    color: "#888",
                    margin: "0 0 0.5rem",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#CCFF00",
                    margin: "0 0 0.25rem",
                  }}
                >
                  {s.value}/100
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    margin: "0 0 0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    color: "#888",
                    fontSize: "0.8rem",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {s.insight}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontFamily: "Space Mono, monospace",
            textTransform: "uppercase",
            fontSize: "1rem",
            color: "#CCFF00",
            marginBottom: "1rem",
          }}
        >
          THE ROAST 🔥
        </h2>
        <div style={{ border: "2px solid #f5f5f5", padding: "1.5rem" }}>
          <p style={{ lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
            {roast}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontFamily: "Space Mono, monospace",
            textTransform: "uppercase",
            fontSize: "1rem",
            color: "#CCFF00",
            marginBottom: "1rem",
          }}
        >
          YOUR REWRITE ✨
        </h2>
        <div style={{ border: "2px solid #f5f5f5", padding: "1.5rem" }}>
          <p style={{ lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
            {rewrite}
          </p>
          <CopyButton text={rewrite} />
        </div>
      </section>

      <section
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "3rem",
        }}
      >
        <ShareButton worstScore={worstScore} roast={roast} id={id} />
        <button
          onClick={() => {
            localStorage.removeItem("lr_headline");
            localStorage.removeItem("lr_about");
            localStorage.removeItem("lr_experience");
            router.push("/");
          }}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "transparent",
            color: "#f5f5f5",
            border: "2px solid #f5f5f5",
            fontWeight: "bold",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Roast Another Profile 👇
        </button>
      </section>
    </main>
  );
}
