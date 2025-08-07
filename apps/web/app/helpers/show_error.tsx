'use server';
import { headers } from 'next/headers';
export async function show_error(msg: string, error: any, critical = false): Promise<any> {
  const headersList = await headers();
  const requestUrl = headersList.get('x-url') || '';
  console.error(
    '\x1b[31m%s\x1b[0m',
    ` 🛑 ${msg} at ${requestUrl}: ${error.toString()}` || 'unknown error',
  );
  if (critical) {
    console.trace('Stack trace:');
    throw new Error(msg || 'unknown error');
  }
  debugger;
  return { status: false, msg };
}
