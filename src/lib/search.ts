import type { NormalizedSurvey, SearchFilters, SearchResult } from "../types";
import { applySurveyFilters } from "./filters";

type FieldMatch = {
  field: "title" | "question" | "insight" | "category" | "methodology";
  count: number;
};

const WEIGHTS: Record<FieldMatch["field"], number> = {
  title: 5,
  question: 3,
  insight: 2,
  category: 2,
  methodology: 2,
};

const tokenize = (input: string): string[] =>
  input
    .toLowerCase()
    .split(/\W+/)
    .map((token) => token.trim())
    .filter(Boolean);

const countTokenMatches = (text: string, tokens: string[]): number => {
  if (!text) {
    return 0;
  }
  const haystack = text.toLowerCase();
  return tokens.reduce(
    (count, token) => (haystack.includes(token) ? count + 1 : count),
    0
  );
};

const scoreSurvey = (
  survey: NormalizedSurvey,
  tokens: string[]
): { score: number; matches: FieldMatch[] } => {
  const matches: FieldMatch[] = [];

  const titleCount = countTokenMatches(survey.title, tokens);
  if (titleCount) {
    matches.push({ field: "title", count: titleCount });
  }

  const questionCount = survey.questions.reduce(
    (sum, question) => sum + countTokenMatches(question.text, tokens),
    0
  );
  if (questionCount) {
    matches.push({ field: "question", count: questionCount });
  }

  const insightCount = survey.answersSummary.reduce(
    (sum, insight) => sum + countTokenMatches(insight.insight, tokens),
    0
  );
  if (insightCount) {
    matches.push({ field: "insight", count: insightCount });
  }

  const categoryCount = countTokenMatches(survey.category, tokens);
  if (categoryCount) {
    matches.push({ field: "category", count: categoryCount });
  }

  const methodologyCount = countTokenMatches(survey.methodology, tokens);
  if (methodologyCount) {
    matches.push({ field: "methodology", count: methodologyCount });
  }

  const score =
    matches.reduce(
      (total, match) => total + match.count * WEIGHTS[match.field],
      0
    ) - (survey.isLegacy ? 0.5 : 0);

  return { score, matches };
};

const pickResultType = (matches: FieldMatch[]): SearchResult["type"] => {
  const top = [...matches].sort((a, b) => WEIGHTS[b.field] - WEIGHTS[a.field])[0];
  if (!top) {
    return "survey";
  }
  if (top.field === "question") {
    return "question";
  }
  if (top.field === "insight") {
    return "insight";
  }
  return "survey";
};

const buildWhyMatched = (
  matches: FieldMatch[],
  survey: NormalizedSurvey,
  filters: SearchFilters
): string[] => {
  const reasons: string[] = [];

  const fields = new Set(matches.map((match) => match.field));
  if (fields.has("title")) reasons.push("matched on title");
  if (fields.has("question")) reasons.push("matched on question text");
  if (fields.has("insight")) reasons.push("matched on answer insight");
  if (fields.has("category")) reasons.push("matched on category");
  if (fields.has("methodology")) reasons.push("matched on methodology");

  if (
    filters.markets.length &&
    survey.markets.some((market) => filters.markets.includes(market))
  ) {
    reasons.push("same market");
  } else if (filters.markets.length) {
    reasons.push("cross-market similar");
  }

  if (survey.isLegacy) {
    reasons.push("legacy study");
  }

  return reasons;
};

export const searchSurveys = (
  surveys: NormalizedSurvey[],
  query: string,
  filters: SearchFilters,
  permittedClient: string
): SearchResult[] => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const tokens = tokenize(trimmedQuery);
  const scopedFilters: SearchFilters = { ...filters, client: permittedClient };
  const filtered = applySurveyFilters(surveys, scopedFilters);

  return filtered
    .map((survey) => {
      const { score, matches } = scoreSurvey(survey, tokens);
      if (!score) {
        return null;
      }

      const resultType = pickResultType(matches);
      const whyMatched = buildWhyMatched(matches, survey, scopedFilters);
      const marketBoost = scopedFilters.markets.length &&
        survey.markets.some((market) => scopedFilters.markets.includes(market))
        ? 1.5
        : 0;

      const finalScore = score + marketBoost;

      return {
        id: `${survey.id}:${resultType}`,
        type: resultType,
        surveyId: survey.id,
        title: survey.title,
        snippet:
          survey.questions[0]?.text ||
          survey.answersSummary[0]?.insight ||
          survey.title,
        score: finalScore,
        whyMatched,
        markets: survey.markets,
        language: survey.language,
        category: survey.category,
        methodology: survey.methodology,
        client: survey.client,
        isLegacy: survey.isLegacy,
      } satisfies SearchResult;
    })
    .filter((result): result is SearchResult => Boolean(result))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
};
