import { countryList } from '@/app/data/countries';
import { Country } from '@/app/models/Country';

export const getCountries = async (id?: string): Promise<Country[] | Country | null> => {
  if (!id) return countryList;

  const matched = countryList.find((country) => country.name.toLowerCase() === id.toLowerCase());

  return matched || null;
};
