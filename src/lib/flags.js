const TEAM_FLAG_MAP = {
  Algeria: "DZ",
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Belgium: "BE",
  "Bosnia-Herzegovina": "BA",
  Brazil: "BR",
  Canada: "CA",
  "Cape Verde Islands": "CV",
  Croatia: "HR",
  Curaçao: "CW",
  Czechia: "CZ",
  Ecuador: "EC",
  Egypt: "EG",
  England: "GB",
  France: "FR",
  Germany: "DE",
  Ghana: "GH",
  Haiti: "HT",
  Iran: "IR",
  Iraq: "IQ",
  "Ivory Coast": "CI",
  Japan: "JP",
  Jordan: "JO",
  Mexico: "MX",
  Morocco: "MA",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Norway: "NO",
  Panama: "PA",
  Paraguay: "PY",
  Portugal: "PT",
  Qatar: "QA",
  Scotland: "GB",
  Senegal: "SN",
  "South Africa": "ZA",
  "South Korea": "KR",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  Tunisia: "TN",
  Turkey: "TR",
  "United States": "US",
  Uruguay: "UY",
  Uzbekistan: "UZ",
  "Congo DR": "CD",
  "Saudi Arabia": "SA",
};

export function getTeamFlagCode(teamName) {
  return TEAM_FLAG_MAP[teamName] || null;
}

export function getTeamFlagUrl(teamName) {
  const code = getTeamFlagCode(teamName);
  if (!code) return null;
  return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
}
