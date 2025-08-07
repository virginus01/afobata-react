'use client';
import React from 'react';
import { SectionOption } from '@/app/types/section';
import { isNull } from '@/app/helpers/isNull';
import { sanitizeHTML } from '@/app/helpers/html_helper';

const PostBody = ({ data }: { data: PostTypes }) => {
  if (isNull(data)) {
    return <div>No blog data</div>;
  }

  return (
    <div className="w-full h-full">
      <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(data.body ?? '') }} />
    </div>
  );
};

export default PostBody;
