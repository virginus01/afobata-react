import React, { useEffect, useState } from 'react';
import ActionInputField from '@/app/widgets/validations';
import { api_generate_user_token, api_get_banks } from '@/app/routes/api_routes';
import { modHeaders } from '@/app/helpers/modHeaders';
import { baseUrl } from '@/app/helpers/baseUrl';
import { toast } from 'sonner';
import FormInput from '@/app/widgets/hook_form_input';

interface EmailValidationProps {
  onSuccess: (data: any) => void;
  user: UserTypes;
  siteInfo: BrandType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const EmailValidation: React.FC<EmailValidationProps> = ({
  onSuccess,
  user,
  siteInfo,
  handleInputChange,
  handleSelectChange,
}) => {
  const [customerName, setCustomerName] = useState();
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const handleVerifications = async () => {
    const toastId = toast.loading('sending email verification');
    setIsVerifying(true);
    try {
      const url = await api_generate_user_token({ subBase: siteInfo.slug });

      const formData = {
        id: user?.id,
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formData),
      });

      const response = await res.json();

      if (response.status) {
        const link = await baseUrl(
          `${siteInfo.slug}/verify?token=${response.data.token.value}&user=${user?.id}&code=${response.data.token.code}`,
        );

        // const mail = await sendMail({
        //   emails: "hr@afobata.com", //|| user?.email,
        //   subject: "Email Verification",
        //   body: (
        //     <VerifyEmail
        //       user={user!}
        //       siteInfo={siteInfo}
        //       link={link}
        //       code={response.data.token.code}
        //     />
        //   ),
        //   siteInfo: siteInfo,
        //   user: user!,
        // });

        // toast.dismiss(toastId);

        // if (mail.success) {
        //   toast.success("verification email sent");
        //   setCodeSent(true);
        // } else {
        //   console.error(mail.msg);
        //   toast.error(mail.msg);
        // }
      } else {
        console.error(response.msg);
        toast.error('error occured, try again');
      }
    } catch (error) {
      console.error(error);
      toast.error('error occured, try again');
    } finally {
      toast.dismiss(toastId);
      setIsVerifying(false);
    }
  };

  return (
    <>
      <ActionInputField
        verifying={isVerifying}
        label="Your Email Address"
        placeholder="Enter email Address"
        name="email"
        id="email"
        buttonText="send code"
        handleVerifications={async (value: string) => {
          await handleVerifications();
        }}
        action="add"
        customerNameValidated={false}
      />

      {codeSent && (
        <>
          <div>
            <FormInput
              name="emailCode"
              label="Email Verification Code"
              onChange={(e: any) => handleInputChange(e)}
            />
          </div>
        </>
      )}
    </>
  );
};

export default EmailValidation;
