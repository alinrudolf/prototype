import type {
  AIDraftOutput,
  DraftRequest,
  DraftQuestion,
  NormalizedSurvey,
  QuestionOrigin,
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

type DraftIntent = "screening" | "core" | "wrapup";

const classifyIntent = (text: string): DraftIntent => {
  const value = text.toLowerCase();

  const screeningSignals = [
    "how often",
    "how frequently",
    "cât de des",
    "jak często",
    "routine",
    "usage",
    "consum",
    "apply",
  ];
  if (screeningSignals.some((signal) => value.includes(signal))) {
    return "screening";
  }

  const coreSignals = [
    "benefit",
    "beneficii",
    "korzy",
    "appeal",
    "associate",
    "concept",
    "awareness",
    "important",
  ];
  if (coreSignals.some((signal) => value.includes(signal))) {
    return "core";
  }

  return "wrapup";
};

const adaptQuestionText = (text: string): { text: string; origin: QuestionOrigin } => {
  const lowered = text.toLowerCase();
  if (lowered.includes("this product")) {
    return { text: text.replace(/this product/gi, "the concept"), origin: "adapted" };
  }
  if (lowered.includes("benefits")) {
    return {
      text: text.replace(/benefits/gi, "benefits you expect"),
      origin: "adapted",
    };
  }
  return { text, origin: "reused" };
};

const buildDraftQuestion = (
  survey: NormalizedSurvey,
  text: string
): DraftQuestion => {
  const adaptation = adaptQuestionText(text);
  return {
    text: adaptation.text,
    origin: adaptation.origin,
    sourceSurveyId: survey.id,
    sourceSurveyTitle: survey.title,
  };
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

  const screeningQuestions: DraftQuestion[] = [];
  const coreQuestions: DraftQuestion[] = [];
  const wrapUpQuestions: DraftQuestion[] = [];

  supportingSurveys.forEach((survey) => {
    survey.questions.forEach((question) => {
      const intent = classifyIntent(question.text);
      const draftQuestion = buildDraftQuestion(survey, question.text);
      if (intent === "screening") {
        screeningQuestions.push(draftQuestion);
        return;
      }
      if (intent === "core") {
        coreQuestions.push(draftQuestion);
        return;
      }
      wrapUpQuestions.push(draftQuestion);
    });
  });

  const generatedWrapUp: DraftQuestion = {
    text: "What final feedback would you like to share about the concept?",
    origin: "generated",
  };

  if (!wrapUpQuestions.some((item) => item.origin === "generated")) {
    wrapUpQuestions.push(generatedWrapUp);
  }

  const sections = [
    {
      title: "Screening",
      description: "Confirm eligibility and usage context.",
      questions: screeningQuestions,
    },
    {
      title: "Core Evaluation",
      description: "Assess reactions, benefits, and concept fit.",
      questions: coreQuestions,
    },
    {
      title: "Wrap-Up",
      description: "Capture final feedback and open-ended inputs.",
      questions: wrapUpQuestions,
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
