export const staticImage = (tag: string): string => {
  const lowTag = tag.toLowerCase();
  switch (lowTag) {
    case "mtn":
      return "/utility/mtn.png";
    case "glo":
      return "/utility/glo.png";
    case "airtel":
      return "/utility/airtel.png";
    case "m_9mobile":
      return "/utility/9_mobile.png";
    case "smile-direct":
      return "/utility/smile.png";
    case "spectranet":
      return "/utility/spectranet.png";
    case "dstv":
      return "/utility/dstv.png";
    case "gotv":
      return "/utility/gotv.png";
    case "startimes":
      return "/utility/startimes.png";
    case "waec":
      return "/utility/waec.png";
    case "jamb":
      return "/utility/jamb.png";
    case "neco":
      return "/utility/neco.png";

    default:
      return "";
  }
};
