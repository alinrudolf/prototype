import rawData from "../../mock_data.json";
import type {
  AnswerSummary,
  NormalizedSurvey,
  QuestionType,
  Survey,
  SurveyDataset,
  SurveyQuestion,
} from "../types";

const emptyArray = <T>(): T[] => [];

const toArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : emptyArray<T>();

const toString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const toQuestionType = (value: unknown): QuestionType => {
  switch (value) {
    case "single_choice":
    case "multiple_choice":
    case "scale":
    case "open_text":
      return value;
    default:
      return "open_text";
  }
};

const buildSearchText = (survey: Survey): string => {
  const questionText = toArray(survey.questions).map((q) => q.text);
  const insightText = toArray(survey.answers_summary).map((a) => a.insight);

  return [
    survey.title,
    survey.category,
    survey.methodology,
    ...questionText,
    ...insightText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const loadMockData = (): SurveyDataset => {
  return rawData as SurveyDataset;
};

export const getNormalizedSurveys = (): NormalizedSurvey[] => {
  const dataset = loadMockData();

  return toArray(dataset.surveys).map((survey) => {
    const questions = toArray<SurveyQuestion>(survey.questions).map((q) => ({
      id: toString(q.id),
      text: toString(q.text),
      type: toQuestionType(q.type),
    }));

    const answersSummary = toArray<AnswerSummary>(survey.answers_summary).map(
      (a) => ({
        question_id: toString(a.question_id),
        insight: toString(a.insight),
      })
    );

    const normalizedSurvey: Survey = {
      id: toString(survey.id),
      title: toString(survey.title),
      client: toString(survey.client),
      markets: toArray(survey.markets).map((m) => toString(m)),
      language: toString(survey.language),
      category: toString(survey.category),
      methodology: toString(survey.methodology),
      date: toString(survey.date),
      is_legacy: Boolean(survey.is_legacy),
      questions,
      answers_summary: answersSummary,
    };

    return {
      id: normalizedSurvey.id,
      title: normalizedSurvey.title,
      client: normalizedSurvey.client,
      markets: normalizedSurvey.markets,
      language: normalizedSurvey.language,
      category: normalizedSurvey.category,
      methodology: normalizedSurvey.methodology,
      date: normalizedSurvey.date,
      isLegacy: normalizedSurvey.is_legacy,
      questions: normalizedSurvey.questions,
      answersSummary: normalizedSurvey.answers_summary,
      searchText: buildSearchText(normalizedSurvey),
    };
  });
};