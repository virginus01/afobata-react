import FormInput from "@/app/widgets/hook_form_input";
import FormSelect from "@/app/widgets/hook_form_select";
import React, { useState } from "react";

interface TransferFormProps {
  action: string;
  handleSelectChange: (e: any) => void;
  handleInputChange: (e: any) => void;
  wallets: any[];
}

export default function TransferForm({
  action,
  handleSelectChange,
  handleInputChange,
  wallets,
}: TransferFormProps) {
  const [selectedFromWallet, setSelectedFromWallet] = useState<string>("");
  const [selectedToWallet, setSelectedToWallet] = useState<string>("");

  const emptySelect = [
    {
      label: "Select Option",
      value: "",
      disabled: false,
    },
  ];

  const tType = [
    ...emptySelect,
    {
      label: "Within Wallet Transfer",
      value: "intra-wallet",
      disabled: false,
    },
  ];

  const handleFromWalletChange = (e: any) => {
    setSelectedFromWallet(e.target.value);
    handleSelectChange(e);
  };

  const handleToWalletChange = (e: any) => {
    setSelectedToWallet(e.target.value);
    handleSelectChange(e);
  };

  // Filter out the selected "wallet-from" in the "wallet-to" options, and vice versa
  const filteredFromWallets = emptySelect.concat(
    wallets.filter((wallet) => wallet.value !== selectedToWallet)
  );
  const filteredToWallets = emptySelect.concat(
    wallets.filter((wallet) => wallet.value !== selectedFromWallet)
  );

  return (
    <div className="mt-4 p-4 flex flex-col space-y-5">
      <FormSelect
        name="transferType"
        onChange={handleSelectChange}
        label={"Transfer Type"}
        id="transfer-type"
        options={tType}
      />

      <FormInput
        onChange={handleInputChange}
        name="amount"
        label="Amount to Transfer"
        type="number"
      />

      <FormSelect
        name="walletFrom"
        onChange={handleFromWalletChange}
        label={"Transfer From"}
        id="wallet-from"
        options={filteredFromWallets}
      />
      <FormSelect
        name="walletTo"
        onChange={handleToWalletChange}
        label={"Transfer To"}
        id="wallet-to"
        options={filteredToWallets}
      />
    </div>
  );
}
