import { RadioBrowserApi, Station } from 'radio-browser-api';
import { Station as AppStation } from '../store';

let api: RadioBrowserApi | null = null;

export const getRadioApi = () => {
  if (!api) {
    api = new RadioBrowserApi('GlobalRadioReactApp');
  }
  return api;
};

// Top 50 countries with most stations or general interesting ones
const MAIN_COUNTRIES = [
  'US', 'GB', 'DE', 'FR', 'IT', 'ES', 'CA', 'AU', 'BR', 'JP', 
  'RU', 'NL', 'SE', 'CH', 'MX', 'IN', 'ZA', 'NZ', 'AR', 'CO'
];

export const fetchStationsForCountry = async (countryCode: string, limit = 20): Promise<AppStation[]> => {
  try {
    const radioApi = getRadioApi();
    const stations = await radioApi.searchStations({
      countryCode: countryCode,
      limit: limit,
      order: 'clickcount',
      reverse: true,
      hasGeoInfo: true,
      hideBroken: true,
      isHttps: true
    });

    return stations.map((s: Station) => ({
      id: s.id,
      name: s.name.trim() || 'Unknown Station',
      country: s.country,
      countryCode: s.countryCode,
      url: s.urlResolved || s.url,
      favicon: s.favicon,
      tags: s.tags,
      geo_lat: s.geoLat || undefined,
      geo_long: s.geoLong || undefined
    }));
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
};

export const fetchInitialStations = async () => {
    // Fetch top stations from a few random countries to populate the globe initially
    const randomCountries = [...MAIN_COUNTRIES].sort(() => 0.5 - Math.random()).slice(0, 5);
    const promises = randomCountries.map(code => fetchStationsForCountry(code, 5));
    
    const results = await Promise.all(promises);
    return results.flat();
};
