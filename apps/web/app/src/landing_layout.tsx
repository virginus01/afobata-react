import Head from "next/head";
import React from "react";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://shuffle.dev/vendor/tailwind-flex/css/tailwind.min.css"
      />

      <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </>
  );
}
