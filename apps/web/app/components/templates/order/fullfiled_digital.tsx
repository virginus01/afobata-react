import React from 'react';
import { getProductFullFilUrl } from '@/app/helpers/product';

export default function FullFiledDigital({ body }: { body: any }) {
  const { data } = body;
  if (!data?.product) return null;

  const product = data.product;
  const link = getProductFullFilUrl({
    product: data.product,
    order: data.order,
    brand: data.brand,
    user: data.user,
  });

  const downloadableLinks =
    product?.product_files?.map((file: any, index: number) => (
      <p key={index}>
        <a href={file.url} style={{ color: '#3182ce', textDecoration: 'underline' }}>
          Download {file.name || `File ${index + 1}`}
        </a>
      </p>
    )) || [];

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
        Thank You for Your Order on {data.brand?.name || 'Our Platform'}
      </h1>
      <p style={{ color: '#718096', marginTop: '16px' }}>
        We appreciate your patronage. Find the link(s) below to access your purchased
        product(s)/service(s):
      </p>
      <div style={{ marginTop: '24px' }}>
        <a
          href={link}
          style={{
            display: 'inline-block',
            backgroundColor: '#4299e1',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '9999px',
            textDecoration: 'none',
          }}
        >
          Access Product
        </a>
      </div>
      <br />
      {downloadableLinks.length > 0 && (
        <div>
          <h3 style={{ color: '#1a202c', marginBottom: '10px' }}>Downloadable Files:</h3>
          {downloadableLinks}
        </div>
      )}
      <br />
    </div>
  );
}
