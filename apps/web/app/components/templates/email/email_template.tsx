import React from "react";

const EmailTemplate = ({
  children,
  title,
  siteInfo,
}: {
  children: any;
  title: string;
  siteInfo: BrandType;
}) => {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body style={{ backgroundColor: "#f7fafc", padding: "10px" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "14px",
            maxWidth: "600px",
            margin: "0 auto",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div>
            {children}{" "}
            <p>
              &copy; {new Date().getFullYear()} {siteInfo?.name ?? ""}. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default EmailTemplate;
