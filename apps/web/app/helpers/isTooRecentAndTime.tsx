import { addHours, formatDistanceToNowStrict, isBefore, parseISO, subSeconds } from 'date-fns';
import { isNull } from '@/app/helpers/isNull';
import { convertDateTime } from '@/app/helpers/convertDateTime';

export const isTooRecent = (time: string, interval = 86400) => {
  if (isNull(time)) return false;

  const buildDate = parseISO(time);
  return isBefore(subSeconds(convertDateTime(), interval), buildDate);
};

export const getRemainingTime = (time: string, interval = 24): string => {
  const buildDate = parseISO(time);
  const expiry = addHours(buildDate, interval);
  return formatDistanceToNowStrict(expiry, { addSuffix: false });
};
