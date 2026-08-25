import countriesFlags from "./countriesFlags";

export interface CountryFlagInfo {
  mini?: string;
  normal?: string;
  alias?: string;
}

const getCountryFlag = (data?: string): CountryFlagInfo => {
  if (!data) return {};
  const flagsRecord = countriesFlags as Record<string, CountryFlagInfo>;
  for (const country in flagsRecord) {
    if (country === data || flagsRecord[country].alias === data) {
      return flagsRecord[country];
    }
  }

  return {};
};

export default getCountryFlag;
