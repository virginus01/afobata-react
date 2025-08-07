'use client';
import React, { useEffect, useState } from 'react';
import { isNull } from '@/app/helpers/isNull';
import { footer_report_and_create } from '@/app/widgets/widgets';
import { notFound } from 'next/navigation';
import { api_get_product } from '@/app/src/constants';
import { modHeaders } from '@/app/helpers/modHeaders';
import { useBaseContext } from '@/app/contexts/base_context';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';

export function LandPageView(data: any) {
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { siteInfo } = useGlobalEssential();

  useEffect(() => {
    async function getLanding() {
      try {
        const url = await api_get_product({
          id: data.segs.seg2,
          subBase: siteInfo.slug ?? '',
        });
        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders(),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const res = await response.json();

        if (!isNull(res.data)) {
          setPostData(res.data);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    getLanding();
  }, [data.segs.seg2, siteInfo.slug]);

  if (loading) {
    return;
  }

  if (error || !postData) {
    return notFound();
  }

  let body = `${postData.body.replace(/flex-ui-assets\//g, 'https://shuffle.dev/flex-ui-assets/')}`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(body, 'text/html');
  const links = doc.querySelectorAll('a');

  links.forEach((link) => {
    link.setAttribute('rel', 'nofollow');
  });

  body = doc.documentElement.outerHTML;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      {footer_report_and_create({ username: 'solace' }, 'landing', postData.id)}
    </>
  );
}
