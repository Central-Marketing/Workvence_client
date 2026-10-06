import countriesFlags from "./countriesFlags";

export interface CountryFlagInfo {
  mini?: string;
  normal?: string;
  alias?: string;
}

const COUNTRY_NAME_TO_KEY: Record<string, string> = {
  "Saudi Arabia": "Arab",
  "Central African Republic": "CAR",
  "China": "China",
  "Cook Islands": "Cook",
  "Costa Rica": "CostaRica",
  "Dominican Republic": "DR",
  "Democratic Republic of the Congo": "DRC",
  "Equatorial Guinea": "EGuinea",
  "Guinea-Bissau": "GuineaB",
  "Côte d'Ivoire": "Ivoire",
  "Cote d'Ivoire": "Ivoire",
  "Sri Lanka": "Lanka",
  "Shri Lanka": "Lanka",
  "North Macedonia": "Macedonia",
  "Macedonia": "Macedonia",
  "Marshall Islands": "Marshall",
  "North Korea": "NKorea",
  "New Zealand": "NZ",
  "Papua New Guinea": "PGuinea",
  "Republic of the Congo": "RC",
  "South Africa": "RSA",
  "Republic of South Africa": "RSA",
  "Western Sahara": "Sahara",
  "El Salvador": "Salvador",
  "Sierra Leone": "Sierra",
  "Saint Kitts and Nevis": "SKN",
  "South Korea": "SKorea",
  "Saint Lucia": "SL",
  "San Marino": "SM",
  "Solomon Islands": "Solomon",
  "South Sudan": "SSudan",
  "Sao Tome and Principe": "STP",
  "Saint Vincent and the Grenadines": "SVG",
  "Eswatini": "Swaziland",
  "Swaziland": "Swaziland",
  "Timor-Leste": "Timor",
  "East Timor": "Timor",
  "United Arab Emirates": "UAE",
  "United Kingdom": "UK",
  "United States": "USA",
  "Vatican City": "Vatican",
  "Cabo Verde": "Verde",
  "Cape Verde": "Verde",
};

const getCountryFlag = (data?: string): CountryFlagInfo => {
  if (!data) return {};
  const flagsRecord = countriesFlags as Record<string, CountryFlagInfo>;

  // 1. Direct key match (e.g. "USA", "France")
  if (flagsRecord[data]) return flagsRecord[data];

  // 2. Direct name map match (e.g. "United States" -> "USA", "Sri Lanka" -> "Lanka")
  const mappedKey = COUNTRY_NAME_TO_KEY[data];
  if (mappedKey && flagsRecord[mappedKey]) return flagsRecord[mappedKey];

  // 3. Alias match (e.g. flagsRecord[c].alias === data)
  for (const country in flagsRecord) {
    if (flagsRecord[country].alias === data) {
      return flagsRecord[country];
    }
  }

  return {};
};

export default getCountryFlag;
