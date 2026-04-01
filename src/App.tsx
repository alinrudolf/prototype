import { useMemo, useState } from "react";
import SearchScreen from "./app/SearchScreen";
import SurveyDetailScreen from "./app/SurveyDetailScreen";
import AiDraftBuilderScreen from "./app/AiDraftBuilderScreen";
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

  const handleRemoveQuestion = (questionId: string) => {
    setDraftSelection((prev) => ({
      ...prev,
      questions: prev.questions.filter((item) => item.questionId !== questionId),
    }));
  };

  const handleRemoveSection = (surveyId: string) => {
    setDraftSelection((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.surveyId !== surveyId),
    }));
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
      <AiDraftBuilderScreen
        permittedClient={permittedClient}
        filters={{
          client: permittedClient,
          markets: [],
          languages: [],
          categories: [],
          methodologies: [],
        }}
        selection={draftSelection}
        onRemoveQuestion={handleRemoveQuestion}
        onRemoveSection={handleRemoveSection}
      />
    </div>
  );
}
