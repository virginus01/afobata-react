import React from 'react';
import EmailTemplate from '@/app/components/templates/email/email_template';

export function VerifyEmail({
  siteInfo,
  link,
  user,
  code,
}: {
  siteInfo?: BrandType;
  link?: string;
  user?: UserTypes;
  code?: number;
}) {
  return (
    <EmailTemplate title={''} siteInfo={siteInfo ?? {}}>
      {' '}
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
        Welcome to {siteInfo?.name || 'Our Plateform'} {user?.firstName || 'sir/ma'}!
      </h1>
      <p style={{ color: '#718096', marginTop: '16px' }}>
        {"We're very happy to have you onbord. One more thing, you need to verify your email"}
      </p>
      <h2>Verifcation Code: {code}</h2>
      <a
        href={link}
        style={{
          display: 'inline-block',
          backgroundColor: '#4299e1',
          color: '#ffffff',
          padding: '8px 24px',
          borderRadius: '9999px',
          marginTop: '24px',
          textDecoration: 'none',
        }}
      >
        Verify Now
      </a>
      <br />
      <br /> <br />
      <p>
        Here is the plain link: <a href={link}>{link}</a>{' '}
      </p>
    </EmailTemplate>
  );
}
