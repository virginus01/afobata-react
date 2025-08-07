import { NextRequest } from 'next/server';
export async function extractStringField(request: NextRequest, param: string) {
  try {
    const { searchParams } = new URL(request.url);
    let p = searchParams.get(param) ?? '';
    return p;
  } catch (error) {
    console.error(error);
    return '';
  }
}
