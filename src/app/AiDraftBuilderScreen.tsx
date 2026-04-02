import { useMemo, useState } from "react";
import { getNormalizedSurveys } from "../lib/data";
import { generateDraft } from "../lib/aiDraft";
import type {
  AIDraftOutput,
  DraftRequest,
  DraftSelection,
  SearchFilters,
} from "../types";

type Props = {
  permittedClient: string;
  filters: SearchFilters;
  selection: DraftSelection;
  onRemoveQuestion: (questionId: string) => void;
  onRemoveSection: (surveyId: string) => void;
};

const emptyDraft: AIDraftOutput = {
  objective: "",
  sections: [],
  recommendedQuestions: [],
  citations: [],
  confidenceNote: "",
};

const exampleObjectives = [
  "Create a concept test for skincare in RO and PL",
  "Build a usage & attitude tracker for skincare in Romania",
  "Draft a concept test for hydration benefits across markets",
  "Design a daily skincare routine tracker in the UK",
];

export default function AiDraftBuilderScreen({
  permittedClient,
  filters,
  selection,
  onRemoveQuestion,
  onRemoveSection,
}: Props) {
  const surveys = useMemo(() => getNormalizedSurveys(), []);
  const [objective, setObjective] = useState("");
  const [draft, setDraft] = useState<AIDraftOutput>(emptyDraft);

  const canGenerate = permittedClient.length > 0;

  const handleGenerate = () => {
    const request: DraftRequest = {
      objective,
      permittedClient,
      filters,
    };
    setDraft(generateDraft(surveys, request));
  };

  return (
    <section className="panel panel--tight">
      <div className="panel__title-row">
        <div>
          <div className="panel__eyebrow">Draft</div>
          <div className="panel__title">AI Draft Builder</div>
        </div>
      </div>

      <div className="draft__access">
        {permittedClient ? (
          <span>
            Client scope: <strong>{permittedClient}</strong> • Citations required
          </span>
        ) : (
          <span className="draft__warning">
            Select a client scope to generate a draft.
          </span>
        )}
      </div>

      <div className="draft__input">
        <label className="field">
          <span className="field__label">Survey objective</span>
          <textarea
            className="field__textarea"
            placeholder="Describe the survey objective"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
          />
        </label>
        <div className="example__list">
          {exampleObjectives.map((example) => (
            <button
              key={example}
              type="button"
              className="example__item"
              onClick={() => setObjective(example)}
            >
              {example}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={handleGenerate}
          disabled={!canGenerate || !objective.trim()}
        >
          Generate draft
        </button>
      </div>

      {draft.objective && (
        <div className="draft__output">
          <div className="draft__objective">
            Objective: <strong>{draft.objective}</strong>
          </div>

          <div className="draft__sections">
            <div className="detail__label">Generated draft structure</div>
            {draft.sections.map((section) => (
              <div key={section.title} className="draft__section">
                <div className="draft__section-title">{section.title}</div>
                <div className="draft__section-desc">{section.description}</div>
                <div className="draft__section-questions">
                  {section.questions.length > 0 ? (
                    section.questions.map((question, index) => (
                      <div
                        key={`${question.text}-${index}`}
                        className="draft__question"
                      >
                        <span className={`origin origin--${question.origin}`}>
                          {question.origin.toUpperCase()}
                        </span>
                        <span className="draft__question-text">
                          {question.text}
                        </span>
                        {question.sourceSurveyTitle && (
                          <div className="draft__source">
                            Source: {question.sourceSurveyTitle}
                            {question.sourceSurveyId
                              ? ` (${question.sourceSurveyId})`
                              : ""}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="detail__empty">
                      No reusable questions found for this section.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="draft__recommendations">
            <div className="detail__label">Recommended reusable questions</div>
            <div className="draft__section-questions">
              {draft.recommendedQuestions.map((question) => (
                <div key={question.questionId} className="draft__question">
                  {question.text}
                  <span className="draft__citation">
                    ({question.surveyId})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="draft__citations">
            <div className="detail__label">Citations (grounding)</div>
            <div className="draft__citation-list">
              {draft.citations.map((citation) => (
                <div key={citation.surveyId} className="draft__citation-item">
                  <div className="draft__citation-title">
                    {citation.surveyTitle} ({citation.surveyId})
                  </div>
                  <div className="draft__citation-meta">
                    {citation.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="draft__confidence">
            <strong>Grounding note:</strong> {draft.confidenceNote}
          </div>
        </div>
      )}

      {!draft.objective && permittedClient && (
        <div className="empty-state">
          <div className="empty-state__title">No draft generated yet</div>
          <div className="empty-state__body">
            Provide an objective and generate a grounded draft with citations.
          </div>
        </div>
      )}

      {(selection.questions.length > 0 || selection.sections.length > 0) && (
        <div className="draft__reuse">
          <div className="detail__label">Reuse queue (from Survey Detail)</div>
          {selection.sections.length > 0 && (
            <div className="draft__reuse-block">
              {selection.sections.map((section) => (
                <div key={section.surveyId} className="draft__reuse-item">
                  <div>
                    <div className="draft__question">
                      Section: {section.title}
                      <span className="draft__citation">
                        ({section.surveyId})
                      </span>
                    </div>
                    <div className="draft__reuse-meta">
                      {section.questionIds.length} questions
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button"
                    onClick={() => onRemoveSection(section.surveyId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {selection.questions.length > 0 && (
            <div className="draft__reuse-block">
              {selection.questions.map((question) => (
                <div key={question.questionId} className="draft__reuse-item">
                  <div className="draft__question">
                    {question.text}
                    <span className="draft__citation">
                      ({question.surveyId})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="button"
                    onClick={() => onRemoveQuestion(question.questionId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
