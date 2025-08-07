import { Button } from '@/components/ui/button';
import React from 'react';
import Link from 'next/link';
import { route_public_page } from '@/app/routes/page_routes';

export default function AccessDenied({
  link,
  subject,
  info,
  buttonText,
}: {
  link?: string;
  subject?: string;
  info?: string;
  buttonText?: string;
}) {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center space-y-10">
      <div className="font-bold">{subject ?? 'Access Denied'}</div>
      <p>{info ?? 'Access Denied'}</p>
      <Link href={link ?? route_public_page({ paths: ['login'] })}>
        <Button>{buttonText ?? 'Login'}</Button>
      </Link>
    </div>
  );
}
