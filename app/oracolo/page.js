"use client";

import { useState } from "react";

export default function OracoloPage() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function askOracle() {
    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    const res = await fetch("/api/oracolo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    setReply(data.reply || data.error || "L'Oracolo resta in silenzio.");
    setLoading(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      padding: "40px",
      background: "radial-gradient(circle at top, #3b0764, #05010a 55%)",
      color: "#f5e8ff",
      fontFamily: "serif"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        border: "1px solid rgba(216,180,254,0.4)",
        borderRadius: "24px",
        padding: "32px",
        background: "rgba(10, 5, 20, 0.75)",
        boxShadow: "0 0 40px rgba(147,51,234,0.25)"
      }}>
        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>
          Oracolo della Casata Valerius
        </h1>

        <p style={{ opacity: 0.8, marginBottom: "28px" }}>
          Poni una domanda. Le ombre risponderanno, se lo riterranno opportuno.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Scrivi la tua domanda..."
          rows={5}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            border: "1px solid rgba(216,180,254,0.4)",
            background: "#12051f",
            color: "#f5e8ff",
            fontSize: "16px",
            resize: "vertical"
          }}
        />

        <button
          onClick={askOracle}
          disabled={loading}
          style={{
            marginTop: "16px",
            padding: "14px 24px",
            borderRadius: "999px",
            border: "none",
            background: loading ? "#6b21a8" : "#9333ea",
            color: "white",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "L'Oracolo scruta..." : "Consulta l'Oracolo"}
        </button>

        {reply && (
          <section style={{
            marginTop: "32px",
            padding: "24px",
            borderRadius: "18px",
            background: "rgba(88,28,135,0.25)",
            border: "1px solid rgba(216,180,254,0.25)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.7
          }}>
            {reply}
          </section>
        )}
      </div>
    </main>
  );
}
