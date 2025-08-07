"use client";
import React, { useEffect, useState } from "react";
import KYC from "./kyc";
import ProfileSettings from "./settings";

export default function ProfileIndex({
  params,
  user,
  auth = {},
  siteInfo,
  wallets,
  iniSearchParams,
  rates,
}: {
  params: { action: string; base: string; seg1: string };
  user: UserTypes;
  siteInfo: BrandType;
  wallets: WalletTypes[];
  iniSearchParams: any;
  rates: any;
  auth: AuthModel;
}) {
  const [action, setAction] = useState(params.action);
  const [actionTitle, setActionTitle] = useState("Dashboard");

  useEffect(() => {
    switch (action) {
      case "settings":
        setActionTitle("Your Basic Information");
        break;

      default:
        break;
    }
    setAction(action);
  }, [action]);

  return (
    <>
      <div className="">
        {["settings"].includes(action) && (
          <ProfileSettings action={action} user={user} siteInfo={siteInfo} />
        )}

        {["kyc"].includes(action) && <KYC siteInfo={siteInfo} user={user} auth={auth} />}
      </div>
    </>
  );
}
