import type { DraftSelection, NormalizedSurvey, ReusableQuestionRef } from "../types";

type Props = {
  survey: NormalizedSurvey | null;
  permittedClient: string;
  whyMatched: string[];
  selection: DraftSelection;
  onAddQuestion: (question: ReusableQuestionRef) => void;
  onAddSection: (survey: NormalizedSurvey) => void;
};

export default function SurveyDetailScreen({
  survey,
  permittedClient,
  whyMatched,
  selection,
  onAddQuestion,
  onAddSection,
}: Props) {
  if (!survey) {
    return (
      <section className="panel panel--tight">
        <div className="panel__title">Survey Detail</div>
        <div className="empty-state">
          <div className="empty-state__title">No survey selected</div>
          <div className="empty-state__body">
            Select a result to review survey details and reuse options.
          </div>
        </div>
      </section>
    );
  }

  const questionLookup = new Set(selection.questions.map((q) => q.questionId));
  const sectionExists = selection.sections.some(
    (section) => section.surveyId === survey.id
  );

  return (
    <section className="panel panel--tight">
      <div className="panel__title">Survey Detail</div>

      <div className="detail__meta">
        <div className="detail__header">
          <div>
            <div className="detail__title">{survey.title}</div>
            <div className="detail__subtitle">
              Client: <strong>{survey.client}</strong> • Date: {survey.date}
            </div>
          </div>
          <div className="detail__badges">
            {survey.isLegacy && <span className="badge badge--legacy">Legacy</span>}
            <span className="badge badge--type">Survey</span>
          </div>
        </div>

        <div className="detail__grid">
          <div>
            <div className="detail__label">Markets</div>
            <div>{survey.markets.join(", ")}</div>
          </div>
          <div>
            <div className="detail__label">Language</div>
            <div>{survey.language}</div>
          </div>
          <div>
            <div className="detail__label">Category</div>
            <div>{survey.category}</div>
          </div>
          <div>
            <div className="detail__label">Methodology</div>
            <div>{survey.methodology}</div>
          </div>
        </div>

        <div className="detail__access">
          Access allowed for client scope: <strong>{permittedClient}</strong>
        </div>
      </div>

      <div className="detail__why">
        <div className="detail__label">Why this was retrieved</div>
        <div className="detail__tags">
          {whyMatched.map((reason) => (
            <span key={reason} className="tag">
              {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="detail__section">
        <div className="detail__section-header">
          <div className="detail__label">Questions</div>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onAddSection(survey)}
            disabled={sectionExists}
          >
            {sectionExists ? "Section added" : "Add section to draft"}
          </button>
        </div>
        <div className="detail__list">
          {survey.questions.map((question) => {
            const selected = questionLookup.has(question.id);
            return (
              <div key={question.id} className="detail__item">
                <div>
                  <div className="detail__item-title">{question.text}</div>
                  <div className="detail__item-meta">Type: {question.type}</div>
                </div>
                <button
                  type="button"
                  className="button"
                  onClick={() =>
                    onAddQuestion({
                      surveyId: survey.id,
                      questionId: question.id,
                      text: question.text,
                    })
                  }
                  disabled={selected}
                >
                  {selected ? "Added" : "Add question"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="detail__section">
        <div className="detail__label">Answer Summaries</div>
        <div className="detail__list">
          {survey.answersSummary.map((summary) => (
            <div key={summary.question_id} className="detail__item detail__item--tight">
              <div className="detail__item-title">{summary.insight}</div>
              <div className="detail__item-meta">Question ID: {summary.question_id}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
