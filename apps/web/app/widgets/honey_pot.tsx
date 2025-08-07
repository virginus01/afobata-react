import React from "react";

export default function HoneyPot({ onChange }: { onChange: () => void }) {
  return (
    <div
      style={{
        opacity: 0,
        visibility: "hidden",
        position: "absolute",
        width: "100%",
        height: "10px",
      }}
    >
      <input
        type="text"
        id="honeypot"
        name="honeypot"
        onChange={onChange}
        autoComplete="off"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
