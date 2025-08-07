import { api_response } from '@/helpers/api_response';
import { findMissingFields } from '@/helpers/findMissingFields';
import { modifyFieldValue } from '@/api/database/mongodb';

export async function server_credit_debit_points({ formData }: { formData: any }) {
  const { userId, brandId, action, value } = formData;
  const data = await creditDebitMille({ userId, brandId, action, value });
  return api_response({ data: data.data, status: data.status });
}

export async function creditDebitMille({
  userId,
  brandId,
  action,
  value,
}: {
  userId: string;
  brandId: string;
  action: 'credit' | 'debit';
  value: number;
}) {
  try {
    const missing = findMissingFields({
      userId,
      brandId,
      action,
      value,
    });

    if (missing) {
      console.error(missing, 'missing');
      return { data: {}, status: false, msg: `${missing}, "missing..."` };
    }

    if (action === 'credit') {
      await modifyFieldValue({
        collectionName: 'users',
        filter: { id: userId },
        fieldName: 'mille',
        value: parseFloat(String(value)),
        operation: 'increment',
      });
      await modifyFieldValue({
        collectionName: 'brands',
        filter: { id: brandId },
        fieldName: 'childrenMille',
        value: parseFloat(String(value)),
        operation: 'increment',
      });
    } else {
      await modifyFieldValue({
        collectionName: 'users',
        filter: { id: userId },
        fieldName: 'mille',
        value: parseFloat(String(value)),
        operation: 'decrement',
      });
      await modifyFieldValue({
        collectionName: 'brands',
        filter: { id: brandId },
        fieldName: 'childrenMille',
        value: parseFloat(String(value)),
        operation: 'decrement',
      });
    }

    return { data: {}, status: true };
  } catch (error) {
    return { data: {}, status: false };
  }
}
