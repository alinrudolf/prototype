import { useMemo, useState } from "react";
import { getNormalizedSurveys } from "../lib/data";
import { searchSurveys } from "../lib/search";
import type {
  DraftSelection,
  NormalizedSurvey,
  SearchFilters,
  SearchResult,
} from "../types";

const exampleQueries = [
  "Skincare routine study in Romania",
  "Concept test for skincare across RO and PL",
  "Hydration benefit insights",
  "Usage & attitude skincare survey",
  "Legacy skincare studies in RO",
  "Daily skincare routine UK",
];

const emptyFilters: SearchFilters = {
  client: "",
  markets: [],
  languages: [],
  categories: [],
  methodologies: [],
};

type ResultSelection = {
  surveyId: string;
  resultType: SearchResult["type"];
  whyMatched: string[];
} | null;

const buildOptions = (surveys: NormalizedSurvey[]) => {
  const clients = new Set<string>();
  const markets = new Set<string>();
  const languages = new Set<string>();
  const categories = new Set<string>();
  const methodologies = new Set<string>();

  surveys.forEach((survey) => {
    clients.add(survey.client);
    survey.markets.forEach((market) => markets.add(market));
    languages.add(survey.language);
    categories.add(survey.category);
    methodologies.add(survey.methodology);
  });

  return {
    clients: Array.from(clients).sort(),
    markets: Array.from(markets).sort(),
    languages: Array.from(languages).sort(),
    categories: Array.from(categories).sort(),
    methodologies: Array.from(methodologies).sort(),
  };
};

const renderValue = (value: string | string[], fallback = "—") => {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : fallback;
  }
  return value ? value : fallback;
};

