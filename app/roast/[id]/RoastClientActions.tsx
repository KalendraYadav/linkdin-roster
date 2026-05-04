"use client";

import React from "react";
import { useRouter } from "next/navigation";

type CopyButtonProps = {
  text: string;
};


export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
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
      }}
    >
      {copied ? "✅ Copied!" : "📋 Copy to Clipboard"}
    </button>
  );
}

export function RoastAnotherButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "transparent",
        color: "#CCFF00",
        border: "2px solid white",
        fontWeight: "bold",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      Roast Another Profile 👇
    </button>
  );
}

