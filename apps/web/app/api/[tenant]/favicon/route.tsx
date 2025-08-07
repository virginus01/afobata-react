import { isNull } from '@/app/helpers/isNull';
import { ImageResponse } from 'next/og';

export async function GET() {
  const brand: BrandType = (await fetchCachedBrand()) || {};

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          color: 'white',
          background: 'black',
          width: '100%',
          height: '100%',
          fontWeight: 'bolder',
          padding: '5px 5px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex', // Center the content
          borderRadius: '50%', // Make the image circular
        }}
      >
        {getFirstLetterUpperCase(brand.slug || 'a')}
      </div>
    ),
    {
      width: 32,
      height: 32,
    },
  );
}

function getFirstLetterUpperCase(str: string) {
  if (isNull(str)) return str;
  if (!str || typeof str !== 'string') return 'A';
  return str.charAt(0).toUpperCase();
}
function fetchCachedBrand(): BrandType | PromiseLike<BrandType> {
  throw new Error('Function not implemented.');
}
