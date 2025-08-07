import BankValidation from "@/app/widgets/bankValidation";
import FormInput from "@/app/widgets/hook_form_input";
import React from "react";
import { toast } from "sonner";

type BVNSectionProps = {
  user: UserTypes;
  siteInfo: BrandType;
  setValue: (name: string, value: any) => void;
  verificationData: (data: any) => void;
};

export const BVNSection: React.FC<BVNSectionProps> = ({
  user,
  siteInfo,
  setValue,
  verificationData,
}) => {
  return (
    <div className="flex flex-col space-y-5">
      <FormInput
        controlled={false}
        name="bvn"
        label="Your BVN Number"
        type="number"
        onChange={(e) => setValue("bvn", e.target.value)}
      />

      <BankValidation
        user={user}
        siteInfo={siteInfo}
        onSuccess={(data) => {
          verificationData(data);
          toast.success("Bank account verified successfully");
        }}
      />
    </div>
  );
};
