import type {
  AIDraftOutput,
  DraftRequest,
  NormalizedSurvey,
  ReusableQuestionRef,
} from "../types";
import { applySurveyFilters } from "./filters";

const pickTopQuestions = (
  surveys: NormalizedSurvey[],
  maxQuestions: number
): ReusableQuestionRef[] => {
  const questions: ReusableQuestionRef[] = [];

  surveys.forEach((survey) => {
    survey.questions.forEach((question) => {
      if (questions.length >= maxQuestions) {
        return;
      }
      questions.push({
        surveyId: survey.id,
        questionId: question.id,
        text: question.text,
      });
    });
  });

  return questions;
};

const scoreSurveyForDraft = (
  survey: NormalizedSurvey,
  request: DraftRequest
): number => {
  let score = 0;
  const objective = request.objective.toLowerCase();

  if (objective.includes(survey.category.toLowerCase())) {
    score += 3;
  }

  if (objective.includes(survey.methodology.toLowerCase())) {
    score += 2;
  }

  const marketMatch = survey.markets.some((market) =>
    request.filters.markets.includes(market)
  );
  if (marketMatch) {
    score += 2;
  }

  if (survey.isLegacy) {
    score -= 1;
  }

  return score;
};

const buildConfidenceNote = (
  surveys: NormalizedSurvey[],
  request: DraftRequest
): string => {
  if (!request.objective.trim()) {
    return "Provide a clear objective to generate grounded recommendations.";
  }
  if (surveys.length === 0) {
    return "No permitted evidence was found. The draft should be considered low confidence.";
  }
  if (surveys.length < 2) {
    return "Limited evidence available. Recommendations are grounded but low confidence.";
  }
  return "Recommendations are grounded in permitted historical surveys.";
};

export const generateDraft = (
  surveys: NormalizedSurvey[],
  request: DraftRequest
): AIDraftOutput => {
  const scopedFilters = { ...request.filters, client: request.permittedClient };
  const scoped = applySurveyFilters(surveys, scopedFilters);

  const ranked = [...scoped].sort(
    (a, b) => scoreSurveyForDraft(b, request) - scoreSurveyForDraft(a, request)
  );

  const supportingSurveys = ranked.slice(0, 3);
  const recommendedQuestions = pickTopQuestions(supportingSurveys, 6);

  const sections = [
    {
      title: "Screening & Context",
      description: "Confirm eligibility and set context for the study.",
      questions: recommendedQuestions.slice(0, 2),
    },
    {
      title: "Core Evaluation",
      description: "Assess reactions to the concept and key benefits.",
      questions: recommendedQuestions.slice(2, 5),
    },
    {
      title: "Wrap-Up",
      description: "Capture final feedback and open-ended inputs.",
      questions: recommendedQuestions.slice(5),
    },
  ];

  const citations = supportingSurveys.map((survey) => ({
    surveyId: survey.id,
    surveyTitle: survey.title,
    rationale: "Matched client scope and objective context.",
  }));

  return {
    objective: request.objective,
    sections,
    recommendedQuestions,
    citations,
    confidenceNote: buildConfidenceNote(supportingSurveys, request),
  };
};
