import { api_response } from '@/app/helpers/api_response';
import { readDb } from '@/api/read';
import fs from 'fs';
import path from 'path';

export async function processCountries() {
  try {
    const countries: any[] = await readDb({ file: 'countriesStateCity.json' });
    const flags: any[] = await readDb({ file: 'countriesAndFlag.json' });

    if (!Array.isArray(countries)) {
      throw new Error('Invalid data format: Expected an array');
    }

    let countriesData = [];
    let statesData = [];
    let citiesData = [];

    // Filter countries based on supported countries
    const filteredCountries = countries;

    for (let country of filteredCountries) {
      if (country && typeof country === 'object') {
        const countryId = String(country.iso2).toLowerCase() || '';
        const flag = flags.find(
          (cd) => String(cd.name).toLowerCase() === String(country.name).toLowerCase(),
        );

        // Process states only if the country is in supported countries and has supported states
        if (Array.isArray(country.states)) {
          for (let state of country.states) {
            if (state && typeof state === 'object') {
              const stateId = `${state.state_code}${countryId}`.toLowerCase();
              const { cities, ...preState } = state; // Extract cities
              const finalState = { ...preState, countryId, id: stateId };

              statesData.push(finalState);

              // Process cities only if the state belongs to a supported country
              if (Array.isArray(cities)) {
                for (let city of cities) {
                  if (city && typeof city === 'object') {
                    const { latitude, longitude, ...cityWithoutLatLng } = city; // Remove latitude and longitude
                    const cityId = `${city.name}${stateId}`.toLowerCase();
                    const finalCity = {
                      ...cityWithoutLatLng,
                      stateId,
                      id: cityId,
                      countryId,
                    };

                    citiesData.push(finalCity);
                  }
                }
              }
            }
          }
        }

        const { states, ...preCountry } = country; // Remove states
        const finalCountry = {
          ...preCountry,
          id: countryId,
          flag: flag?.flag,
        };
        countriesData.push(finalCountry);
      }
    }

    // Log size of processed data
    console.info('Countries data size:', countriesData.length);
    console.info('States data size:', statesData.length);
    console.info('Cities data size:', citiesData.length);

    await createFile({ data: countriesData, name: 'countries' });
    await createFile({ data: statesData, name: 'states' });
    await createFile({ data: citiesData, name: 'cities' });

    return api_response({
      data: {
        cities: citiesData,
        countries: countriesData,
        states: statesData,
      },
      status: true,
    });
  } catch (error: any) {
    console.error('Error with country API:', error.message);
    return api_response({
      data: null,
      status: false,
      message: 'Error processing countries',
    });
  }
}

async function createFile({ data, name }: { data: any[]; name: string }): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'public', 'demographic-data');
    const backupFile = path.join(backupDir, `${name}.json`);

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Write backup file
    await fs.promises.writeFile(backupFile, JSON.stringify(data, null, 2));

    console.info(`${name} contains ${data.length} records`);
  } catch (error) {
    console.error(`Failed to create ${name}: ${error}`);
    throw new Error(`${name} creation failed: ${error}`);
  }
}
