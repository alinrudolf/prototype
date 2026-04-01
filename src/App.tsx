import { useMemo, useState } from "react";
import SearchScreen from "./app/SearchScreen";
import SurveyDetailScreen from "./app/SurveyDetailScreen";
import { getNormalizedSurveys } from "./lib/data";
import type { DraftSelection, NormalizedSurvey, SearchResult } from "./types";

type SelectionState = {
  surveyId: string;
  resultType: SearchResult["type"];
  whyMatched: string[];
} | null;

export default function App() {
  const surveys = useMemo(() => getNormalizedSurveys(), []);
  const [selection, setSelection] = useState<SelectionState>(null);
  const [permittedClient, setPermittedClient] = useState("");
  const [draftSelection, setDraftSelection] = useState<DraftSelection>({
    questions: [],
    sections: [],
  });

  const selectedSurvey: NormalizedSurvey | null = selection
    ? surveys.find((survey) => survey.id === selection.surveyId) ?? null
    : null;

  const handleAddQuestion = (question: DraftSelection["questions"][number]) => {
    setDraftSelection((prev) => {
      if (prev.questions.some((item) => item.questionId === question.questionId)) {
        return prev;
      }
      return { ...prev, questions: [...prev.questions, question] };
    });
  };

  const handleAddSection = (survey: NormalizedSurvey) => {
    setDraftSelection((prev) => {
      if (prev.sections.some((section) => section.surveyId === survey.id)) {
        return prev;
      }
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            surveyId: survey.id,
            title: survey.title,
            questionIds: survey.questions.map((q) => q.id),
          },
        ],
      };
    });
  };

  return (
    <div className="page page--dense">
      <SearchScreen
        onSelect={(nextSelection, client) => {
          setSelection(nextSelection);
          if (client !== permittedClient) {
            setDraftSelection({ questions: [], sections: [] });
          }
          setPermittedClient(client);
        }}
        selection={selection}
        draftSelection={draftSelection}
      />
      <SurveyDetailScreen
        survey={selectedSurvey}
        permittedClient={permittedClient}
        whyMatched={selection?.whyMatched ?? []}
        selection={draftSelection}
        onAddQuestion={handleAddQuestion}
        onAddSection={handleAddSection}
      />
    </div>
  );
}
