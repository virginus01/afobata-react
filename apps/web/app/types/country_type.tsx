type CountryType = {
  id?: string;
  name?: string;
  shortName?: string;
  currency?: any;
  others?: ExtCountry;
};

type ExtCountry = {
  id?: string;
  name?: {
    common: string | null;
    official: string | null;
    nativeName?: {
      [languageCode: string]: {
        official: string | null;
        common: string | null;
      } | null;
    } | null;
  } | null;
  tld?: string[] | null;
  cca2?: string | null;
  ccn3?: string | null;
  cca3?: string | null;
  cioc?: string | null;
  independent?: boolean | null;
  status?: string | null;
  unMember?: boolean | null;
  currencies?: {
    [currencyCode: string]: {
      name: string | null;
      symbol: string | null;
    } | null;
  } | null;
  idd?: {
    root: string | null;
    suffixes: string[] | null;
  } | null;
  capital?: string[] | null;
  altSpellings?: string[] | null;
  region?: string | null;
  subregion?: string | null;
  languages?: {
    [languageCode: string]: string | null;
  } | null;
  translations?: {
    [languageCode: string]: {
      official: string | null;
      common: string | null;
    } | null;
  } | null;
  latlng?: [number | null, number | null] | null;
  landlocked?: boolean | null;
  borders?: string[] | null;
  area?: number | null;
  demonyms?: {
    eng?: {
      f: string | null;
      m: string | null;
    } | null;
    fra?: {
      f: string | null;
      m: string | null;
    } | null;
  } | null;
  flag?: string | null;
  maps?: {
    googleMaps: string | null;
    openStreetMaps: string | null;
  } | null;
  population?: number | null;
  gini?: {
    [year: string]: number | null;
  } | null;
  fifa?: string | null;
  car?: {
    signs: string[] | null;
    side: string | null;
  } | null;
  timezones?: string[] | null;
  continents?: string[] | null;
  flags?: {
    png: string | null;
    svg: string | null;
    alt: string | null;
  } | null;
  coatOfArms?: {
    png: string | null;
    svg: string | null;
  } | null;
  startOfWeek?: string | null;
  capitalInfo?: {
    latlng?: [number | null, number | null] | null;
  } | null;
  postalCode?: {
    format: string | null;
    regex: string | null;
  } | null;
};
