import juice from 'juice';
import FullFiledDigital from '@/app/components/templates/order/fullfiled_digital';
import EmailTemplate from '@/app/components/templates/email/email_template';
import { render } from '@react-email/render';
import PinTemp from '@/app/components/templates/email/pin';
import MobileAppReadyEmail from '@/app/components/templates/email/mobile_app_ready';

export async function renderEmailContent({ body }: { body: any }) {
  let content: any = `<>${body?.data}</>`;

  try {
    switch (body.templateId) {
      case 'fullFillDigital':
        content = <FullFiledDigital body={body} />;
        break;

      case 'pin':
        content = <PinTemp body={body} />;
        break;

      case 'mobileAppsReady':
        content = <MobileAppReadyEmail body={body} />;
        break;

      default:
        break;
    }

    const templatedContent = (
      <EmailTemplate
        siteInfo={body?.brand ?? body?.siteInfo ?? body?.data?.brand ?? {}}
        title={body.subject}
      >
        {content}
      </EmailTemplate>
    );

    const emailHTML = await render(templatedContent, {
      pretty: true,
    });

    return juice(emailHTML);
  } catch (error) {
    console.error('error in render email template');
    throw Error(error as string);
  }
}
