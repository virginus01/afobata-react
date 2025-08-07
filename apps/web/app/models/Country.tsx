export class Country {
  id: string;
  code: string;
  name: string;
  native: string;
  phone: string;
  continent: string;
  capital: string;
  currency: string;
  languages: string[];
  emoji: string;
  emojiU: string;

  constructor(code: string, info: any) {
    this.id = info.id;
    this.code = code;
    this.name = info.name;
    this.native = info.native;
    this.phone = info.phone;
    this.continent = info.continent;
    this.capital = info.capital;
    this.languages = info.languages;
    this.emoji = info.emoji;
    this.emojiU = info.emojiU;

    // Safely split currency
    this.currency =
      Array.isArray(info.currency) && info.currency.length > 0 ? info.currency[0] : '';
  }
}
