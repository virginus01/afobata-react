import { getDynamicData } from '@/app/helpers/getDynamicData';
import { isNull } from '@/app/helpers/isNull';

export class PartialBrand {
  id?: string = '';
  name?: string = '';
  type?: string = '';
  userId?: string = '';
  logoId?: string = '';
  iconId?: string = '';
  domain?: string = '';
  brandId?: string = '';
  pendingDomain?: string = '';
  subDomain?: string = '';
  profiles?: string[] = [];
  slug?: string = '';
  phone?: string = '';
  email?: string = '';
  allowMonetization?: boolean = false;
  isDefault?: boolean = false;
  isTester?: boolean = false;
  wallet?: string = '';
  childrenViews?: number = 0;
  costPerMille?: number = 0;
  costPerUnit?: number = 0;
  childrenMille?: number = 0;
  revenueWallet?: string = '';
}
