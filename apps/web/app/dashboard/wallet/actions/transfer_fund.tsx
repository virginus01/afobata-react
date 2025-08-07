import React from "react";
import TransferForm from "../transfer_form";
import CustomCard from "@/app/widgets/custom_card";

export default function TransferFund({
  user,
  wallets,
}: {
  user: UserTypes;
  wallets: WalletTypes[];
}) {
  return <CustomCard title="Fund Transfer">not available yet</CustomCard>;
}
