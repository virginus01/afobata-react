import View from '@/app/views/view';
import { Metadata } from 'next';
import { buildDefaultMetadata, pageView } from '@/app/views/views_helper';

export async function generateMetadata(props: {
  params: Promise<{ seg1: string; slug: string }>;
}): Promise<Metadata> {
  try {
    const params = await props.params;

    const { brand, seg1, data } = await pageView({
      params: ['home'],
      table: '',
      renderPage: undefined,
      conditions: [],
      slug: 'home',
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

async function Home() {
  return <View params={['home']} />;
}

export default Home;
