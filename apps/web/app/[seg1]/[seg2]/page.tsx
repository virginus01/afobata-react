import View from "@/app/views/view";

export default async function Slug(props: { params: Promise<{ seg1: string; slug: string }> }) {
  const params = await props.params;

  return <View params={[params.seg1, params.slug]} paramSource={"2"} />;
}
