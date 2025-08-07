import React from "react";

interface PinTempProps {
  body: {
    data: {
      brandName?: string;
      code: string;
    };
  };
}

export default function PinTemp({ body }: PinTempProps) {
  const { data } = body;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{ fontSize: "22px", fontWeight: "bold", color: "#1a202c", marginBottom: "16px" }}
        >
          Authentication Pin for {data.brandName || "Our Platform"}
        </h2>
        <p style={{ fontSize: "16px", color: "#4a5568", marginBottom: "24px" }}>
          Use this pin for verification:
        </p>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#2d3748",
            padding: "12px 24px",
            backgroundColor: "#edf2f7",
            display: "inline-block",
            borderRadius: "4px",
          }}
        >
          {data.code}
        </div>
        <p style={{ fontSize: "14px", color: "#718096", marginTop: "24px" }}>
          If you did not request this, please ignore this email.
        </p>
      </div>
    </div>
  );
}
