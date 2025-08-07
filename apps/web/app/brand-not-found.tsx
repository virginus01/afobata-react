"use client";
import { useState } from "react";

const BrandNotFound = () => {
  const [brandId, setBrandId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandId) {
      document.cookie = `brandId=${brandId}; path=/;`;
      alert("Brand ID saved as a cookie!");
      setBrandId("");
    } else {
      alert("Please enter a Brand ID.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Brand Not Found</h1>

      <p>The brand you are looking for does not exist.</p>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter Brand ID"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "300px",
            marginRight: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default BrandNotFound;
