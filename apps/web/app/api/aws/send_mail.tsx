'use server';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { cookies } from 'next/headers'; // Import the cookies function for setting and reading cookies
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';

const sesClient = new SESClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const EMAIL_SEND_INTERVAL = 60 * 1000; // 60 seconds in milliseconds

export async function sendEmailWithSES({
  to,
  from,
  subject,
  body,
}: {
  to: string[];
  from: string;
  subject: string;
  body: string;
}) {
  try {
    const cookieStore = await cookies();

    // Get the last sent timestamp from cookies
    const lastSent = cookieStore.get('lastEmailSent');
    const currentTime = Date.now();

    if (lastSent && currentTime - parseInt(lastSent.value) < EMAIL_SEND_INTERVAL) {
      return invalid_response(
        `Please wait ${Math.ceil(
          (EMAIL_SEND_INTERVAL - (currentTime - parseInt(lastSent.value))) / 1000,
        )} seconds before sending another email`,
        200,
      );
    }

    const toAddresses: any = to;

    if (!Array.isArray(toAddresses) || toAddresses.length === 0 || !subject || !body || !from) {
      return invalid_response('All email fields are required', 200);
    }

    const toAddress = toAddresses.shift();
    const bccAddresses = toAddresses.length > 0 ? toAddresses : undefined;

    const params = {
      Destination: {
        ToAddresses: [toAddress],
        BccAddresses: bccAddresses,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: { Data: subject },
      },
      // Using the specified sender name and email
      Source: from,
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    // Set a new cookie for last email sent timestamp
    cookieStore.set('lastEmailSent', currentTime.toString(), {
      httpOnly: process.env.NODE_ENV === 'production', // Prevent client-side access
      maxAge: 60, // Cookie expires in 30 seconds
      path: '/', // Cookie is valid for the entire site
    });

    return api_response({
      success: true,
      data: { messageId: response.MessageId },
    });
  } catch (error: any) {
    console.error(`Error sending email: ${error.stack || error}`);
    return invalid_response(`Error sending email`, 500);
  }
}
