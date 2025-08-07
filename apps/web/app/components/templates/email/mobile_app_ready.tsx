import React from "react";

export default function MobileAppReadyEmail({ body }: { body: any }) {
  const { data } = body;
  if (!data?.apps || !data?.brand || !data?.user) return null;

  const apps = data.apps;
  const brand = data.brand;
  const user = data.user;

  const getDownloadButton = (url: string, type: string) => {
    const buttonText =
      type === "apk"
        ? "Download Android APK"
        : type === "aab"
        ? "Download Android Bundle"
        : type === "ios"
        ? "Download iOS App"
        : `Download ${type.toUpperCase()}`;

    return (
      <div style={{ marginBottom: "16px" }}>
        <a
          href={url}
          style={{
            display: "inline-block",
            backgroundColor: type === "ios" ? "#000000" : "#4CAF50",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          {buttonText}
        </a>
      </div>
    );
  };

  const renderAppDownloads = () => {
    const downloadLinks = [];

    if (apps.apk?.publicUrl) {
      downloadLinks.push(
        <div key="apk" style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#333", marginBottom: "8px" }}>Android APK</h3>
          <p style={{ color: "#666", marginBottom: "12px" }}>
            Direct installation file for Android devices
          </p>
          {getDownloadButton(apps.apk.publicUrl, "apk")}
          <p style={{ fontSize: "13px", color: "#888" }}>Built on: {apps.apk.buildTime}</p>
        </div>
      );
    }

    if (apps.aab?.publicUrl) {
      downloadLinks.push(
        <div key="aab" style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#333", marginBottom: "8px" }}>Android App Bundle</h3>
          <p style={{ color: "#666", marginBottom: "12px" }}>For submission to Google Play Store</p>
          {getDownloadButton(apps.aab.publicUrl, "aab")}
          <p style={{ fontSize: "13px", color: "#888" }}>Built on: {apps.aab.buildTime}</p>
        </div>
      );
    }

    if (apps.ios?.publicUrl) {
      downloadLinks.push(
        <div key="ios" style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#333", marginBottom: "8px" }}>iOS App</h3>
          <p style={{ color: "#666", marginBottom: "12px" }}>For installation on Apple devices</p>
          {getDownloadButton(apps.ios.publicUrl, "ios")}
          <p style={{ fontSize: "13px", color: "#888" }}>Built on: {apps.ios.buildTime}</p>
        </div>
      );
    }

    return downloadLinks;
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1a202c", textAlign: "center" }}>
          Your {brand.name} Mobile App Is Ready! 🎉
        </h1>
      </div>

      <p style={{ color: "#718096", marginBottom: "20px", fontSize: "16px" }}>
        Hello {user.name || user.email},
      </p>

      <p style={{ color: "#718096", marginBottom: "20px", fontSize: "16px" }}>
        Great news! Your mobile application for <strong>{brand.name}</strong> has been successfully
        built and is ready for download. You can access your app files using the links below:
      </p>

      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        {renderAppDownloads()}
      </div>

      <div style={{ marginTop: "32px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
        <h3 style={{ color: "#333", marginBottom: "12px" }}>What&apos;s Next?</h3>
        <ul style={{ color: "#718096", paddingLeft: "20px" }}>
          <li style={{ marginBottom: "8px" }}>For Android APK: Install directly on your device</li>
          <li style={{ marginBottom: "8px" }}>
            For Android Bundle (AAB): Submit to Google Play Store
          </li>
          <li style={{ marginBottom: "8px" }}>
            For iOS: Follow Apple&apos;s deployment guidelines
          </li>
        </ul>
      </div>

      <p style={{ color: "#718096", marginTop: "24px", fontSize: "16px" }}>
        To enable your users to access your app, please ensure you update the download links (either
        direct link or App Store Link) on the app download section of your parent platform.
      </p>

      <p style={{ color: "#718096", marginTop: "24px", fontSize: "16px" }}>
        If you have any questions or need assistance with your app, please don&apos;t hesitate to
        contact our support team.
      </p>

      <div
        style={{
          marginTop: "32px",
          borderTop: "1px solid #e2e8f0",
          paddingTop: "20px",
          textAlign: "center",
          color: "#a0aec0",
          fontSize: "14px",
        }}
      ></div>
    </div>
  );
}