type Props = {
  selection: ResultSelection;
  draftSelection: DraftSelection;
  onSelect: (selection: ResultSelection, client: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
};

export default function SearchScreen({
  selection,
  draftSelection,
  onSelect,
  onFiltersChange,
}: Props) {
  const surveys = useMemo(() => getNormalizedSurveys(), []);
  const options = useMemo(() => buildOptions(surveys), [surveys]);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);

  const results = useMemo(() => {
    if (!filters.client) {
      return [];
    }
    return searchSurveys(surveys, query, filters, filters.client);
  }, [surveys, query, filters]);

  const clearSelection = () => onSelect(null, filters.client);

  const updateFilters = (next: SearchFilters) => {
    setFilters(next);
    onFiltersChange(next);
  };

  return (
    <div className="stack">
      <header className="header header--tight">
        <div className="header__eyebrow">Toluna Internal Research</div>
        <div className="header__title">Survey Intelligence Search</div>
        <div className="header__meta">
          Local mock data only • Client scope enforced before results
        </div>
      </header>

      <section className="panel panel--tight">
        <div className="panel__title-row">
          <div>
            <div className="panel__eyebrow">Search</div>
            <div className="panel__title">Search Historical Surveys</div>
          </div>
        </div>
        <div className="search__grid">
          <label className="field field--full">
            <span className="field__label">Query</span>
            <input
              className="field__input"
              type="text"
              placeholder="e.g., concept test for skincare in RO and PL"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="field field--client">
            <span className="field__label field__label--critical">
              Client Scope (required)
            </span>
            <select
              className="field__select"
              value={filters.client}
              onChange={(event) => {
                updateFilters({
                  ...filters,
                  client: event.target.value,
                });
                onSelect(null, event.target.value);
              }}
            >
              <option value="">Select permitted client…</option>
              {options.clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
            <span className="field__hint">
              {filters.client
                ? "Scoped access active. Results limited to this client."
                : "Access required. Select a client to view results."}
            </span>
          </label>
        </div>

        <div className="filter__title">Filters (optional)</div>
        <div className="filter__grid">
          <div className="filter__group">
            <div className="filter__label">Markets</div>
            <div className="filter__chips">
              {options.markets.map((market) => (
                <button
                  key={market}
                  type="button"
                  className={
                    filters.markets.includes(market)
                      ? "chip chip--active"
                      : "chip"
                  }
                  onClick={() => {
                    const next = filters.markets.includes(market)
                      ? { ...filters, markets: filters.markets.filter((m) => m !== market) }
                      : { ...filters, markets: [...filters.markets, market] };
                    updateFilters(next);
                  }}
                >
                  {market}
                </button>
              ))}
            </div>
          </div>

          <div className="filter__group">
            <div className="filter__label">Languages</div>
            <div className="filter__chips">
              {options.languages.map((language) => (
                <button
                  key={language}
                  type="button"
                  className={
                    filters.languages.includes(language)
                      ? "chip chip--active"
                      : "chip"
                  }
                  onClick={() => {
                    const next = filters.languages.includes(language)
                      ? { ...filters, languages: filters.languages.filter((l) => l !== language) }
                      : { ...filters, languages: [...filters.languages, language] };
                    updateFilters(next);
                  }}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          <div className="filter__group">
            <div className="filter__label">Category</div>
            <div className="filter__chips">
              {options.categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    filters.categories.includes(category)
                      ? "chip chip--active"
                      : "chip"
                  }
                  onClick={() => {
                    const next = filters.categories.includes(category)
                      ? { ...filters, categories: filters.categories.filter((c) => c !== category) }
                      : { ...filters, categories: [...filters.categories, category] };
                    updateFilters(next);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter__group">
            <div className="filter__label">Methodology</div>
            <div className="filter__chips">
              {options.methodologies.map((methodology) => (
                <button
                  key={methodology}
                  type="button"
                  className={
                    filters.methodologies.includes(methodology)
                      ? "chip chip--active"
                      : "chip"
                  }
                  onClick={() => {
                    const next = filters.methodologies.includes(methodology)
                      ? {
                          ...filters,
                          methodologies: filters.methodologies.filter((m) => m !== methodology),
                        }
                      : { ...filters, methodologies: [...filters.methodologies, methodology] };
                    updateFilters(next);
                  }}
                >
                  {methodology}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel panel--tight">
          <div className="panel__title-row">
            <div>
              <div className="panel__eyebrow">Results</div>
              <div className="panel__title">Results</div>
            </div>
            {filters.client && (
              <span className="badge badge--type">Client scoped</span>
            )}
          </div>
        {filters.client && (
          <div className="scope-banner">
            Client scope: <strong>{filters.client}</strong> • Results limited to
            permitted surveys
          </div>
        )}
        {!filters.client && (
          <div className="empty-state">
            <div className="empty-state__title">Client scope required</div>
            <div className="empty-state__body">
              Select a permitted client to view historical surveys and insights.
            </div>
          </div>
        )}

        {filters.client && !query.trim() && (
          <div className="empty-state">
            <div className="empty-state__title">Enter a search query</div>
            <div className="empty-state__body">
              Start with a study topic, market, or methodology.
            </div>
            <div className="empty-state__label">Suggested demo queries</div>
            <div className="example__list">
              {exampleQueries.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="example__item"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {filters.client && query.trim() && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__title">No results</div>
            <div className="empty-state__body">
              Try a broader query or relax filters. Results are client-scoped.
            </div>
          </div>
        )}

        {filters.client && query.trim() && results.length > 0 && (
          <div className="results">
            <div className="results__summary">
              {results.length} result{results.length === 1 ? "" : "s"} found
            </div>
            {results.map((result) => {
              const isSameMarket =
                filters.markets.length > 0 &&
                result.markets.some((market) =>
                  filters.markets.includes(market)
                );
              const isCrossMarket =
                filters.markets.length > 0 && !isSameMarket;

              return (
                <button
                  key={result.id}
                  type="button"
                  className={
                    selection?.surveyId === result.surveyId
                      ? "result-card result-card--active"
                      : "result-card"
                  }
                  onClick={() =>
                    onSelect(
                      {
                        surveyId: result.surveyId,
                        resultType: result.type,
                        whyMatched: result.whyMatched,
                      },
                      filters.client
                    )
                  }
                >
                  <div className="result-card__header">
                    <div className="result-card__title">{result.title}</div>
                    <span className="badge badge--type">{result.type}</span>
                  </div>
                  <div className="result-card__snippet">
                    Matched content: “{result.snippet}”
                  </div>
                  <div className="result-card__why">
                    <span className="result-card__label">Why matched</span>
                    <div className="result-card__tags">
                      {result.whyMatched.map((reason) => (
                        <span key={reason} className="tag">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="result-card__meta">
                    <span>Markets: {renderValue(result.markets)}</span>
                    <span>Language: {renderValue(result.language)}</span>
                    <span>Category: {renderValue(result.category)}</span>
                    <span>Methodology: {renderValue(result.methodology)}</span>
                  </div>
                  <div className="result-card__badges">
                    {result.isLegacy && (
                      <span className="badge badge--legacy">Legacy</span>
                    )}
                    {isSameMarket && (
                      <span className="badge badge--market">
                        Same market
                      </span>
                    )}
                    {isCrossMarket && (
                      <span className="badge badge--market-alt">
                        Cross-market
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel panel--tight">
        <div className="panel__title-row">
          <div>
            <div className="panel__eyebrow">Selection</div>
            <div className="panel__title">Selection</div>
          </div>
        </div>
        {selection ? (
          <div className="selection">
            <div className="selection__title">Prepared for Survey Detail</div>
            <div className="selection__body">
              Selected survey: <strong>{selection.surveyId}</strong>
              <span className="selection__divider">•</span>
              Result type: <strong>{selection.resultType}</strong>
            </div>
            <button
              type="button"
              className="selection__clear"
              onClick={clearSelection}
            >
              Clear selection
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__title">No survey selected</div>
            <div className="empty-state__body">
              Click a result to prepare the Survey Detail view.
            </div>
          </div>
        )}
      </section>

      <section className="panel panel--tight">
        <div className="panel__title-row">
          <div>
            <div className="panel__eyebrow">Reuse</div>
            <div className="panel__title">Draft Reuse Queue</div>
          </div>
        </div>
        {draftSelection.questions.length === 0 &&
        draftSelection.sections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__title">No reuse items yet</div>
            <div className="empty-state__body">
              Add questions or sections from Survey Detail.
            </div>
          </div>
        ) : (
          <div className="reuse">
            {draftSelection.sections.map((section) => (
              <div key={section.surveyId} className="reuse__item">
                <div className="reuse__title">Section from {section.title}</div>
                <div className="reuse__meta">
                  {section.questionIds.length} questions
                </div>
              </div>
            ))}
            {draftSelection.questions.map((question) => (
              <div key={question.questionId} className="reuse__item">
                <div className="reuse__title">{question.text}</div>
                <div className="reuse__meta">Survey: {question.surveyId}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
