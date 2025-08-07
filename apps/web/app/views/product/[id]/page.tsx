import View from '@/app/views/view';

export default async function PuchasedView(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <View
      conditions={[{ password: params.id }]}
      params={['purchased-view']}
      paramSource={'3'}
      seg1="purchased-view"
      renderPage="purchased-view"
      table="products"
    />
  );
}
