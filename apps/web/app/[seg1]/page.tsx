import View from '@/app/views/view';
import { Metadata } from 'next';
import { buildDefaultMetadata, pageView } from '@/app/views/views_helper';

export async function generateMetadata(props: {
  params: Promise<{ seg1: string; slug: string }>;
}): Promise<Metadata> {
  try {
    const params: any = await props.params;

    let finalParams = [params.seg1];
    let paramSource;
    let plateForm = 'web';
    let table = '';
    let renderPage;
    let conditions: any[] = [];

    const { brand, seg1, data, rendererData, pageEssentials } = await pageView({
      params: [params],
      table,
      renderPage,
      conditions,
      slug: params.seg1,
    });

    const metadata = await buildDefaultMetadata({ data, brand, seg1 });

    return metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Page',
      description: 'Welcome to our website',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function seg1(props: { params: Promise<{ seg1: string }> }) {
  const params = await props.params;
  return <View params={[params.seg1]} paramSource={1} />;
}
