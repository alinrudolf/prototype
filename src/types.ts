export type MarketCode = string;
export type LanguageCode = string;
export type SurveyId = string;
export type QuestionId = string;

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "scale"
  | "open_text";

export interface SurveyQuestion {
  id: QuestionId;
  text: string;
  type: QuestionType;
}

export interface AnswerSummary {
  question_id: QuestionId;
  insight: string;
}

export interface Survey {
  id: SurveyId;
  title: string;
  client: string;
  markets: MarketCode[];
  language: LanguageCode;
  category: string;
  methodology: string;
  date: string;
  is_legacy: boolean;
  questions: SurveyQuestion[];
  answers_summary: AnswerSummary[];
}

export interface SurveyDataset {
  surveys: Survey[];
}

export interface NormalizedSurvey {
  id: SurveyId;
  title: string;
  client: string;
  markets: MarketCode[];
  language: LanguageCode;
  category: string;
  methodology: string;
  date: string;
  isLegacy: boolean;
  questions: SurveyQuestion[];
  answersSummary: AnswerSummary[];
  searchText: string;
}

export interface SearchFilters {
  client: string;
  markets: MarketCode[];
  languages: LanguageCode[];
  categories: string[];
  methodologies: string[];
}

export type SearchResultType = "survey" | "question" | "insight";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  surveyId: SurveyId;
  matchedQuestionId?: QuestionId;
  title: string;
  snippet: string;
  score: number;
  whyMatched: string[];
  markets: MarketCode[];
  language: LanguageCode;
  category: string;
  methodology: string;
  client: string;
  isLegacy: boolean;
}

export interface ReusableQuestionRef {
  surveyId: SurveyId;
  questionId: QuestionId;
  text: string;
}

export type QuestionOrigin = "reused" | "adapted" | "generated";

export interface DraftQuestion {
  text: string;
  origin: QuestionOrigin;
  sourceSurveyId?: string;
  sourceSurveyTitle?: string;
}

export interface DraftSelection {
  questions: ReusableQuestionRef[];
  sections: {
    surveyId: SurveyId;
    title: string;
    questionIds: QuestionId[];
  }[];
}

export interface AIDraftSection {
  title: string;
  description: string;
  questions: DraftQuestion[];
}

export interface AIDraftCitation {
  surveyId: SurveyId;
  surveyTitle: string;
  rationale: string;
}

export interface AIDraftOutput {
  objective: string;
  sections: AIDraftSection[];
  recommendedQuestions: ReusableQuestionRef[];
  citations: AIDraftCitation[];
  confidenceNote: string;
}

export interface DraftRequest {
  objective: string;
  permittedClient: string;
  filters: SearchFilters;
}
