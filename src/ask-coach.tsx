import {
  ActionPanel,
  Action,
  Form,
  Detail,
  Icon,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import { CoachWattsApi, getWebUrl } from "./api/client";

export default function AskCoachCommand() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const presetQuestions = [
    "What training or workout should I do today?",
    "How is my current recovery and HRV looking?",
    "How should I adjust my intensity based on my fatigue?",
    "Can you analyze my recent training load (CTL / ATL / TSB)?",
  ];

  async function handleSubmit(values: { prompt: string; preset?: string }) {
    const finalPrompt =
      values.prompt && values.prompt.trim().length > 0
        ? values.prompt.trim()
        : values.preset && values.preset !== "custom"
          ? values.preset
          : "";

    if (!finalPrompt) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter or select a question",
      });
      return;
    }

    setLoading(true);
    setQuestion(finalPrompt);
    showToast({
      style: Toast.Style.Animated,
      title: "Asking Coach Watts AI...",
    });

    try {
      const result = await CoachWattsApi.askCoach(finalPrompt);
      setResponse(result);
      showToast({ style: Toast.Style.Success, title: "Response Received" });
    } catch (err: unknown) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to get AI response",
        message: err instanceof Error ? err.message : "Server error",
      });
    } finally {
      setLoading(false);
    }
  }

  if (response) {
    return (
      <Detail
        markdown={`# 💬 Question\n> ${question}\n\n---\n\n# 🤖 Coach Watts Response\n\n${response}`}
        metadata={
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="Model"
              text="Coach Watts AI"
              icon={Icon.Stars}
            />
            <Detail.Metadata.Label title="Status" text="Completed" />
          </Detail.Metadata>
        }
        actions={
          <ActionPanel>
            <Action
              title="Ask Another Question"
              icon={Icon.Message}
              onAction={() => {
                setResponse(null);
                setQuestion("");
              }}
            />
            <Action.CopyToClipboard title="Copy Response" content={response} />
            <Action.OpenInBrowser
              title="Open Coach Watts Chat"
              url={getWebUrl("/chat")}
            />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Ask Coach Watts"
            icon={Icon.Airplane}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="preset" title="Preset Question" defaultValue="custom">
        <Form.Dropdown.Item
          title="Custom Question (type below)"
          value="custom"
          icon={Icon.Pencil}
        />
        {presetQuestions.map((q) => (
          <Form.Dropdown.Item
            key={q}
            title={q}
            value={q}
            icon={Icon.QuestionMark}
          />
        ))}
      </Form.Dropdown>

      <Form.TextArea
        id="prompt"
        title="Question / Prompt"
        placeholder="e.g. How should I adjust my training based on my current fatigue?"
        enableMarkdown
      />
    </Form>
  );
}
