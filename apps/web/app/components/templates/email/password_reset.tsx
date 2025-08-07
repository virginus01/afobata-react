import React from 'react';
import EmailTemplate from '@/app/components/templates/email/email_template';

export function PasswordResetEmail({
  siteInfo,
  link,
  user,
}: {
  siteInfo?: BrandType;
  link?: string;
  user?: UserTypes;
}) {
  return (
    <EmailTemplate title={''} siteInfo={{}}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
        Attention! on {siteInfo?.name || 'Our Plateform'}
      </h1>
      <p style={{ color: '#718096', marginTop: '16px' }}>
        {
          'You have initiated to change your password, follow the link below to complete this. If you did not initiate this, please do not send the link to anyone'
        }
      </p>
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
        Reset Now
      </a>
      <br />
      <br /> <br />
      <p>
        Here is the plain link: <a href={link}>{link}</a>{' '}
      </p>
    </EmailTemplate>
  );
}
