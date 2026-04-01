export default function App() {
  return (
    <div className="page">
      <header className="header">
        <div className="header__title">
          Toluna POC: Survey Intelligence Prototype
        </div>
        <div className="header__meta">Local mock data • No backend • No AI</div>
      </header>

      <main className="content">
        <section className="panel">
          <h2 className="panel__title">1. Search</h2>
          <p className="panel__desc">
            Find historical surveys, questions, and insights with client-scoped
            filters and explainable matches.
          </p>
          <div className="panel__placeholder">
            Placeholder: search input, filters, and results list.
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">2. Survey Detail</h2>
          <p className="panel__desc">
            Review metadata, questions, answer summaries, and reuse actions for a
            selected survey.
          </p>
          <div className="panel__placeholder">
            Placeholder: survey metadata, insights, and reusable questions.
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">3. AI Draft Builder</h2>
          <p className="panel__desc">
            Mocked, grounded draft suggestions with citations from retrieved
            surveys.
          </p>
          <div className="panel__placeholder">
            Placeholder: objective input, draft outline, citations, confidence.
          </div>
        </section>
      </main>
    </div>
  );
}