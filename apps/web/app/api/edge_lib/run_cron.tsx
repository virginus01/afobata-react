import { baseUrl } from '@/app/helpers/baseUrl';

export default async function runCron({ target }: { target: string }) {
  const finalUrl = await baseUrl(`/api/a/node/run_cron_job?target=${target}`);
  await fetch(finalUrl);
  return { status: true, msg: 'started', data: {} };
}
