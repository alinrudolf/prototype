import type { NormalizedSurvey, SearchFilters } from "../types";

const hasValue = (value: string): boolean => value.trim().length > 0;

const normalize = (value: string): string => value.trim().toLowerCase();

export const filterByClient = (
  surveys: NormalizedSurvey[],
  client: string
): NormalizedSurvey[] => {
  if (!hasValue(client)) {
    return [];
  }

  const normalizedClient = normalize(client);
  return surveys.filter(
    (survey) => normalize(survey.client) === normalizedClient
  );
};

export const filterByMarkets = (
  surveys: NormalizedSurvey[],
  markets: string[]
): NormalizedSurvey[] => {
  if (!markets.length) {
    return surveys;
  }

  const normalizedMarkets = markets.map(normalize);
  return surveys.filter((survey) =>
    survey.markets.some((market) => normalizedMarkets.includes(normalize(market)))
  );
};

export const filterByLanguages = (
  surveys: NormalizedSurvey[],
  languages: string[]
): NormalizedSurvey[] => {
  if (!languages.length) {
    return surveys;
  }

  const normalizedLanguages = languages.map(normalize);
  return surveys.filter((survey) =>
    normalizedLanguages.includes(normalize(survey.language))
  );
};

export const filterByCategories = (
  surveys: NormalizedSurvey[],
  categories: string[]
): NormalizedSurvey[] => {
  if (!categories.length) {
    return surveys;
  }

  const normalizedCategories = categories.map(normalize);
  return surveys.filter((survey) =>
    normalizedCategories.includes(normalize(survey.category))
  );
};

export const filterByMethodologies = (
  surveys: NormalizedSurvey[],
  methodologies: string[]
): NormalizedSurvey[] => {
  if (!methodologies.length) {
    return surveys;
  }

  const normalizedMethodologies = methodologies.map(normalize);
  return surveys.filter((survey) =>
    normalizedMethodologies.includes(normalize(survey.methodology))
  );
};

export const applySurveyFilters = (
  surveys: NormalizedSurvey[],
  filters: SearchFilters
): NormalizedSurvey[] => {
  const clientFiltered = filterByClient(surveys, filters.client);
  const marketFiltered = filterByMarkets(clientFiltered, filters.markets);
  const languageFiltered = filterByLanguages(marketFiltered, filters.languages);
  const categoryFiltered = filterByCategories(
    languageFiltered,
    filters.categories
  );

  return filterByMethodologies(categoryFiltered, filters.methodologies);
};