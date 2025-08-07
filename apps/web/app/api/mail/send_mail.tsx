import { renderEmailContent } from '@/app/mail/actions';
import { sendEmailWithSES } from '@/api/aws/send_mail';
import { api_response } from '@/app/helpers/api_response';
import { invalid_response } from '@/app/helpers/invalid_response';
import { findMissingFields } from '@/app/helpers/findMissingFields';

export async function sendMail({
  data,
  siteInfo,
}: {
  data: any;
  siteInfo?: BrandType;
}): Promise<any> {
  const { subject, from, to } = data;

  let missing = findMissingFields({
    to,
    subject,
    from,
    body: data.body,
  });

  if (missing) {
    return {
      success: false,
      msg: `${missing} required and are missing`,
    };
  }

  const inlinedHtmlContent = await renderEmailContent(data);
  const body = inlinedHtmlContent;

  try {
    const res = await sendEmailWithSES({ to, from, subject, body });
    const data = await res.json();

    if (data.status) {
      return {
        success: true,
        msg: to.length > 1 ? `${to.length} Emails sent successfully` : 'Email sent successfully',
      };
    } else {
      console.error('Email error:', data.msg);
      return {
        success: false,
        msg: 'error sending message',
      };
    }
  } catch (e: any) {
    console.error('Email error:', e);
    return {
      success: false,
      msg: 'error sending message',
    };
  }
}

export async function server_send_mail({
  formData,
  siteInfo,
}: {
  formData: any;
  siteInfo?: BrandType;
}): Promise<any> {
  try {
    const res = await sendMail({ data: formData });

    if (res.status) {
      return api_response({ data: res, msg: 'successful', status: true });
    } else {
      return api_response({ data: res, msg: res.msg, status: true });
    }
  } catch (e: any) {
    console.error('Email error:', e);
    return invalid_response('error sending message');
  }
}

export async function validateEmail(email: string): Promise<boolean> {
  const NEVERBOUNCE_API_KEY = process.env.NEVERBOUNCE_API_KEY;

  try {
    const response = await fetch('https://api.neverbounce.com/v4/single/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: NEVERBOUNCE_API_KEY,
        email: email,
      }),
    });

    const data = await response.json();

    if (data.status === 'success' && data.result === 'valid') {
      return true; // Return true if email is valid
    } else {
      console.info(`Invalid Email: ${email} - Reason: ${data.result}`);
      return false; // Return false if email is invalid
    }
  } catch (error) {
    console.error('Error validating email:', error);
    return false; // Return false on error
  }
}
