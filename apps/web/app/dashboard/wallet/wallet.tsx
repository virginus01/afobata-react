import { show_error } from '@/app/helpers/show_error';
import { capitalize } from '@/app/helpers/capitalize';
import { curFormat } from '@/app/helpers/curFormat';

export const GetWallets = ({
  params,
  siteInfo,
  user,
}: {
  params: { action: string; base: string; seg1: string };
  siteInfo: BrandType;
  user: UserTypes;
}): WalletTypes[] => {
  try {
    let wallets: WalletTypes[] = [];

    const emptyWallet: any = {
      value: '',
      label: `Select Wallet`,
    };

    // wallets.push(emptyWallet as any);

    const formWallets: any = {
      ...user.wallet,
      value: user.wallet?.id || '',
      label: capitalize(
        `Main: ${user?.wallet?.title || ''} Wallet (${curFormat(
          user?.wallet?.value || 0,
          user.currencyInfo?.currencySymbol!,
        )})`,
      ),
      balance: user?.wallet?.value || 0,
    };

    wallets.push(formWallets as any);

    return wallets;
  } catch (error) {
    show_error('error getting sps', error as string);
    return [];
  }
};
