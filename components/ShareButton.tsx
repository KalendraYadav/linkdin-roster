"use client";

import React from "react";

type ShareButtonProps = {
  id: string;
  worstScore: number;
};

export default function ShareButton({ id, worstScore }: ShareButtonProps) {
  const handleShare = () => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const roastUrl = `${appUrl}/roast/${id}`;
    const text = encodeURIComponent(
      `I got roasted by AI 💀\nMy LinkedIn score: ${worstScore}/100\n\n"Your headline reads like a fortune cookie had a LinkedIn phase."\n\nThink yours is better? Try it 👇\n${roastUrl}`
    );
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      roastUrl
    )}&summary=${text}`;

    const newTab = window.open(linkedInUrl, "_blank");

    if (!newTab) {
      navigator.clipboard.writeText(
        `I got roasted by AI 💀\nMy LinkedIn score: ${worstScore}/100\n\n"Your headline reads like a fortune cookie had a LinkedIn phase."\n\nThink yours is better? Try it 👇\n${roastUrl}`
      );
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
