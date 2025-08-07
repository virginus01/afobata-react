export function findBankByCode(bankCode: string, banks: any) {
  return banks.find((bank: any) => bank.code === bankCode);
}
